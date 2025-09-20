"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useLeague } from "~/hooks/useLeague";
import Image from "next/image";
import MatchCard from "~/components/MatchCard";
import {useSummoner} from "~/hooks/useSummoner";

const SummonersPage = () => {
  const params = useParams();
  const queryParams = useSearchParams();
  const name = params.name as string;
  const platform = queryParams.get("region") ?? "NA1";
  const [gameName, tagName] = name.split("-");

  const [start, setStart] = useState<number>(0);
  const [count, setCount] = useState<number>(10);

  const league = useLeague(platform);
  const summoner = useSummoner({platform, name: gameName ?? "", tag: tagName ?? "", start, count});

  if (summoner.isLoading) {
    return <div>Loading...</div>;
  }

  if (!summoner.account || !summoner.summoner) {
    return <div>Account not found</div>;
  }

  if(!league.version) {
    return <div>Version not found</div>;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 px-60 py-24 text-white">
      <div className="flex w-full gap-4">
        <div className="flex w-1/4 flex-col items-center rounded-lg bg-slate-700/50 p-4">
          <Image
            src={`https://ddragon.leagueoflegends.com/cdn/${league.version.v}/img/profileicon/${summoner?.summoner.profileIconId}.png`}
            alt="Profile Icon"
            width={100}
            height={100}
            className="rounded-full"
          />
          <p>
            {summoner.account?.gameName} #{summoner.account?.tagLine}
          </p>
          <p>Level: {summoner.summoner?.summonerLevel}</p>
        </div>
        <div className="flex w-full flex-col rounded-lg bg-slate-700/50 p-4 gap-4">
          {summoner.processedMatches.map((match) => (
            <div key={match.info.gameId}>
              <MatchCard
                key={match.info.gameId}
                puuid={summoner.account?.puuid ?? ""}
                match={match}
                version={league.version!}
                summonerSpells={league.summonerSpells!}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SummonersPage;
