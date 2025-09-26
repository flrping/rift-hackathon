import type { Participant } from "~/types/riot";

interface PlayerStatsProps {
  participant: Participant;
  matchDurationMinutes: number;
}

const PlayerStats = ({
  participant,
  matchDurationMinutes,
}: PlayerStatsProps) => {
  const totalCS =
    participant.totalMinionsKilled + participant.neutralMinionsKilled;
  const csPerMinute = (totalCS / matchDurationMinutes).toFixed(1);

  return (
    <div className="flex w-full min-w-0 flex-col items-center justify-center gap-1 lg:w-40">
      <div className="text-md font-semibold">
        <span className="text-green-400">{participant.kills}</span> /{" "}
        <span className="text-red-400">{participant.deaths}</span> /{" "}
        <span className="text-blue-400">{participant.assists}</span>
      </div>
      <div className="text-xs text-slate-300">
        <span className="whitespace-nowrap">
          {totalCS} CS <span className="text-slate-400">({csPerMinute})</span>
        </span>
      </div>
    </div>
  );
};

export default PlayerStats;
