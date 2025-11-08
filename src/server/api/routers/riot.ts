import { z } from "zod";
import { env } from "~/env";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import type {
  Summoner,
  Account,
  Match,
  LeagueVersionConfig,
  SummonerSpellConfigRaw,
  Queue,
  LeagueEntry,
  MatchTimeline,
  Champion,
  ChampionConfig,
  ItemData,
} from "~/types/riot";
import { SimpleCache } from "~/util/cache/cache";
import { getRegion } from "~/util/riot/region";
import { riotRateLimiter } from "~/util/limiter/rateLimiter";
import { observable } from "@trpc/server/observable";

const CACHE_TTL = 1000 * 60 * 60 * 24;

const accountCache = new SimpleCache<Account>(CACHE_TTL);
const summonerCache = new SimpleCache<Summoner>(CACHE_TTL);
const matchCache = new SimpleCache<Match>(CACHE_TTL);
const matchTimelineCache = new SimpleCache<MatchTimeline>(CACHE_TTL);
const matchesCache = new SimpleCache<string[]>(CACHE_TTL);
const ranksCache = new SimpleCache<LeagueEntry[]>(CACHE_TTL);

const versionCache = new SimpleCache<LeagueVersionConfig>(CACHE_TTL);
const spellsCache = new SimpleCache<
  { data: SummonerSpellConfigRaw["data"][string][] } & Omit<
    SummonerSpellConfigRaw,
    "data"
  >
>(CACHE_TTL);
const queuesCache = new SimpleCache<Queue[]>(CACHE_TTL);
const championCache = new SimpleCache<Champion>(CACHE_TTL);
const itemsCache = new SimpleCache<ItemData>(CACHE_TTL);

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
      const cacheKey = `${input.name}-${input.tag}-${input.platform}`;
      return await accountCache.getOrLoad(cacheKey, async () => {
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
      });
    }),

  getSummonerByPuuid: publicProcedure
    .input(z.object({ id: z.string().min(78), platform: z.string().min(1) }))
    .query(async ({ input }) => {
      const cacheKey = `${input.id}-${input.platform}`;
      return await summonerCache.getOrLoad(cacheKey, async () => {
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
      });
    }),

  getMatchesByPuuid: publicProcedure
    .input(
      z.object({
        id: z.string().min(78),
        platform: z.string().min(1),
        startTime: z.number().int().optional(),
        endTime: z.number().int().optional(),
        start: z.number().default(0).optional(),
        count: z.number().default(10).optional(),
        queue: z.number().int().optional(),
      }),
    )
    .query(async ({ input }) => {
      const cacheKey = `${input.id}-${input.platform}-${input.start}-${input.count}-${input.startTime ?? "none"}-${input.endTime ?? "none"}`;

      return await matchesCache.getOrLoad(cacheKey, async () => {
        const apiKey = env.RIOT_DEVELOPER_KEY;
        const region = getRegion(input.platform).toLowerCase();
        if (region === "none") {
          throw new Error("Invalid region");
        }

        let url = `https://${region}.api.riotgames.com/lol/match/v5/matches/by-puuid/${input.id}/ids?start=${input.start}&count=${input.count}`;
        if (input.startTime !== undefined) {
          url += `&startTime=${input.startTime}`;
        }
        if (input.endTime !== undefined) {
          url += `&endTime=${input.endTime}`;
        }
        if (input.queue !== undefined && input.queue !== -1) {
          url += `&queue=${input.queue}`;
        }

        console.log(url);

        const response = await fetch(url, {
          headers: {
            "X-Riot-Token": apiKey,
          },
        });

        if (!response.ok) {
          throw new Error(
            `Failed to fetch matches: ${response.status} ${response.statusText}`,
          );
        }

        return (await response.json()) as string[];
      });
    }),

  getMatchesByPuuidAndMonths: publicProcedure
    .input(
      z.object({
        id: z.string().min(78),
        platform: z.string().min(1),
        queue: z.number().int().optional(),
        months: z.array(
          z.object({
            startTime: z.number().int(),
            endTime: z.number().int(),
            month: z.number().int(),
          }),
        ),
        count: z.number().default(20).optional(),
      }),
    )
    .query(async ({ input }) => {
      const apiKey = env.RIOT_DEVELOPER_KEY;
      const region = getRegion(input.platform).toLowerCase();
      if (region === "none") {
        throw new Error("Invalid region");
      }

      const results: { month: number; matches: string[] }[] = [];

      for (const m of input.months) {
        const cacheKey = `${input.id}-${input.platform}-${m.startTime}-${m.endTime}-${input.count}`;
        const matches = await matchesCache.getOrLoad(cacheKey, async () => {
          let url = `https://${region}.api.riotgames.com/lol/match/v5/matches/by-puuid/${input.id}/ids?count=${input.count}&startTime=${m.startTime}&endTime=${m.endTime}`;
          if (input.queue !== undefined && input.queue !== -1) {
            url += `&queue=${input.queue}`;
          }
          const res = await fetch(url, {
            headers: { "X-Riot-Token": apiKey },
          });
          if (!res.ok) {
            throw new Error(
              `Failed to fetch matches for month ${m.month}: ${res.status} ${res.statusText}`,
            );
          }
          return (await res.json()) as string[];
        });

        results.push({ month: m.month, matches });
      }

      return results;
    }),

  getMatchByGameId: publicProcedure
    .input(z.object({ id: z.string().min(1), platform: z.string().min(1) }))
    .query(async ({ input }) => {
      const cacheKey = `${input.id}-${input.platform}`;
      return await matchCache.getOrLoad(cacheKey, async () => {
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
      });
    }),

  getMatchTimelineByGameId: publicProcedure
    .input(z.object({ id: z.string().min(1), platform: z.string().min(1) }))
    .query(async ({ input }) => {
      const cacheKey = `${input.id}-${input.platform}-timeline`;
      return await matchTimelineCache.getOrLoad(cacheKey, async () => {
        const apiKey = env.RIOT_DEVELOPER_KEY;
        const region = getRegion(input.platform).toLowerCase();
        if (region === "none") {
          throw new Error("Invalid region");
        }
        const url = `https://${region}.api.riotgames.com/lol/match/v5/matches/${input.platform.replace("/\d/g", "")}_${input.id}/timeline`;
        const response = await fetch(url, {
          headers: {
            "X-Riot-Token": apiKey,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch match");
        }

        return (await response.json()) as MatchTimeline;
      });
    }),

  getMatchesByGameIds: publicProcedure
    .input(
      z.object({
        ids: z.array(z.string().min(1)),
        platform: z.string().min(1),
      }),
    )
    .query(async ({ input }) => {
      const matches = await Promise.all(
        input.ids.map(async (id) => {
          const cacheKey = `${id}-${input.platform}`;
          return await matchCache.getOrLoad(cacheKey, async () => {
            const apiKey = env.RIOT_DEVELOPER_KEY;
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
          });
        }),
      );

      return matches;
    }),

  getMatchesByGameIdsWithProgress: publicProcedure
    .input(
      z.object({
        ids: z.array(z.string().min(1)),
        platform: z.string().min(1),
      }),
    )
    .subscription(async ({ input }) => {
      return observable<{
        type: "progress" | "complete" | "error";
        progress?: number;
        current?: number;
        total?: number;
        match?: Match;
        matches?: Match[];
        error?: string;
        rateLimitStatus?: {
          shortWindow: { used: number; limit: number; remaining: number };
          longWindow: { used: number; limit: number; remaining: number };
        };
      }>((emit) => {
        const matches: Match[] = [];
        const total = input.ids.length;
        let closed = false;

        void (async () => {
          try {
            for (let i = 0; i < input.ids.length; i++) {
              if (closed) {
                break;
              }
              const id = input.ids[i]!;
              const cacheKey = `${id}-${input.platform}`;

              const cached = matchCache.get(cacheKey);
              let match: Match;

              if (cached) {
                match = cached;
              } else {
                await riotRateLimiter.acquireSlot();

                const apiKey = env.RIOT_DEVELOPER_KEY;
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
                  if (response.status === 429) {
                    const retryAfter = response.headers.get("Retry-After");
                    const waitTime = retryAfter
                      ? parseInt(retryAfter) * 1000
                      : 5000;

                    console.warn(`Rate limited, retrying after ${waitTime}ms`);
                    await new Promise((resolve) =>
                      setTimeout(resolve, waitTime),
                    );

                    const retryResponse = await fetch(url, {
                      headers: { "X-Riot-Token": apiKey },
                    });

                    if (!retryResponse.ok) {
                      throw new Error(
                        `Failed to fetch match after retry: ${retryResponse.status}`,
                      );
                    }

                    match = (await retryResponse.json()) as Match;
                  } else {
                    throw new Error(
                      `Failed to fetch match: ${response.status}`,
                    );
                  }
                } else {
                  match = (await response.json()) as Match;
                }

                matchCache.set(cacheKey, match);
              }

              matches.push(match);

              if (!closed) {
                emit.next({
                  type: "progress",
                  progress: ((i + 1) / total) * 100,
                  current: i + 1,
                  total,
                  match,
                  rateLimitStatus: riotRateLimiter.getStatus(),
                });
              }
            }

            if (!closed) {
              emit.next({
                type: "complete",
                matches,
                progress: 100,
                current: total,
                total,
              });

              emit.complete();
            }
          } catch (error) {
            if (!closed) {
              emit.next({
                type: "error",
                error:
                  error instanceof Error
                    ? error.message
                    : "Unknown error occurred",
              });

              emit.complete();
            }
          }
        })();

        return () => {
          closed = true;
        };
      });
    }),

  getRanksByPuuid: publicProcedure
    .input(z.object({ puuid: z.string().min(1), platform: z.string().min(1) }))
    .query(async ({ input }) => {
      const cacheKey = `${input.puuid}-${input.platform}-ranks`;
      return await ranksCache.getOrLoad(cacheKey, async () => {
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
      });
    }),

  getLeagueVersion: publicProcedure
    .input(z.object({ platform: z.string().min(1) }))
    .query(async ({ input }) => {
      const platformStripped = input.platform.toLowerCase().replace(/\d/g, "");
      const cacheKey = `version-${platformStripped}`;
      return await versionCache.getOrLoad(cacheKey, async () => {
        const url = `https://ddragon.leagueoflegends.com/realms/${platformStripped}.json`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Failed to fetch league version");
        }

        return (await response.json()) as LeagueVersionConfig;
      });
    }),

  getSummonerSpells: publicProcedure
    .input(
      z.object({ version: z.string().min(1), language: z.string().min(1) }),
    )
    .query(async ({ input }) => {
      const cacheKey = `spells-${input.version}-${input.language}`;
      return await spellsCache.getOrLoad(cacheKey, async () => {
        const url = `https://ddragon.leagueoflegends.com/cdn/${input.version}/data/${input.language}/summoner.json`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Failed to fetch summoners");
        }

        const raw = (await response.json()) as SummonerSpellConfigRaw;
        return { ...raw, data: Object.values(raw.data) };
      });
    }),

  getQueues: publicProcedure.query(async () => {
    const cacheKey = "queues";
    return await queuesCache.getOrLoad(cacheKey, async () => {
      const url = `https://static.developer.riotgames.com/docs/lol/queues.json`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch queues");
      }

      return (await response.json()) as Queue[];
    });
  }),

  getChampion: publicProcedure
    .input(
      z.object({
        version: z.string().min(1),
        language: z.string().min(1),
        name: z.string().min(1),
      }),
    )
    .query(async ({ input }) => {
      const cached = championCache.get(input.name);
      if (cached) {
        return cached;
      }
      const url = `https://ddragon.leagueoflegends.com/cdn/${input.version}/data/${input.language}/champion/${input.name}.json`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch champion");
      }
      const champion = ((await response.json()) as ChampionConfig).data[
        input.name
      ];
      if (!champion) {
        throw new Error("Champion not found");
      }
      championCache.set(input.name, champion);
      return champion;
    }),

  getItems: publicProcedure
    .input(
      z.object({ version: z.string().min(1), language: z.string().min(1) }),
    )
    .query(async ({ input }) => {
      const cacheKey = `items-${input.version}-${input.language}`;
      return await itemsCache.getOrLoad(cacheKey, async () => {
        const url = `https://ddragon.leagueoflegends.com/cdn/${input.version}/data/${input.language}/item.json`;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Failed to fetch items");
        }
        return (await response.json()) as ItemData;
      });
    }),
});
