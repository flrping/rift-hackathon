import type {
  LeagueVersionConfig,
  Match,
  Queue,
  SummonerSpellConfig,
} from "~/types/riot";
import { getMatchAge } from "~/util/riot/game";
import { useState } from "react";
import { api } from "~/trpc/react";
import TimelineSection from "./TimelineSection";
import MatchInfo from "./match/MatchInfo";
import PlayerInfo from "./match/PlayerInfo";
import PlayerStats from "./match/PlayerStats";
import TeamSides from "./match/TeamSides";
import TimelineToggle from "./match/TimelineToggle";

interface MatchCardProps {
  puuid: string;
  match: Match;
  platform: string;
  version: LeagueVersionConfig;
  summonerSpells: SummonerSpellConfig;
  queues: Queue[];
}

const MatchCard = ({
  puuid,
  match,
  platform,
  version,
  summonerSpells,
  queues,
}: MatchCardProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const { data: timeline, isLoading } =
    api.riot.getMatchTimelineByGameId.useQuery(
      { platform, id: match.info.gameId.toString() },
      { enabled: isOpen },
    );

  const queue = queues.find((queue) => queue.queueId === match.info.queueId);
  const matchDurationMinutes = Math.floor(match.info.gameDuration / 60);
  const matchDurationSeconds = match.info.gameDuration % 60;
  const matchAge = getMatchAge(match.info.gameEndTimestamp!);

  const me = match.info.participants.find(
    (participant) => participant.puuid === puuid,
  );

  const win = match.info.teams.find((team) => team.teamId === me?.teamId)?.win;
  const blueSide = match.info.participants.filter(
    (team) => team.teamId === 100,
  );
  const redSide = match.info.participants.filter((team) => team.teamId === 200);

  return (
    <div className="flex w-full max-w-full flex-col gap-3 overflow-hidden rounded-lg border border-slate-600/30 bg-slate-900/60 px-3 py-3 shadow-md transition-colors duration-200 sm:px-6 lg:px-8">
      <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:gap-0">
        <MatchInfo
          queue={queue}
          matchDurationMinutes={matchDurationMinutes}
          matchDurationSeconds={matchDurationSeconds}
          matchAge={matchAge}
          win={win}
        />

        <PlayerInfo
          participant={me!}
          version={version}
          summonerSpells={summonerSpells}
        />

        <PlayerStats
          participant={me!}
          matchDurationMinutes={matchDurationMinutes}
        />

        <TeamSides
          blueSide={blueSide}
          redSide={redSide}
          version={version}
          platform={platform}
          gameId={match.info.gameId}
        />

        <TimelineToggle isOpen={isOpen} onToggle={() => setIsOpen(!isOpen)} />
      </div>

      {isOpen && !isLoading && (
        <div className="flex max-w-full min-w-0 flex-col gap-2 overflow-hidden rounded-lg border border-slate-600/30 bg-slate-800 px-3 py-3 sm:px-6 lg:px-8">
          <TimelineSection
            participant={me!}
            timeline={timeline!}
            version={version}
            match={match}
          />
        </div>
      )}
    </div>
  );
};

export default MatchCard;
