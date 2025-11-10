import Image from "next/image";
import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { Match } from "~/types/riot";

interface RewindHighlightsSectionProps {
  highlights: Array<{
    id: number;
    type: string;
    matchId: string;
    title: string;
    description: string;
    badge: string;
    rarity: string;
    statsJson: unknown;
  }>;
  achievements: Array<{
    id: number | string;
    title: string;
    description: string;
    icon: string;
    rarity: string;
    unlocked: boolean;
    progress?: number | null;
    total?: number | null;
  }>;
  summoner: {
    gameName: string;
    tagLine: string;
    profileIconId: number;
  };
  version: string;
  onNext: () => void;
  setMatches: Dispatch<SetStateAction<Match[]>>;
}

type HighlightStats = {
  kda?: number;
  kills?: number;
  deaths?: number;
  assists?: number;
  damage?: number;
  duration?: number;
  goldDeficit?: number;
  multiKills?: string;
};

const ALL_ACHIEVEMENTS = [
  {
    id: "vision_master",
    title: "Vision Master",
    description: "Average vision score of 40+",
    icon: "👁️",
    rarity: "epic",
    threshold: 40,
  },
  {
    id: "first_blood_hunter",
    title: "First Blood Hunter",
    description: "Secured first blood in 10+ games",
    icon: "🩸",
    rarity: "rare",
    threshold: 10,
  },
  {
    id: "flawless",
    title: "Flawless",
    description: "5+ perfect games (0 deaths)",
    icon: "💎",
    rarity: "epic",
    threshold: 5,
  },
  {
    id: "pentakill_legend",
    title: "Pentakill Legend",
    description: "Secured a pentakill",
    icon: "🏆",
    rarity: "legendary",
    threshold: 1,
  },
  {
    id: "objective_secured",
    title: "Objective Secured",
    description: "50+ major objectives secured",
    icon: "🐉",
    rarity: "rare",
    threshold: 50,
  },
  {
    id: "on_fire",
    title: "On Fire!",
    description: "5 game win streak",
    icon: "🔥",
    rarity: "epic",
    threshold: 5,
  },
  {
    id: "dedicated",
    title: "Dedicated",
    description: "Played 100+ games",
    icon: "🎮",
    rarity: "common",
    threshold: 100,
  },
];

const RewindHighlightsSection = ({
  highlights,
  achievements,
  summoner,
  version,
  onNext,
}: RewindHighlightsSectionProps) => {
  const [activeView, setActiveView] = useState<"highlights" | "achievements">(
    "highlights",
  );
  const allAchievements = ALL_ACHIEVEMENTS.map((template) => {
    const unlocked = achievements.find((a) => {
      const key = (a as unknown as { type?: string; id?: string | number })
        .type;
      const candidate = key ?? a.id;
      return String(candidate) === String(template.id);
    });
    if (unlocked) {
      return {
        ...template,
        unlocked: true,
        progress: unlocked.progress ?? 0,
        total: unlocked.total ?? template.threshold,
        description: unlocked.description,
      };
    }
    return {
      ...template,
      unlocked: false,
      progress: 0,
      total: template.threshold,
    };
  });
  const rarityOrder: Record<string, number> = {
    legendary: 0,
    epic: 1,
    rare: 2,
    common: 3,
  };
  const sortedAchievements = [...allAchievements].sort((a, b) => {
    if (
      (b as { unlocked?: boolean }).unlocked !==
      (a as { unlocked?: boolean }).unlocked
    ) {
      return (
        ((b as { unlocked?: boolean }).unlocked ? 1 : 0) -
        ((a as { unlocked?: boolean }).unlocked ? 1 : 0)
      );
    }
    const rA = rarityOrder[(a as { rarity?: string }).rarity ?? "common"] ?? 3;
    const rB = rarityOrder[(b as { rarity?: string }).rarity ?? "common"] ?? 3;
    return rA - rB;
  });

  return (
    <div className="flex min-h-screen flex-col items-center justify-start bg-neutral-50 px-4 pt-10 pb-8 md:px-20 lg:px-40 dark:bg-neutral-950">
      <div className="absolute top-25 right-8 flex items-center gap-2">
        <Image
          src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/profileicon/${summoner.profileIconId}.png`}
          alt="Summoner Icon"
          width={40}
          height={40}
          className="rounded-full border-2 border-neutral-300 dark:border-neutral-700"
        />
        <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
          {summoner.gameName}
          <span className="text-neutral-500 dark:text-neutral-400">
            #{summoner.tagLine}
          </span>
        </div>
      </div>

      <div className="flex w-full max-w-5xl flex-col gap-10">
        <div className="mt-10 space-y-4 text-center">
          <h1 className="mb-3 text-5xl font-extrabold tracking-tight text-rose-600 sm:text-[4rem] dark:text-rose-500">
            Highlights
          </h1>
          <p className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            Your best moments and unlocked achievements
          </p>
          <div className="mx-auto mt-2 inline-flex rounded-xl border border-neutral-300 bg-white p-1 dark:border-neutral-700 dark:bg-neutral-900">
            <button
              onClick={() => setActiveView("highlights")}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
                activeView === "highlights"
                  ? "bg-rose-500 text-white"
                  : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
              }`}
            >
              Highlights
            </button>
            <button
              onClick={() => setActiveView("achievements")}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
                activeView === "achievements"
                  ? "bg-rose-500 text-white"
                  : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
              }`}
            >
              Achievements
            </button>
          </div>
        </div>

        {activeView === "highlights" && (
          <section>
            <h2 className="mb-5 text-3xl font-bold text-rose-500 dark:text-rose-400">
              Best Highlights
            </h2>
            {highlights.length === 0 ? (
              <div className="rounded-xl border border-neutral-300 bg-white p-6 text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300">
                No highlights detected yet. Keep playing!
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {highlights.slice(0, 6).map((h, idx) => {
                  const stats: HighlightStats =
                    typeof h.statsJson === "object" && h.statsJson !== null
                      ? (h.statsJson as HighlightStats)
                      : {};
                  return (
                    <div
                      key={`${h.type}-${h.matchId}-${idx}`}
                      className="group relative overflow-hidden rounded-xl border border-neutral-300 bg-white p-5 shadow-lg transition-all hover:shadow-xl dark:border-neutral-700 dark:bg-neutral-900"
                    >
                      <div className="relative z-10 mb-3 flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                            {h.title}
                          </h3>
                          <p className="mt-1 text-sm text-neutral-700 dark:text-neutral-300">
                            {h.description}
                          </p>
                        </div>
                        <span className="ml-3 text-3xl">{h.badge}</span>
                      </div>
                      <div className="relative z-10 mt-3 space-y-2">
                        {stats.kda !== undefined && (
                          <div className="flex items-center justify-between rounded-lg bg-neutral-100 px-3 py-1.5 dark:bg-neutral-800">
                            <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                              KDA
                            </span>
                            <span className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                              {stats.kda}
                            </span>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-2">
                          {stats.kills !== undefined && (
                            <div className="rounded-lg bg-neutral-100 px-2.5 py-1.5 dark:bg-neutral-800">
                              <div className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                                Kills
                              </div>
                              <div className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                                {stats.kills}
                              </div>
                            </div>
                          )}
                          {stats.deaths !== undefined && (
                            <div className="rounded-lg bg-neutral-100 px-2.5 py-1.5 dark:bg-neutral-800">
                              <div className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                                Deaths
                              </div>
                              <div className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                                {stats.deaths}
                              </div>
                            </div>
                          )}
                          {stats.assists !== undefined && (
                            <div className="rounded-lg bg-neutral-100 px-2.5 py-1.5 dark:bg-neutral-800">
                              <div className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                                Assists
                              </div>
                              <div className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                                {stats.assists}
                              </div>
                            </div>
                          )}
                          {stats.damage !== undefined && (
                            <div className="rounded-lg bg-neutral-100 px-2.5 py-1.5 dark:bg-neutral-800">
                              <div className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                                Damage
                              </div>
                              <div className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                                {Math.floor(Number(stats.damage) / 1000)}k
                              </div>
                            </div>
                          )}
                        </div>
                        {stats.duration !== undefined && (
                          <div className="flex items-center justify-between rounded-lg bg-neutral-100 px-3 py-1.5 dark:bg-neutral-800">
                            <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                              Duration
                            </span>
                            <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                              {Math.floor(Number(stats.duration ?? 0) / 60)}m
                            </span>
                          </div>
                        )}
                        {stats.goldDeficit !== undefined && (
                          <div className="flex items-center justify-between rounded-lg bg-neutral-100 px-3 py-1.5 dark:bg-neutral-800">
                            <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                              Gold Deficit
                            </span>
                            <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                              {Math.floor(
                                Number(stats.goldDeficit ?? 0) / 1000,
                              )}
                              k
                            </span>
                          </div>
                        )}
                        {stats.multiKills !== undefined && (
                          <div className="flex items-center justify-between rounded-lg bg-neutral-100 px-3 py-1.5 dark:bg-neutral-800">
                            <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                              Multi-kills
                            </span>
                            <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                              {stats.multiKills}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {activeView === "achievements" && (
          <section>
            <h2 className="mb-5 text-3xl font-bold text-rose-500 dark:text-rose-400">
              Achievements
            </h2>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {sortedAchievements.map((a) => (
                <div
                  key={a.id}
                  className={`group relative overflow-hidden rounded-xl border p-5 shadow-lg transition-all hover:shadow-xl ${
                    a.unlocked
                      ? "border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-900"
                      : "border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/50"
                  }`}
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex-1">
                      <h3
                        className={`text-xl font-bold ${
                          a.unlocked
                            ? "text-neutral-900 dark:text-neutral-100"
                            : "text-neutral-500 dark:text-neutral-500"
                        }`}
                      >
                        {a.title}
                      </h3>
                      <p
                        className={`mt-1 text-sm ${
                          a.unlocked
                            ? "text-neutral-700 dark:text-neutral-300"
                            : "text-neutral-500 dark:text-neutral-500"
                        }`}
                      >
                        {a.description}
                      </p>
                    </div>
                    <span
                      className={`ml-3 text-3xl ${a.unlocked ? "" : "opacity-50 grayscale"}`}
                    >
                      {a.icon}
                    </span>
                  </div>
                  <div className="mt-3">
                    <div className="mb-1.5 flex justify-between text-xs font-medium text-neutral-600 dark:text-neutral-400">
                      <span>{a.unlocked ? "Unlocked" : "Locked"}</span>
                      <span>
                        {a.progress}/{a.total}
                      </span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                      <div
                        className="h-full rounded-full bg-rose-500 transition-all dark:bg-rose-400"
                        style={{
                          width: `${Math.min((a.progress / a.total) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="flex justify-center">
          <button
            onClick={
              activeView === "highlights"
                ? () => setActiveView("achievements")
                : onNext
            }
            className="mt-2 rounded-lg border border-neutral-300 bg-rose-400 px-8 py-3 text-lg font-medium text-white shadow-lg transition-all hover:bg-rose-500 dark:border-neutral-700 dark:bg-rose-500 dark:hover:bg-rose-600"
          >
            {activeView === "highlights" ? "View Achievements" : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RewindHighlightsSection;
