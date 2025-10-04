const RewindInitialSection = ({
  handleInitialOk,
}: {
  handleInitialOk: () => void;
}) => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 px-4 py-6 text-white md:px-20 lg:px-60">
      <h1 className="mb-4 text-center text-4xl font-bold text-white">
        Rift Rewind
      </h1>
      <p className="mb-12 text-center text-xl text-gray-200">
        Welcome to Rift Rewind! Rift Rewind is a tool that helps you analyze
        your match history and improve your gameplay.
      </p>

      <div className="flex flex-row gap-4">
        <button
          onClick={() => handleInitialOk()}
          className="flex-1 rounded-lg border border-slate-600/30 bg-slate-700/50 p-4 hover:cursor-pointer hover:border-slate-400/50 hover:bg-slate-800/50"
        >
          <div className="text-left">
            <div className="text-xl font-bold">Continue</div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default RewindInitialSection;
