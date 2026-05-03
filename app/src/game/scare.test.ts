import { describe, expect, it } from "vitest";
import { getWatcherScare } from "./scare";

describe("getWatcherScare", () => {
  it("keeps the creature hidden during intro countdown", () => {
    const scare = getWatcherScare({
      completedRituals: 0,
      totalRituals: 6,
      threat: 0,
      violationProgress: 0,
      phase: "playing",
      activeRuleKind: "do-not-blink",
      active: false,
    });

    expect(scare.creatureOpacity).toBe(0);
    expect(scare.revealMessage).toBe("It has marked the frame.");
  });

  it("reveals the creature once the command is active", () => {
    const scare = getWatcherScare({
      completedRituals: 0,
      totalRituals: 6,
      threat: 0.2,
      violationProgress: 0,
      phase: "playing",
      activeRuleKind: "do-not-blink",
      active: true,
    });

    expect(scare.presence).toBeGreaterThan(0.36);
    expect(scare.creatureOpacity).toBeGreaterThanOrEqual(0.44);
    expect(scare.asset).toBe("front");
  });

  it("gets closer as rituals are survived", () => {
    const early = getWatcherScare({
      completedRituals: 1,
      totalRituals: 6,
      threat: 0.2,
      violationProgress: 0,
      phase: "playing",
      activeRuleKind: "do-not-blink",
      active: true,
    });
    const late = getWatcherScare({
      completedRituals: 4,
      totalRituals: 6,
      threat: 0.2,
      violationProgress: 0,
      phase: "playing",
      activeRuleKind: "do-not-blink",
      active: true,
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
      activeRuleKind: "do-not-look-away",
      active: true,
    });

    expect(scare.presence).toBe(1);
    expect(scare.scale).toBeGreaterThan(1.2);
    expect(scare.asset).toBe("lean");
    expect(scare.revealMessage).toBe("It was already in the evidence.");
  });

  it("jumps closer during look-away pressure", () => {
    const calm = getWatcherScare({
      completedRituals: 1,
      totalRituals: 6,
      threat: 0.2,
      violationProgress: 0,
      phase: "playing",
      activeRuleKind: "do-not-look-away",
      active: true,
    });
    const pressured = getWatcherScare({
      completedRituals: 1,
      totalRituals: 6,
      threat: 0.2,
      violationProgress: 0.7,
      phase: "playing",
      activeRuleKind: "do-not-look-away",
      active: true,
    });

    expect(pressured.movementJump).toBeGreaterThan(0.6);
    expect(pressured.scale).toBeGreaterThan(calm.scale);
    expect(pressured.peekSide).not.toBe(calm.peekSide);
    expect(pressured.asset).toBe("lean");
  });
});
