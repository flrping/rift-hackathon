import { useState } from "react";
import type {
  LeagueVersionConfig,
  Match,
  MatchTimeline,
  Participant,
  TimelineEvents,
} from "~/types/riot";
import { api } from "~/trpc/react";
import TabSelector from "./timeline/TabSelector";
import BuildTimeline from "./timeline/BuildTimeline";
import SkillTimeline from "./timeline/SkillTimeline";

interface TimelineSectionProps {
  participant: Participant;
  match: Match;
  timeline: MatchTimeline;
  version: LeagueVersionConfig;
}

const TimelineSection = ({
  participant,
  timeline,
  match: _match,
  version,
}: TimelineSectionProps) => {
  const [tab, setTab] = useState<"build" | "skill">("build");
  const { data: champion } = api.riot.getChampion.useQuery(
    {
      version: version.v,
      language: version.l,
      name: participant.championName,
    },
    { enabled: !!version && tab === "skill" },
  );

  const buildTimeline = timeline
    ? {
        ...timeline,
        info: {
          ...timeline.info,
          participants: [participant],
          frames: timeline.info.frames.map((frame) => ({
            ...frame,
            events: frame.events.filter(
              (e: TimelineEvents & { participantId?: number }) =>
                e.participantId === participant.participantId &&
                e.type === "ITEM_PURCHASED",
            ),
            participantFrames: {
              [participant.participantId]:
                frame.participantFrames[participant.participantId],
            },
          })),
        },
      }
    : null;

  const skillTimeline = timeline
    ? {
        ...timeline,
        info: {
          ...timeline.info,
          participants: [participant],
          frames: timeline.info.frames.map((frame) => ({
            ...frame,
            events: frame.events.filter(
              (e: TimelineEvents & { participantId?: number }) =>
                e.participantId === participant.participantId &&
                e.type === "SKILL_LEVEL_UP",
            ),
            participantFrames: {
              [participant.participantId]:
                frame.participantFrames[participant.participantId],
            },
          })),
        },
      }
    : null;

  const handleTabChange = (
    tab: "build" | "skill",
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    setTab(tab);
  };

  return (
    <div className="flex flex-col gap-2">
      <TabSelector activeTab={tab} onTabChange={handleTabChange} />

      {tab === "build" && buildTimeline && (
        <BuildTimeline
          timeline={buildTimeline as MatchTimeline}
          version={version}
        />
      )}

      {tab === "skill" && skillTimeline && champion && (
        <SkillTimeline
          timeline={skillTimeline as MatchTimeline}
          version={version}
          champion={champion}
        />
      )}
    </div>
  );
};

export default TimelineSection;
