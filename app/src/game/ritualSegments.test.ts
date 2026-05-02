import { describe, expect, it } from "vitest";
import { getActiveRitual } from "./ritualSegments";
import { watcherRituals } from "./rituals";

describe("getActiveRitual", () => {
  it("returns the active segment as a ritual-like rule", () => {
    const rule = getActiveRitual(watcherRituals[5], 8800, 1000);

    expect(rule.kind).toBe("stop-smiling");
    expect(rule.instruction).toBe("Stop smiling.");
    expect(rule.failReason).toBe("SMILE DETECTED");
  });

  it("returns the base ritual when there are no segments", () => {
    expect(getActiveRitual(watcherRituals[0], 7200, 1000)).toBe(watcherRituals[0]);
  });
});
