import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { type MatchOverview } from "~/types/riot";
import { bedrock } from "~/server/bedrock";
import { ConverseCommand } from "@aws-sdk/client-bedrock-runtime";
import path from "path";
import fs from "fs";
import type {QueryResponse} from "~/types/aws";
import {env} from "~/env";

const ParticipantPerformanceSchema = z.object({
  championName: z.string(),
  kills: z.number(),
  deaths: z.number(),
  assists: z.number(),
  gold: z.number(),
  cs: z.number(),
  level: z.number(),
  totalPings: z.number(),
  consumablesPurchased: z.number(),
  wardsPlaced: z.number(),
  dragonKills: z.number(),
  turretKills: z.number(),
  inhibitorKills: z.number(),
  damageDealt: z.number(),
  damageTaken: z.number(),
  win: z.boolean(),
  item0: z.string(),
  item1: z.string(),
  item2: z.string(),
  item3: z.string(),
  item4: z.string(),
  item5: z.string(),
  item6: z.string(),
  lane: z.string(),
});

export const MatchOverviewSchema: z.ZodType<MatchOverview> = z.object({
  gameDuration: z.number(),
  me: ParticipantPerformanceSchema,
  opponent: ParticipantPerformanceSchema,
  game: z.object({
    duration: z.number(),
    version: z.string(),
  }),
  teams: z.object({
    red: z.object({
      champions: z.array(z.string()),
      kills: z.number(),
      deaths: z.number(),
      assists: z.number(),
      gold: z.number(),
    }),
    blue: z.object({
      champions: z.array(z.string()),
      kills: z.number(),
      deaths: z.number(),
      assists: z.number(),
      gold: z.number(),
    }),
  }),
});

export const awsRouter = createTRPCRouter({
  sendQuery: publicProcedure
    .input(
      z.array(
        z.object({
          month: z.string(),
          performances: z.array(MatchOverviewSchema),
        }),
      ),
    )
    .mutation(async ({ input }) => {
      const modelId = env.AWS_BEDROCK_MODEL_ID;
      const response = await bedrock().send(
        new ConverseCommand({
          modelId: modelId,
          system: [{ text: getSystemPrompt() }],
          messages: [
            { role: "user", content: [{ text: JSON.stringify(input) }] },
          ],
        }),
      );

      const content = response.output?.message?.content ?? [];
      const jsonText = content[1]?.text;

      if (!jsonText) {
        throw new Error("Missing response text from Bedrock");
      }

      return JSON.parse(jsonText) as QueryResponse;
    }),
});

const getSystemPrompt = () => {
  const filePath = path.join(process.cwd(), "src/assets/aws/behavior.txt");
  let systemPrompt = fs.readFileSync(filePath, "utf8");

  const playstyleTypes = `
  {
  AGGRESSIVE: {
    name: "Aggressive",
    description:
      "You are willing to take risks to achieve your goals, and you are not afraid to make mistakes. Though these decisions may lead to a higher risk of failure.",
  },
  DEFENSIVE: {
    name: "Defensive",
    description:
      "You are more careful and cautious in your actions, and you are more likely to avoid making mistakes. Though opportunities may be missed.",
  },
  BALANCED: {
    name: "Balanced",
    description:
      "You are both risky and cautious in your actions. This though may lead to better plays being missed.",
  },
  FARMER: {
    name: "Farmer",
    description:
      "You are more focused on farming than making choices that may accelerate the game.",
  },
  OBJECTIVE_FOCUSED: {
    name: "Objective-Focused",
    description:
      "You prioritize map objectives such as towers, dragons, and barons. This creates long-term advantages but can mean sacrificing immediate fights or opportunities.",
  },
  TEAM_ORIENTED: {
    name: "Team-Oriented",
    description:
      "You prefer to group and act with your team, focusing on coordination and shared success. This strengthens team play but can reduce individual impact.",
  },
  SPLIT_PUSHER: {
    name: "Split-Pusher",
    description:
      "You focus on creating pressure in side lanes, forcing opponents to respond. This opens space for your team but can leave them outnumbered if mistimed.",
  },
  OPPORTUNIST: {
    name: "Opportunist",
    description:
      "You wait for the right moment to act, capitalizing on mistakes and low-risk plays. This reduces personal risk but can lead to missed openings.",
  },
  CONTROL: {
    name: "Control",
    description:
      "You emphasize vision, zoning, and map control to slowly strangle out the enemy’s options. This secures safer wins but can lack explosive momentum.",
  },
  CHAOTIC: {
    name: "Chaotic",
    description:
      "You thrive in unpredictable situations, constantly pressuring and forcing fights. This can overwhelm opponents, but risks throwing games if poorly timed.",
  },
}
  `.replace(/\s+/g, " ");

  const gameplayElements = `
  {
  VISION: {
    name: "Vision",
    description: "Placing wards and vision to help your team win fights.",
    abundanceOf: "Vision is always good.",
    lackOf:
      "Vision helps your team position better and see the enemy's actions. If you don't have vision, you are always at a disadvantage.",
  },
  KILLER: {
    name: "Killer",
    description:
      "Getting kills and winning fights to help your team win the game.",
    abundanceOf:
      "A lot of kills are good, but it puts a lot of pressure on you. It makes you a priority target for the enemy.",
    lackOf: "You are likely to not have much impact on the game.",
    excludes: ["CATEGORY:TANK", "ROLE:SUPPORT"],
  },
  FARMER: {
    name: "Farmer",
    description:
      "Farming minions and objectives to keep your tempo and make sure you're always in the game.",
    abundanceOf:
      "Farming is good as it always keeps you in the game. Too much farming may mean you are not fighting with your team.",
    lackOf:
      "You must be able to farm to keep yourself in the game. If you are lacking in farming, you will slowly slide into a disadvantage.",
    excludes: ["ROLE:SUPPORT"],
  },
  OBJECTIVES: {
    name: "Objectives",
    description:
      "Securing dragons, barons, towers, and other objectives to give your team long-term advantages.",
    abundanceOf:
      "Securing many objectives ensures map control and win conditions. Over-prioritizing them may lead to losing fights or forcing plays at the wrong time.",
    lackOf:
      "If you don't take objectives, the enemy will slowly gain permanent advantages and your leads will fade.",
  },
  TEAMPLAY: {
    name: "Teamplay",
    description:
      "Grouping with allies, supporting them, and making coordinated plays.",
    abundanceOf:
      "Playing heavily around your team can help win coordinated fights, but may limit your own growth if you never take resources for yourself.",
    lackOf:
      "Without teamplay, your allies may struggle to win fights and objectives, leaving the game disjointed.",
  },
  MAP_PRESSURE: {
    name: "Map Pressure",
    description:
      "Applying pressure on lanes and forcing the enemy to respond to you.",
    abundanceOf:
      "Consistently applying pressure keeps the enemy under control, but overextending may cause unnecessary deaths.",
    lackOf:
      "Without pressure, the enemy has freedom to make plays and control the map without punishment.",
  },
  SURVIVABILITY: {
    name: "Survivability",
    description:
      "Staying alive, avoiding unnecessary deaths, and keeping your gold/XP safe.",
    abundanceOf:
      "Not dying keeps your team’s power stable, but playing too safe may mean missing opportunities to win fights.",
    lackOf:
      "Frequent deaths give the enemy gold and momentum, weakening your entire team.",
  },
}
  `.replace(/\s+/g, " ");

  const queryResponse = `
  {
  playstyle: {
    type: PlaystyleKey;
    reason: string;
  };
  strengths: {
    type: GameplayElementKey;
    reason: string;
  }[];
  weaknesses: {
    type: GameplayElementKey;
    reason: string;
  }[];
  advice: {
    type: PlaystyleKey | GameplayElementKey;
    reason: string;
  }[];
}
  `.replace(/\s+/g, " ");

  systemPrompt = systemPrompt.replace("{{ PLAYSTYLE_TYPES }}", playstyleTypes);
  systemPrompt = systemPrompt.replace(
    "{{ GAMEPLAY_ELEMENTS }}",
    gameplayElements,
  );
  systemPrompt = systemPrompt.replace("{{ QUERY_RESPONSE }}", queryResponse);

  return systemPrompt;
};
