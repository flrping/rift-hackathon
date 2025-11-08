import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import type { QueryResponse } from "~/types/aws";

export const QueryResponseSchema: z.ZodType<QueryResponse> = z.object({
  playstyle: z.object({
    type: z.enum([
      "AGGRESSIVE",
      "DEFENSIVE",
      "BALANCED",
      "FARMER",
      "OBJECTIVE_FOCUSED",
      "TEAM_ORIENTED",
      "SPLIT_PUSHER",
      "OPPORTUNIST",
      "CONTROL",
      "CHAOTIC",
    ]),
    reason: z.string(),
  }),
  strengths: z.array(
    z.object({
      type: z.enum([
        "VISION",
        "KILLER",
        "FARMER",
        "OBJECTIVES",
        "TEAMPLAY",
        "MAP_PRESSURE",
        "SURVIVABILITY",
      ]),
      reason: z.string(),
    }),
  ),
  weaknesses: z.array(
    z.object({
      type: z.enum([
        "VISION",
        "KILLER",
        "FARMER",
        "OBJECTIVES",
        "TEAMPLAY",
        "MAP_PRESSURE",
        "SURVIVABILITY",
      ]),
      reason: z.string(),
    }),
  ),
  advice: z.array(
    z.object({
      type: z.enum([
        "AGGRESSIVE",
        "DEFENSIVE",
        "BALANCED",
        "FARMER",
        "OBJECTIVE_FOCUSED",
        "TEAM_ORIENTED",
        "SPLIT_PUSHER",
        "OPPORTUNIST",
        "CONTROL",
        "CHAOTIC",
        "VISION",
        "KILLER",
        "OBJECTIVES",
        "TEAMPLAY",
        "MAP_PRESSURE",
        "SURVIVABILITY",
      ]),
      reason: z.string(),
    }),
  ),
});

const HighlightInputSchema = z.object({
  type: z.string(),
  matchId: z.string(),
  title: z.string(),
  description: z.string(),
  badge: z.string(),
  rarity: z.string(),
  statsJson: z.any(),
  reason: z.string().optional(),
});

const AchievementInputSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  icon: z.string(),
  rarity: z.string(),
  unlocked: z.boolean(),
  progress: z.number().optional(),
  total: z.number().optional(),
});

export const rewindRouter = createTRPCRouter({
  getExistingRewind: publicProcedure
    .input(
      z.object({
        puuid: z.string(),
        platform: z.string(),
        queueType: z.string(),
        year: z.number().int(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return await ctx.db.rewind.findUnique({
        where: {
          puuid_platform_queueType_year: {
            puuid: input.puuid,
            platform: input.platform,
            queueType: input.queueType,
            year: input.year,
          },
        },
        include: {
          gameplayElements: true,
          advice: true,
          playstyle: true,
          highlights: true,
          achievements: true,
        },
      });
    }),

  createRewind: publicProcedure
    .input(
      z.object({
        puuid: z.string(),
        platform: z.string(),
        queueType: z.string(),
        year: z.number().int(),
        data: QueryResponseSchema,
        highlights: z.array(HighlightInputSchema).optional(),
        achievements: z.array(AchievementInputSchema).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const gameplayElements = [];
      if (input.data.strengths.length > 0) {
        gameplayElements.push(
          ...input.data.strengths.map((strength) => ({
            type: strength.type,
            form: "strength",
            reason: strength.reason,
          })),
        );
      }
      if (input.data.weaknesses.length > 0) {
        gameplayElements.push(
          ...input.data.weaknesses.map((weakness) => ({
            type: weakness.type,
            form: "weakness",
            reason: weakness.reason,
          })),
        );
      }
      return await ctx.db.rewind.create({
        data: {
          puuid: input.puuid,
          platform: input.platform,
          queueType: input.queueType,
          year: input.year,
          playstyle: {
            create: {
              type: input.data.playstyle.type,
              reason: input.data.playstyle.reason,
            },
          },
          gameplayElements: {
            create: gameplayElements.map((gameplayElement) => ({
              type: gameplayElement.type,
              form: gameplayElement.form,
              reason: gameplayElement.reason,
            })),
          },
          advice: {
            create: input.data.advice.map((advice) => ({
              type: advice.type,
              reason: advice.reason,
            })),
          },
          highlights: input.highlights
            ? {
                create: input.highlights.map((h) => ({
                  type: h.type,
                  reason: h.description ?? "",
                  matchId: h.matchId,
                  title: h.title,
                  description: h.description,
                  badge: h.badge,
                  rarity: h.rarity,
                  statsJson: h.statsJson,
                })),
              }
            : undefined,
          achievements: input.achievements
            ? {
                create: input.achievements.map((a) => ({
                  type: a.id,
                  reason: a.description,
                  title: a.title,
                  description: a.description,
                  icon: a.icon,
                  rarity: a.rarity,
                  unlocked: a.unlocked,
                  progress: a.progress,
                  total: a.total,
                })),
              }
            : undefined,
        },
        include: {
          gameplayElements: true,
          advice: true,
          highlights: true,
          achievements: true,
        },
      });
    }),
});
