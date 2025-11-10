"use client";

import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { api } from "~/trpc/react";
import type { MatchOverview, Match, Participant } from "~/types/riot";
import {
  type CommonQueueType,
  getMonthlyRanges,
  convertMatchesToPerformances,
  QUEUE_IDS,
} from "~/util/riot/game";
import type { ItemData } from "~/types/riot";
import { detectHighlightGames, generateAchievements } from "~/util/riot/game";
import { findOpponent } from "~/util/riot/game";

interface RewindGenerationSectionProps {
  handleGenerationOk: () => void;
  puuid: string;
  platform: string;
  queueType: CommonQueueType;
  items?: ItemData;
  matches: Match[];
  setMatches: Dispatch<SetStateAction<Match[]>>;
}

const RewindGenerationSection = ({
  handleGenerationOk,
  puuid,
  platform,
  queueType,
  items,
  matches: _matches,
  setMatches,
}: RewindGenerationSectionProps) => {
  const sendQuery = api.aws.sendQuery.useMutation();
  const utils = api.useUtils();
  const createRewind = api.rewind.createRewind.useMutation({
    onSuccess: async () => {
      const year = new Date().getFullYear();
      await Promise.all([
        utils.rewind.getExistingRewind.invalidate({
          puuid,
          platform,
          queueType,
          year,
        }),
        utils.rewind.getGlobalStats.invalidate({
          year,
          queueType,
        }),
      ]);
    },
  });
  const hasSentQuery = useRef(false);
  const hasCreatedRewind = useRef(false);

  const selectedQueueId = QUEUE_IDS[queueType];
  const ranges = getMonthlyRanges(new Date().getFullYear()).slice(
    0,
    new Date().getMonth() + 1,
  );

  const { data: matchIdsByMonth } =
    api.riot.getMatchesByPuuidAndMonths.useQuery(
      {
        id: puuid,
        queue: selectedQueueId,
        platform,
        months: ranges,
        count: 10,
      },
      {
        enabled: !!puuid,
        staleTime: Infinity,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
      },
    );

  const idsRef = useRef<string[]>([]);
  const [idsReady, setIdsReady] = useState(false);
  const [allMatchData, setAllMatchData] = useState<Match[]>([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);

  useEffect(() => {
    if (matchIdsByMonth) {
      const ids = matchIdsByMonth.flatMap((m) => m.matches);
      const same =
        idsRef.current.length === ids.length &&
        idsRef.current.every((v, i) => v === ids[i]);
      if (!same) {
        idsRef.current = ids;
        setAllMatchData([]);
        setIdsReady(true);
      }
    } else {
      idsRef.current = [];
      setIdsReady(false);
    }
  }, [matchIdsByMonth]);

  void api.riot.getMatchesByGameIdsWithProgress.useSubscription(
    {
      ids: idsRef.current,
      platform,
    },
    {
      enabled: idsReady && idsRef.current.length > 0,
      onData: (data) => {
        if (data.type === "progress" && data.match) {
          setAllMatchData((prev) => {
            if (prev.some((m) => m.info.gameId === data.match!.info.gameId)) {
              return prev;
            }
            return [...prev, data.match!];
          });
          setIsLoadingMatches(true);
        } else if (data.type === "complete" && data.matches) {
          setAllMatchData(data.matches);
          setIsLoadingMatches(false);
          setMatches(data.matches);
        } else if (data.type === "error") {
          setIsLoadingMatches(false);
        }
      },
      onError: () => {
        setIsLoadingMatches(false);
      },
    },
  );

  const [structuredMatches, setStructuredMatches] = useState<
    { month: string; performances: MatchOverview[] }[]
  >([]);

  useEffect(() => {
    if (allMatchData.length > 0 && matchIdsByMonth && puuid) {
      const restructuredData = convertMatchesToPerformances(
        allMatchData,
        matchIdsByMonth,
        puuid,
        items,
      ).filter((match) => match.performances.length > 0);
      setStructuredMatches(restructuredData);
    }
  }, [allMatchData, matchIdsByMonth, puuid, items]);

  useEffect(() => {
    if (
      structuredMatches.length &&
      !isLoadingMatches &&
      !hasSentQuery.current &&
      !sendQuery.isPending
    ) {
      hasSentQuery.current = true;
      sendQuery.mutate(structuredMatches);
    }
  }, [structuredMatches, isLoadingMatches, sendQuery]);

  useEffect(() => {
    if (
      sendQuery.data &&
      !hasCreatedRewind.current &&
      !createRewind.isPending
    ) {
      hasCreatedRewind.current = true;

      const computeExtras = () => {
        const laneCounts = new Map<string, number>();
        const champStats = new Map<string, { games: number; wins: number }>();
        const bullyCounts = new Map<string, number>(); // wins against
        const nemesisCounts = new Map<string, number>(); // losses against
        const itemCounts = new Map<string, number>();
        const starterCounts = new Map<string, number>();

        type ItemDetails = ItemData["data"][string];

        const getItemData = (
          id: number | undefined,
        ): ItemDetails | undefined => {
          if (!id || id <= 0) return undefined;
          const key = String(id);
          return items?.data?.[key];
        };

        const getItemName = (item: ItemDetails | undefined) => item?.name;

        const isBoots = (item: ItemDetails | undefined) => {
          const name = item?.name?.toLowerCase() ?? "";
          return name.includes("boots") || name.includes("greaves");
        };

        const isStarter = (item: ItemDetails | undefined) => {
          if (!item) return false;
          const name = item.name ?? "";
          const tags = item.tags ?? [];
          const depth = item.depth ?? 0;
          const doran = name.includes("Doran");
          if (name.includes("Refillable Potion")) return false;
          const jungle = tags.includes("Jungle") && depth <= 1;
          return doran || jungle;
        };

        const isConsumableLike = (item: ItemDetails | undefined) => {
          if (!item) return false;
          const tags = item.tags ?? [];
          const name = item.name?.toLowerCase() ?? "";
          const description = item.description?.toLowerCase() ?? "";
          return (
            tags.includes("Consumable") ||
            tags.includes("Trinket") ||
            tags.includes("Vision") ||
            name.includes("potion") ||
            name.includes("elixir") ||
            name.includes("ward") ||
            description.includes("consume")
          );
        };

        const isFullyBuiltItem = (item: ItemDetails | undefined) => {
          if (!item) return false;
          if (isConsumableLike(item)) return false;
          if ((item.into?.length ?? 0) > 0) return false;
          return true;
        };

        const isEligibleFavoriteItem = (item: ItemDetails | undefined) => {
          if (!item) return false;
          if (!isFullyBuiltItem(item)) return false;
          if (isBoots(item)) return false;
          if (isStarter(item)) return false;
          return true;
        };

        allMatchData.forEach((match) => {
          const me = match.info.participants.find(
            (p: Participant) => p.puuid === puuid,
          );
          if (!me) return;

          const lane =
            me.individualPosition || me.teamPosition || me.lane || "";
          if (lane) {
            laneCounts.set(lane, (laneCounts.get(lane) ?? 0) + 1);
          }

          const champ = me.championName ?? "";
          if (champ) {
            const stat = champStats.get(champ) ?? { games: 0, wins: 0 };
            stat.games += 1;
            stat.wins += me.win ? 1 : 0;
            champStats.set(champ, stat);
          }

          const opponent = findOpponent(me, match.info.participants);
          if (opponent) {
            if (me.win) {
              bullyCounts.set(
                opponent.championName,
                (bullyCounts.get(opponent.championName) ?? 0) + 1,
              );
            } else {
              nemesisCounts.set(
                opponent.championName,
                (nemesisCounts.get(opponent.championName) ?? 0) + 1,
              );
            }
          }

          // Items (item6 is trinket/ward slot, exclude from all counts)
          const itemIds = [
            me.item0,
            me.item1,
            me.item2,
            me.item3,
            me.item4,
            me.item5,
          ];

          // Favorite starter
          itemIds.forEach((id) => {
            const itemData = getItemData(id);
            if (!itemData) return;
            if (isStarter(itemData)) {
              const name = getItemName(itemData);
              if (name)
                starterCounts.set(name, (starterCounts.get(name) ?? 0) + 1);
            }
          });

          // Favorite item (excluding boots, consumables, and incomplete builds)
          itemIds.forEach((id) => {
            const itemData = getItemData(id);
            if (!isEligibleFavoriteItem(itemData)) return;
            const name = getItemName(itemData);
            if (!name) return;
            itemCounts.set(name, (itemCounts.get(name) ?? 0) + 1);
          });
        });

        const favoriteLane =
          Array.from(laneCounts.entries()).sort(
            (a, b) => b[1] - a[1],
          )[0]?.[0] ?? undefined;

        const favoriteChampion =
          Array.from(champStats.entries()).sort(
            (a, b) => b[1].games - a[1].games,
          )[0]?.[0] ?? undefined;

        const highestWinrateChampion = (() => {
          let best: { champ: string; wr: number; games: number } | undefined;
          champStats.forEach((v, k) => {
            const wr = v.games > 0 ? v.wins / v.games : 0;
            if (
              !best ||
              wr > best.wr ||
              (wr === best.wr && v.games > best.games) ||
              (wr === best.wr && v.games === best.games && k < best.champ)
            ) {
              best = { champ: k, wr, games: v.games };
            }
          });
          return best?.champ ?? undefined;
        })();

        const nemesisChampion =
          Array.from(nemesisCounts.entries()).sort(
            (a, b) => b[1] - a[1],
          )[0]?.[0] ?? undefined;

        const bullyChampion =
          Array.from(bullyCounts.entries()).sort(
            (a, b) => b[1] - a[1],
          )[0]?.[0] ?? undefined;

        const favoriteItem =
          Array.from(itemCounts.entries()).sort(
            (a, b) => b[1] - a[1],
          )[0]?.[0] ?? undefined;

        const favoriteStarter =
          Array.from(starterCounts.entries()).sort(
            (a, b) => b[1] - a[1],
          )[0]?.[0] ?? undefined;

        return {
          favoriteLane,
          favoriteChampion,
          favoriteItem,
          favoriteStarter,
          highestWinrateChampion,
          nemesisChampion,
          bullyChampion,
        };
      };

      const extras = computeExtras();

      const highlights = detectHighlightGames(allMatchData, puuid).map((h) => ({
        type: h.type,
        matchId: h.matchId,
        title: h.title,
        description: h.description,
        badge: h.badge,
        rarity: h.rarity,
        statsJson: h.stats,
        reason: h.description,
      }));
      const achievements = generateAchievements(allMatchData, puuid).map(
        (a) => ({
          id: a.id,
          title: a.title,
          description: a.description,
          icon: a.icon,
          rarity: a.rarity,
          unlocked: a.unlocked,
          progress: a.progress,
          total: a.total,
        }),
      );
      createRewind.mutate({
        puuid,
        platform,
        queueType,
        year: new Date().getFullYear(),
        data: sendQuery.data,
        highlights,
        achievements,
        favoriteLane: extras.favoriteLane,
        favoriteChampion: extras.favoriteChampion,
        favoriteItem: extras.favoriteItem,
        favoriteStarter: extras.favoriteStarter,
        highestWinrateChampion: extras.highestWinrateChampion,
        nemesisChampion: extras.nemesisChampion,
        bullyChampion: extras.bullyChampion,
      });
    }
  }, [sendQuery.data, createRewind, puuid, platform, queueType, allMatchData]);

  useEffect(() => {
    if (createRewind.data) {
      handleGenerationOk();
    }
  }, [createRewind.data, handleGenerationOk]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-4 py-4 md:px-20 lg:px-40 dark:bg-neutral-950">
      <div className="w-full max-w-4xl text-center">
        <h2 className="mb-4 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          {isLoadingMatches &&
            `Loading matches... (${allMatchData.length}/${idsRef.current.length})`}
          {sendQuery.isPending && "Analyzing your gameplay..."}
          {createRewind.isPending && "Saving your rewind..."}
          {createRewind.isSuccess && "Rewind generated!"}
        </h2>
        {sendQuery.isError && (
          <p className="text-red-500">Error generating rewind</p>
        )}
        {createRewind.isError && (
          <p className="text-red-500">Error saving rewind</p>
        )}
      </div>
    </div>
  );
};

export default RewindGenerationSection;
