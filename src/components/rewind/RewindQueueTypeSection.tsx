import { type CommonQueueType } from "~/util/riot/game";

const RewindQueueTypeSection = ({
  handleQueueTypeSelection,
}: {
  handleQueueTypeSelection: (queueType: CommonQueueType) => void;
}) => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 px-4 py-6 text-white md:px-20 lg:px-60">
      <h1 className="mb-4 text-center text-4xl font-bold text-white">
        Rift Rewind
      </h1>
      <p className="mb-12 text-center text-xl text-gray-200">
        Choose a queue type to analyze your performance
      </p>

      <div className="flex flex-row gap-4">
        <button
          onClick={() => handleQueueTypeSelection("DRAFT")}
          className="flex-1 rounded-lg border border-slate-600/30 bg-slate-700/50 p-4 hover:cursor-pointer hover:border-slate-400/50 hover:bg-slate-800/50"
        >
          <div className="text-left">
            <div className="text-xl font-bold">Normal Draft</div>
            <div className="text-sm opacity-90">
              Analyze your normal draft performance
            </div>
          </div>
        </button>
        <button
          onClick={() => handleQueueTypeSelection("RANKED_SOLO_5x5")}
          className="flex-1 rounded-lg border border-slate-600/30 bg-slate-700/50 p-4 hover:cursor-pointer hover:border-slate-400/50 hover:bg-slate-800/50"
        >
          <div className="text-left">
            <div className="text-xl font-bold">Ranked Solo/Duo</div>
            <div className="text-sm opacity-90">
              Analyze your ranked solo queue performance
            </div>
          </div>
        </button>
        <button
          onClick={() => handleQueueTypeSelection("RANKED_FLEX_SR")}
          className="flex-1 rounded-lg border border-slate-600/30 bg-slate-700/50 p-4 hover:cursor-pointer hover:border-slate-400/50 hover:bg-slate-800/50"
        >
          <div className="text-left">
            <div className="text-xl font-bold">Ranked Flex</div>
            <div className="text-sm opacity-90">
              Analyze your ranked flex queue performance
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default RewindQueueTypeSection;
