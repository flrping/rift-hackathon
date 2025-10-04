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
  items?: ItemData,
): ParticipantPerformance => {
  return {
    championName: participant.championName,
    kills: participant.kills,
    deaths: participant.deaths,
    assists: participant.assists,
    cs: participant.totalMinionsKilled + participant.neutralMinionsKilled,
    gold: participant.goldEarned,
    level: participant.champLevel,
    totalPings:
      participant.allInPings +
      participant.assistMePings +
      participant.commandPings +
      participant.enemyMissingPings +
      participant.enemyVisionPings +
      participant.getBackPings +
      participant.holdPings +
      participant.needVisionPings +
      participant.onMyWayPings +
      participant.pushPings +
      participant.visionClearedPings,
    consumablesPurchased: participant.consumablesPurchased,
    wardsPlaced: participant.wardsPlaced,
    dragonKills: participant.dragonKills,
    turretKills: participant.turretKills,
    inhibitorKills: participant.inhibitorKills,
    damageDealt: participant.totalDamageDealtToChampions,
    damageTaken: participant.totalDamageTaken,
    win: participant.win,
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
      participant.lane,
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

        return {
          gameDuration: match.info.gameDuration,
          me: convertToParticipantPerformance(me, items),
          opponent: convertToParticipantPerformance(opponent, items),
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
