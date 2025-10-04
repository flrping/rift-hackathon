"use client";

import { api } from "~/trpc/react";
import { useMemo } from "react";

interface SummonerProps {
  platform: string;
  puuid?: string;
  name?: string;
  tag?: string;
  startTime?: number;
  endTime?: number;
  start?: number;
  count?: number;
}

export const useSummoner = ({
  platform,
  puuid,
  name,
  tag,
}: SummonerProps) => {
  const { data: account, isLoading: isAccountLoading } =
    api.riot.getAccountByNameAndTag.useQuery(
      { name: name ?? "", tag: tag ?? "", platform },
      { enabled: !puuid && !!name && !!tag },
    );

  const resolvedPuuid = useMemo(
    () => puuid ?? account?.puuid,
    [puuid, account],
  );

  const { data: summoner, isLoading: isSummonerLoading } =
    api.riot.getSummonerByPuuid.useQuery(
      { id: resolvedPuuid ?? "", platform },
      { enabled: !!resolvedPuuid },
    );

  const { data: ranks, isLoading: isRanksLoading } =
    api.riot.getRanksByPuuid.useQuery(
      { puuid: resolvedPuuid ?? "", platform },
      { enabled: !!resolvedPuuid },
    );

  const isLoading =
    isAccountLoading ||
    isSummonerLoading ||
    isRanksLoading;

  return {
    account,
    summoner,
    isLoading,
    ranks,
    puuid: resolvedPuuid,
  };
};
