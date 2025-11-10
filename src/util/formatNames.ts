import { PlaystyleType, GameplayElement } from "~/types/gameplay";

export function formatQueueType(queueType: string | null | undefined): string {
  if (!queueType) return "";

  const queueMap: Record<string, string> = {
    RANKED_SOLO_5x5: "Ranked Solo/Duo",
    RANKED_FLEX_SR: "Ranked Flex",
    DRAFT: "Draft Pick",
    NORMAL: "Normal",
    ARAM: "ARAM",
    CLASH: "Clash",
  };

  return queueMap[queueType] ?? queueType;
}

export function formatPlaystyleType(
  playstyleType: string | null | undefined,
): string {
  if (!playstyleType) return "";

  const playstyle = PlaystyleType[playstyleType as keyof typeof PlaystyleType];
  const gameplayElement =
    GameplayElement[playstyleType as keyof typeof GameplayElement];
  return playstyle?.name ?? gameplayElement?.name ?? playstyleType;
}
