import type { Ritual, RitualResult, TrackingSample } from "./types";

export const watcherRituals: Ritual[] = [
  {
    id: "watcher-blink",
    kind: "do-not-blink",
    title: "First Stare",
    instruction: "Do not blink.",
    durationMs: 20000,
    introMs: 3000,
    graceMs: 1000,
    failHoldMs: 150,
    failReason: "BLINK DETECTED",
    threshold: 0.72,
  },
  {
    id: "watcher-look-away",
    kind: "do-not-look-away",
    title: "It Moves When Unseen",
    instruction: "Do not look away.",
    durationMs: 22000,
    introMs: 2500,
    graceMs: 800,
    failHoldMs: 260,
    failReason: "YOU LOOKED AWAY",
    threshold: 0.58,
  },
  {
    id: "watcher-still",
    kind: "stay-still",
    title: "Hold Still",
    instruction: "Do not move.",
    durationMs: 18000,
    introMs: 2500,
    graceMs: 800,
    failHoldMs: 320,
    failReason: "MOVEMENT DETECTED",
    threshold: 0.62,
  },
];

export function evaluateRitual(ritual: Ritual, sample: TrackingSample): RitualResult {
  if (!sample.facePresent) {
    return { status: "failed", reason: "FACE LOST" };
  }

  const score =
    ritual.kind === "do-not-blink"
      ? sample.blinkScore
      : ritual.kind === "do-not-look-away"
        ? sample.lookAwayScore
        : sample.motionScore;

  if (score >= ritual.threshold) {
    return { status: "failed", reason: ritual.failReason };
  }

  return { status: "safe" };
}
