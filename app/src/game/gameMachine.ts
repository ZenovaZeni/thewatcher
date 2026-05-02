import { evaluateRitual, watcherRituals } from "./rituals";
import { getActiveRitual } from "./ritualSegments";
import type { TrackingSample } from "./types";

const RITUAL_SUCCESS_BEAT_MS = 1500;

export type GamePhase = "idle" | "calibrating" | "playing" | "ritualComplete" | "failed" | "won";

export type GameState = {
  phase: GamePhase;
  currentRitualIndex: number;
  ritualStartedAt: number;
  ritualCompletedAt: number | null;
  completedRitualIndex: number | null;
  activeRuleId: string | null;
  violationStartedAt: number | null;
  failureReason: string | null;
  failedAt: number | null;
};

export function createInitialGameState(): GameState {
  return {
    phase: "idle",
    currentRitualIndex: 0,
    ritualStartedAt: 0,
    ritualCompletedAt: null,
    completedRitualIndex: null,
    activeRuleId: null,
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
    ritualCompletedAt: null,
    completedRitualIndex: null,
    activeRuleId: null,
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
    ritualCompletedAt: null,
    completedRitualIndex: null,
    activeRuleId: watcherRituals[0].id,
    violationStartedAt: null,
    failureReason: null,
    failedAt: null,
  };
}

export function tickGame(state: GameState, now: number, sample: TrackingSample): GameState {
  if (state.phase === "ritualComplete") {
    const completedAt = state.ritualCompletedAt ?? now;

    if (now - completedAt < RITUAL_SUCCESS_BEAT_MS) {
      return state;
    }

    const nextIndex = state.currentRitualIndex + 1;

    if (nextIndex >= watcherRituals.length) {
      return { ...state, phase: "won", completedRitualIndex: watcherRituals.length - 1 };
    }

    return {
      ...state,
      phase: "playing",
      currentRitualIndex: nextIndex,
      ritualStartedAt: now,
      ritualCompletedAt: null,
      activeRuleId: watcherRituals[nextIndex].id,
      violationStartedAt: null,
    };
  }

  if (state.phase !== "playing") {
    return state;
  }

  const ritual = watcherRituals[state.currentRitualIndex];
  const elapsedMs = now - state.ritualStartedAt;
  const activeRitual = getActiveRitual(ritual, now, state.ritualStartedAt);
  const activeRuleId = `${ritual.id}:${activeRitual.kind}:${activeRitual.instruction}`;
  const stateForRule = state.activeRuleId === activeRuleId ? state : { ...state, activeRuleId, violationStartedAt: null };
  const result = evaluateRitual(activeRitual, sample);

  if (elapsedMs < ritual.introMs + ritual.graceMs) {
    return stateForRule.violationStartedAt ? { ...stateForRule, violationStartedAt: null } : stateForRule;
  }

  if (result.status === "failed") {
    const violationStartedAt = stateForRule.violationStartedAt ?? now;

    if (now - violationStartedAt < activeRitual.failHoldMs) {
      return { ...stateForRule, violationStartedAt };
    }

    return { ...stateForRule, phase: "failed", failureReason: result.reason, failedAt: now };
  }

  if (stateForRule.violationStartedAt) {
    return { ...stateForRule, violationStartedAt: null };
  }

  if (elapsedMs < ritual.introMs + ritual.durationMs) {
    return stateForRule;
  }

  const nextIndex = state.currentRitualIndex + 1;

  return {
    ...stateForRule,
    phase: "ritualComplete",
    ritualCompletedAt: now,
    completedRitualIndex: state.currentRitualIndex,
    violationStartedAt: null,
  };
}
