import { describe, expect, it } from "vitest";
import { getRitualTiming } from "./ritualTiming";
import { watcherRituals } from "./rituals";

describe("getRitualTiming", () => {
  it("reports intro countdown before active play", () => {
    expect(getRitualTiming(watcherRituals[0], 4100, 3000)).toEqual({
      stage: "intro",
      introCountdown: 2,
      secondsRemaining: 20,
    });
  });

  it("reports active timing after the intro", () => {
    expect(getRitualTiming(watcherRituals[0], 7200, 3000)).toEqual({
      stage: "active",
      introCountdown: 0,
      secondsRemaining: 19,
    });
  });
});
