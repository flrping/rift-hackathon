"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useLeague } from "~/hooks/useLeague";
import Image from "next/image";
import MatchCard from "~/components/MatchCard";
import { useSummoner } from "~/hooks/useSummoner";
import FadeContainer from "~/components/FadeContainer";
import {useMatch} from "~/hooks/useMatch";
import {type CommonQueueType, getQueueName, QUEUE_ALIASES} from "~/util/riot/game";

const SummonersPage = () => {
  const router = useRouter();
  const params = useParams();
  const name = params.name as string;
  const platform = params.platform as string;
  const [gameName, tagName] = name.split("-");
  
  const [start, setStart] = useState<number>(0);
  const [count, setCount] = useState<number>(10);
  const [rankTab, setRankTab] = useState<"RANKED_SOLO_5x5" | "RANKED_FLEX_SR">("RANKED_SOLO_5x5");
  const [queueType, setQueueType] = useState<CommonQueueType>("ALL");

  const league = useLeague(platform);
  const selectedQueue = league?.queues?.find((queue) =>
    QUEUE_ALIASES[queueType].some(
      (alias) =>
        getQueueName(queue.description).toUpperCase() == alias.toUpperCase(),
    ),
  );

  const summoner = useSummoner({
    platform,
    name: gameName ?? "",
    tag: tagName ?? "",
  });

  const match = useMatch({
    platform,
    puuid: summoner?.account?.puuid ?? "",
    start,
    count,
    queue: selectedQueue?.queueId ?? -1
  })

  if ((!summoner.account || !summoner.summoner) && !summoner.isLoading) {
    return <div>Account not found</div>;
  }

  if (!league.version && !league.isLoading) {
    return <div>Version not found</div>;
  }

  const handleRiftRewind = () => {
    router.push(`/summoners/${platform}/${name}/rewind`);
  };

  return (
    <FadeContainer isLoading={summoner.isLoading || league.isLoading}>
      <div className="flex min-h-screen flex-col items-center justify-start bg-slate-900 px-4 py-6 text-white md:px-20 lg:px-60">
        <div className="flex w-full max-w-7xl gap-4">
          <div className="flex min-w-[260px] flex-col items-center gap-4">
            {/* Profile */}
            <div className="flex w-full flex-col items-center rounded-lg border border-slate-600/30 bg-slate-700/50 p-4">
              <Image
                src={`https://ddragon.leagueoflegends.com/cdn/${league.version?.v}/img/profileicon/${summoner?.summoner?.profileIconId}.png`}
                alt="Profile Icon"
                width={120}
                height={120}
                className="mb-3 rounded-full border-4 border-slate-500/50"
              />
              <div className="space-y-1.5 text-center">
                <p className="text-lg font-semibold text-slate-100">
                  {summoner.account?.gameName}
                </p>
                <p className="text-sm text-slate-400">
                  #{summoner.account?.tagLine}
                </p>
                <p className="rounded-full bg-slate-600/50 px-3 py-1 text-sm text-slate-300">
                  Level {summoner.summoner?.summonerLevel}
                </p>
              </div>
            </div>

            {/* Rank */}
            <div className="flex w-full flex-col items-center rounded-lg border border-slate-600/30 bg-slate-700/50 p-4">
              <div className="mb-4 flex w-full rounded-lg bg-slate-800 p-1">
                <button
                  onClick={() => setRankTab("RANKED_SOLO_5x5")}
                  className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    rankTab === "RANKED_SOLO_5x5"
                      ? "bg-slate-600 text-white"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Solo/Duo
                </button>
                <button
                  onClick={() => setRankTab("RANKED_FLEX_SR")}
                  className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    rankTab === "RANKED_FLEX_SR"
                      ? "bg-slate-600 text-white"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Flex
                </button>
              </div>

              {(() => {
                const currentRank = summoner.ranks?.find(
                  (rank) => rank.queueType === rankTab,
                );
                return (
                  <>
                    <Image
                      src={`/Rank=${currentRank?.tier}.png`}
                      alt="Rank Icon"
                      width={120}
                      height={120}
                      className="mb-1"
                    />
                    <div className="space-y-1.5 text-center">
                      <p className="text-lg font-semibold text-slate-100">
                        {currentRank?.tier} {currentRank?.rank}
                      </p>
                      <p className="text-sm text-slate-400">
                        {currentRank?.wins}W - {currentRank?.losses}L (
                        {(
                          ((currentRank?.wins ?? 0) /
                            ((currentRank?.wins ?? 0) +
                              (currentRank?.losses ?? 0))) *
                          100
                        ).toFixed(0)}
                        %)
                      </p>
                      <p className="rounded-full bg-slate-600/50 px-3 py-1 text-sm text-slate-300">
                        {currentRank?.leaguePoints} LP
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          {/* Matches */}
          <div className="flex flex-col gap-4">
            <div
              className="group relative flex min-h-[100px] w-full flex-col items-center justify-center gap-2 rounded-lg border border-purple-500/30 bg-purple-500/10 p-4 transition-all duration-300 hover:cursor-pointer hover:border-blue-400/50"
              onClick={handleRiftRewind}
            >
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-600/20 via-blue-500/20 to-purple-600/20 opacity-0 transition-opacity duration-500 group-hover:opacity-100 hover:animate-pulse"></div>
              <div className="relative z-10 flex flex-col items-center justify-center gap-2">
                <p className="p-0 text-lg font-semibold text-slate-100 transition-colors duration-300 group-hover:text-white">
                  Rift Rewind
                </p>
                <small className="text-sm text-slate-400 transition-colors duration-300 group-hover:text-slate-300">
                  View and analyze your match history with Rift Rewind.
                </small>
              </div>
            </div>
            <div className="flex w-full flex-col gap-2 rounded-lg border border-slate-600/30 bg-slate-700/50 p-4">
              <div className="space-y-2">
                {match.processedMatches.length === 0 &&
                !summoner.isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <span className="text-slate-400">No matches found</span>
                  </div>
                ) : (
                  match.processedMatches
                    .filter(
                      (match) => match.info.endOfGameResult === "GameComplete",
                    )
                    .map((match) => (
                      <MatchCard
                        key={match.info.gameId}
                        puuid={summoner.account?.puuid ?? ""}
                        match={match}
                        platform={platform}
                        version={league.version!}
                        summonerSpells={league.summonerSpells!}
                        queues={league.queues!}
                      />
                    ))
                )}
              </div>
            </div>
            <button
              className="cursor-pointer rounded-lg border border-slate-600/30 bg-slate-700/50 px-4 py-2 text-sm text-slate-300 hover:bg-slate-600/50"
              onClick={() => setStart(start + count)}
            >
              Load More
            </button>
          </div>
        </div>
      </div>
    </FadeContainer>
  );
};

export default SummonersPage;
