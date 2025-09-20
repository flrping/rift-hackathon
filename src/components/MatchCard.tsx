import type {LeagueVersionConfig, Match, SummonerSpellConfig} from "~/types/riot";
import Image from "next/image";
import {matchName} from "~/util/riot/image";

interface MatchCardProps {
  puuid: string;
  match: Match;
  version: LeagueVersionConfig;
  summonerSpells: SummonerSpellConfig;
}

const MatchCard = ({ puuid, match, version, summonerSpells }: MatchCardProps) => {
  const CHAMPION_ICON_SIZE = 20;
  const ITEM_ICON_SIZE = 25;
  const PLAYER_ICON_SIZE = 50;

  const me = match.info.participants.find(
    (participant) => participant.puuid === puuid,
  );
  const summoner1 = summonerSpells.data.find(
    (summoner) => summoner.key === me!.summoner1Id.toString()
  );
  const summoner2 = summonerSpells.data.find(
    (summoner) => summoner.key === me!.summoner2Id.toString()
  );

  const blueSide = match.info.participants.filter(
    (team) => team.teamId === 100,
  );
  const redSide = match.info.participants.filter(
    (team) => team.teamId === 200
  );

  const matchDurationMinutes = Math.floor(match.info.gameDuration / 60);

  return (
    <div className="flex flex-row gap-2 rounded-lg bg-slate-700/50 p-2">
      {/*User*/}
      <div className="flex flex-1 flex-row items-center justify-center gap-2">
        <div>
          <Image
            src={`https://ddragon.leagueoflegends.com/cdn/${version.v}/img/champion/${me?.championName}.png`}
            alt={me?.championName ?? ""}
            width={PLAYER_ICON_SIZE}
            height={PLAYER_ICON_SIZE}
          />
        </div>

        {/*Summoner Spells*/}
        <div className="flex flex-col gap-1">
          <Image
            src={`https://ddragon.leagueoflegends.com/cdn/${version.v}/img/spell/${summoner1?.id}.png`}
            alt={me?.championName ?? ""}
            width={ITEM_ICON_SIZE}
            height={ITEM_ICON_SIZE}
          />
          <Image
            src={`https://ddragon.leagueoflegends.com/cdn/${version.v}/img/spell/${summoner2?.id}.png`}
            alt={me?.championName ?? ""}
            width={ITEM_ICON_SIZE}
            height={ITEM_ICON_SIZE}
          />
        </div>

        {/*Items*/}
        <div className="grid grid-cols-3 grid-rows-2 gap-1">
          {Array.from({ length: 6 }, (_, i) => {
            const itemId = me?.[`item${i}` as keyof typeof me] as
              | number
              | undefined;

            if (!itemId || itemId === 0) {
              return (
                <span
                  key={i}
                  className="flex bg-gray-700"
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
              />
            );
          })}
        </div>

        {/* Extra */}
        <div className="grid grid-cols-3 grid-rows-2 gap-1">
          {(() => {
            const itemId = me?.item6;

            if (!itemId || itemId === 0) {
              return (
                <span
                  key={6}
                  className="flex bg-gray-700"
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
              />
            );
          })()}
        </div>
      </div>

      {/* Stats */}
      <div className="flex flex-1 flex-col items-center justify-center gap-2">
        <div>
          {me?.kills} / {me?.deaths} / {me?.assists}
        </div>
        <div>
          {me!.totalMinionsKilled} CS {" "}
          ({(me!.totalMinionsKilled / matchDurationMinutes).toFixed(1)})
        </div>
      </div>

      {/* Sides */}
      <div className="flex flex-1 flex-row gap-4">
        <div className="flex flex-col">
          {blueSide?.map((participant) => (
            <div
              key={match.info.gameId + participant.puuid}
              className="flex flex-row gap-x-2"
            >
              <Image
                src={`https://ddragon.leagueoflegends.com/cdn/${version.v}/img/champion/${matchName(participant?.championName)}.png`}
                alt={me?.championName ?? ""}
                width={CHAMPION_ICON_SIZE}
                height={CHAMPION_ICON_SIZE}
                className="rounded-full"
              />
              <small>{participant.riotIdGameName}</small>
            </div>
          ))}
        </div>
        <div className="flex flex-col">
          {redSide?.map((participant) => (
            <div
              key={match.info.gameId + participant.puuid}
              className="flex flex-row gap-x-2"
            >
              <Image
                src={`https://ddragon.leagueoflegends.com/cdn/${version.v}/img/champion/${matchName(participant?.championName)}.png`}
                alt={me?.championName ?? ""}
                width={CHAMPION_ICON_SIZE}
                height={CHAMPION_ICON_SIZE}
                className="rounded-full"
              />
              <small>{participant.riotIdGameName}</small>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MatchCard;
