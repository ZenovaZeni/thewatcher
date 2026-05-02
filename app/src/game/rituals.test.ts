import { describe, expect, it } from "vitest";
import { evaluateRitual, watcherRituals } from "./rituals";

describe("evaluateRitual", () => {
  it("uses short commands so the run starts fast", () => {
    expect(watcherRituals.slice(0, -1).every((ritual) => ritual.durationMs <= 8500)).toBe(true);
    expect(watcherRituals.every((ritual) => ritual.introMs <= 1400)).toBe(true);
  });

  it("uses rapid rule switches in the final command chain", () => {
    const chain = watcherRituals.at(-1);

    expect(chain?.segments?.length).toBeGreaterThanOrEqual(5);
    expect(chain?.durationMs).toBeLessThanOrEqual(12000);
  });

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
