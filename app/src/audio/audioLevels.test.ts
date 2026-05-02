import { describe, expect, it } from "vitest";
import { getTensionAudioLevels } from "./audioLevels";

describe("getTensionAudioLevels", () => {
  it("keeps the normal tension bed in an audible speaker range", () => {
    const levels = getTensionAudioLevels(0.25, false);

    expect(levels.primaryFrequency).toBeGreaterThanOrEqual(82);
    expect(levels.secondaryFrequency).toBeGreaterThanOrEqual(138);
    expect(levels.primaryGain).toBeGreaterThanOrEqual(0.028);
    expect(levels.secondaryGain).toBeGreaterThanOrEqual(0.01);
  });

  it("gets louder and higher as threat rises", () => {
    const quiet = getTensionAudioLevels(0, false);
    const tense = getTensionAudioLevels(1, false);

    expect(tense.primaryFrequency).toBeGreaterThan(quiet.primaryFrequency);
    expect(tense.primaryGain).toBeGreaterThan(quiet.primaryGain);
    expect(tense.secondaryGain).toBeGreaterThan(quiet.secondaryGain);
  });

  it("uses the loudest sustained bed after failure", () => {
    const failed = getTensionAudioLevels(0.1, true);

    expect(failed.primaryGain).toBe(0.12);
    expect(failed.secondaryGain).toBe(0.04);
  });
});
