import type { GameplayElementKey, PlaystyleKey } from "./gameplay";
import type { MatchOverview } from "./riot";

export interface QueryRequest {
  rules: string[];
  facts: {
    playstyle: PlaystyleKey;
    gameplayElements: GameplayElementKey[];
  };
  goal: string;
  guardrails: string[];
  language: string;
  summonerName: string;
  tagLine: string;
  puuid: string;
  matches: MatchOverview[];
}

export interface QueryResponse {
  playstyle: {
    type: PlaystyleKey;
    reason: string;
  };
  favoriteChampions: {
    champion: string;
    reason: string;
  }[];
  favoriteItems: {
    item: string;
    reason: string;
  }[];
  mostSuccessfulChampions: {
    champion: string;
    reason: string;
  }[];
  bestMonth: {
    month: string;
    reason: string;
  };
  strengths: {
    type: GameplayElementKey;
    reason: string;
  }[];
  weaknesses: {
    type: GameplayElementKey;
    reason: string;
  }[];
  advice: {
    type: PlaystyleKey | GameplayElementKey;
    reason: string;
  }[];
}
