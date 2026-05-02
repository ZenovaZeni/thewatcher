import type { GamePhase } from "./gameMachine";

export type RunScore = {
  commandsCleared: number;
  streakLabel: string;
  paceLabel: string;
};

export function getRunScore(phase: GamePhase, currentRitualIndex: number, totalRituals: number): RunScore {
  const safeTotal = Math.max(1, totalRituals);
  const commandsCleared = phase === "won" ? safeTotal : Math.min(Math.max(0, currentRitualIndex), safeTotal);
  const commandsLeft = Math.max(0, safeTotal - commandsCleared);

  return {
    commandsCleared,
    streakLabel: `${commandsCleared}-command streak`,
    paceLabel: phase === "won" ? "Perfect run" : `${commandsLeft} command${commandsLeft === 1 ? "" : "s"} left`,
  };
}
