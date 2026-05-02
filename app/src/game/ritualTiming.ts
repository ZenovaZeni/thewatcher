import type { Ritual } from "./types";

export type RitualTiming = {
  stage: "intro" | "active";
  introCountdown: number;
  secondsRemaining: number;
};

export function getRitualTiming(ritual: Ritual, now: number, ritualStartedAt: number): RitualTiming {
  const elapsedMs = Math.max(0, now - ritualStartedAt);
  const activeElapsedMs = Math.max(0, elapsedMs - ritual.introMs);

  return {
    stage: elapsedMs < ritual.introMs ? "intro" : "active",
    introCountdown: elapsedMs < ritual.introMs ? Math.ceil((ritual.introMs - elapsedMs) / 1000) : 0,
    secondsRemaining: Math.max(0, Math.ceil((ritual.durationMs - activeElapsedMs) / 1000)),
  };
}
