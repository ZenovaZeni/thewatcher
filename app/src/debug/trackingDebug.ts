import type { TrackingSample } from "../game/types";

export type TrackingDebugRow = {
  label: string;
  value: string;
};

function formatPercent(score: number): string {
  return `${Math.round(Math.max(0, Math.min(1, score)) * 100)}%`;
}

export function buildTrackingDebugRows(sample: TrackingSample): TrackingDebugRow[] {
  return [
    { label: "Face", value: sample.facePresent ? "yes" : "no" },
    { label: "Blink", value: formatPercent(sample.blinkScore) },
    { label: "Look", value: formatPercent(sample.lookAwayScore) },
    { label: "Motion", value: formatPercent(sample.motionScore) },
    { label: "Smile", value: formatPercent(sample.smileScore) },
  ];
}
