"use client";

import { useParams } from "next/navigation";
import { useLeague } from "~/hooks/useLeague";
import { useState, useEffect, useCallback } from "react";
import {
  type CommonQueueType,
  getMonthlyRanges,
  convertMatchesToPerformances,
  QUEUE_IDS,
} from "~/util/riot/game";
import type { MatchOverview } from "~/types/riot";
import { api } from "~/trpc/react";
import { useSummoner } from "~/hooks/useSummoner";
import RewindQueueTypeSection from "~/components/rewind/RewindQueueTypeSection";
import RewindInitialSection from "~/components/rewind/RewindInitialSection";
import RewindGenerationSection from "~/components/rewind/RewindGenerationSection";
import RewindPlaystyleSection from "~/components/rewind/RewindPlaystyleSection";
import RewindStrengthsSection from "~/components/rewind/RewindStrengthsSection";
import RewindWeaknessesSection from "~/components/rewind/RewindWeaknessesSection";
import RewindAdviceSection from "~/components/rewind/RewindAdviceSection";

type RewindStageType =
  | "initial"
  | "queueType"
  | "generation"
  | "overview"
  | "favorite_champion"
  | "favorite_item"
  | "playstyle"
  | "strengths"
  | "weaknesses"
  | "advice";

const RewindPage = () => {
  const params = useParams();
  const name = params.name as string;
  const platform = params.platform as string;
  const [gameName, tagName] = name.split("-");
  const [queueType, setQueueType] = useState<CommonQueueType | null>(null);

  const league = useLeague(platform);
  const selectedQueueId = queueType === null ? null : QUEUE_IDS[queueType];

  const summoner = useSummoner({ platform, name: gameName, tag: tagName });

  const ranges = getMonthlyRanges(new Date().getFullYear()).slice(
    0,
    new Date().getMonth() + 1,
  );
  const { data: matchIdsByMonth, isLoading: isMatchIdsLoading } =
    api.riot.getMatchesByPuuidAndMonths.useQuery(
      {
        id: summoner?.puuid ?? "",
        queue: selectedQueueId ?? -1,
        platform,
        months: ranges,
        count: 10,
      },
      {
        enabled: !!summoner?.puuid && queueType !== null,
      },
    );
  const { data: matchData, isLoading: IsMatchDataLoading } =
    api.riot.getMatchesByGameIds.useQuery(
      {
        platform,
        ids: matchIdsByMonth?.flatMap((month) => month.matches) ?? [],
      },
      {
        enabled:
          !isMatchIdsLoading && !!matchIdsByMonth && matchIdsByMonth.length > 0,
      },
    );

  const [matches, setMatches] = useState<
    { month: string; performances: MatchOverview[] }[]
  >([]);
  const [stage, setStage] = useState<RewindStageType>("initial");

  const { data: existingRewind } = api.rewind.getExistingRewind.useQuery(
    {
      puuid: summoner?.puuid ?? "",
      platform,
      queueType: queueType ?? "",
      year: new Date().getFullYear(),
    },
    {
      enabled: !!summoner?.puuid && queueType !== null,
    },
  );

  useEffect(() => {
    if (existingRewind && stage === "generation") {
      setStage("playstyle");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingRewind]);

  useEffect(() => {
    if (matchData && matchIdsByMonth && summoner?.puuid) {
      const restructuredData = convertMatchesToPerformances(
        matchData,
        matchIdsByMonth,
        summoner.puuid,
        league.items,
      ).filter((match) => match.performances.length > 0);
      setMatches(restructuredData);
    }
  }, [matchData, matchIdsByMonth, summoner?.puuid, league.items]);

  const handleInitialOk = useCallback(() => {
    setStage("queueType");
  }, []);

  const handleQueueTypeSelection = useCallback(
    (selectedQueueType: CommonQueueType) => {
      setQueueType(selectedQueueType);
      setStage("generation");
    },
    [],
  );

  const handleGenerationOk = useCallback(() => {
    setStage("playstyle");
  }, []);

  const handlePlaystyleNext = useCallback(() => {
    setStage("strengths");
  }, []);

  const handleStrengthsNext = useCallback(() => {
    setStage("weaknesses");
  }, []);

  const handleWeaknessesNext = useCallback(() => {
    setStage("advice");
  }, []);

  const handleAdviceFinish = useCallback(() => {
    setStage("overview");
  }, []);

  return (
    <>
      {stage === "initial" && (
        <RewindInitialSection handleInitialOk={handleInitialOk} />
      )}
      {stage === "queueType" && (
        <RewindQueueTypeSection
          handleQueueTypeSelection={handleQueueTypeSelection}
        />
      )}
      {stage === "generation" && (
        <RewindGenerationSection
          handleGenerationOk={handleGenerationOk}
          matches={matches}
          puuid={summoner?.puuid ?? ""}
          platform={platform}
          queueType={queueType ?? ""}
        />
      )}
      {stage === "playstyle" &&
        existingRewind?.playstyle &&
        summoner.account &&
        summoner.summoner &&
        league.version && (
          <RewindPlaystyleSection
            playstyle={existingRewind.playstyle}
            summoner={{
              gameName: summoner.account.gameName ?? "",
              tagLine: summoner.account.tagLine ?? "",
              profileIconId: summoner.summoner.profileIconId,
            }}
            version={league.version.v}
            onNext={handlePlaystyleNext}
          />
        )}
      {stage === "strengths" &&
        existingRewind?.gameplayElements &&
        summoner.account &&
        summoner.summoner &&
        league.version && (
          <RewindStrengthsSection
            strengths={existingRewind.gameplayElements.filter(
              (el) => el.form === "strength",
            )}
            summoner={{
              gameName: summoner.account.gameName ?? "",
              tagLine: summoner.account.tagLine ?? "",
              profileIconId: summoner.summoner.profileIconId,
            }}
            version={league.version.v}
            onNext={handleStrengthsNext}
          />
        )}
      {stage === "weaknesses" &&
        existingRewind?.gameplayElements &&
        summoner.account &&
        summoner.summoner &&
        league.version && (
          <RewindWeaknessesSection
            weaknesses={existingRewind.gameplayElements.filter(
              (el) => el.form === "weakness",
            )}
            summoner={{
              gameName: summoner.account.gameName ?? "",
              tagLine: summoner.account.tagLine ?? "",
              profileIconId: summoner.summoner.profileIconId,
            }}
            version={league.version.v}
            onNext={handleWeaknessesNext}
          />
        )}
      {stage === "advice" &&
        existingRewind?.advice &&
        summoner.account &&
        summoner.summoner &&
        league.version && (
          <RewindAdviceSection
            advice={existingRewind.advice}
            summoner={{
              gameName: summoner.account.gameName ?? "",
              tagLine: summoner.account.tagLine ?? "",
              profileIconId: summoner.summoner.profileIconId,
            }}
            version={league.version.v}
            onFinish={handleAdviceFinish}
          />
        )}
      {stage === "overview" && existingRewind && (
        <div className="flex min-h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-950">
          <div className="text-center">
            <h2 className="mb-4 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              Rewind Complete!
            </h2>
            <p className="text-neutral-700 dark:text-neutral-300">
              Thank you for viewing your {new Date().getFullYear()} rewind.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default RewindPage;
