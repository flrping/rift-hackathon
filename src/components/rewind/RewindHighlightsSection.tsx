import Image from "next/image";
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

const RewindHighlightsSection = ({
  highlights,
  achievements,
  summoner,
  version,
  onNext,
}: RewindHighlightsSectionProps) => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-4 py-6 md:px-20 lg:px-40 dark:bg-neutral-950">
      <div className="absolute top-20 right-4 flex items-center gap-2">
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
        <div className="space-y-4 pt-30 text-center">
          <h1 className="dark:text-rose-450 mb-3 text-5xl font-extrabold tracking-tight text-rose-600 sm:text-[4rem]">
            Highlights
          </h1>
          <p className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            Your best moments and unlocked achievements
          </p>
        </div>

        <section>
          <h2 className="mb-4 text-2xl font-semibold text-rose-500 dark:text-rose-400">
            Best Highlights
          </h2>
          {highlights.length === 0 ? (
            <div className="rounded-xl border border-neutral-300 bg-white p-6 text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300">
              No highlights detected yet. Keep playing!
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {highlights.slice(0, 6).map((h, idx) => {
                const stats: HighlightStats =
                  typeof h.statsJson === "object" && h.statsJson !== null
                    ? (h.statsJson as HighlightStats)
                    : {};
                return (
                  <div
                    key={`${h.type}-${h.matchId}-${idx}`}
                    className="rounded-xl border border-neutral-300 bg-white p-6 shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                        {h.title}
                      </span>
                      <span className="text-2xl">{h.badge}</span>
                    </div>
                    <p className="mb-3 text-neutral-700 dark:text-neutral-300">
                      {h.description}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                      {stats.kda !== undefined && <div>KDA: {stats.kda}</div>}
                      {stats.kills !== undefined && (
                        <div>Kills: {stats.kills}</div>
                      )}
                      {stats.deaths !== undefined && (
                        <div>Deaths: {stats.deaths}</div>
                      )}
                      {stats.assists !== undefined && (
                        <div>Assists: {stats.assists}</div>
                      )}
                      {stats.damage !== undefined && (
                        <div>
                          Damage: {Math.floor(Number(stats.damage) / 1000)}k
                        </div>
                      )}
                      {stats.duration !== undefined && (
                        <div>
                          Duration:{" "}
                          {Math.floor(Number(stats.duration ?? 0) / 60)}m
                        </div>
                      )}
                      {stats.goldDeficit !== undefined && (
                        <div>
                          Deficit:{" "}
                          {Math.floor(Number(stats.goldDeficit ?? 0) / 1000)}k
                        </div>
                      )}
                      {stats.multiKills !== undefined && (
                        <div>Multikills: {stats.multiKills}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold text-rose-500 dark:text-rose-400">
            Achievements
          </h2>
          {achievements.length === 0 ? (
            <div className="rounded-xl border border-neutral-300 bg-white p-6 text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300">
              No achievements yet. Keep playing to unlock more!
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {achievements.map((a) => (
                <div
                  key={a.id}
                  className="rounded-xl border border-neutral-300 bg-white p-6 shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                      {a.title}
                    </span>
                    <span className="text-2xl">{a.icon}</span>
                  </div>
                  <p className="mb-3 text-neutral-700 dark:text-neutral-300">
                    {a.description}
                  </p>
                  {a.progress !== undefined &&
                    a.total !== undefined &&
                    a.progress !== null &&
                    a.total !== null && (
                      <div className="text-sm text-neutral-600 dark:text-neutral-400">
                        Progress: {a.progress}/{a.total}
                      </div>
                    )}
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="flex justify-center">
          <button
            onClick={onNext}
            className="mt-2 rounded-lg border border-neutral-300 bg-rose-400 px-8 py-3 text-lg font-medium text-white shadow-lg transition-all hover:bg-rose-500 dark:border-neutral-700 dark:bg-rose-500 dark:hover:bg-rose-600"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default RewindHighlightsSection;
