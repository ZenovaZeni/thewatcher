import type { Ritual } from "./types";

export function getActiveRitual(ritual: Ritual, now: number, ritualStartedAt: number): Ritual {
  if (!ritual.segments?.length) {
    return ritual;
  }

  const activeElapsedMs = Math.max(0, now - ritualStartedAt - ritual.introMs);
  const segment = ritual.segments.reduce(
    (activeSegment, nextSegment) => (nextSegment.startsAtMs <= activeElapsedMs ? nextSegment : activeSegment),
    ritual.segments[0],
  );

  return {
    ...ritual,
    kind: segment.kind,
    instruction: segment.instruction,
    failReason: segment.failReason,
    threshold: segment.threshold,
    failHoldMs: segment.failHoldMs,
  };
}
