import { describe, expect, it } from "vitest";
import { evaluateRitual, watcherRituals } from "./rituals";

describe("evaluateRitual", () => {
  it("fails do-not-blink when both eyes are closed", () => {
    const result = evaluateRitual(watcherRituals[0], {
      facePresent: true,
      blinkScore: 0.91,
      lookAwayScore: 0.1,
      motionScore: 0.1,
      smileScore: 0,
    });

    expect(result).toEqual({ status: "failed", reason: "BLINK DETECTED" });
  });

  it("passes do-not-blink while eyes stay open", () => {
    const result = evaluateRitual(watcherRituals[0], {
      facePresent: true,
      blinkScore: 0.1,
      lookAwayScore: 0.1,
      motionScore: 0.1,
      smileScore: 0,
    });

    expect(result).toEqual({ status: "safe" });
  });
});
