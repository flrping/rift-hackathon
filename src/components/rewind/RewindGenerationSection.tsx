"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "~/trpc/react";
import type { MatchOverview, Match } from "~/types/riot";
import {
  type CommonQueueType,
  getMonthlyRanges,
  convertMatchesToPerformances,
  QUEUE_IDS,
} from "~/util/riot/game";
import type { ItemData } from "~/types/riot";

interface RewindGenerationSectionProps {
  handleGenerationOk: () => void;
  puuid: string;
  platform: string;
  queueType: CommonQueueType;
  items?: ItemData;
}

const RewindGenerationSection = ({
  handleGenerationOk,
  puuid,
  platform,
  queueType,
  items,
}: RewindGenerationSectionProps) => {
  const sendQuery = api.aws.sendQuery.useMutation();
  const createRewind = api.rewind.createRewind.useMutation();
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
        count: 15,
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
        } else if (data.type === "error") {
          setIsLoadingMatches(false);
        }
      },
      onError: () => {
        setIsLoadingMatches(false);
      },
    },
  );

  const [matches, setMatches] = useState<
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
      setMatches(restructuredData);
    }
  }, [allMatchData, matchIdsByMonth, puuid, items]);

  useEffect(() => {
    if (
      matches.length &&
      !isLoadingMatches &&
      !hasSentQuery.current &&
      !sendQuery.isPending
    ) {
      hasSentQuery.current = true;
      sendQuery.mutate(matches);
    }
  }, [matches, isLoadingMatches, sendQuery]);

  useEffect(() => {
    if (
      sendQuery.data &&
      !hasCreatedRewind.current &&
      !createRewind.isPending
    ) {
      hasCreatedRewind.current = true;
      createRewind.mutate({
        puuid,
        platform,
        queueType,
        year: new Date().getFullYear(),
        data: sendQuery.data,
      });
    }
  }, [sendQuery.data, createRewind, puuid, platform, queueType]);

  useEffect(() => {
    if (createRewind.data) {
      handleGenerationOk();
    }
  }, [createRewind.data, handleGenerationOk]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="mb-4 text-2xl font-bold">
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
