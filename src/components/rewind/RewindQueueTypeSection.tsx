import { type CommonQueueType } from "~/util/riot/game";
import { SiteFooter } from "../SiteFooter";
import { SiteNavbar } from "../SiteNavbar";

const RewindQueueTypeSection = ({
  handleQueueTypeSelection,
}: {
  handleQueueTypeSelection: (queueType: CommonQueueType) => void;
}) => {
  return (
    <>
      <SiteNavbar />
      <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-4 py-6 md:px-20 lg:px-40 dark:bg-neutral-950">
        <p className="mb-12 text-center text-xl text-neutral-600 dark:text-neutral-300">
          Choose a queue type to analyze your performance
        </p>

        <div className="flex w-full max-w-5xl flex-col gap-4">
          <button
            onClick={() => handleQueueTypeSelection("DRAFT")}
            className="relative overflow-hidden rounded-xl border border-neutral-300 bg-gradient-to-r from-cyan-200 to-blue-200 shadow-lg transition-all hover:cursor-pointer hover:border-rose-400/50 dark:border-neutral-700/50 dark:from-cyan-900/40 dark:to-blue-900/40"
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
            className="relative overflow-hidden rounded-xl border border-neutral-300 bg-gradient-to-r from-purple-200 to-pink-200 shadow-lg transition-all hover:cursor-pointer hover:border-rose-400/50 dark:border-neutral-700/50 dark:from-purple-900/40 dark:to-pink-900/40"
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
            className="relative overflow-hidden rounded-xl border border-neutral-300 bg-gradient-to-r from-orange-200 to-red-200 shadow-lg transition-all hover:cursor-pointer hover:border-rose-400/50 dark:border-neutral-700/50 dark:from-orange-900/40 dark:to-red-900/40"
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
      <SiteFooter />
    </>
  );
};

export default RewindQueueTypeSection;
