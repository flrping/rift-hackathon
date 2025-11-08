import Image from "next/image";
import type { Dispatch, SetStateAction } from "react";
import type { Match } from "~/types/riot";

interface RewindWeaknessesSectionProps {
  weaknesses: Array<{
    type: string;
    reason: string;
  }>;
  summoner: {
    gameName: string;
    tagLine: string;
    profileIconId: number;
  };
  version: string;
  onNext: () => void;
  matches: Match[];
  setMatches: Dispatch<SetStateAction<Match[]>>;
}

const RewindWeaknessesSection = ({
  weaknesses,
  summoner,
  version,
  onNext,
  matches: _matches,
  setMatches: _setMatches,
}: RewindWeaknessesSectionProps) => {
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

      <div className="flex w-full max-w-4xl flex-col items-center gap-8">
        <div className="text-center">
          <h1 className="dark:text-rose-450 mb-4 text-5xl font-extrabold tracking-tight text-rose-600 sm:text-[4rem]">
            Your Struggles
          </h1>
          <p className="mb-4 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            Not everyone is perfect, and that&apos;s okay. Here are some areas
            you currently struggle with.
          </p>
        </div>

        <div className="flex w-full flex-col gap-4">
          {weaknesses.map((weakness, index) => (
            <div
              key={index}
              className="rounded-xl border border-neutral-300 bg-white p-6 shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
            >
              <h3 className="mb-3 text-xl font-semibold text-rose-500 dark:text-rose-400">
                {weakness.type}
              </h3>
              <p className="text-base leading-relaxed text-neutral-700 dark:text-neutral-300">
                {weakness.reason}
              </p>
            </div>
          ))}
        </div>

        <button
          onClick={onNext}
          className="mt-8 rounded-lg border border-neutral-300 bg-rose-400 px-8 py-3 text-lg font-medium text-white shadow-lg transition-all hover:bg-rose-500 dark:border-neutral-700 dark:bg-rose-500 dark:hover:bg-rose-600"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default RewindWeaknessesSection;
