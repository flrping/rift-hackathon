"use client";

import { useParams } from "next/navigation";
import { useLeague } from "~/hooks/useLeague";
import { useState, useEffect, useCallback } from "react";
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
import { SiteNavbar } from "~/components/SiteNavbar";
import { SiteFooter } from "~/components/SiteFooter";

type RewindStageType =
  | "initial"
  | "queueType"
  | "generation"
  | "highlights"
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
      <SiteNavbar />
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
      {stage === "overview" && existing && (
        <div className="flex min-h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-950">
          <div className="text-center">
            <h2 className="dark:text-rose-450 mb-4 text-5xl font-extrabold tracking-tight text-rose-600 sm:text-[4rem]">
              Rewind Complete!
            </h2>
            <p className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
              Thank you for viewing your {new Date().getFullYear()} rewind.
            </p>
          </div>
        </div>
      )}
      <SiteFooter />
    </>
  );
};

export default RewindPage;
