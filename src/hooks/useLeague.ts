"use client";

import { api } from "~/trpc/react";

export const useLeague = (platform = "NA1") => {
  const { data: leagueVersion, isLoading: isLeagueVersionLoading } =
    api.riot.getLeagueVersion.useQuery({
      platform,
    });

  const { data: summonerSpells, isLoading: isSummonerSpellsLoading } =
    api.riot.getSummonerSpells.useQuery(
      {
        version: leagueVersion?.n.summoner ?? "",
        language: leagueVersion?.l ?? "",
      },
      { enabled: !!leagueVersion },
    );

  const { data: queues, isLoading: isQueuesLoading } =
    api.riot.getQueues.useQuery();

  const { data: items, isLoading: isItemsLoading } = api.riot.getItems.useQuery(
    { version: leagueVersion?.n.item ?? "", language: leagueVersion?.l ?? "" },
    { enabled: !!leagueVersion },
  );

  const isLoading =
    isLeagueVersionLoading ||
    isSummonerSpellsLoading ||
    isQueuesLoading ||
    isItemsLoading;

  return {
    version: leagueVersion,
    summonerSpells: summonerSpells,
    queues: queues,
    items: items,
    isLoading,
  };
};
