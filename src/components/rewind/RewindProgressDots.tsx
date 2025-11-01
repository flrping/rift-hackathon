interface RewindProgressDotsProps {
  currentStage: number;
  totalStages: number;
}

const RewindProgressDots = ({
  currentStage,
  totalStages,
}: RewindProgressDotsProps) => {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: totalStages }, (_, index) => (
        <div
          key={index}
          className={`h-2 w-2 rounded-full transition-all ${
            index === currentStage
              ? "scale-125 bg-rose-500"
              : index < currentStage
                ? "bg-rose-400/60"
                : "bg-neutral-300 dark:bg-neutral-700"
          }`}
        />
      ))}
    </div>
  );
};

export default RewindProgressDots;
