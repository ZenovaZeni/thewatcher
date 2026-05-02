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

  it("fails smile-when-told when the player does not smile", () => {
    const result = evaluateRitual(watcherRituals[3], {
      facePresent: true,
      blinkScore: 0,
      lookAwayScore: 0,
      motionScore: 0,
      smileScore: 0.1,
    });

    expect(result).toEqual({ status: "failed", reason: "SMILE MISSING" });
  });

  it("fails stop-smiling when the player keeps smiling", () => {
    const result = evaluateRitual(watcherRituals[4], {
      facePresent: true,
      blinkScore: 0,
      lookAwayScore: 0,
      motionScore: 0,
      smileScore: 0.8,
    });

    expect(result).toEqual({ status: "failed", reason: "SMILE DETECTED" });
  });
});
