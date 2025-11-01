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
import { SiteFooter } from "~/components/SiteFooter";
import { SiteNavbar } from "~/components/SiteNavbar";

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
    <>
      <SiteNavbar />
      <FadeContainer
        isLoading={summoner.isLoading || league.isLoading}
        bgColor="bg-neutral-100 dark:bg-neutral-800"
      >
        <div className="container mx-auto flex min-h-screen flex-col items-center justify-start gap-4 px-8 py-6 text-black dark:text-white">
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
                <p className="rounded-full bg-rose-500/70 px-3 py-1 text-sm text-white">
                  Level {summoner.summoner?.summonerLevel}
                </p>
              </div>
            </div>
          </div>

          <div className="flex w-full flex-col gap-4 lg:flex-row">
            {/* Side */}
            <div className="flex flex-1 flex-col items-center gap-4">
              {/* Rank */}
              <div className="flex w-full flex-col items-center rounded-lg border border-neutral-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                <div className="mb-4 flex w-full rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800">
                  <button
                    onClick={() => setRankTab("RANKED_SOLO_5x5")}
                    className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      rankTab === "RANKED_SOLO_5x5"
                        ? "bg-rose-500 text-white"
                        : "text-dark hover:text-rose-400"
                    }`}
                  >
                    Solo/Duo
                  </button>
                  <button
                    onClick={() => setRankTab("RANKED_FLEX_SR")}
                    className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      rankTab === "RANKED_FLEX_SR"
                        ? "bg-rose-500 text-white"
                        : "text-dark hover:text-rose-400"
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
                        <p className="text-dark text-lg font-semibold dark:text-white">
                          {currentRank?.tier} {currentRank?.rank}
                        </p>
                        <p className="text-dark text-sm dark:text-white">
                          {currentRank?.wins}W - {currentRank?.losses}L (
                          {(
                            ((currentRank?.wins ?? 0) /
                              ((currentRank?.wins ?? 0) +
                                (currentRank?.losses ?? 0))) *
                            100
                          ).toFixed(0)}
                          %)
                        </p>
                        <p className="rounded-full bg-rose-500/70 px-3 py-1 text-sm text-white">
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
                className="group relative flex min-h-[100px] w-full flex-col items-center justify-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/50 p-4 transition-all duration-300 hover:cursor-pointer hover:border-orange-400/50"
                onClick={handleRiftRewind}
              >
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-rose-600/50 via-orange-500/50 to-rose-600/50 opacity-0 transition-opacity duration-500 group-hover:opacity-100 hover:animate-pulse"></div>
                <div className="relative z-10 flex flex-col items-center justify-center gap-2">
                  <p className="p-0 text-lg font-semibold text-white transition-colors duration-300 group-hover:text-white dark:text-white">
                    RIFT REWIND
                  </p>
                  <small className="text-sm text-white transition-colors duration-300">
                    View and analyze your match history with Rift Rewind.
                  </small>
                </div>
              </div>

              <div className="flex w-full flex-col gap-2">
                <div className="flex flex-row gap-2">
                  {/* Search */}
                  <input
                    type="text"
                    className="text-dark flex-1/2 rounded-lg border border-neutral-100 bg-white p-2 text-sm placeholder-neutral-400 focus:ring-2 focus:ring-rose-500/50 focus:outline-none dark:border-neutral-900 dark:bg-neutral-900 dark:text-white dark:placeholder-neutral-400"
                    placeholder="Search by Champion"
                    onChange={(e) => setSearch(e.target.value)}
                    value={search}
                  />

                  {/* Filter */}
                  <select
                    className="text-dark ms-auto rounded-lg border border-neutral-100 bg-white p-2 text-sm placeholder-neutral-400 focus:ring-2 focus:ring-rose-500/50 focus:outline-none dark:border-neutral-900 dark:bg-neutral-900 dark:text-white dark:placeholder-neutral-400"
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
                  {match.processedMatches.length === 0 &&
                  !summoner.isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <span className="text-neutral-400">No matches found</span>
                    </div>
                  ) : (
                    match.processedMatches
                      .filter(
                        (match) =>
                          match.info.endOfGameResult === "GameComplete",
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
                className="cursor-pointer rounded-lg border border-rose-800/30 bg-rose-500 px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-600/50 dark:border-neutral-600/30 dark:bg-neutral-700/50 dark:text-neutral-300 dark:hover:bg-neutral-600/50"
                onClick={() => setStart(start + MATCH_COUNT_PER_FETCH)}
              >
                Load More
              </button>
            </div>
          </div>
        </div>
      </FadeContainer>
      <SiteFooter />
    </>
  );
};

export default SummonersPage;
