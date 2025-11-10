"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "~/trpc/react";
import { useLeague } from "~/hooks/useLeague";
import ShowcaseCard from "~/components/rewind/ShowcaseCard";
import type { ChampionSkin } from "~/types/riot";

interface RewindShowcaseBuilderSectionProps {
  puuid: string;
  platform: string;
  queueType: string;
  year: number;
  summoner: {
    gameName: string;
    tagLine: string;
    profileIconId: number;
  };
  onFinish: () => void;
}

const RewindShowcaseBuilderSection = ({
  puuid,
  platform,
  queueType,
  year,
  summoner,
  onFinish,
}: RewindShowcaseBuilderSectionProps) => {
  const league = useLeague(platform);

  const [championOptions, setChampionOptions] = useState<string[]>([
    "Ahri",
    "Lux",
    "Yasuo",
    "Zed",
    "Ezreal",
  ]);
  const [champion, setChampion] = useState<string>("");
  const [skinNum, setSkinNum] = useState<number>(0);
  const [availableSkins, setAvailableSkins] = useState<ChampionSkin[]>([]);

  const upsert = api.rewind.upsertShowcase.useMutation();
  const globalStats = api.rewind.getGlobalStats.useQuery(
    { year, queueType },
    { enabled: !!queueType && !!year },
  );
  const { data: existingRewind } = api.rewind.getExistingRewind.useQuery(
    {
      puuid,
      platform,
      queueType,
      year,
    },
    { enabled: !!puuid && !!platform && !!queueType && !!year },
  );

  const { data: championData } = api.riot.getChampion.useQuery(
    {
      version: league.version?.v ?? "",
      language: league.version?.l ?? "",
      name: champion,
    },
    { enabled: !!champion && !!league.version?.v && !!league.version?.l },
  );

  type ExistingExtras = {
    playstyle?: { type?: string | null } | null;
    highlights?: Array<{ title?: string | null; badge?: string | null }> | null;
    achievements?: Array<{ title: string; icon?: string | null }> | null;
    favoriteChampion?: string | null;
    favoriteLane?: string | null;
    favoriteItem?: string | null;
  };
  const extras = (existingRewind as unknown as ExistingExtras) ?? undefined;
  const hasExistingShowcase = !!(
    existingRewind as unknown as { showcase?: unknown } | null
  )?.showcase;

  const percentileStats = useMemo(() => {
    if (!globalStats.data) return null;
    const result: Array<{ label: string; percentile: number }> = [];
    const total = globalStats.data.totalCount ?? 0;
    if (total <= 0) return null;
    const compute = (
      map: Map<string, number> | undefined,
      key?: string | null,
      label?: string,
    ) => {
      if (!map || !key || !label) return;
      const counts = Array.from(map.values()).sort((a, b) => a - b);
      const percentile = Math.max(
        0,
        Math.min(
          100,
          Math.round(
            (1 - counts.indexOf(map.get(key) ?? 0) / counts.length) * 100,
          ),
        ),
      );
      result.push({ label, percentile });
    };
    compute(
      globalStats.data.favoriteChampion as unknown as Map<string, number>,
      extras?.favoriteChampion,
      "Champion Popularity",
    );
    compute(
      globalStats.data.favoriteLane as unknown as Map<string, number>,
      extras?.favoriteLane,
      "Lane Popularity",
    );
    compute(
      globalStats.data.favoriteItem as unknown as Map<string, number>,
      extras?.favoriteItem,
      "Item Popularity",
    );
    return result.length > 0 ? result : null;
  }, [
    globalStats.data,
    extras?.favoriteChampion,
    extras?.favoriteLane,
    extras?.favoriteItem,
  ]);

  useEffect(() => {
    const load = async () => {
      if (!league.version?.v || !league.version?.l) return;
      try {
        const url = `https://ddragon.leagueoflegends.com/cdn/${league.version.v}/data/${league.version.l}/champion.json`;
        const res = await fetch(url);
        if (!res.ok) return;
        const json = (await res.json()) as { data: Record<string, unknown> };
        const names = Object.keys(json.data).sort((a, b) => a.localeCompare(b));
        if (names.length) {
          setChampionOptions(names);
          setChampion((prev) =>
            prev && prev.trim().length > 0 ? prev : (names[0] ?? "Aatrox"),
          );
        }
      } catch {
        setChampion((prev) =>
          prev && prev.trim().length > 0 ? prev : "Aatrox",
        );
      }
    };
    void load();
  }, [league.version?.v, league.version?.l]);

  useEffect(() => {
    if (!championData?.skins) {
      setAvailableSkins([]);
      return;
    }
    setAvailableSkins(championData.skins);
    const validSkinNums = championData.skins.map((s) => s.num);
    if (!validSkinNums.includes(skinNum)) {
      setSkinNum(0);
    }
  }, [championData, skinNum]);

  useMemo(() => {
    if (!champion) return "";
    return `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champion}_${skinNum}.jpg`;
  }, [champion, skinNum]);

  const handleSave = async () => {
    await upsert.mutateAsync({
      puuid,
      platform,
      queueType,
      year,
      champion: champion || undefined,
      skinNum: Number.isFinite(skinNum) ? skinNum : undefined,
    });
    onFinish();
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-start bg-neutral-50 px-4 pt-10 pb-8 md:px-20 lg:px-40 dark:bg-neutral-950">
      <div className="mb-10 text-center">
        <h1 className="mb-4 text-5xl font-extrabold tracking-tight text-rose-600 sm:text-[4rem] dark:text-rose-500">
          Showcase Builder
        </h1>
        <p className="mb-4 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
          Customize your rewind card with your favorite champion, skin, and a
          personal flair. Changes preview live on the right.
        </p>
      </div>

      <div className="flex w-full max-w-7xl flex-col gap-6 md:flex-row">
        <div className="rounded-xl border border-neutral-300 bg-white p-8 shadow-lg md:w-80 lg:w-96 dark:border-neutral-700 dark:bg-neutral-900">
          <div className="grid grid-cols-1 gap-6">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Champion
              </span>
              <select
                value={champion}
                onChange={(e) => setChampion(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 transition-colors outline-none hover:border-neutral-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:hover:border-neutral-600 dark:focus:border-rose-500"
              >
                {championOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Skin
              </span>
              <select
                value={skinNum}
                onChange={(e) => setSkinNum(parseInt(e.target.value, 10))}
                className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 transition-colors outline-none hover:border-neutral-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:hover:border-neutral-600 dark:focus:border-rose-500"
              >
                {availableSkins.length > 0 ? (
                  availableSkins.map((skin) => (
                    <option key={skin.num} value={skin.num}>
                      {skin.name}
                    </option>
                  ))
                ) : (
                  <option value={0}>Default</option>
                )}
              </select>
            </label>
          </div>
          <div className="mt-8 flex gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={upsert.isPending}
              className="flex-1 rounded-lg border border-neutral-300 bg-rose-400 px-6 py-3 text-base font-medium text-white shadow-lg transition-all hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:bg-rose-500 dark:hover:bg-rose-600"
            >
              {upsert.isPending ? "Saving…" : "Save Showcase"}
            </button>
            {hasExistingShowcase && (
              <button
                type="button"
                onClick={onFinish}
                className="rounded-lg border border-neutral-300 bg-white px-6 py-3 text-base font-medium text-neutral-900 shadow-lg transition-all hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700"
              >
                Skip
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 md:flex-[2]">
          <ShowcaseCard
            className="min-h-[280px] sm:min-h-[340px] lg:min-h-[420px] xl:min-h-[480px]"
            year={year}
            champion={champion}
            skinNum={skinNum}
            summonerGameName={summoner.gameName}
            summonerTagLine={summoner.tagLine}
            playstyleType={extras?.playstyle?.type ?? undefined}
            highlights={extras?.highlights ?? []}
            achievements={extras?.achievements ?? []}
            queueType={queueType}
            statistics={{
              favoriteChampion: extras?.favoriteChampion,
              favoriteLane: extras?.favoriteLane,
              favoriteItem: extras?.favoriteItem,
            }}
            percentileStats={percentileStats}
          />
        </div>
      </div>
    </div>
  );
};

export default RewindShowcaseBuilderSection;
