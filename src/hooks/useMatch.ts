import { api } from "~/trpc/react";
import { useEffect, useState } from "react";
import type { Match } from "~/types/riot";

interface MatchProps {
  platform: string;
  puuid: string;
  startTime?: number;
  endTime?: number;
  start?: number;
  count?: number;
  queue?: number;
}

export const useMatch = ({
  platform,
  puuid,
  startTime,
  endTime,
  start,
  count,
  queue,
}: MatchProps) => {
  const { data: matchIds, isLoading: isMatchIdsLoading } =
    api.riot.getMatchesByPuuid.useQuery(
      { id: puuid ?? "", start, count, platform, startTime, endTime, queue },
      { enabled: !!puuid },
    );

  const { data: matches, isLoading: isMatchesLoading } =
    api.riot.getMatchesByGameIds.useQuery(
      { ids: matchIds ?? [], platform },
      { enabled: !!matchIds?.length },
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

  const isLoading = isMatchIdsLoading || isMatchesLoading;

  return {
    processedMatches,
    isLoading,
  };
};
