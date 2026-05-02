import { evaluateRitual, watcherRituals } from "./rituals";
import type { TrackingSample } from "./types";

export type GamePhase = "idle" | "calibrating" | "playing" | "failed" | "won";

export type GameState = {
  phase: GamePhase;
  currentRitualIndex: number;
  ritualStartedAt: number;
  violationStartedAt: number | null;
  failureReason: string | null;
  failedAt: number | null;
};

export function createInitialGameState(): GameState {
  return {
    phase: "idle",
    currentRitualIndex: 0,
    ritualStartedAt: 0,
    violationStartedAt: null,
    failureReason: null,
    failedAt: null,
  };
}

export function startCalibration(state: GameState): GameState {
  return {
    ...state,
    phase: "calibrating",
    currentRitualIndex: 0,
    ritualStartedAt: 0,
    violationStartedAt: null,
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
    violationStartedAt: null,
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
  const elapsedMs = now - state.ritualStartedAt;

  if (elapsedMs < ritual.introMs + ritual.graceMs) {
    return state.violationStartedAt ? { ...state, violationStartedAt: null } : state;
  }

  if (result.status === "failed") {
    const violationStartedAt = state.violationStartedAt ?? now;

    if (now - violationStartedAt < ritual.failHoldMs) {
      return { ...state, violationStartedAt };
    }

    return { ...state, phase: "failed", failureReason: result.reason, failedAt: now };
  }

  if (state.violationStartedAt) {
    return { ...state, violationStartedAt: null };
  }

  if (elapsedMs < ritual.introMs + ritual.durationMs) {
    return state;
  }

  const nextIndex = state.currentRitualIndex + 1;

  if (nextIndex >= watcherRituals.length) {
    return { ...state, phase: "won" };
  }

  return { ...state, currentRitualIndex: nextIndex, ritualStartedAt: now, violationStartedAt: null };
}
