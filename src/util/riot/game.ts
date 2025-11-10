import type {
  Participant,
  ParticipantPerformance,
  Match,
  MatchOverview,
  ItemData,
} from "~/types/riot";
import type {
  HighlightGame,
  Achievement,
  PlayerRecords,
} from "~/types/gameplay";

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
    // Use UTC boundaries to avoid timezone/DST shifting months for start/end
    const startUtcMs = Date.UTC(year, month, 1, 0, 0, 0, 0);
    const endUtcMs = Date.UTC(year, month + 1, 1, 0, 0, 0, 0) - 1;

    ranges.push({
      month: month + 1,
      startTime: Math.floor(startUtcMs / 1000),
      endTime: Math.floor(endUtcMs / 1000),
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

export function detectHighlightGames(
  matches: Match[],
  puuid: string,
): HighlightGame[] {
  const highlights: HighlightGame[] = [];

  let bestKDA = 0;
  let highestDamage = 0;
  let mostKills = 0;
  const comebackGames: Match[] = [];

  matches.forEach((match) => {
    const me = match.info.participants.find(
      (p: Participant) => p.puuid === puuid,
    );
    if (!me) return;

    const kda =
      me.deaths === 0
        ? me.kills + me.assists
        : (me.kills + me.assists) / me.deaths;

    if (kda > bestKDA && me.win) {
      bestKDA = kda;
    }

    if (me.totalDamageDealtToChampions > highestDamage) {
      highestDamage = me.totalDamageDealtToChampions;
    }

    if (me.kills > mostKills) {
      mostKills = me.kills;
    }

    if (me.pentaKills > 0) {
      highlights.push({
        matchId: match.metadata.matchId,
        type: "pentakill",
        title: "PENTAKILL!",
        description: `Dominated with ${me.championName}, securing a legendary pentakill!`,
        stats: {
          kills: me.kills,
          deaths: me.deaths,
          assists: me.assists,
          damage: me.totalDamageDealtToChampions,
          multiKills: `${me.pentaKills} Pentakill${me.pentaKills > 1 ? "s" : ""}`,
        },
        badge: "🏆",
        rarity: "legendary",
      });
    }

    if (me.deaths === 0 && me.win && me.kills + me.assists >= 10) {
      highlights.push({
        matchId: match.metadata.matchId,
        type: "perfect_game",
        title: "Perfect Game",
        description: `Flawless victory with ${me.championName} - Zero deaths!`,
        stats: {
          kda: kda,
          kills: me.kills,
          deaths: 0,
          assists: me.assists,
        },
        badge: "💎",
        rarity: "epic",
      });
    }

    const myTeam = match.info.participants.filter(
      (p: Participant) => p.teamId === me.teamId,
    );
    const enemyTeam = match.info.participants.filter(
      (p: Participant) => p.teamId !== me.teamId,
    );
    const myTeamGold = myTeam.reduce((sum, p) => sum + p.goldEarned, 0);
    const enemyTeamGold = enemyTeam.reduce((sum, p) => sum + p.goldEarned, 0);
    const goldDeficit = enemyTeamGold - myTeamGold;

    if (me.win && goldDeficit > 10000) {
      comebackGames.push(match);
      highlights.push({
        matchId: match.metadata.matchId,
        type: "epic_comeback",
        title: "Epic Comeback",
        description: `Turned the tide and won despite being ${Math.floor(goldDeficit / 1000)}k gold behind!`,
        stats: {
          goldDeficit: goldDeficit,
          kda: kda,
          damage: me.totalDamageDealtToChampions,
        },
        badge: "🔥",
        rarity: "epic",
      });
    }
  });

  if (bestKDA > 0) {
    const bestKdaMatch = matches.find((m) => {
      const me = m.info.participants.find(
        (p: Participant) => p.puuid === puuid,
      );
      if (!me) return false;
      const kda =
        me.deaths === 0
          ? me.kills + me.assists
          : (me.kills + me.assists) / me.deaths;
      return me.win && kda === bestKDA;
    });
    if (bestKdaMatch) {
      const me = bestKdaMatch.info.participants.find(
        (p: Participant) => p.puuid === puuid,
      )!;
      highlights.push({
        matchId: bestKdaMatch.metadata.matchId,
        type: "best_kda",
        title: "Best Performance",
        description: `Your best game of the year with ${me.championName}!`,
        stats: {
          kda: bestKDA,
          kills: me.kills,
          deaths: me.deaths,
          assists: me.assists,
          damage: me.totalDamageDealtToChampions,
        },
        badge: "⭐",
        rarity: "legendary",
      });
    }
  }

  if (highestDamage > 0) {
    const highDmgMatch = matches.find((m) => {
      const me = m.info.participants.find(
        (p: Participant) => p.puuid === puuid,
      );
      return me ? me.totalDamageDealtToChampions === highestDamage : false;
    });
    if (highDmgMatch) {
      const me = highDmgMatch.info.participants.find(
        (p: Participant) => p.puuid === puuid,
      )!;
      highlights.push({
        matchId: highDmgMatch.metadata.matchId,
        type: "high_damage",
        title: "Damage Monster",
        description: `Absolute destruction with ${Math.floor(highestDamage / 1000)}k damage!`,
        stats: {
          damage: highestDamage,
          kda:
            me.deaths === 0
              ? me.kills + me.assists
              : (me.kills + me.assists) / me.deaths,
        },
        badge: "💥",
        rarity: "epic",
      });
    }
  }

  if (mostKills > 0) {
    const mostKillsMatch = matches.find((m) => {
      const me = m.info.participants.find(
        (p: Participant) => p.puuid === puuid,
      );
      return me ? me.kills === mostKills : false;
    });
    if (mostKillsMatch) {
      const me = mostKillsMatch.info.participants.find(
        (p: Participant) => p.puuid === puuid,
      )!;
      highlights.push({
        matchId: mostKillsMatch.metadata.matchId,
        type: "most_kills",
        title: "Kill Leader",
        description: `Dominated with ${mostKills} kills!`,
        stats: {
          kills: mostKills,
          deaths: me.deaths,
          assists: me.assists,
        },
        badge: "🗡️",
        rarity: "rare",
      });
    }
  }

  const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };
  return highlights.sort(
    (a, b) => rarityOrder[a.rarity] - rarityOrder[b.rarity],
  );
}

export function generateAchievements(
  matches: Match[],
  puuid: string,
): Achievement[] {
  const achievements: Achievement[] = [];

  let firstBloods = 0;
  let perfectGames = 0;
  let pentakills = 0;
  let totalVisionScore = 0;
  let baronKills = 0;
  let dragonKills = 0;
  let maxWinStreak = 0;
  let currentStreak = 0;

  matches.forEach((match) => {
    const me = match.info.participants.find((p) => p.puuid === puuid);
    if (!me) return;

    if (me.firstBloodKill || me.firstBloodAssist) firstBloods++;
    if (me.deaths === 0 && me.win) perfectGames++;
    if (me.pentaKills > 0) pentakills += me.pentaKills;
    totalVisionScore += me.visionScore;
    baronKills += me.baronKills;
    dragonKills += me.dragonKills;

    if (me.win) {
      currentStreak++;
      maxWinStreak = Math.max(maxWinStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  });

  const avgVisionScore = totalVisionScore / matches.length;

  if (avgVisionScore >= 40) {
    achievements.push({
      id: "vision_master",
      title: "Vision Master",
      description: "Average vision score of 40+",
      icon: "👁️",
      rarity: "epic",
      unlocked: true,
      progress: Math.floor(avgVisionScore),
      total: 40,
    });
  }

  if (firstBloods >= 10) {
    achievements.push({
      id: "first_blood_hunter",
      title: "First Blood Hunter",
      description: "Secured first blood in 10+ games",
      icon: "🩸",
      rarity: "rare",
      unlocked: true,
      progress: firstBloods,
      total: 10,
    });
  }

  if (perfectGames >= 5) {
    achievements.push({
      id: "flawless",
      title: "Flawless",
      description: "5+ perfect games (0 deaths)",
      icon: "💎",
      rarity: "epic",
      unlocked: true,
      progress: perfectGames,
      total: 5,
    });
  }

  if (pentakills > 0) {
    achievements.push({
      id: "pentakill_legend",
      title: "Pentakill Legend",
      description: `Secured ${pentakills} pentakill${pentakills > 1 ? "s" : ""}!`,
      icon: "🏆",
      rarity: "legendary",
      unlocked: true,
      progress: pentakills,
      total: 1,
    });
  }

  if (baronKills + dragonKills >= 50) {
    achievements.push({
      id: "objective_secured",
      title: "Objective Secured",
      description: "50+ major objectives secured",
      icon: "🐉",
      rarity: "rare",
      unlocked: true,
      progress: baronKills + dragonKills,
      total: 50,
    });
  }

  if (maxWinStreak >= 5) {
    achievements.push({
      id: "on_fire",
      title: "On Fire!",
      description: `${maxWinStreak} game win streak`,
      icon: "🔥",
      rarity: maxWinStreak >= 10 ? "legendary" : "epic",
      unlocked: true,
      progress: maxWinStreak,
      total: 5,
    });
  }

  if (matches.length >= 100) {
    achievements.push({
      id: "dedicated",
      title: "Dedicated",
      description: "Played 100+ games",
      icon: "🎮",
      rarity: "common",
      unlocked: true,
      progress: matches.length,
      total: 100,
    });
  }

  return achievements;
}

export function calculateRecords(
  matches: Match[],
  puuid: string,
): PlayerRecords {
  const records: PlayerRecords = {
    totalGames: matches.length,
    totalWins: 0,
    highestKills: 0,
    highestDamage: 0,
    highestVisionScore: 0,
    mostControlWardsPlaced: 0,
    longestGame: 0,
    shortestWin: Infinity,
    winRate: 0,
  };

  matches.forEach((match) => {
    const me = match.info.participants.find((p) => p.puuid === puuid);
    if (!me) return;

    if (me.win) records.totalWins++;
    records.highestKills = Math.max(records.highestKills, me.kills);
    records.highestDamage = Math.max(
      records.highestDamage,
      me.totalDamageDealtToChampions,
    );
    records.highestVisionScore = Math.max(
      records.highestVisionScore,
      me.visionScore,
    );
    records.mostControlWardsPlaced = Math.max(
      records.mostControlWardsPlaced,
      me.detectorWardsPlaced,
    );
    records.longestGame = Math.max(
      records.longestGame,
      match.info.gameDuration,
    );

    if (me.win) {
      records.shortestWin = Math.min(
        records.shortestWin,
        match.info.gameDuration,
      );
    }
  });

  records.winRate =
    records.totalGames > 0 ? (records.totalWins / records.totalGames) * 100 : 0;

  return records;
}
