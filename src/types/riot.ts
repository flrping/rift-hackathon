export interface Account {
  puuid: string;
  gameName?: string;
  tagLine?: string;
}

export interface Summoner {
  profileIconId: number;
  revisionDate: number;
  puuid: string;
  summonerLevel: number;
}

export interface Match {
  metadata: Metadata;
  info: Info;
}

export interface MatchTimeline {
  metadata: Metadata;
  info: TimelineInfo;
}

export interface Metadata {
  dataVersion: string;
  matchId: string;
  participants: string[];
}

export interface Info {
  endOfGameResult: string;
  gameCreation: number;
  gameDuration: number;
  gameEndTimestamp?: number;
  gameId: number;
  gameMode: string;
  gameName: string;
  gameStartTimestamp: number;
  gameType: string;
  gameVersion: string;
  mapId: number;
  participants: Participant[];
  platformId: string;
  queueId: number;
  teams: Team[];
  tournamentCode?: string;
}

export interface TimelineInfo {
  endOfGameResult: string;
  frameInterval: number;
  gameId: number;
  participants: Participant[];
  frames: TimelineFrame[];
}

export interface TimelineFrame {
  events: TimelineEvents[];
  participantFrames: TimelineParticipantFrames[];
  timestamp: number;
}

export interface TimelineEvents {
  timestamp: number;
  realTimestamp: number;
  type: string;
  [key: string]: unknown;
}

export type TimelineParticipantFrames = Record<
  string,
  TimelineParticipantFrame
>;

export interface TimelineParticipantFrame {
  championStats: ChampionStats;
  currentGold: number;
  damageStats: DamageStats;
  goldPerSecond: number;
  jungleMinionsKilled: number;
  level: number;
  minionsKilled: number;
  participantId: number;
  position: { x: number; y: number };
  timeEnemySpentControlled: number;
  totalGold: number;
  xp: number;
}

export interface ChampionStats {
  abilityHaste: number;
  abilityPower: number;
  armor: number;
  armorPen: number;
  armorPenPercent: number;
  attackDamage: number;
  attackSpeed: number;
  bonusArmorPenPercent: number;
  bonusMagicPenPercent: number;
  ccReduction: number;
  cooldownReduction: number;
  health: number;
  healthMax: number;
  healthRegen: number;
  lifesteal: number;
  magicPen: number;
  magicPenPercent: number;
  magicResist: number;
  movementSpeed: number;
  omnivamp: number;
  physicalVamp: number;
  power: number;
  powerMax: number;
  powerRegen: number;
  spellVamp: number;
}

export interface DamageStats {
  magicDamageDone: number;
  magicDamageDoneToChampions: number;
  magicDamageTaken: number;
  physicalDamageDone: number;
  physicalDamageDoneToChampions: number;
  physicalDamageTaken: number;
  totalDamageDone: number;
  totalDamageDoneToChampions: number;
  totalDamageTaken: number;
  trueDamageDone: number;
  trueDamageDoneToChampions: number;
  trueDamageTaken: number;
}

export interface Participant {
  allInPings: number;
  assistMePings: number;
  assists: number;
  baronKills: number;
  bountyLevel: number;
  champExperience: number;
  champLevel: number;
  championId: number;
  championName: string;
  commandPings: number;
  championTransform: number;
  consumablesPurchased: number;
  challenges: Challenges;
  damageDealtToBuildings: number;
  damageDealtToObjectives: number;
  damageDealtToTurrets: number;
  damageSelfMitigated: number;
  deaths: number;
  detectorWardsPlaced: number;
  doubleKills: number;
  dragonKills: number;
  eligibleForProgression: boolean;
  enemyMissingPings: number;
  enemyVisionPings: number;
  firstBloodAssist: boolean;
  firstBloodKill: boolean;
  firstTowerAssist: boolean;
  firstTowerKill: boolean;
  gameEndedInEarlySurrender: boolean;
  gameEndedInSurrender: boolean;
  holdPings: number;
  getBackPings: number;
  goldEarned: number;
  goldSpent: number;
  individualPosition: string;
  inhibitorKills: number;
  inhibitorTakedowns: number;
  inhibitorsLost: number;
  item0: number;
  item1: number;
  item2: number;
  item3: number;
  item4: number;
  item5: number;
  item6: number;
  itemsPurchased: number;
  killingSprees: number;
  kills: number;
  lane: string;
  largestCriticalStrike: number;
  largestKillingSpree: number;
  largestMultiKill: number;
  longestTimeSpentLiving: number;
  magicDamageDealt: number;
  magicDamageDealtToChampions: number;
  magicDamageTaken: number;
  missions: Missions;
  neutralMinionsKilled: number;
  needVisionPings: number;
  nexusKills: number;
  nexusTakedowns: number;
  nexusLost: number;
  objectivesStolen: number;
  objectivesStolenAssists: number;
  onMyWayPings: number;
  participantId: number;
  playerScore0: number;
  playerScore1: number;
  playerScore2: number;
  playerScore3: number;
  playerScore4: number;
  playerScore5: number;
  playerScore6: number;
  playerScore7: number;
  playerScore8: number;
  playerScore9: number;
  playerScore10: number;
  playerScore11: number;
  pentaKills: number;
  perks: PerksDto;
  physicalDamageDealt: number;
  physicalDamageDealtToChampions: number;
  physicalDamageTaken: number;
  placement: number;
  playerAugment1: number;
  playerAugment2: number;
  playerAugment3: number;
  playerAugment4: number;
  playerSubteamId: number;
  pushPings: number;
  profileIcon: number;
  puuid: string;
  quadraKills: number;
  riotIdGameName: string;
  riotIdTagline: string;
  role: string;
  sightWardsBoughtInGame: number;
  spell1Casts: number;
  spell2Casts: number;
  spell3Casts: number;
  spell4Casts: number;
  subteamPlacement: number;
  summoner1Casts: number;
  summoner1Id: number;
  summoner2Casts: number;
  summoner2Id: number;
  summonerId: string;
  summonerLevel: number;
  summonerName: string;
  teamEarlySurrendered: boolean;
  teamId: number;
  teamPosition: string;
  timeCCingOthers: number;
  timePlayed: number;
  totalAllyJungleMinionsKilled: number;
  totalDamageDealt: number;
  totalDamageDealtToChampions: number;
  totalDamageShieldedOnTeammates: number;
  totalDamageTaken: number;
  totalEnemyJungleMinionsKilled: number;
  totalHeal: number;
  totalHealsOnTeammates: number;
  totalMinionsKilled: number;
  totalTimeCCDealt: number;
  totalTimeSpentDead: number;
  totalUnitsHealed: number;
  tripleKills: number;
  trueDamageDealt: number;
  trueDamageDealtToChampions: number;
  trueDamageTaken: number;
  turretKills: number;
  turretTakedowns: number;
  turretsLost: number;
  unrealKills: number;
  visionScore: number;
  visionClearedPings: number;
  visionWardsBoughtInGame: number;
  wardsKilled: number;
  wardsPlaced: number;
  win: boolean;
}

export interface Challenges {
  [key: string]: number | number[];
  "12AssistStreakCount": number;
  baronBuffGoldAdvantageOverThreshold: number;
  controlWardTimeCoverageInRiverOrEnemyHalf: number;
  earliestBaron: number;
  legendaryItemUsed: number[];
}

export interface Missions {
  playerScore0: number;
  playerScore1: number;
  playerScore2: number;
  playerScore3: number;
  playerScore4: number;
  playerScore5: number;
  playerScore6: number;
  playerScore7: number;
  playerScore8: number;
  playerScore9: number;
  playerScore10: number;
  playerScore11: number;
}

export interface PerksDto {
  statPerks: PerkStats;
  styles: PerkStyle[];
}

export interface PerkStats {
  defense: number;
  flex: number;
  offense: number;
}

export interface PerkStyle {
  description: string;
  selections: PerkStyleSelection[];
  style: number;
}

export interface PerkStyleSelection {
  perk: number;
  var1: number;
  var2: number;
  var3: number;
}

export interface Team {
  bans: Ban[];
  objectives: Objectives;
  teamId: number;
  win: boolean;
}

export interface Ban {
  championId: number;
  pickTurn: number;
}

export interface Objectives {
  baron: Objective;
  champion: Objective;
  dragon: Objective;
  horde: Objective;
  inhibitor: Objective;
  riftHerald: Objective;
  tower: Objective;
}

export interface Objective {
  first: boolean;
  kills: number;
}

export interface LeagueVersionConfig {
  n: {
    item: string;
    rune: string;
    summoner: string;
    mastery: string;
    champion: string;
    map: string;
    language: string;
    sticker: string;
  };
  v: string;
  l: string;
  cdn: string;
  dd: string;
  lg: string;
  css: string;
  profileiconmax: string;
  store: string;
}

export interface SummonerSpellConfigRaw {
  type: string;
  version: string;
  data: Record<string, SummonerSpell>;
}

export interface SummonerSpellConfig {
  type: string;
  version: string;
  data: SummonerSpell[];
}

export interface SummonerSpell {
  id: string;
  name: string;
  description: string;
  tooltip: string;
  maxrank: number;
  cooldown: number[];
  cooldownBurn: string;
  cost: number[];
  costBurn: string;
  key: string;
}

export interface Queue {
  queueId: number;
  map: string;
  description: string;
  notes: string | null;
}

export interface LeagueEntry {
  leagueId: string;
  puuid: string;
  queueType: string;
  tier: string;
  rank: string;
  leaguePoints: number;
  wins: number;
  losses: number;
  hotStreak: boolean;
  veteran: boolean;
  freshBlood: boolean;
  inactive: boolean;
  miniSeries: MiniSeries;
}

export interface MiniSeries {
  losses: number;
  progress: string;
  target: number;
  wins: number;
}

export interface ChampionConfig {
  type: string;
  format: string;
  version: string;
  data: Record<string, Champion>;
}

export interface Champion {
  id: string;
  key: string;
  name: string;
  title: string;
  image: ChampionImage;
  skins: ChampionSkin[];
  lore: string;
  blurb: string;
  allytips: string[];
  enemytips: string[];
  tags: string[];
  partype: string;
  info: ChampionInfo;
  stats: ChampionStats;
  spells: ChampionSpell[];
  passive: ChampionPassive;
  recommended: unknown[];
}

export interface ChampionInfo {
  attack: number;
  defense: number;
  magic: number;
  difficulty: number;
}

export interface ChampionImage {
  full: string;
  sprite: string;
  group: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ChampionStats {
  hp: number;
  hpperlevel: number;
  mp: number;
  mpperlevel: number;
  movespeed: number;
  armor: number;
  armorperlevel: number;
  spellblock: number;
  spellblockperlevel: number;
  attackrange: number;
  hpregen: number;
  hpregenperlevel: number;
  mpregen: number;
  mpregenperlevel: number;
  crit: number;
  critperlevel: number;
  attackdamage: number;
  attackdamageperlevel: number;
  attackspeedperlevel: number;
  attackspeed: number;
}

export interface ChampionSkin {
  id: string;
  num: number;
  name: string;
  chromas: boolean;
}

export interface ChampionSpell {
  id: string;
  name: string;
  description: string;
  tooltip: string;
  leveltip: {
    label: string[];
    effect: string[];
  };
  maxrank: number;
  cooldown: number[];
  cooldownBurn: string;
  cost: number[];
  costBurn: string;
  datavalues: Record<string, unknown>;
  effect: Array<number[] | null>;
  effectBurn: Array<string | null>;
  vars: unknown[];
  costType: string;
  maxammo: string;
  range: number[];
  rangeBurn: string;
  image: ChampionImage;
  resource: string;
}

export interface ChampionPassive {
  name: string;
  description: string;
  image: ChampionImage;
}

export interface MatchOverview {
  gameDuration: number;
  me: ParticipantPerformance;
  opponent: ParticipantPerformance;
  game: {
    duration: number;
    version: string;
  };
  teams: {
    red: {
      champions: string[];
      kills: number;
      deaths: number;
      assists: number;
      gold: number;
    };
    blue: {
      champions: string[];
      kills: number;
      deaths: number;
      assists: number;
      gold: number;
    };
  };
}

export interface ParticipantPerformance {
  championName: string;
  kills: number;
  deaths: number;
  assists: number;
  cs: number;
  gold: number;
  level: number;
  totalPings: number;
  consumablesPurchased: number;
  wardsPlaced: number;
  dragonKills: number;
  turretKills: number;
  inhibitorKills: number;
  damageDealt: number;
  damageTaken: number;
  win: boolean;
  item0: string;
  item1: string;
  item2: string;
  item3: string;
  item4: string;
  item5: string;
  item6: string;
  lane: string;
}

export interface ItemStats {
  FlatHPPoolMod?: number;
  rFlatHPModPerLevel?: number;
  FlatMPPoolMod?: number;
  rFlatMPModPerLevel?: number;
  PercentHPPoolMod?: number;
  PercentMPPoolMod?: number;
  FlatHPRegenMod?: number;
  rFlatHPRegenModPerLevel?: number;
  PercentHPRegenMod?: number;
  FlatMPRegenMod?: number;
  rFlatMPRegenModPerLevel?: number;
  PercentMPRegenMod?: number;
  FlatArmorMod?: number;
  rFlatArmorModPerLevel?: number;
  PercentArmorMod?: number;
  rFlatArmorPenetrationMod?: number;
  rFlatArmorPenetrationModPerLevel?: number;
  rPercentArmorPenetrationMod?: number;
  rPercentArmorPenetrationModPerLevel?: number;
  FlatPhysicalDamageMod?: number;
  rFlatPhysicalDamageModPerLevel?: number;
  PercentPhysicalDamageMod?: number;
  FlatMagicDamageMod?: number;
  rFlatMagicDamageModPerLevel?: number;
  PercentMagicDamageMod?: number;
  FlatMovementSpeedMod?: number;
  rFlatMovementSpeedModPerLevel?: number;
  PercentMovementSpeedMod?: number;
  rPercentMovementSpeedModPerLevel?: number;
  FlatAttackSpeedMod?: number;
  PercentAttackSpeedMod?: number;
  rPercentAttackSpeedModPerLevel?: number;
  rFlatDodgeMod?: number;
  rFlatDodgeModPerLevel?: number;
  PercentDodgeMod?: number;
  FlatCritChanceMod?: number;
  rFlatCritChanceModPerLevel?: number;
  PercentCritChanceMod?: number;
  FlatCritDamageMod?: number;
  rFlatCritDamageModPerLevel?: number;
  PercentCritDamageMod?: number;
  FlatBlockMod?: number;
  PercentBlockMod?: number;
  FlatSpellBlockMod?: number;
  rFlatSpellBlockModPerLevel?: number;
  PercentSpellBlockMod?: number;
  FlatEXPBonus?: number;
  PercentEXPBonus?: number;
  rPercentCooldownMod?: number;
  rPercentCooldownModPerLevel?: number;
  rFlatTimeDeadMod?: number;
  rFlatTimeDeadModPerLevel?: number;
  rPercentTimeDeadMod?: number;
  rPercentTimeDeadModPerLevel?: number;
  rFlatGoldPer10Mod?: number;
  rFlatMagicPenetrationMod?: number;
  rFlatMagicPenetrationModPerLevel?: number;
  rPercentMagicPenetrationMod?: number;
  rPercentMagicPenetrationModPerLevel?: number;
  FlatEnergyRegenMod?: number;
  rFlatEnergyRegenModPerLevel?: number;
  FlatEnergyPoolMod?: number;
  rFlatEnergyModPerLevel?: number;
  PercentLifeStealMod?: number;
  PercentSpellVampMod?: number;
}

export interface ItemImage {
  full: string;
  sprite: string;
  group: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ItemGold {
  base: number;
  total: number;
  sell: number;
  purchasable: boolean;
}

export interface ItemRune {
  isrune: boolean;
  tier: number;
  type: string;
}

export interface ItemBasic {
  name: string;
  rune: ItemRune;
  gold: ItemGold;
  group: string;
  description: string;
  colloq: string;
  plaintext: string;
  consumed: boolean;
  stacks: number;
  depth: number;
  consumeOnFull: boolean;
  from: string[];
  into: string[];
  specialRecipe: number;
  inStore: boolean;
  hideFromAll: boolean;
  requiredChampion: string;
  requiredAlly: string;
  stats: ItemStats;
  tags: string[];
  maps: Record<string, boolean>;
}

export interface Item {
  name: string;
  description: string;
  colloq: string;
  plaintext: string;
  from?: string[];
  into?: string[];
  image: ItemImage;
  gold: ItemGold;
  tags: string[];
  maps: Record<string, boolean>;
  stats: ItemStats;
  depth?: number;
}

export interface ItemData {
  type: string;
  version: string;
  basic: ItemBasic;
  data: Record<string, Item>;
}
