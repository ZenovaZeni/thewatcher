import { describe, expect, it } from "vitest";
import { getWatcherScare } from "./scare";

describe("getWatcherScare", () => {
  it("starts with a barely visible presence", () => {
    const scare = getWatcherScare({
      completedRituals: 0,
      totalRituals: 6,
      threat: 0,
      violationProgress: 0,
      phase: "playing",
    });

    expect(scare.presence).toBeCloseTo(0.12);
    expect(scare.scale).toBeCloseTo(0.84);
    expect(scare.revealMessage).toBe("It has marked the frame.");
  });

  it("gets closer as rituals are survived", () => {
    const early = getWatcherScare({
      completedRituals: 1,
      totalRituals: 6,
      threat: 0.2,
      violationProgress: 0,
      phase: "playing",
    });
    const late = getWatcherScare({
      completedRituals: 4,
      totalRituals: 6,
      threat: 0.2,
      violationProgress: 0,
      phase: "playing",
    });

    expect(late.presence).toBeGreaterThan(early.presence);
    expect(late.scale).toBeGreaterThan(early.scale);
    expect(late.peekSide).not.toBe(early.peekSide);
  });

  it("pushes the entity closest on failure", () => {
    const scare = getWatcherScare({
      completedRituals: 2,
      totalRituals: 6,
      threat: 0.3,
      violationProgress: 0,
      phase: "failed",
    });

    expect(scare.presence).toBe(1);
    expect(scare.scale).toBeGreaterThan(1.2);
    expect(scare.revealMessage).toBe("It was already in the evidence.");
  });
});
