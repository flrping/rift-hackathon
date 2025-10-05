"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useLeague } from "~/hooks/useLeague";
import Image from "next/image";
import MatchCard from "~/components/MatchCard";
import { useSummoner } from "~/hooks/useSummoner";
import FadeContainer from "~/components/FadeContainer";
import { useMatch } from "~/hooks/useMatch";
import { type CommonQueueType, QUEUE_IDS } from "~/util/riot/game";
import { api } from "~/trpc/react";

const MATCH_COUNT_PER_FETCH = 10;

const SummonersPage = () => {
  const router = useRouter();
  const params = useParams();
  const name = params.name as string;
  const platform = params.platform as string;
  const [gameName, tagName] = name.split("-");

  const [start, setStart] = useState<number>(0);
  const [rankTab, setRankTab] = useState<"RANKED_SOLO_5x5" | "RANKED_FLEX_SR">(
    "RANKED_SOLO_5x5",
  );
  const [queueType, setQueueType] = useState<CommonQueueType>("ALL");
  const [search, setSearch] = useState<string>("");
  const [randomSkinNum, setRandomSkinNum] = useState<number>(0);

  const league = useLeague(platform);
  const selectedQueueId = queueType === null ? null : QUEUE_IDS[queueType];

  const summoner = useSummoner({
    platform,
    name: gameName ?? "",
    tag: tagName ?? "",
  });

  const match = useMatch({
    platform,
    puuid: summoner?.account?.puuid ?? "",
    start,
    count: MATCH_COUNT_PER_FETCH,
    queue: selectedQueueId ?? -1,
  });

  const mostPlayedChampion = useMemo(() => {
    if (!match?.processedMatches || !summoner?.account?.puuid) return null;

    const counts = match.processedMatches.reduce<Record<string, number>>(
      (acc, m) => {
        const champ = m.info.participants.find(
          (p) => p.puuid === summoner.account?.puuid,
        )?.championName;
        if (champ) acc[champ] = (acc[champ] ?? 0) + 1;
        return acc;
      },
      {},
    );

    const [mostPlayed] =
      Object.entries(counts).sort(([, a], [, b]) => b - a)[0] ?? [];
    return mostPlayed ?? null;
  }, [match?.processedMatches, summoner?.account?.puuid]);

  const { data: championData } = api.riot.getChampion.useQuery(
    {
      version: league.version?.v ?? "",
      language: league.version?.l ?? "",
      name: mostPlayedChampion ?? "",
    },
    { enabled: !!mostPlayedChampion && !!league.version },
  );

  useEffect(() => {
    if (!championData?.skins?.length) return;
    const random =
      championData.skins[Math.floor(Math.random() * championData.skins.length)];
    setRandomSkinNum(random?.num ?? 0);
  }, [championData]);

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
      <div className="container mx-auto flex min-h-screen flex-col items-center justify-start gap-4 bg-slate-900 px-8 py-6 text-white">
        <div className="flex w-full flex-col gap-4">
          {/* Profile */}
          <div
            className="relative flex min-h-[30vh] w-full flex-col items-center overflow-hidden rounded-lg border border-slate-600/30 p-4"
            style={{
              backgroundImage:
                mostPlayedChampion && championData
                  ? `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url(https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${mostPlayedChampion}_${randomSkinNum}.jpg)`
                  : undefined,
              backgroundSize: "cover",
              backgroundPosition: "top",
            }}
          >
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
        </div>

        <div className="flex w-full flex-col gap-4 lg:flex-row">
          {/* Side */}
          <div className="flex flex-1 flex-col items-center gap-4">
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

          {/* Main */}
          <div className="flex flex-3 flex-col gap-4">
            {/* Rift Rewind */}
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
              <div className="flex flex-row gap-2">
                {/* Search */}
                <input
                  type="text"
                  className="flex-1/2 rounded-lg border border-slate-600/30 bg-slate-700/50 p-2 text-sm text-slate-300"
                  placeholder="Search by Champion"
                  onChange={(e) => setSearch(e.target.value)}
                  value={search}
                />

                {/* Filter */}
                <select
                  className="ms-auto rounded-lg border border-slate-600/30 bg-slate-700/50 p-2 text-sm text-slate-300"
                  onChange={(e) =>
                    setQueueType(e.target.value as CommonQueueType)
                  }
                  value={queueType}
                >
                  <option value="ALL">All</option>
                  <option value="NORMAL">Normal</option>
                  <option value="RANKED_SOLO_5x5">Ranked Solo/Duo</option>
                  <option value="RANKED_FLEX_SR">Ranked Flex</option>
                </select>
              </div>

              {/* Matches */}
              <div className="space-y-2">
                {match.processedMatches.length === 0 && !summoner.isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <span className="text-slate-400">No matches found</span>
                  </div>
                ) : (
                  match.processedMatches
                    .filter(
                      (match) => match.info.endOfGameResult === "GameComplete",
                    )
                    .filter((match) =>
                      match.info.participants.some(
                        (participant) =>
                          participant.championName
                            .toLowerCase()
                            .includes(search.toLowerCase()) &&
                          participant.puuid === summoner.account?.puuid,
                      ),
                    )
                    .filter(
                      (match) =>
                        queueType === "ALL" ||
                        match.info.queueId === QUEUE_IDS[queueType],
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
              onClick={() => setStart(start + MATCH_COUNT_PER_FETCH)}
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
