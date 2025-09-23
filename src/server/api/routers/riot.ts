import { platform } from "os";
import { z } from "zod";
import { env } from "~/env";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import type {
  Summoner,
  Account,
  Match,
  LeagueVersionConfig,
  SummonerSpellConfigRaw, Queue,
  LeagueEntry
} from "~/types/riot";
import { getRegion } from "~/util/riot/region";

export const riotRouter = createTRPCRouter({
  getAccountByNameAndTag: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        tag: z.string().min(1),
        platform: z.string().min(1),
      }),
    )
    .query(async ({ input }) => {
      const region = getRegion(input.platform).toLowerCase();
      if (region === "none") {
        throw new Error("Invalid region");
      }
      const apiKey = env.RIOT_DEVELOPER_KEY;
      const url = `https://${region}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${input.name}/${input.tag}`;
      const response = await fetch(url, {
        headers: {
          "X-Riot-Token": apiKey,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch account");
      }

      return (await response.json()) as Account;
    }),

  getSummonerByPUUID: publicProcedure
    .input(z.object({ id: z.string().min(78), platform: z.string().min(1) }))
    .query(async ({ input }) => {
      const apiKey = env.RIOT_DEVELOPER_KEY;
      const region = getRegion(input.platform).toLowerCase();
      if (region === "none") {
        // Not a valid platform if region is none
        throw new Error("Invalid region");
      }
      const url = `https://${input.platform}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${input.id}`;
      const response = await fetch(url, {
        headers: {
          "X-Riot-Token": apiKey,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch summoner");
      }

      return (await response.json()) as Summoner;
    }),

  getMatchesByPUUID: publicProcedure
    .input(
      z.object({
        id: z.string().min(78),
        platform: z.string().min(1),
        start: z.number().default(0).optional(),
        count: z.number().default(10).optional(),
      }),
    )
    .query(async ({ input }) => {
      const apiKey = env.RIOT_DEVELOPER_KEY;
      const region = getRegion(input.platform).toLowerCase();
      if (region === "none") {
        throw new Error("Invalid region");
      }
      const url = `https://${region}.api.riotgames.com/lol/match/v5/matches/by-puuid/${input.id}/ids?start=${input.start}&count=${input.count}`;
      const response = await fetch(url, {
        headers: {
          "X-Riot-Token": apiKey,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch matches");
      }

      return (await response.json()) as string[];
    }),

  getMatchByGameId: publicProcedure
    .input(z.object({ id: z.string().min(1), platform: z.string().min(1) }))
    .query(async ({ input }) => {
      const apiKey = env.RIOT_DEVELOPER_KEY;
      const region = getRegion(input.platform).toLowerCase();
      if (region === "none") {
        throw new Error("Invalid region");
      }
      const url = `https://${region}.api.riotgames.com/lol/match/v5/matches/${input.id}`;
      const response = await fetch(url, {
        headers: {
          "X-Riot-Token": apiKey,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch match");
      }

      return (await response.json()) as Match;
    }),

  getMatchesByGameIds: publicProcedure
    .input(
      z.object({
        ids: z.array(z.string().min(1)),
        platform: z.string().min(1),
      }),
    )
    .query(async ({ input }) => {
      const apiKey = env.RIOT_DEVELOPER_KEY;
      const matches = await Promise.all(
        input.ids.map(async (id) => {
          const region = getRegion(input.platform).toLowerCase();
          if (region === "none") {
            throw new Error("Invalid region");
          }
          const url = `https://${region}.api.riotgames.com/lol/match/v5/matches/${id}`;
          const response = await fetch(url, {
            headers: {
              "X-Riot-Token": apiKey,
            },
          });

          if (!response.ok) {
            throw new Error("Failed to fetch match");
          }

          return (await response.json()) as Match;
        }),
      );

      return matches;
    }),

  getRanksByPUUID: publicProcedure
    .input(z.object({ puuid: z.string().min(1), platform: z.string().min(1) }))
    .query(async ({ input }) => {
      const apiKey = env.RIOT_DEVELOPER_KEY;
      const region = getRegion(input.platform).toLowerCase();
      if (region === "none") {
        throw new Error("Invalid region");
      }
      const url = `https://${input.platform}.api.riotgames.com/lol/league/v4/entries/by-puuid/${input.puuid}`;
      const response = await fetch(url, {
        headers: {
          "X-Riot-Token": apiKey,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch ranks");
      }
      return (await response.json()) as LeagueEntry[];
    }),

  getLeagueVersion: publicProcedure
    .input(z.object({ platform: z.string().min(1) }))
    .query(async ({ input }) => {
      const platformStripped = input.platform.toLowerCase().replace(/\d/g, "");
      const url = `https://ddragon.leagueoflegends.com/realms/${platformStripped}.json`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch league version");
      }

      return (await response.json()) as LeagueVersionConfig;
    }),

  getSummonerSpells: publicProcedure
    .input(z.object({ version: z.string().min(1), language: z.string().min(1) }))
    .query(async ({ input }) => {
      const url = `https://ddragon.leagueoflegends.com/cdn/${input.version}/data/${input.language}/summoner.json`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch summoners");
      }

      const raw = (await response.json()) as SummonerSpellConfigRaw;
      return { ...raw, data: Object.values(raw.data) };
    }),

    getQueues: publicProcedure
      .query(async () => {
        const url = `https://static.developer.riotgames.com/docs/lol/queues.json`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Failed to fetch queues");
        }

        return (await response.json()) as Queue[];
      }),

});
