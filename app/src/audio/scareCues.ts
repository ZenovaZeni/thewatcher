import type { GamePhase } from "../game/gameMachine";

export type WatcherAudioCueType = "breath" | "glitch" | "impact";

export type WatcherAudioCue = {
  id: string;
  type: WatcherAudioCueType;
  intensity: number;
};

export type WatcherAudioSnapshot = {
  phase: GamePhase;
  ritualIndex: number;
  violationProgress: number;
  threat: number;
};

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

export function getWatcherAudioCue(
  previous: WatcherAudioSnapshot | null,
  current: WatcherAudioSnapshot,
): WatcherAudioCue | null {
  if (current.phase === "failed" && previous?.phase !== "failed") {
    return {
      id: `failed:${current.ritualIndex}:impact`,
      type: "impact",
      intensity: 1,
    };
  }

  if (current.phase === "ritualComplete" && previous?.phase !== "ritualComplete") {
    return {
      id: `ritualComplete:${current.ritualIndex}:breath`,
      type: "breath",
      intensity: clamp(0.35 + current.ritualIndex * 0.08, 0.35, 0.9),
    };
  }

  if (
    current.phase === "playing" &&
    current.violationProgress >= 0.6 &&
    (!previous || previous.phase !== "playing" || previous.violationProgress < 0.6)
  ) {
    return {
      id: `nearFail:${current.ritualIndex}:${current.violationProgress.toFixed(2)}`,
      type: "glitch",
      intensity: clamp(0.5 + current.threat * 0.4),
    };
  }

  return null;
}
