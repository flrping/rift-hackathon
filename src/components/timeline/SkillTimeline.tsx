import type { LeagueVersionConfig, MatchTimeline } from "~/types/riot";
import Image from "next/image";

interface SkillTimelineProps {
  timeline: MatchTimeline;
  version: LeagueVersionConfig;
  champion: {
    spells: Array<{
      id: string;
      name: string;
    }>;
  };
}

const SkillTimeline = ({ timeline, version, champion }: SkillTimelineProps) => {
  const skillOrder: (number | null)[] = Array.from({ length: 19 }, () => null);

  timeline.info.frames.forEach((frame) => {
    frame.events.forEach((event) => {
      if (typeof event.skillSlot === "number") {
        for (let level = 1; level <= 18; level++) {
          if (skillOrder[level] === null) {
            skillOrder[level] = event.skillSlot;
            break;
          }
        }
      }
    });
  });

  return (
    <div className="relative w-0 min-w-full overflow-x-auto px-4 py-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          {[0, 1, 2, 3].map((spellIndex) => {
            const spell = champion.spells[spellIndex];
            return (
              <div key={spellIndex} className="flex items-center gap-1">
                <div className="flex w-16 items-center gap-2">
                  {spell && (
                    <>
                      <Image
                        src={`https://ddragon.leagueoflegends.com/cdn/${version.v}/img/spell/${spell.id}.png`}
                        alt={spell.id}
                        width={24}
                        height={24}
                        className="h-6 w-6 rounded border border-slate-600/50"
                      />
                      <span className="text-xs text-slate-400">
                        {["Q", "W", "E", "R"][spellIndex]}
                      </span>
                    </>
                  )}
                </div>

                <div className="grid flex-1 grid-cols-18 gap-1">
                  {Array.from({ length: 18 }, (_, levelIndex) => {
                    const level = levelIndex + 1;
                    const skillSlot = spellIndex + 1;
                    const isLeveled = skillOrder[level] === skillSlot;

                    return (
                      <div
                        key={`${level}-${spellIndex}`}
                        className={`flex h-6 w-full items-center justify-center rounded border text-xs font-medium ${
                          isLeveled
                            ? "border-slate-500 bg-slate-600 text-white"
                            : "border-slate-600/50 bg-slate-800 text-slate-500"
                        }`}
                      >
                        {isLeveled ? level : ""}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SkillTimeline;
