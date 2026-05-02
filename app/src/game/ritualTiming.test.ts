import { describe, expect, it } from "vitest";
import { getRitualTiming } from "./ritualTiming";
import { watcherRituals } from "./rituals";

describe("getRitualTiming", () => {
  it("reports intro countdown before active play", () => {
    expect(getRitualTiming(watcherRituals[0], 3500, 3000)).toEqual({
      stage: "intro",
      introCountdown: 1,
      secondsRemaining: 7,
    });
  });

  it("reports active timing after the intro", () => {
    expect(getRitualTiming(watcherRituals[0], 4700, 3000)).toEqual({
      stage: "active",
      introCountdown: 0,
      secondsRemaining: 6,
    });
  });
});
