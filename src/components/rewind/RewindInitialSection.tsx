import type { Dispatch, SetStateAction } from "react";
import type { Match } from "~/types/riot";

const RewindInitialSection = ({
  handleInitialOk,
  matches,
  setMatches,
}: {
  handleInitialOk: () => void;
  matches: Match[];
  setMatches: Dispatch<SetStateAction<Match[]>>;
}) => {
  return (
    <section className="relative min-h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-900 dark:text-white">
      <div className="container mx-auto flex flex-col items-center justify-center gap-12 px-6 py-20 text-center">
        {/* Hero Heading */}
        <div className="max-w-3xl space-y-4 pt-30">
          <h1 className="dark:text-rose-450 text-5xl font-extrabold tracking-tight text-rose-600 sm:text-[4rem]">
            Rift Rewind
          </h1>
          <p className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            Your AI-Powered Match Analysis Companion
          </p>
          <p className="text-base leading-relaxed text-neutral-700 dark:text-neutral-300">
            Rift Rewind uses advanced AI to analyze your League of Legends match
            history and provide personalized insights. Discover your gameplay
            patterns, strengths, and weaknesses to sharpen your strategy and
            climb smarter.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Smart Analysis",
              desc: "AI reviews your performance to reveal trends across champions, roles, and playstyles.",
            },
            {
              title: "Personalized Insights",
              desc: "Understand what you excel at and receive tailored feedback for areas to improve.",
            },
            {
              title: "Actionable Tips",
              desc: "Practical, data-driven advice you can apply in your next match to improve instantly.",
            },
          ].map(({ title, desc }) => (
            <div
              key={title}
              className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-neutral-700 dark:bg-neutral-800/60"
            >
              <h3 className="mb-2 text-lg font-semibold text-rose-600 dark:text-rose-400">
                {title}
              </h3>
              <p className="text-sm text-neutral-700 dark:text-neutral-300">
                {desc}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <button
          onClick={handleInitialOk}
          className="mt-4 rounded-lg bg-rose-600 px-8 py-3 text-lg font-semibold text-white shadow-sm transition-all hover:bg-rose-700 focus:ring-2 focus:ring-rose-300 dark:focus:ring-rose-700"
        >
          Start Your Rewind
        </button>
      </div>
    </section>
  );
};

export default RewindInitialSection;
