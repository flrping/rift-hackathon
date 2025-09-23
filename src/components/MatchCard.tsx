import type {
  LeagueVersionConfig,
  Match,
  Queue,
  SummonerSpellConfig,
} from "~/types/riot";
import Image from "next/image";
import { matchName } from "~/util/riot/image";
import { getMatchAge, getQueueName } from "~/util/riot/game";
import Link from "next/link";

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
  const CHAMPION_ICON_SIZE = 20;
  const ITEM_ICON_SIZE = 25;
  const PLAYER_ICON_SIZE = 50;

  const queue = queues.find((queue) => queue.queueId === match.info.queueId);

  const matchDurationMinutes = Math.floor(match.info.gameDuration / 60);
  const matchDurationSeconds = match.info.gameDuration % 60;
  const matchAge = getMatchAge(match.info.gameEndTimestamp!);

  const me = match.info.participants.find(
    (participant) => participant.puuid === puuid,
  );
  const summoner1 = summonerSpells.data.find(
    (summoner) => summoner.key === me!.summoner1Id.toString(),
  );
  const summoner2 = summonerSpells.data.find(
    (summoner) => summoner.key === me!.summoner2Id.toString(),
  );
  const win = match.info.teams.find((team) => team.teamId === me?.teamId)?.win;

  const blueSide = match.info.participants.filter(
    (team) => team.teamId === 100,
  );
  const redSide = match.info.participants.filter((team) => team.teamId === 200);

  return (
    <div
      className="flex flex-row gap-3 rounded-lg border border-slate-600/30 px-8 py-2 transition-colors duration-200 hover:opacity-90"
      style={{
        borderLeftWidth: "5px",
        borderLeftColor: win ? "#22c55e" : "#ef4444",
        background: win
          ? "linear-gradient(to right, rgba(34, 197, 94, 0.15) 0%, rgba(51, 65, 85, 0.5) 10%, rgba(51, 65, 85, 0.5) 100%)"
          : "linear-gradient(to right, rgba(239, 68, 68, 0.15) 0%, rgba(51, 65, 85, 0.5) 10%, rgba(51, 65, 85, 0.5) 100%)",
      }}
    >
      {/* Match */}
      <div className="flex w-32 flex-col items-center justify-center gap-0.5">
        <p className="text-sm font-medium text-slate-200">
          {getQueueName(queue?.description ?? "")}
        </p>
        <p className="text-xs text-slate-400">
          {matchDurationMinutes}:
          {matchDurationSeconds.toString().padStart(2, "0")}
        </p>
        <p className="text-xs text-slate-400">{matchAge}</p>
        <p
          className="text-xs text-slate-400"
          style={{
            color: win ? "#22c55e" : "#ef4444",
          }}
        >
          {win ? "Win" : "Loss"}
        </p>
      </div>

      {/*User*/}
      <div className="flex w-64 flex-row items-center justify-center gap-2">
        <div className="relative">
          <Image
            src={`https://ddragon.leagueoflegends.com/cdn/${version.v}/img/champion/${me?.championName}.png`}
            alt={me?.championName ?? ""}
            width={PLAYER_ICON_SIZE}
            height={PLAYER_ICON_SIZE}
            className="rounded-lg border border-slate-500/50"
          />
        </div>

        {/*Summoner Spells*/}
        <div className="flex flex-col gap-0.5">
          <Image
            src={`https://ddragon.leagueoflegends.com/cdn/${version.v}/img/spell/${summoner1?.id}.png`}
            alt={me?.championName ?? ""}
            width={ITEM_ICON_SIZE}
            height={ITEM_ICON_SIZE}
            className="flex rounded border border-slate-600/50 bg-slate-800"
          />
          <Image
            src={`https://ddragon.leagueoflegends.com/cdn/${version.v}/img/spell/${summoner2?.id}.png`}
            alt={me?.championName ?? ""}
            width={ITEM_ICON_SIZE}
            height={ITEM_ICON_SIZE}
            className="flex rounded border border-slate-600/50 bg-slate-800"
          />
        </div>

        {/*Items*/}
        <div className="grid grid-cols-3 grid-rows-2 gap-0.5">
          {Array.from({ length: 6 }, (_, i) => {
            const itemId = me?.[`item${i}` as keyof typeof me] as
              | number
              | undefined;

            if (!itemId || itemId === 0) {
              return (
                <span
                  key={i}
                  className="flex rounded border border-slate-600/50 bg-slate-800"
                  style={{ width: ITEM_ICON_SIZE, height: ITEM_ICON_SIZE }}
                />
              );
            }

            return (
              <Image
                key={i}
                src={`https://ddragon.leagueoflegends.com/cdn/${version.v}/img/item/${itemId}.png`}
                alt={me?.championName ?? ""}
                width={ITEM_ICON_SIZE}
                height={ITEM_ICON_SIZE}
                className="rounded border border-slate-500/50"
              />
            );
          })}
        </div>

        {/* Extra */}
        <div className="grid grid-cols-3 grid-rows-2 gap-0.5">
          {(() => {
            const itemId = me?.item6;

            if (!itemId || itemId === 0) {
              return (
                <span
                  key={6}
                  className="flex rounded border border-slate-600/50 bg-slate-800"
                  style={{ width: ITEM_ICON_SIZE, height: ITEM_ICON_SIZE }}
                />
              );
            }

            return (
              <Image
                key={6}
                src={`https://ddragon.leagueoflegends.com/cdn/${version.v}/img/item/${itemId}.png`}
                alt={me?.championName ?? ""}
                width={ITEM_ICON_SIZE}
                height={ITEM_ICON_SIZE}
                className="rounded border border-slate-500/50"
              />
            );
          })()}
        </div>
      </div>

      {/* Stats */}
      <div className="flex w-40 flex-col items-center justify-center gap-1">
        <div className="text-md font-semibold">
          <span className="text-green-400">{me?.kills}</span> /{" "}
          <span className="text-red-400">{me?.deaths}</span> /{" "}
          <span className="text-blue-400">{me?.assists}</span>
        </div>
        <div className="text-xs text-slate-300">
          {me!.totalMinionsKilled + me!.neutralMinionsKilled} CS{" "}
          <span className="text-slate-400">
            (
            {(
              (me!.totalMinionsKilled + me!.neutralMinionsKilled) /
              matchDurationMinutes
            ).toFixed(1)}
            )
          </span>
        </div>
      </div>

      {/* Sides */}
      <div className="ms-auto flex w-64 flex-row gap-3">
        <div className="flex flex-col gap-0.5">
          {blueSide?.map((participant) => (
            <div
              key={match.info.gameId + participant.puuid}
              className="flex flex-row items-center gap-x-2"
            >
              <Image
                src={`https://ddragon.leagueoflegends.com/cdn/${version.v}/img/champion/${matchName(participant?.championName)}.png`}
                alt={me?.championName ?? ""}
                width={CHAMPION_ICON_SIZE}
                height={CHAMPION_ICON_SIZE}
                className="rounded-full border border-blue-500/30"
              />
              <Link
                href={`/summoners/${participant.riotIdGameName}-${participant.riotIdTagline}?region=${platform}`}
                className="max-w-[80px] truncate text-xs text-slate-300 hover:text-slate-100"
              >
                {participant.riotIdGameName}
              </Link>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-0.5">
          {redSide?.map((participant) => (
            <div
              key={match.info.gameId + participant.puuid}
              className="flex flex-row items-center gap-x-2"
            >
              <Image
                src={`https://ddragon.leagueoflegends.com/cdn/${version.v}/img/champion/${matchName(participant?.championName)}.png`}
                alt={me?.championName ?? ""}
                width={CHAMPION_ICON_SIZE}
                height={CHAMPION_ICON_SIZE}
                className="rounded-full border border-red-500/30"
              />
              <Link
                href={`/summoners/${participant.riotIdGameName}-${participant.riotIdTagline}?region=${platform}`}
                className="max-w-[80px] truncate text-xs text-slate-300 hover:text-slate-100"
              >
                {participant.riotIdGameName}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MatchCard;
