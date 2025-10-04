import type { GameplayElementKey, PlaystyleKey } from "./gameplay";

export interface QueryResponse {
  playstyle: {
    type: PlaystyleKey;
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
