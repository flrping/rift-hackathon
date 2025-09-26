import type { LeagueVersionConfig, Participant } from "~/types/riot";
import Image from "next/image";
import Link from "next/link";
import { matchName } from "~/util/riot/image";

interface TeamSidesProps {
  blueSide: Participant[];
  redSide: Participant[];
  version: LeagueVersionConfig;
  platform: string;
  gameId: number;
}

const CHAMPION_ICON_SIZE = 20;

const TeamSides = ({
  blueSide,
  redSide,
  version,
  platform,
  gameId,
}: TeamSidesProps) => {
  return (
    <div className="hidden w-full min-w-0 flex-row gap-2 overflow-hidden md:flex lg:w-64 lg:gap-3">
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        {blueSide.map((participant) => (
          <div
            key={gameId + participant.puuid}
            className="flex min-w-0 flex-row items-center gap-x-1 lg:gap-x-2"
          >
            <Image
              src={`https://ddragon.leagueoflegends.com/cdn/${version.v}/img/champion/${matchName(participant.championName)}.png`}
              alt={participant.championName}
              width={CHAMPION_ICON_SIZE}
              height={CHAMPION_ICON_SIZE}
              className="flex-shrink-0 rounded-full border border-blue-500/30"
            />
            <Link
              href={`/summoners/${platform}/${participant.riotIdGameName}-${participant.riotIdTagline}`}
              className="max-w-[60px] min-w-0 truncate text-xs text-slate-300 hover:text-slate-100 lg:max-w-[80px]"
              title={participant.riotIdGameName}
            >
              {participant.riotIdGameName}
            </Link>
          </div>
        ))}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        {redSide.map((participant) => (
          <div
            key={gameId + participant.puuid}
            className="flex min-w-0 flex-row items-center gap-x-1 lg:gap-x-2"
          >
            <Image
              src={`https://ddragon.leagueoflegends.com/cdn/${version.v}/img/champion/${matchName(participant.championName)}.png`}
              alt={participant.championName}
              width={CHAMPION_ICON_SIZE}
              height={CHAMPION_ICON_SIZE}
              className="flex-shrink-0 rounded-full border border-red-500/30"
            />
            <Link
              href={`/summoners/${platform}/${participant.riotIdGameName}-${participant.riotIdTagline}`}
              className="max-w-[60px] min-w-0 truncate text-xs text-slate-300 hover:text-slate-100 lg:max-w-[80px]"
              title={participant.riotIdGameName}
            >
              {participant.riotIdGameName}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamSides;
