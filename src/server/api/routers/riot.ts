import { z } from "zod";
import { env } from "~/env";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import type { Summoner, Account, Match } from "~/types/riot";

export const riotRouter = createTRPCRouter({
  getAccountByNameAndTag: publicProcedure
    .input(z.object({ name: z.string().min(1), tag: z.string().min(1) }))
    .query(async ({ input }) => {
      const apiKey = env.RIOT_DEVELOPER_KEY;
      const url = `https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${input.name}/${input.tag}`;
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
    .input(z.object({ id: z.string().min(78) }))
    .query(async ({ input }) => {
      const apiKey = env.RIOT_DEVELOPER_KEY;
      const url = `https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${input.id}`;
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
        start: z.number().default(0).optional(),
        count: z.number().default(10).optional(),
      }),
    )
    .query(async ({ input }) => {
      const apiKey = env.RIOT_DEVELOPER_KEY;
      const url = `https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${input.id}/ids?start=${input.start}&count=${input.count}`;
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
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ input }) => {
      const apiKey = env.RIOT_DEVELOPER_KEY;
      const url = `https://americas.api.riotgames.com/lol/match/v5/matches/${input.id}`;
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
    .input(z.object({ ids: z.array(z.string().min(1)) }))
    .query(async ({ input }) => {
      const apiKey = env.RIOT_DEVELOPER_KEY;
      const matches = await Promise.all(
        input.ids.map(async (id) => {
          const url = `https://americas.api.riotgames.com/lol/match/v5/matches/${id}`;
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
});
