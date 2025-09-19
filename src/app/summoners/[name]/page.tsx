"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { Match } from "~/types/riot";
import { api } from "~/trpc/react";

const SummonersPage = () => {
  const params = useParams();
  const name = params.name as string;
  const [gameName, tagName] = name.split("-");

  const [processedMatches, setProcessedMatches] = useState<Match[]>([]);

  const [start, setStart] = useState<number>(0);
  const [count, setCount] = useState<number>(10);

  const { data: account, isLoading: isAccountLoading } =
    api.riot.getAccountByNameAndTag.useQuery(
      { name: gameName ?? "", tag: tagName ?? "" },
      { enabled: !!gameName && !!tagName },
    );

  const { data: summoner, isLoading: isSummonerLoading } =
    api.riot.getSummonerByPUUID.useQuery(
      { id: account?.puuid ?? "" },
      { enabled: !!account?.puuid },
    );

  const { data: matchIds, isLoading: isMatchIdsLoading } =
    api.riot.getMatchesByPUUID.useQuery(
      { id: account?.puuid ?? "", start, count },
      { enabled: !!account?.puuid },
    );

  const { data: matches, isLoading: isMatchesLoading } =
    api.riot.getMatchesByGameIds.useQuery(
      { ids: matchIds ?? [] },
      { enabled: !!matchIds },
    );

  useEffect(() => {
    if (matchIds && matches) {
      setProcessedMatches((prev) => {
        const newMatches = matches.filter(
          (m) => !prev.some((pm) => pm.info.gameId === m.info.gameId),
        );
        return [...prev, ...newMatches];
      });
    }
  }, [matchIds, matches]);

  if (isAccountLoading || isSummonerLoading) {
    return <div>Loading...</div>;
  }

  if (!account || !summoner) {
    return <div>Account not found</div>;
  }

  return (
    <>
      <div>
        <h1>Account</h1>
        <p>{account?.gameName}</p>
        <p>{account?.tagLine}</p>
      </div>
      <div>
        <h1>Summoner</h1>
        <p>{summoner?.profileIconId}</p>
        <p>{summoner?.revisionDate}</p>
        <p>{summoner?.summonerLevel}</p>
      </div>
      <div>
        <h1>Matches</h1>
        <p>{processedMatches?.length}</p>
        {processedMatches.map((match) => (
          <div key={match.info.gameId}>
            <p>Game ID: {match.info.gameId}</p>
            <p>Game Mode: {match.info.gameMode}</p>
            <p>Game Type: {match.info.gameType}</p>
            <p>Game Version: {match.info.gameVersion}</p>
            <hr />
          </div>
        ))}
      </div>
    </>
  );
};

export default SummonersPage;
