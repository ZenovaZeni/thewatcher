import { describe, expect, it } from "vitest";
import { buildTrackingDebugRows } from "./trackingDebug";

describe("buildTrackingDebugRows", () => {
  it("formats tracking samples as readable percent rows", () => {
    expect(
      buildTrackingDebugRows({
        facePresent: true,
        blinkScore: 0.812,
        lookAwayScore: 0.236,
        motionScore: 0.04,
        smileScore: 0.5,
      }),
    ).toEqual([
      { label: "Face", value: "yes" },
      { label: "Blink", value: "81%" },
      { label: "Look", value: "24%" },
      { label: "Motion", value: "4%" },
      { label: "Smile", value: "50%" },
    ]);
  });
});
