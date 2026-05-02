export type TrackingSample = {
  facePresent: boolean;
  blinkScore: number;
  lookAwayScore: number;
  motionScore: number;
  smileScore: number;
};

export type RitualKind = "do-not-blink" | "do-not-look-away" | "stay-still" | "smile" | "stop-smiling";

export type Ritual = {
  id: string;
  kind: RitualKind;
  title: string;
  instruction: string;
  durationMs: number;
  introMs: number;
  graceMs: number;
  failHoldMs: number;
  failReason: string;
  threshold: number;
  segments?: RitualSegment[];
};

export type RitualSegment = {
  startsAtMs: number;
  kind: RitualKind;
  instruction: string;
  failReason: string;
  threshold: number;
  failHoldMs: number;
};

export type RitualResult = { status: "safe" } | { status: "failed"; reason: string };
