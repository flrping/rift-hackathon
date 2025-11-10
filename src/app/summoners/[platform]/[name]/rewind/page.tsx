"use client";

import { useParams } from "next/navigation";
import { useLeague } from "~/hooks/useLeague";
import { useState, useEffect, useCallback, useMemo } from "react";
import type { Match } from "~/types/riot";
import { type CommonQueueType } from "~/util/riot/game";
import { api } from "~/trpc/react";
import { useSummoner } from "~/hooks/useSummoner";
import RewindQueueTypeSection from "~/components/rewind/RewindQueueTypeSection";
import RewindInitialSection from "~/components/rewind/RewindInitialSection";
import RewindGenerationSection from "~/components/rewind/RewindGenerationSection";
import RewindPlaystyleSection from "~/components/rewind/RewindPlaystyleSection";
import RewindStrengthsSection from "~/components/rewind/RewindStrengthsSection";
import RewindWeaknessesSection from "~/components/rewind/RewindWeaknessesSection";
import RewindAdviceSection from "~/components/rewind/RewindAdviceSection";
import RewindHighlightsSection from "~/components/rewind/RewindHighlightsSection";
import RewindShowcaseBuilderSection from "~/components/rewind/RewindShowcaseBuilderSection";
import RewindStatisticSection from "~/components/rewind/RewindStatisticSection";
import ProgressBar from "~/components/rewind/ProgressBar";
import { SiteNavbar } from "~/components/SiteNavbar";
import { SiteFooter } from "~/components/SiteFooter";
import Link from "next/link";

type RewindStageType =
  | "initial"
  | "queueType"
  | "generation"
  | "highlights"
  | "favorite_champion"
  | "favorite_lane"
  | "favorite_item"
  | "favorite_starter"
  | "highest_winrate"
  | "nemesis"
  | "bully"
  | "playstyle"
  | "strengths"
  | "weaknesses"
  | "advice"
  | "showcase"
  | "overview";

const RewindPage = () => {
  const params = useParams();
  const name = params.name as string;
  const platform = params.platform as string;
  const [gameName, tagName] = name.split("-");
  const [queueType, setQueueType] = useState<CommonQueueType | null>(null);

  const league = useLeague(platform);
  const summoner = useSummoner({ platform, name: gameName, tag: tagName });
  const [stage, setStage] = useState<RewindStageType>("initial");
  const [matches, setMatches] = useState<Match[]>([]);

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

  const { data: globalStats } = api.rewind.getGlobalStats.useQuery(
    {
      year: new Date().getFullYear(),
      queueType: queueType ?? "",
    },
    {
      enabled: queueType !== null,
    },
  );

  type UIHighlight = {
    id: number;
    type: string;
    matchId: string;
    title: string;
    description: string;
    badge: string;
    rarity: string;
    statsJson: unknown;
  };
  type UIAchievement = {
    id: number | string;
    title: string;
    description: string;
    icon: string;
    rarity: string;
    unlocked: boolean;
    progress?: number | null;
    total?: number | null;
  };

  type ExistingRewind = {
    playstyle?: { type: string; reason: string } | null;
    gameplayElements?: Array<{
      id: number;
      type: string;
      form: string;
      reason: string;
    }> | null;
    advice?: Array<{ type: string; reason: string }> | null;
    highlights?: UIHighlight[] | null;
    achievements?: UIAchievement[] | null;
    favoriteChampion?: string | null;
    favoriteLane?: string | null;
    favoriteItem?: string | null;
    favoriteStarter?: string | null;
    highestWinrateChampion?: string | null;
    nemesisChampion?: string | null;
    bullyChampion?: string | null;
  };

  const existing = (existingRewind as unknown as ExistingRewind) ?? undefined;

  const dbHighlights: UIHighlight[] =
    (existing?.highlights as unknown as UIHighlight[]) ?? [];
  const dbAchievements: UIAchievement[] =
    (existing?.achievements as unknown as UIAchievement[]) ?? [];

  useEffect(() => {
    if (existingRewind && stage === "generation") {
      setStage("highlights");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingRewind]);

  // Auto-skip sections with missing data
  useEffect(() => {
    if (!existing || !summoner.account || !summoner.summoner || !league.version)
      return;

    if (stage === "favorite_champion" && !existing.favoriteChampion) {
      setStage("favorite_lane");
    } else if (stage === "favorite_lane" && !existing.favoriteLane) {
      setStage("favorite_item");
    } else if (stage === "favorite_item" && !existing.favoriteItem) {
      setStage("favorite_starter");
    } else if (stage === "favorite_starter" && !existing.favoriteStarter) {
      setStage("highest_winrate");
    } else if (
      stage === "highest_winrate" &&
      !existing.highestWinrateChampion
    ) {
      setStage("nemesis");
    } else if (stage === "nemesis" && !existing.nemesisChampion) {
      setStage("bully");
    } else if (stage === "bully" && !existing.bullyChampion) {
      setStage("playstyle");
    }
  }, [stage, existing, summoner.account, summoner.summoner, league.version]);

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
    setStage("highlights");
  }, []);

  const handleHighlightsNext = useCallback(() => {
    setStage("favorite_champion");
  }, []);

  const handleFavoriteChampionNext = useCallback(() => {
    setStage("favorite_lane");
  }, []);

  const handleFavoriteLaneNext = useCallback(() => {
    setStage("favorite_item");
  }, []);

  const handleFavoriteItemNext = useCallback(() => {
    setStage("favorite_starter");
  }, []);

  const handleFavoriteStarterNext = useCallback(() => {
    setStage("highest_winrate");
  }, []);

  const handleHighestWinrateNext = useCallback(() => {
    setStage("nemesis");
  }, []);

  const handleNemesisNext = useCallback(() => {
    setStage("bully");
  }, []);

  const handleBullyNext = useCallback(() => {
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
    setStage("showcase");
  }, []);

  type PercentageField =
    | "favoriteChampion"
    | "favoriteLane"
    | "favoriteItem"
    | "favoriteStarter"
    | "highestWinrateChampion"
    | "nemesisChampion"
    | "bullyChampion";

  type PercentageContext =
    | "favoriteChampion"
    | "favoriteLane"
    | "favoriteItem"
    | "favoriteStarter"
    | "highestWinrate"
    | "nemesis"
    | "bully";

  type PercentageResult = {
    percentage: number | undefined;
    text: string | undefined;
  };

  const formatPercentageMessage = (
    context: PercentageContext,
    value: string,
    percentage: number,
  ): string => {
    const pct = percentage.toFixed(1);
    switch (context) {
      case "favoriteChampion":
        return `${pct}% of players chose ${value} as their favorite champion.`;
      case "favoriteLane":
        return `${pct}% of players prefer to play ${value}.`;
      case "favoriteItem":
        return `${pct}% of players use ${value} the most.`;
      case "favoriteStarter":
        return `${pct}% of players start most games with ${value}.`;
      case "highestWinrate":
        return `${pct}% of players achieve their best winrate with ${value}.`;
      case "nemesis":
        return `${pct}% of players struggle to beat ${value}.`;
      case "bully":
        return `${pct}% of players consistently defeat ${value}.`;
      default:
        return `${pct}% of players share this stat.`;
    }
  };

  const percentageInfo = useMemo(() => {
    const make = (
      field: PercentageField,
      value: string | undefined | null,
      context: PercentageContext,
    ): PercentageResult => {
      if (!value) return { percentage: undefined, text: undefined };
      if (!globalStats?.totalCount) {
        return { percentage: undefined, text: undefined };
      }
      const count = globalStats[field]?.get(value) ?? 0;
      const percentage = (count / globalStats.totalCount) * 100;
      return {
        percentage,
        text: formatPercentageMessage(context, value, percentage),
      };
    };

    return {
      favoriteChampion: make(
        "favoriteChampion",
        existing?.favoriteChampion,
        "favoriteChampion",
      ),
      favoriteLane: make(
        "favoriteLane",
        existing?.favoriteLane,
        "favoriteLane",
      ),
      favoriteItem: make(
        "favoriteItem",
        existing?.favoriteItem,
        "favoriteItem",
      ),
      favoriteStarter: make(
        "favoriteStarter",
        existing?.favoriteStarter,
        "favoriteStarter",
      ),
      highestWinrate: make(
        "highestWinrateChampion",
        existing?.highestWinrateChampion,
        "highestWinrate",
      ),
      nemesis: make("nemesisChampion", existing?.nemesisChampion, "nemesis"),
      bully: make("bullyChampion", existing?.bullyChampion, "bully"),
    };
  }, [globalStats, existing]);

  const stageOrder: RewindStageType[] = [
    "initial",
    "queueType",
    "generation",
    "highlights",
    "favorite_champion",
    "favorite_lane",
    "favorite_item",
    "favorite_starter",
    "highest_winrate",
    "nemesis",
    "bully",
    "playstyle",
    "strengths",
    "weaknesses",
    "advice",
    "showcase",
    "overview",
  ];

  const currentStageIndex = stageOrder.indexOf(stage);
  const totalStages = stageOrder.length;
  const progressTotalSteps = Math.max(1, totalStages - 3);
  const progressCurrentStep = Math.min(
    progressTotalSteps,
    Math.max(0, currentStageIndex - 2),
  );
  const showProgressBar =
    currentStageIndex >= 3 && currentStageIndex < totalStages - 1;

  return (
    <>
      <SiteNavbar />
      {showProgressBar && (
        <ProgressBar current={progressCurrentStep} total={progressTotalSteps} />
      )}
      {stage === "initial" && (
        <RewindInitialSection
          handleInitialOk={handleInitialOk}
          matches={matches}
          setMatches={setMatches}
        />
      )}
      {stage === "queueType" && (
        <RewindQueueTypeSection
          handleQueueTypeSelection={handleQueueTypeSelection}
          matches={matches}
          setMatches={setMatches}
        />
      )}
      {stage === "generation" && queueType && (
        <RewindGenerationSection
          handleGenerationOk={handleGenerationOk}
          puuid={summoner?.puuid ?? ""}
          platform={platform}
          queueType={queueType}
          items={league.items}
          matches={matches}
          setMatches={setMatches}
        />
      )}
      {stage === "highlights" &&
        summoner.account &&
        summoner.summoner &&
        league.version &&
        existingRewind && (
          <RewindHighlightsSection
            highlights={dbHighlights}
            achievements={dbAchievements}
            summoner={{
              gameName: summoner.account.gameName ?? "",
              tagLine: summoner.account.tagLine ?? "",
              profileIconId: summoner.summoner.profileIconId,
            }}
            version={league.version.v}
            onNext={handleHighlightsNext}
            setMatches={setMatches}
          />
        )}
      {stage === "favorite_champion" &&
        existing?.favoriteChampion &&
        summoner.account &&
        summoner.summoner &&
        league.version && (
          <RewindStatisticSection
            title="Favorite Champion"
            description="The champion you played the most this year"
            statValue={existing.favoriteChampion}
            statLabel="Most Played Champion"
            percentage={percentageInfo.favoriteChampion.percentage}
            percentageText={percentageInfo.favoriteChampion.text}
            summoner={{
              gameName: summoner.account.gameName ?? "",
              tagLine: summoner.account.tagLine ?? "",
              profileIconId: summoner.summoner.profileIconId,
            }}
            version={league.version.v}
            onNext={handleFavoriteChampionNext}
            matches={matches}
            setMatches={setMatches}
          />
        )}
      {stage === "favorite_lane" &&
        existing?.favoriteLane &&
        summoner.account &&
        summoner.summoner &&
        league.version && (
          <RewindStatisticSection
            title="Favorite Lane"
            description="The lane you played the most this year"
            statValue={existing.favoriteLane}
            statLabel="Most Played Lane"
            percentage={percentageInfo.favoriteLane.percentage}
            percentageText={percentageInfo.favoriteLane.text}
            summoner={{
              gameName: summoner.account.gameName ?? "",
              tagLine: summoner.account.tagLine ?? "",
              profileIconId: summoner.summoner.profileIconId,
            }}
            version={league.version.v}
            onNext={handleFavoriteLaneNext}
            matches={matches}
            setMatches={setMatches}
          />
        )}
      {stage === "favorite_item" &&
        existing?.favoriteItem &&
        summoner.account &&
        summoner.summoner &&
        league.version && (
          <RewindStatisticSection
            title="Favorite Item"
            description="The item you built the most this year"
            statValue={existing.favoriteItem}
            statLabel="Most Built Item"
            percentage={percentageInfo.favoriteItem.percentage}
            percentageText={percentageInfo.favoriteItem.text}
            summoner={{
              gameName: summoner.account.gameName ?? "",
              tagLine: summoner.account.tagLine ?? "",
              profileIconId: summoner.summoner.profileIconId,
            }}
            version={league.version.v}
            onNext={handleFavoriteItemNext}
            matches={matches}
            setMatches={setMatches}
          />
        )}
      {stage === "favorite_starter" &&
        existing?.favoriteStarter &&
        summoner.account &&
        summoner.summoner &&
        league.version && (
          <RewindStatisticSection
            title="Favorite Starter Item"
            description="The starter item you used the most this year"
            statValue={existing.favoriteStarter}
            statLabel="Most Used Starter Item"
            percentage={percentageInfo.favoriteStarter.percentage}
            percentageText={percentageInfo.favoriteStarter.text}
            summoner={{
              gameName: summoner.account.gameName ?? "",
              tagLine: summoner.account.tagLine ?? "",
              profileIconId: summoner.summoner.profileIconId,
            }}
            version={league.version.v}
            onNext={handleFavoriteStarterNext}
            matches={matches}
            setMatches={setMatches}
          />
        )}
      {stage === "highest_winrate" &&
        existing?.highestWinrateChampion &&
        summoner.account &&
        summoner.summoner &&
        league.version && (
          <RewindStatisticSection
            title="Highest Winrate Champion"
            description="The champion you had the highest winrate with this year"
            statValue={existing.highestWinrateChampion}
            statLabel="Highest Winrate Champion"
            percentage={percentageInfo.highestWinrate.percentage}
            percentageText={percentageInfo.highestWinrate.text}
            summoner={{
              gameName: summoner.account.gameName ?? "",
              tagLine: summoner.account.tagLine ?? "",
              profileIconId: summoner.summoner.profileIconId,
            }}
            version={league.version.v}
            onNext={handleHighestWinrateNext}
            matches={matches}
            setMatches={setMatches}
          />
        )}
      {stage === "nemesis" &&
        existing?.nemesisChampion &&
        summoner.account &&
        summoner.summoner &&
        league.version && (
          <RewindStatisticSection
            title="Nemesis Champion"
            description="The opponent champion you lost to the most this year"
            statValue={existing.nemesisChampion}
            statLabel="Nemesis Champion"
            percentage={percentageInfo.nemesis.percentage}
            percentageText={percentageInfo.nemesis.text}
            summoner={{
              gameName: summoner.account.gameName ?? "",
              tagLine: summoner.account.tagLine ?? "",
              profileIconId: summoner.summoner.profileIconId,
            }}
            version={league.version.v}
            onNext={handleNemesisNext}
            matches={matches}
            setMatches={setMatches}
          />
        )}
      {stage === "bully" &&
        existing?.bullyChampion &&
        summoner.account &&
        summoner.summoner &&
        league.version && (
          <RewindStatisticSection
            title="Bully Champion"
            description="The opponent champion you beat the most this year"
            statValue={existing.bullyChampion}
            statLabel="Your Bully Champion"
            percentage={percentageInfo.bully.percentage}
            percentageText={percentageInfo.bully.text}
            summoner={{
              gameName: summoner.account.gameName ?? "",
              tagLine: summoner.account.tagLine ?? "",
              profileIconId: summoner.summoner.profileIconId,
            }}
            version={league.version.v}
            onNext={handleBullyNext}
            matches={matches}
            setMatches={setMatches}
          />
        )}
      {stage === "playstyle" &&
        existing?.playstyle &&
        summoner.account &&
        summoner.summoner &&
        league.version && (
          <RewindPlaystyleSection
            playstyle={existing.playstyle}
            summoner={{
              gameName: summoner.account.gameName ?? "",
              tagLine: summoner.account.tagLine ?? "",
              profileIconId: summoner.summoner.profileIconId,
            }}
            version={league.version.v}
            onNext={handlePlaystyleNext}
            matches={matches}
            setMatches={setMatches}
          />
        )}
      {stage === "strengths" &&
        existing?.gameplayElements &&
        summoner.account &&
        summoner.summoner &&
        league.version && (
          <RewindStrengthsSection
            strengths={(existing?.gameplayElements ?? []).filter(
              (el) => el.form === "strength",
            )}
            summoner={{
              gameName: summoner.account.gameName ?? "",
              tagLine: summoner.account.tagLine ?? "",
              profileIconId: summoner.summoner.profileIconId,
            }}
            version={league.version.v}
            onNext={handleStrengthsNext}
            matches={matches}
            setMatches={setMatches}
          />
        )}
      {stage === "weaknesses" &&
        existing?.gameplayElements &&
        summoner.account &&
        summoner.summoner &&
        league.version && (
          <RewindWeaknessesSection
            weaknesses={(existing?.gameplayElements ?? []).filter(
              (el) => el.form === "weakness",
            )}
            summoner={{
              gameName: summoner.account.gameName ?? "",
              tagLine: summoner.account.tagLine ?? "",
              profileIconId: summoner.summoner.profileIconId,
            }}
            version={league.version.v}
            onNext={handleWeaknessesNext}
            matches={matches}
            setMatches={setMatches}
          />
        )}
      {stage === "advice" &&
        existing?.advice &&
        summoner.account &&
        summoner.summoner &&
        league.version && (
          <RewindAdviceSection
            advice={existing.advice}
            summoner={{
              gameName: summoner.account.gameName ?? "",
              tagLine: summoner.account.tagLine ?? "",
              profileIconId: summoner.summoner.profileIconId,
            }}
            version={league.version.v}
            onFinish={handleAdviceFinish}
            matches={matches}
            setMatches={setMatches}
          />
        )}
      {stage === "showcase" && existing && summoner.puuid && (
        <RewindShowcaseBuilderSection
          puuid={summoner.puuid}
          platform={platform}
          queueType={queueType ?? "ALL"}
          year={new Date().getFullYear()}
          summoner={{
            gameName: summoner.account?.gameName ?? "",
            tagLine: summoner.account?.tagLine ?? "",
            profileIconId: summoner.summoner?.profileIconId ?? 0,
          }}
          onFinish={() => setStage("overview")}
        />
      )}
      {stage === "overview" && existing && (
        <div className="flex min-h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-950">
          <div className="text-center">
            <h2 className="mb-4 text-5xl font-extrabold tracking-tight text-rose-600 sm:text-[4rem] dark:text-rose-500">
              Rewind Complete!
            </h2>
            <p className="mb-8 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
              Your showcase has been saved (if you created one). Share it with
              your friends!
            </p>
            <Link
              href={`/summoners/${platform}/${name}/rewind/share`}
              className="inline-block rounded-lg border border-neutral-300 bg-rose-400 px-8 py-3 text-lg font-medium text-white shadow-lg transition-all hover:bg-rose-500 dark:border-neutral-700 dark:bg-rose-500 dark:hover:bg-rose-600"
            >
              View Share Page
            </Link>
          </div>
        </div>
      )}
      <SiteFooter />
    </>
  );
};

export default RewindPage;
