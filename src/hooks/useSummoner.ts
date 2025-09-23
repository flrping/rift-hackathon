"use client";

import { api } from "~/trpc/react";
import { useEffect, useState } from "react";
import type { Match } from "~/types/riot";

interface SummonerProps {
  platform: string;
  name: string;
  tag: string;
  start: number;
  count: number;
}

export const useSummoner = ({
  platform,
  name,
  tag,
  start = 0,
  count = 10,
}: SummonerProps) => {
  const { data: account, isLoading: isAccountLoading } =
    api.riot.getAccountByNameAndTag.useQuery(
      { name: name ?? "", tag: tag ?? "", platform },
      { enabled: !!name && !!tag },
    );

  const { data: summoner, isLoading: isSummonerLoading } =
    api.riot.getSummonerByPUUID.useQuery(
      { id: account?.puuid ?? "", platform },
      { enabled: !!account?.puuid },
    );

  const { data: matchIds, isLoading: isMatchIdsLoading } =
    api.riot.getMatchesByPUUID.useQuery(
      { id: account?.puuid ?? "", start, count, platform },
      { enabled: !!account?.puuid },
    );

  const { data: matches, isLoading: isMatchesLoading } =
    api.riot.getMatchesByGameIds.useQuery(
      { ids: matchIds ?? [], platform },
      { enabled: !!matchIds },
    );

  const { data: ranks, isLoading: isRanksLoading } =
    api.riot.getRanksByPUUID.useQuery(
      { puuid: account?.puuid ?? "", platform },
      { enabled: !!account?.puuid },
    );

  const [processedMatches, setProcessedMatches] = useState<Match[]>([]);

  useEffect(() => {
    if (matchIds && matches) {
      setProcessedMatches((prev) => {
        const newMatches = matches.filter(
          (m) => !prev.some((pm) => pm.info.gameId === m.info.gameId),
        );
        return [...prev, ...newMatches];
      });
    }
  }, [matchIds, matches]);

  const isLoading =
    isAccountLoading ||
    isSummonerLoading ||
    isMatchIdsLoading ||
    isMatchesLoading ||
    isRanksLoading;

  return { account, summoner, processedMatches, isLoading, ranks };
};
