import type { Ritual, RitualResult, TrackingSample } from "./types";

export const watcherRituals: Ritual[] = [
  {
    id: "watcher-blink",
    kind: "do-not-blink",
    title: "First Stare",
    instruction: "Do not blink.",
    durationMs: 6500,
    introMs: 1200,
    graceMs: 500,
    failHoldMs: 0,
    failReason: "BLINK DETECTED",
    threshold: 0.72,
  },
  {
    id: "watcher-look-away",
    kind: "do-not-look-away",
    title: "It Moves When Unseen",
    instruction: "Do not look away.",
    durationMs: 7000,
    introMs: 1100,
    graceMs: 450,
    failHoldMs: 220,
    failReason: "YOU LOOKED AWAY",
    threshold: 0.58,
  },
  {
    id: "watcher-still",
    kind: "stay-still",
    title: "Hold Still",
    instruction: "Do not move.",
    durationMs: 6500,
    introMs: 1100,
    graceMs: 450,
    failHoldMs: 260,
    failReason: "MOVEMENT DETECTED",
    threshold: 0.62,
  },
  {
    id: "watcher-smile",
    kind: "smile",
    title: "Show It Teeth",
    instruction: "Smile.",
    durationMs: 6000,
    introMs: 1000,
    graceMs: 500,
    failHoldMs: 360,
    failReason: "SMILE MISSING",
    threshold: 0.42,
  },
  {
    id: "watcher-stop-smiling",
    kind: "stop-smiling",
    title: "Stop Now",
    instruction: "Stop smiling.",
    durationMs: 5600,
    introMs: 900,
    graceMs: 400,
    failHoldMs: 180,
    failReason: "SMILE DETECTED",
    threshold: 0.38,
  },
  {
    id: "watcher-obey-face",
    kind: "smile",
    title: "Obey The Face",
    instruction: "Smile.",
    durationMs: 11000,
    introMs: 1200,
    graceMs: 300,
    failHoldMs: 260,
    failReason: "SMILE MISSING",
    threshold: 0.42,
    segments: [
      {
        startsAtMs: 0,
        kind: "smile",
        instruction: "Smile.",
        failReason: "SMILE MISSING",
        threshold: 0.42,
        failHoldMs: 340,
      },
      {
        startsAtMs: 2200,
        kind: "stop-smiling",
        instruction: "Stop smiling.",
        failReason: "SMILE DETECTED",
        threshold: 0.38,
        failHoldMs: 180,
      },
      {
        startsAtMs: 4200,
        kind: "smile",
        instruction: "Smile again.",
        failReason: "SMILE MISSING",
        threshold: 0.46,
        failHoldMs: 260,
      },
      {
        startsAtMs: 6200,
        kind: "do-not-look-away",
        instruction: "Eyes here. Now.",
        failReason: "YOU LOOKED AWAY",
        threshold: 0.52,
        failHoldMs: 180,
      },
      {
        startsAtMs: 8200,
        kind: "stop-smiling",
        instruction: "Dead face.",
        failReason: "SMILE DETECTED",
        threshold: 0.34,
        failHoldMs: 160,
      },
    ],
  },
];

export function evaluateRitual(ritual: Ritual, sample: TrackingSample): RitualResult {
  if (!sample.facePresent) {
    return { status: "failed", reason: "FACE LOST" };
  }

  if (ritual.kind === "smile") {
    if (sample.smileScore < ritual.threshold) {
      return { status: "failed", reason: ritual.failReason };
    }

    return { status: "safe" };
  }

  const score =
    ritual.kind === "do-not-blink"
      ? sample.blinkScore
      : ritual.kind === "do-not-look-away"
        ? sample.lookAwayScore
        : ritual.kind === "stop-smiling"
          ? sample.smileScore
          : sample.motionScore;

  if (score >= ritual.threshold) {
    return { status: "failed", reason: ritual.failReason };
  }

  return { status: "safe" };
}
