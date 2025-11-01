import type { LeagueVersionConfig, MatchTimeline } from "~/types/riot";
import Image from "next/image";
import { getMatchTimestamp } from "~/util/riot/game";

interface BuildTimelineProps {
  timeline: MatchTimeline;
  version: LeagueVersionConfig;
}

const BuildTimeline = ({ timeline, version }: BuildTimelineProps) => {
  return (
    <div className="relative w-0 min-w-full overflow-x-auto px-4 py-6">
      <div className="flex flex-wrap items-center gap-6">
        {timeline.info.frames
          .filter((frame) => frame.events.length > 0)
          .map((frame) => (
            <div
              key={frame.timestamp}
              className="relative flex flex-shrink-0 flex-col items-center"
            >
              <div className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                {getMatchTimestamp(frame.timestamp)}
              </div>
              <div className="mt-1 flex min-w-[45px] flex-shrink-0 flex-wrap justify-center gap-2 rounded-lg bg-neutral-100 p-2 shadow-md dark:bg-neutral-900">
                {frame.events.map((event, idx) => (
                  <div key={event.timestamp + idx} className="flex-shrink-0">
                    <Image
                      src={`https://ddragon.leagueoflegends.com/cdn/${version.v}/img/item/${event.itemId as string}.png`}
                      alt={event.itemId as string}
                      width={35}
                      height={35}
                      className="h-8 w-8 flex-shrink-0 rounded border border-neutral-200 dark:border-neutral-800"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default BuildTimeline;
