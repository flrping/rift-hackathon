import { type CommonQueueType } from "~/util/riot/game";
import type { Dispatch, SetStateAction } from "react";
import type { Match } from "~/types/riot";

const RewindQueueTypeSection = ({
  handleQueueTypeSelection,
  matches,
  setMatches,
}: {
  handleQueueTypeSelection: (queueType: CommonQueueType) => void;
  matches: Match[];
  setMatches: Dispatch<SetStateAction<Match[]>>;
}) => {
  return (
    <section className="relative min-h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-900 dark:text-white">
      <div className="container mx-auto flex flex-col items-center justify-center gap-12 px-6 py-20 text-center">
        {/* Hero Heading */}
        <div className="max-w-3xl space-y-4 pt-30">
          <h1 className="dark:text-rose-450 text-5xl font-extrabold tracking-tight text-rose-600 sm:text-[4rem]">
            Queue Selection
          </h1>
          <p className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            Choose a queue type to analyze your performance
          </p>
        </div>

        <div className="flex w-full max-w-5xl flex-col gap-4">
          <button
            onClick={() => handleQueueTypeSelection("DRAFT")}
            className="relative overflow-hidden rounded-xl border border-neutral-300 shadow-lg transition-all hover:cursor-pointer hover:border-rose-400 hover:bg-rose-50 dark:border-neutral-700/50 dark:hover:border-rose-400 dark:hover:bg-rose-900/20"
          >
            <div className="relative z-10 flex items-center justify-between p-8">
              <div className="text-left">
                <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                  Normal Draft
                </div>
                <div className="text-base text-neutral-600 dark:text-neutral-300">
                  Analyze your normal draft performance
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 h-full bg-neutral-500/50 bg-cover bg-center opacity-20" />
          </button>
          <button
            onClick={() => handleQueueTypeSelection("RANKED_SOLO_5x5")}
            className="relative overflow-hidden rounded-xl border border-neutral-300 shadow-lg transition-all hover:cursor-pointer hover:border-rose-400 hover:bg-rose-50 dark:border-neutral-700/50 dark:hover:border-rose-400 dark:hover:bg-rose-900/20"
          >
            <div className="relative z-10 flex items-center justify-between p-8">
              <div className="text-left">
                <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                  Ranked Solo/Duo
                </div>
                <div className="text-base text-neutral-600 dark:text-neutral-300">
                  Analyze your ranked solo queue performance
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 h-full bg-neutral-500/50 bg-cover bg-center opacity-20" />
          </button>
          <button
            onClick={() => handleQueueTypeSelection("RANKED_FLEX_SR")}
            className="relative overflow-hidden rounded-xl border border-neutral-300 shadow-lg transition-all hover:cursor-pointer hover:border-rose-400 hover:bg-rose-50 dark:border-neutral-700/50 dark:hover:border-rose-400 dark:hover:bg-rose-900/20"
          >
            <div className="relative z-10 flex items-center justify-between p-8">
              <div className="text-left">
                <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                  Ranked Flex
                </div>
                <div className="text-base text-neutral-600 dark:text-neutral-300">
                  Analyze your ranked flex queue performance
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 h-full bg-neutral-500/50 bg-cover bg-center opacity-20" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default RewindQueueTypeSection;
