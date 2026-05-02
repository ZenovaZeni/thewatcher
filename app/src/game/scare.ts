import type { GamePhase } from "./gameMachine";
import type { RitualKind } from "./types";

export type WatcherScare = {
  presence: number;
  scale: number;
  peekSide: "left" | "right";
  eyeGlow: number;
  distortion: number;
  creatureOpacity: number;
  movementJump: number;
  revealMessage: string;
};

type WatcherScareInput = {
  completedRituals: number;
  totalRituals: number;
  threat: number;
  violationProgress: number;
  phase: GamePhase;
  activeRuleKind?: RitualKind;
};

const revealMessages = [
  "It has marked the frame.",
  "It moved while you breathed.",
  "It is using the corners now.",
  "It learned your face.",
  "It is closer than last time.",
  "It is waiting in the evidence.",
];

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

export function getWatcherScare({
  completedRituals,
  totalRituals,
  threat,
  violationProgress,
  phase,
  activeRuleKind,
}: WatcherScareInput): WatcherScare {
  const safeTotal = Math.max(1, totalRituals);
  const completed = Math.min(Math.max(0, completedRituals), safeTotal);
  const progress = completed / safeTotal;
  const isLookAwayPressure = activeRuleKind === "do-not-look-away" && violationProgress > 0.2;
  const movementJump = isLookAwayPressure ? clamp((violationProgress - 0.2) / 0.58) : 0;
  const pressure = clamp(threat * 0.36 + violationProgress * 0.34 + movementJump * 0.18);
  const failed = phase === "failed";
  const ritualComplete = phase === "ritualComplete";
  const presence = failed ? 1 : clamp(0.42 + progress * 0.32 + pressure + (ritualComplete ? 0.18 : 0));
  const scale = failed ? 1.34 : 0.84 + progress * 0.28 + pressure * 0.18 + movementJump * 0.18 + (ritualComplete ? 0.08 : 0);
  const baseSide = completed % 2 === 0 ? "left" : "right";

  return {
    presence,
    scale,
    peekSide: movementJump > 0.55 ? (baseSide === "left" ? "right" : "left") : baseSide,
    eyeGlow: failed ? 1 : clamp(0.34 + progress * 0.54 + pressure * 0.8 + (ritualComplete ? 0.22 : 0)),
    distortion: failed ? 1 : clamp(threat * 0.6 + violationProgress * 0.62 + progress * 0.18 + movementJump * 0.22),
    creatureOpacity: failed ? 1 : clamp(0.72 + progress * 0.18 + pressure * 0.16),
    movementJump,
    revealMessage: failed ? "It was already in the evidence." : revealMessages[Math.min(completed, revealMessages.length - 1)],
  };
}
