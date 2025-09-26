import type { Queue } from "~/types/riot";
import { getQueueName } from "~/util/riot/game";

interface MatchInfoProps {
  queue?: Queue;
  matchDurationMinutes: number;
  matchDurationSeconds: number;
  matchAge: string;
  win?: boolean;
}

const MatchInfo = ({
  queue,
  matchDurationMinutes,
  matchDurationSeconds,
  matchAge,
  win,
}: MatchInfoProps) => {
  return (
    <div className="flex w-full flex-row items-center justify-between gap-2 lg:w-32 lg:flex-col lg:justify-center">
      <div className="flex flex-col items-start lg:items-center">
        <h3
          className="glow-text text-sm font-medium"
          style={{
            color: win ? "#22c55e" : "#ef4444",
          }}
        >
          {win ? "Victory" : "Defeat"}
        </h3>
        <p className="mt-1 truncate text-sm font-medium text-slate-200 lg:text-center">
          {getQueueName(queue?.description ?? "")}
        </p>
        <p className="text-xs text-slate-400">
          {matchDurationMinutes}:
          {matchDurationSeconds.toString().padStart(2, "0")}
        </p>
      </div>
      <div className="flex flex-col items-end lg:items-center">
        <p className="text-xs text-slate-400">{matchAge}</p>
      </div>
    </div>
  );
};

export default MatchInfo;
