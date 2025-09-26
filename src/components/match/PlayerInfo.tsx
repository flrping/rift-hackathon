import type {
  LeagueVersionConfig,
  Participant,
  SummonerSpellConfig,
} from "~/types/riot";
import Image from "next/image";

interface PlayerInfoProps {
  participant: Participant;
  version: LeagueVersionConfig;
  summonerSpells: SummonerSpellConfig;
}

const PLAYER_ICON_SIZE = 50;
const ITEM_ICON_SIZE = 25;

const PlayerInfo = ({
  participant,
  version,
  summonerSpells,
}: PlayerInfoProps) => {
  const summoner1 = summonerSpells.data.find(
    (summoner) => summoner.key === participant.summoner1Id.toString(),
  );
  const summoner2 = summonerSpells.data.find(
    (summoner) => summoner.key === participant.summoner2Id.toString(),
  );

  return (
    <div className="flex w-full min-w-0 flex-row items-center justify-start gap-2 lg:w-64 lg:justify-center">
      <div className="relative">
        <Image
          src={`https://ddragon.leagueoflegends.com/cdn/${version.v}/img/champion/${participant.championName}.png`}
          alt={participant.championName}
          width={PLAYER_ICON_SIZE}
          height={PLAYER_ICON_SIZE}
          className="rounded-lg border border-slate-500/50"
        />
      </div>

      {/*Summoner Spells*/}
      <div className="flex flex-col gap-0.5">
        <Image
          src={`https://ddragon.leagueoflegends.com/cdn/${version.v}/img/spell/${summoner1?.id}.png`}
          alt={participant.championName}
          width={ITEM_ICON_SIZE}
          height={ITEM_ICON_SIZE}
          className="flex rounded border border-slate-600/50 bg-slate-800"
        />
        <Image
          src={`https://ddragon.leagueoflegends.com/cdn/${version.v}/img/spell/${summoner2?.id}.png`}
          alt={participant.championName}
          width={ITEM_ICON_SIZE}
          height={ITEM_ICON_SIZE}
          className="flex rounded border border-slate-600/50 bg-slate-800"
        />
      </div>

      {/*Items*/}
      <div className="grid grid-cols-3 grid-rows-2 gap-0.5">
        {Array.from({ length: 6 }, (_, i) => {
          const itemId = participant[`item${i}` as keyof typeof participant] as
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
              alt={participant.championName}
              width={ITEM_ICON_SIZE}
              height={ITEM_ICON_SIZE}
              className="rounded border border-slate-500/50"
            />
          );
        })}
      </div>

      {/* Extra Item (Trinket) */}
      <div className="grid grid-cols-3 grid-rows-2 gap-0.5">
        {(() => {
          const itemId = participant.item6;

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
              alt={participant.championName}
              width={ITEM_ICON_SIZE}
              height={ITEM_ICON_SIZE}
              className="rounded border border-slate-500/50"
            />
          );
        })()}
      </div>
    </div>
  );
};

export default PlayerInfo;
