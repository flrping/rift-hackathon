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
          showcase: true,
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
        favoriteLane: z.string().optional(),
        favoriteChampion: z.string().optional(),
        favoriteItem: z.string().optional(),
        favoriteStarter: z.string().optional(),
        highestWinrateChampion: z.string().optional(),
        nemesisChampion: z.string().optional(),
        bullyChampion: z.string().optional(),
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
          favoriteLane: input.favoriteLane,
          favoriteChampion: input.favoriteChampion,
          favoriteItem: input.favoriteItem,
          favoriteStarter: input.favoriteStarter,
          highestWinrateChampion: input.highestWinrateChampion,
          nemesisChampion: input.nemesisChampion,
          bullyChampion: input.bullyChampion,
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
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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

  upsertShowcase: publicProcedure
    .input(
      z.object({
        puuid: z.string(),
        platform: z.string(),
        queueType: z.string(),
        year: z.number().int(),
        champion: z.string().optional(),
        skinNum: z.number().int().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const rewind = await ctx.db.rewind.findUnique({
        where: {
          puuid_platform_queueType_year: {
            puuid: input.puuid,
            platform: input.platform,
            queueType: input.queueType,
            year: input.year,
          },
        },
        select: { id: true },
      });

      if (!rewind) {
        throw new Error("Rewind not found for the given identifiers");
      }

      const createData: Record<string, unknown> = {
        rewindId: rewind.id,
        champion: input.champion ?? undefined,
        skinNum: input.skinNum ?? undefined,
      };
      const updateData: Record<string, unknown> = {
        champion: input.champion ?? undefined,
        skinNum: input.skinNum ?? undefined,
      };
      const result: unknown = await (
        ctx.db as unknown as {
          showcaseCard: { upsert: (args: unknown) => unknown };
        }
      ).showcaseCard.upsert({
        where: { rewindId: rewind.id },
        create: createData,
        update: updateData,
      });
      return result;
    }),

  getGlobalStats: publicProcedure
    .input(
      z.object({
        year: z.number().int(),
        queueType: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const allRewinds = await ctx.db.rewind.findMany({
        where: {
          year: input.year,
          queueType: input.queueType,
        },
        select: {
          favoriteChampion: true,
          favoriteLane: true,
          favoriteItem: true,
          favoriteStarter: true,
          highestWinrateChampion: true,
          nemesisChampion: true,
          bullyChampion: true,
        },
      });

      const totalCount = allRewinds.length;
      if (totalCount === 0) return null;

      const countField = (field: keyof (typeof allRewinds)[0]) => {
        const counts = new Map<string, number>();
        allRewinds.forEach((r) => {
          const value = r[field];
          if (value && typeof value === "string") {
            counts.set(value, (counts.get(value) ?? 0) + 1);
          }
        });
        return counts;
      };

      return {
        totalCount,
        favoriteChampion: countField("favoriteChampion"),
        favoriteLane: countField("favoriteLane"),
        favoriteItem: countField("favoriteItem"),
        favoriteStarter: countField("favoriteStarter"),
        highestWinrateChampion: countField("highestWinrateChampion"),
        nemesisChampion: countField("nemesisChampion"),
        bullyChampion: countField("bullyChampion"),
      };
    }),
});
