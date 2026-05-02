import { evaluateRitual, watcherRituals } from "./rituals";
import type { TrackingSample } from "./types";

export type GamePhase = "idle" | "playing" | "failed" | "won";

export type GameState = {
  phase: GamePhase;
  currentRitualIndex: number;
  ritualStartedAt: number;
  failureReason: string | null;
  failedAt: number | null;
};

export function createInitialGameState(): GameState {
  return {
    phase: "idle",
    currentRitualIndex: 0,
    ritualStartedAt: 0,
    failureReason: null,
    failedAt: null,
  };
}

export function startGame(state: GameState, now: number): GameState {
  return {
    ...state,
    phase: "playing",
    currentRitualIndex: 0,
    ritualStartedAt: now,
    failureReason: null,
    failedAt: null,
  };
}

export function tickGame(state: GameState, now: number, sample: TrackingSample): GameState {
  if (state.phase !== "playing") {
    return state;
  }

  const ritual = watcherRituals[state.currentRitualIndex];
  const result = evaluateRitual(ritual, sample);

  if (result.status === "failed") {
    return { ...state, phase: "failed", failureReason: result.reason, failedAt: now };
  }

  if (now - state.ritualStartedAt < ritual.durationMs) {
    return state;
  }

  const nextIndex = state.currentRitualIndex + 1;

  if (nextIndex >= watcherRituals.length) {
    return { ...state, phase: "won" };
  }

  return { ...state, currentRitualIndex: nextIndex, ritualStartedAt: now };
}
