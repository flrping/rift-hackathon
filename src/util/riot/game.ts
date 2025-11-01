import type {
  Participant,
  ParticipantPerformance,
  Match,
  MatchOverview,
  ItemData,
} from "~/types/riot";

export type CommonQueueType =
  | "ALL"
  | "SWIFTPLAY"
  | "DRAFT"
  | "RANKED_SOLO_5x5"
  | "RANKED_FLEX_SR";

export const QUEUE_ALIASES: Record<CommonQueueType, string[]> = {
  ALL: ["ALL"],
  SWIFTPLAY: ["SWIFTPLAY", "Swiftplay"],
  DRAFT: ["DRAFT", "Normal Draft"],
  RANKED_SOLO_5x5: ["RANKED_SOLO_5x5", "Ranked Solo/Duo", "Ranked Solo"],
  RANKED_FLEX_SR: ["RANKED_FLEX_SR", "Ranked Flex"],
};

export const QUEUE_IDS: Record<CommonQueueType, number> = {
  ALL: -1,
  SWIFTPLAY: 490,
  DRAFT: 400,
  RANKED_SOLO_5x5: 420,
  RANKED_FLEX_SR: 440,
};

export const getMapSide = (teamId: number) => {
  if (teamId === 100) {
    return "Blue";
  } else if (teamId === 200) {
    return "Red";
  } else {
    return "unknown";
  }
};

export const getQueueName = (description: string) => {
  if (!description) return "";

  description = description
    .replace(/\b\d+v\d+\b/gi, "")
    .replace(/\bgame\b/gi, "")
    .replace(/\bgames\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  if (description === "Ranked Solo") return "Ranked Solo/Duo";

  return description;
};

export const getMatchTimestamp = (timestamp: number) => {
  const totalSeconds = Math.floor(timestamp / 1000);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${minutes}m`;
  }
};

export const getMatchAge = (timestamp: number) => {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 1000 / 60);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min${minutes !== 1 ? "s" : ""} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days !== 1 ? "s" : ""} ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} week${weeks !== 1 ? "s" : ""} ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months !== 1 ? "s" : ""} ago`;

  const years = Math.floor(days / 365);
  return `${years} year${years !== 1 ? "s" : ""} ago`;
};

export const getMonthlyRanges = (year: number) => {
  const ranges: { month: number; startTime: number; endTime: number }[] = [];

  for (let month = 0; month < 12; month++) {
    const start = new Date(year, month, 1, 0, 0, 0, 0);
    const end = new Date(year, month + 1, 1, 0, 0, 0, 0);
    end.setMilliseconds(end.getMilliseconds() - 1);

    ranges.push({
      month: month + 1,
      startTime: Math.floor(start.getTime() / 1000),
      endTime: Math.floor(end.getTime() / 1000),
    });
  }

  return ranges;
};

export const findOpponent = (
  me: Participant,
  participants: Participant[],
): Participant | undefined => {
  return participants.find(
    (participant) =>
      participant.puuid !== me.puuid &&
      participant.teamId !== me.teamId &&
      (participant.individualPosition === me.individualPosition ||
        participant.teamPosition === me.teamPosition ||
        participant.lane === me.lane),
  );
};

export const convertToParticipantPerformance = (
  participant: Participant,
  gameDuration: number,
  teamKills: number,
  items?: ItemData,
): ParticipantPerformance => {
  const cs = participant.totalMinionsKilled + participant.neutralMinionsKilled;
  const gold = participant.goldEarned;
  const gameMinutes = gameDuration / 60;

  return {
    championName: participant.championName ?? "",
    kills: participant.kills ?? 0,
    deaths: participant.deaths ?? 0,
    assists: participant.assists ?? 0,
    cs,
    gold,
    level: participant.champLevel ?? 0,
    totalPings:
      (participant.allInPings ?? 0) +
      (participant.assistMePings ?? 0) +
      (participant.commandPings ?? 0) +
      (participant.enemyMissingPings ?? 0) +
      (participant.enemyVisionPings ?? 0) +
      (participant.getBackPings ?? 0) +
      (participant.holdPings ?? 0) +
      (participant.needVisionPings ?? 0) +
      (participant.onMyWayPings ?? 0) +
      (participant.pushPings ?? 0) +
      (participant.visionClearedPings ?? 0),
    consumablesPurchased: participant.consumablesPurchased ?? 0,
    wardsPlaced: participant.wardsPlaced ?? 0,
    dragonKills: participant.dragonKills ?? 0,
    turretKills: participant.turretKills ?? 0,
    inhibitorKills: participant.inhibitorKills ?? 0,
    damageDealt: participant.totalDamageDealtToChampions ?? 0,
    damageTaken: participant.totalDamageTaken ?? 0,
    win: !!participant.win,
    item0: items?.data?.[participant.item0]?.name ?? "",
    item1: items?.data?.[participant.item1]?.name ?? "",
    item2: items?.data?.[participant.item2]?.name ?? "",
    item3: items?.data?.[participant.item3]?.name ?? "",
    item4: items?.data?.[participant.item4]?.name ?? "",
    item5: items?.data?.[participant.item5]?.name ?? "",
    item6: items?.data?.[participant.item6]?.name ?? "",
    lane:
      participant.individualPosition ||
      participant.teamPosition ||
      participant.lane ||
      "",
    visionScore: participant.visionScore ?? 0,
    controlWardsPlaced: participant.detectorWardsPlaced ?? 0,
    wardsKilled: participant.wardsKilled ?? 0,
    controlWardsPurchased: participant.visionWardsBoughtInGame ?? 0,
    damageToObjectives: participant.damageDealtToObjectives ?? 0,
    damageToBuildings: participant.damageDealtToBuildings ?? 0,
    damageMitigated: participant.damageSelfMitigated ?? 0,
    ccTime: participant.timeCCingOthers ?? 0,
    timeSpentDead: participant.totalTimeSpentDead ?? 0,
    doubleKills: participant.doubleKills ?? 0,
    tripleKills: participant.tripleKills ?? 0,
    quadraKills: participant.quadraKills ?? 0,
    pentaKills: participant.pentaKills ?? 0,
    firstBlood: !!participant.firstBloodKill,
    firstBloodAssist: !!participant.firstBloodAssist,
    firstTower: !!(participant.firstTowerKill || participant.firstTowerAssist),
    goldSpent: participant.goldSpent ?? 0,
    allyJungleFarm: participant.totalAllyJungleMinionsKilled ?? 0,
    enemyJungleFarm: participant.totalEnemyJungleMinionsKilled ?? 0,
    objectiveSteals:
      (participant.objectivesStolen ?? 0) +
      (participant.objectivesStolenAssists ?? 0),
    healsToAllies: participant.totalHealsOnTeammates ?? 0,
    shieldsToAllies: participant.totalDamageShieldedOnTeammates ?? 0,
    baronKills: participant.baronKills ?? 0,
    bountyLevel: participant.bountyLevel ?? 0,
    killingSprees: participant.killingSprees ?? 0,
    gameSurrendered: !!(
      participant.gameEndedInSurrender || participant.gameEndedInEarlySurrender
    ),
    killParticipation:
      teamKills > 0
        ? (((participant.kills ?? 0) + (participant.assists ?? 0)) /
            teamKills) *
          100
        : 0,
    csPerMinute: gameMinutes > 0 ? cs / gameMinutes : 0,
    goldPerMinute: gameMinutes > 0 ? gold / gameMinutes : 0,
    damagePerGold:
      gold > 0 ? (participant.totalDamageDealtToChampions ?? 0) / gold : 0,
  };
};

export const convertMatchesToPerformances = (
  matchData: Match[],
  matchIdsByMonth: { month: number; matches: string[] }[],
  summonerPuuid: string,
  items?: ItemData,
): {
  month: string;
  performances: MatchOverview[];
}[] => {
  return matchIdsByMonth.map((monthData) => ({
    month: monthData.month.toString(),
    performances: matchData
      .filter((match) => monthData.matches.includes(match.metadata.matchId))
      .map((match) => {
        const me = match.info.participants.find(
          (participant) => participant.puuid === summonerPuuid,
        );
        if (!me) return null;
        const opponent = findOpponent(me, match.info.participants);
        if (!opponent) return null;

        const redParticipants = match.info.participants.filter(
          (p) => p.teamId === 200,
        );
        const blueParticipants = match.info.participants.filter(
          (p) => p.teamId === 100,
        );

        const myTeamParticipants =
          me.teamId === 200 ? redParticipants : blueParticipants;
        const myTeamKills = myTeamParticipants.reduce(
          (sum, p) => sum + p.kills,
          0,
        );
        const opponentTeamParticipants =
          opponent.teamId === 200 ? redParticipants : blueParticipants;
        const opponentTeamKills = opponentTeamParticipants.reduce(
          (sum, p) => sum + p.kills,
          0,
        );

        return {
          gameDuration: match.info.gameDuration,
          me: convertToParticipantPerformance(
            me,
            match.info.gameDuration,
            myTeamKills,
            items,
          ),
          opponent: convertToParticipantPerformance(
            opponent,
            match.info.gameDuration,
            opponentTeamKills,
            items,
          ),
          game: {
            duration: match.info.gameDuration,
            version: match.info.gameVersion,
          },
          teams: {
            red: {
              champions: redParticipants.map((p) => p.championName),
              kills: redParticipants.reduce((sum, p) => sum + p.kills, 0),
              deaths: redParticipants.reduce((sum, p) => sum + p.deaths, 0),
              assists: redParticipants.reduce((sum, p) => sum + p.assists, 0),
              gold: redParticipants.reduce((sum, p) => sum + p.goldEarned, 0),
            },
            blue: {
              champions: blueParticipants.map((p) => p.championName),
              kills: blueParticipants.reduce((sum, p) => sum + p.kills, 0),
              deaths: blueParticipants.reduce((sum, p) => sum + p.deaths, 0),
              assists: blueParticipants.reduce((sum, p) => sum + p.assists, 0),
              gold: blueParticipants.reduce((sum, p) => sum + p.goldEarned, 0),
            },
          },
        };
      })
      .filter((match): match is MatchOverview => match !== null),
  }));
};