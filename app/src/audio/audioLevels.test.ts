import { describe, expect, it } from "vitest";
import { getTensionAudioLevels } from "./audioLevels";

describe("getTensionAudioLevels", () => {
  it("keeps the normal tension bed quiet enough to avoid engine hum", () => {
    const levels = getTensionAudioLevels(0.25, false);

    expect(levels.primaryFrequency).toBeLessThanOrEqual(68);
    expect(levels.secondaryFrequency).toBeGreaterThanOrEqual(160);
    expect(levels.primaryGain).toBeLessThanOrEqual(0.018);
    expect(levels.secondaryGain).toBeLessThanOrEqual(0.008);
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

    expect(failed.primaryGain).toBe(0.035);
    expect(failed.secondaryGain).toBe(0.014);
  });
});
