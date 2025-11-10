"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "~/trpc/react";
import { useSummoner } from "~/hooks/useSummoner";
import { SiteNavbar } from "~/components/SiteNavbar";
import type { CommonQueueType } from "~/util/riot/game";
import ShowcaseCard from "~/components/rewind/ShowcaseCard";
import { formatQueueType, formatPlaystyleType } from "~/util/formatNames";
import { toPng } from "html-to-image";

const CURRENT_YEAR = new Date().getFullYear();

export default function RewindSharePage() {
  const params = useParams();
  const name = params.name as string;
  const platform = params.platform as string;
  const [gameName, tagName] = useMemo(() => name.split("-"), [name]);

  const cardRef = useRef<HTMLDivElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [queueType, setQueueType] = useState<CommonQueueType>("DRAFT");

  const summoner = useSummoner({
    platform,
    name: gameName ?? "",
    tag: tagName ?? "",
  });

  const { data: existingRewind, isLoading } =
    api.rewind.getExistingRewind.useQuery(
      {
        puuid: summoner?.puuid ?? "",
        platform,
        queueType,
        year: CURRENT_YEAR,
      },
      {
        enabled: !!summoner?.puuid,
      },
    );

  const globalStats = api.rewind.getGlobalStats.useQuery(
    { year: CURRENT_YEAR, queueType },
    { enabled: !!summoner?.puuid },
  );

  const draftQuery = api.rewind.getExistingRewind.useQuery(
    {
      puuid: summoner?.puuid ?? "",
      platform,
      queueType: "DRAFT",
      year: CURRENT_YEAR,
    },
    { enabled: !!summoner?.puuid && queueType !== "DRAFT" },
  );
  const soloQuery = api.rewind.getExistingRewind.useQuery(
    {
      puuid: summoner?.puuid ?? "",
      platform,
      queueType: "RANKED_SOLO_5x5",
      year: CURRENT_YEAR,
    },
    { enabled: !!summoner?.puuid && queueType !== "RANKED_SOLO_5x5" },
  );
  const flexQuery = api.rewind.getExistingRewind.useQuery(
    {
      puuid: summoner?.puuid ?? "",
      platform,
      queueType: "RANKED_FLEX_SR",
      year: CURRENT_YEAR,
    },
    { enabled: !!summoner?.puuid && queueType !== "RANKED_FLEX_SR" },
  );

  type ExistingWithShowcase = {
    showcase?: {
      backgroundColor?: string | null;
      flair?: string | null;
      champion?: string | null;
      skinNum?: number | null;
      overlayEnabled?: boolean | null;
    } | null;
    highlights?: Array<{
      title?: string | null;
      badge?: string | null;
    }> | null;
    achievements?: Array<{
      title: string;
      icon?: string | null;
    }> | null;
    advice?: Array<{
      type: string;
      reason: string;
    }> | null;
    playstyle?: { type?: string | null } | null;
    favoriteChampion?: string | null;
    favoriteLane?: string | null;
    favoriteItem?: string | null;
    favoriteStarter?: string | null;
    highestWinrateChampion?: string | null;
    nemesisChampion?: string | null;
    bullyChampion?: string | null;
    gameplayElements?: Array<{
      type: string;
      form: string;
      reason: string;
    }> | null;
  };
  const withExtras =
    (existingRewind as unknown as ExistingWithShowcase) ?? undefined;

  useEffect(() => {
    if (!summoner?.puuid) return;
    if (isLoading) return;
    if (withExtras?.showcase) return;
    const soloHas = (
      soloQuery.data as unknown as ExistingWithShowcase | undefined
    )?.showcase;
    const draftHas = (
      draftQuery.data as unknown as ExistingWithShowcase | undefined
    )?.showcase;
    const flexHas = (
      flexQuery.data as unknown as ExistingWithShowcase | undefined
    )?.showcase;
    if (soloHas) {
      setQueueType("RANKED_SOLO_5x5");
      return;
    }
    if (draftHas) {
      setQueueType("DRAFT");
      return;
    }
    if (flexHas) {
      setQueueType("RANKED_FLEX_SR");
    }
  }, [
    summoner?.puuid,
    isLoading,
    withExtras?.showcase,
    draftQuery.data,
    soloQuery.data,
    flexQuery.data,
  ]);

  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(id);
  }, [copied]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const handleDownloadImage = async () => {
    if (!cardRef.current) return;
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        backgroundColor: "#0a0a0a",
        pixelRatio: 2,
      });
      const link = document.createElement("a");
      link.download = `rewind-${gameName}-${CURRENT_YEAR}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to generate image", err);
    }
  };

  const isSummonerReady = !!summoner?.account && !!summoner?.summoner;
  const notFound = !isLoading && isSummonerReady && !existingRewind;

  return (
    <>
      <SiteNavbar />
      <main className="flex min-h-screen w-full items-start justify-center bg-neutral-50 px-4 py-10 text-neutral-900 dark:bg-neutral-950 dark:text-white">
        <div className="w-full max-w-4xl">
          <div className="mb-8 text-center">
            <h1 className="mb-4 text-5xl font-extrabold tracking-tight text-rose-600 sm:text-[4rem] dark:text-rose-500">
              Rewind Share
            </h1>
          </div>

          <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
            <div className="flex overflow-hidden rounded-lg border border-neutral-300 shadow-sm dark:border-neutral-700">
              <button
                type="button"
                onClick={() => setQueueType("DRAFT")}
                className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                  queueType === "DRAFT"
                    ? "bg-rose-500 text-white dark:bg-rose-500"
                    : "bg-white text-neutral-700 hover:bg-neutral-50 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                } border-r border-neutral-300 dark:border-neutral-700`}
              >
                Draft
              </button>
              <button
                type="button"
                onClick={() => setQueueType("RANKED_SOLO_5x5")}
                className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                  queueType === "RANKED_SOLO_5x5"
                    ? "bg-rose-500 text-white dark:bg-rose-500"
                    : "bg-white text-neutral-700 hover:bg-neutral-50 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                } border-r border-neutral-300 dark:border-neutral-700`}
              >
                Ranked Solo/Duo
              </button>
              <button
                type="button"
                onClick={() => setQueueType("RANKED_FLEX_SR")}
                className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                  queueType === "RANKED_FLEX_SR"
                    ? "bg-rose-500 text-white dark:bg-rose-500"
                    : "bg-white text-neutral-700 hover:bg-neutral-50 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                }`}
              >
                Flex
              </button>
            </div>
            <button
              type="button"
              onClick={handleCopyLink}
              className="rounded-lg border border-neutral-300 bg-white px-5 py-2.5 text-sm font-medium text-neutral-700 shadow-sm transition-all hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
            >
              {copied ? "Copied!" : "Copy Link"}
            </button>
            <button
              type="button"
              onClick={handleDownloadImage}
              disabled={isLoading || !withExtras?.showcase}
              className="rounded-lg border border-neutral-300 bg-rose-400 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-rose-500 dark:border-neutral-700 dark:bg-rose-500 dark:hover:bg-rose-600"
            >
              Download Image
            </button>
          </div>

          <div className="rounded-xl border border-neutral-300 bg-white p-8 text-neutral-900 shadow-lg dark:border-neutral-700 dark:bg-neutral-900 dark:text-white">
            {!isLoading && withExtras?.showcase && (
              <div ref={cardRef}>
                <ShowcaseCard
                  className="mb-6 min-h-[280px] sm:min-h-[340px] lg:min-h-[420px] xl:min-h-[480px]"
                  year={CURRENT_YEAR}
                  champion={withExtras?.showcase?.champion ?? "Aatrox"}
                  skinNum={withExtras?.showcase?.skinNum ?? 0}
                  summonerGameName={summoner.account?.gameName ?? ""}
                  summonerTagLine={summoner.account?.tagLine ?? ""}
                  playstyleType={withExtras?.playstyle?.type ?? undefined}
                  highlights={withExtras?.highlights ?? []}
                  achievements={withExtras?.achievements ?? []}
                  queueType={queueType}
                  statistics={{
                    favoriteChampion: withExtras?.favoriteChampion,
                    favoriteLane: withExtras?.favoriteLane,
                    favoriteItem: withExtras?.favoriteItem,
                  }}
                  percentileStats={(() => {
                    const gs = globalStats.data;
                    if (!gs) return null;
                    const out: Array<{ label: string; percentile: number }> =
                      [];
                    const compute = (
                      map: Map<string, number> | undefined,
                      key?: string | null,
                      label?: string,
                    ) => {
                      if (!map || !key || !label) return;
                      const entries = Array.from(map.entries()).sort(
                        (a, b) => b[1] - a[1],
                      );
                      const index = entries.findIndex(([k]) => k === key);
                      if (index < 0) return;
                      const percentile = Math.round(
                        ((index + 1) / Math.max(1, entries.length)) * 100,
                      );
                      out.push({ label, percentile });
                    };
                    compute(
                      gs.favoriteChampion as unknown as Map<string, number>,
                      withExtras?.favoriteChampion,
                      "Champion Popularity",
                    );
                    compute(
                      gs.favoriteLane as unknown as Map<string, number>,
                      withExtras?.favoriteLane,
                      "Lane Popularity",
                    );
                    compute(
                      gs.favoriteItem as unknown as Map<string, number>,
                      withExtras?.favoriteItem,
                      "Item Popularity",
                    );
                    return out.length ? out : null;
                  })()}
                />
              </div>
            )}
            {(summoner.isLoading || isLoading) && (
              <div className="py-12 text-center text-base text-neutral-500 dark:text-neutral-400">
                Loading…
              </div>
            )}

            {notFound && (
              <div className="py-12 text-center">
                <p className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                  Rewind not found
                </p>
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                  No rewind exists for {CURRENT_YEAR} ({queueType}).
                </p>
              </div>
            )}

            {!isLoading && existingRewind && (
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                    {summoner.account?.gameName}
                    {summoner.account?.tagLine
                      ? ` #${summoner.account.tagLine}`
                      : ""}
                  </p>
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Platform: {platform}
                  </p>
                </div>

                <div className="rounded-lg border border-neutral-300 bg-neutral-50 p-6 dark:border-neutral-700 dark:bg-neutral-800">
                  <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    Rift Rewind Overview
                  </p>
                  <ul className="mt-4 space-y-2 text-sm text-neutral-700 dark:text-neutral-300">
                    <li className="flex items-center gap-2">
                      <span className="font-medium">Year:</span> {CURRENT_YEAR}
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="font-medium">Queue:</span>{" "}
                      {formatQueueType(queueType)}
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="font-medium">Highlights:</span>{" "}
                      {withExtras?.highlights?.length ?? 0}
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="font-medium">Achievements:</span>{" "}
                      {withExtras?.achievements?.length ?? 0}
                    </li>
                    {withExtras?.playstyle?.type && (
                      <li className="flex items-center gap-2">
                        <span className="font-medium">Playstyle:</span>{" "}
                        {formatPlaystyleType(withExtras.playstyle.type)}
                      </li>
                    )}
                    {withExtras?.favoriteChampion && (
                      <li className="flex items-center gap-2">
                        <span className="font-medium">Favorite Champion:</span>{" "}
                        {withExtras.favoriteChampion}
                      </li>
                    )}
                    {withExtras?.favoriteLane && (
                      <li className="flex items-center gap-2">
                        <span className="font-medium">Favorite Lane:</span>{" "}
                        {withExtras.favoriteLane}
                      </li>
                    )}
                    {withExtras?.favoriteItem && (
                      <li className="flex items-center gap-2">
                        <span className="font-medium">Favorite Item:</span>{" "}
                        {withExtras.favoriteItem}
                      </li>
                    )}
                    {withExtras?.favoriteStarter && (
                      <li className="flex items-center gap-2">
                        <span className="font-medium">Favorite Starter:</span>{" "}
                        {withExtras.favoriteStarter}
                      </li>
                    )}
                    {withExtras?.highestWinrateChampion && (
                      <li className="flex items-center gap-2">
                        <span className="font-medium">
                          Highest Winrate Champion:
                        </span>{" "}
                        {withExtras.highestWinrateChampion}
                      </li>
                    )}
                    {withExtras?.nemesisChampion && (
                      <li className="flex items-center gap-2">
                        <span className="font-medium">Nemesis Champion:</span>{" "}
                        {withExtras.nemesisChampion}
                      </li>
                    )}
                    {withExtras?.bullyChampion && (
                      <li className="flex items-center gap-2">
                        <span className="font-medium">Bully Champion:</span>{" "}
                        {withExtras.bullyChampion}
                      </li>
                    )}
                  </ul>
                  {withExtras?.gameplayElements &&
                    withExtras.gameplayElements.filter(
                      (el) => el.form === "strength",
                    ).length > 0 && (
                      <div className="mt-6">
                        <p className="mb-3 text-base font-semibold text-neutral-900 dark:text-neutral-100">
                          Strengths
                        </p>
                        <ul className="space-y-3">
                          {withExtras.gameplayElements
                            .filter((el) => el.form === "strength")
                            .map((item, idx) => (
                              <li
                                key={idx}
                                className="rounded-lg border border-neutral-300 bg-white p-4 dark:border-neutral-600 dark:bg-neutral-900"
                              >
                                <p className="mb-1 text-sm font-medium text-rose-600 dark:text-rose-400">
                                  {formatPlaystyleType(item.type)}
                                </p>
                                <p className="text-sm text-neutral-700 dark:text-neutral-300">
                                  {item.reason}
                                </p>
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}
                  {withExtras?.gameplayElements &&
                    withExtras.gameplayElements.filter(
                      (el) => el.form === "weakness",
                    ).length > 0 && (
                      <div className="mt-6">
                        <p className="mb-3 text-base font-semibold text-neutral-900 dark:text-neutral-100">
                          Weaknesses
                        </p>
                        <ul className="space-y-3">
                          {withExtras.gameplayElements
                            .filter((el) => el.form === "weakness")
                            .map((item, idx) => (
                              <li
                                key={idx}
                                className="rounded-lg border border-neutral-300 bg-white p-4 dark:border-neutral-600 dark:bg-neutral-900"
                              >
                                <p className="mb-1 text-sm font-medium text-rose-600 dark:text-rose-400">
                                  {formatPlaystyleType(item.type)}
                                </p>
                                <p className="text-sm text-neutral-700 dark:text-neutral-300">
                                  {item.reason}
                                </p>
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}
                  {withExtras?.advice && withExtras.advice.length > 0 && (
                    <div className="mt-6">
                      <p className="mb-3 text-base font-semibold text-neutral-900 dark:text-neutral-100">
                        Advice
                      </p>
                      <ul className="space-y-3">
                        {withExtras.advice.map((item, idx) => (
                          <li
                            key={idx}
                            className="rounded-lg border border-neutral-300 bg-white p-4 dark:border-neutral-600 dark:bg-neutral-900"
                          >
                            <p className="mb-1 text-sm font-medium text-rose-600 dark:text-rose-400">
                              {formatPlaystyleType(item.type)}
                            </p>
                            <p className="text-sm text-neutral-700 dark:text-neutral-300">
                              {item.reason}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
