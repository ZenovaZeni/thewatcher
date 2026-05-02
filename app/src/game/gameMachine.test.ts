import { describe, expect, it } from "vitest";
import { createInitialGameState, startCalibration, startGame, tickGame } from "./gameMachine";

const openEyesSample = {
  facePresent: true,
  blinkScore: 0,
  lookAwayScore: 0,
  motionScore: 0,
  smileScore: 0,
};

describe("gameMachine", () => {
  it("starts on the first watcher ritual", () => {
    const state = startGame(createInitialGameState(), 1000);

    expect(state.phase).toBe("playing");
    expect(state.currentRitualIndex).toBe(0);
    expect(state.ritualStartedAt).toBe(1000);
    expect(state.activeRuleId).toBe("watcher-blink");
    expect(state.violationStartedAt).toBeNull();
  });

  it("enters calibration before the ritual starts", () => {
    const state = startCalibration(createInitialGameState());

    expect(state.phase).toBe("calibrating");
    expect(state.failureReason).toBeNull();
  });

  it("does not fail during the ritual grace window", () => {
    const state = startGame(createInitialGameState(), 1000);
    const next = tickGame(state, 2400, {
      facePresent: true,
      blinkScore: 1,
      lookAwayScore: 0,
      motionScore: 0,
      smileScore: 0,
    });

    expect(next.phase).toBe("playing");
    expect(next.violationStartedAt).toBeNull();
  });

  it("fails on the first active blink sample", () => {
    const state = startGame(createInitialGameState(), 1000);
    const failed = tickGame(state, 3000, {
      facePresent: true,
      blinkScore: 1,
      lookAwayScore: 0,
      motionScore: 0,
      smileScore: 0,
    });

    expect(failed.phase).toBe("failed");
    expect(failed.failureReason).toBe("BLINK DETECTED");
  });

  it("clears a pending look-away violation when the player recovers", () => {
    const state = startGame(createInitialGameState(), 1000);
    const lookAwayRitual = { ...state, currentRitualIndex: 1 };
    const firstViolation = tickGame(lookAwayRitual, 2600, {
      facePresent: true,
      blinkScore: 0,
      lookAwayScore: 1,
      motionScore: 0,
      smileScore: 0,
    });
    const recovered = tickGame(firstViolation, 2680, openEyesSample);

    expect(recovered.phase).toBe("playing");
    expect(recovered.violationStartedAt).toBeNull();
  });

  it("fails the smile ritual when the player refuses to smile", () => {
    const state = startGame(createInitialGameState(), 1000);
    const smileRitual = { ...state, currentRitualIndex: 3 };
    const firstViolation = tickGame(smileRitual, 2600, {
      facePresent: true,
      blinkScore: 0,
      lookAwayScore: 0,
      motionScore: 0,
      smileScore: 0,
    });
    const failed = tickGame(firstViolation, 3000, {
      facePresent: true,
      blinkScore: 0,
      lookAwayScore: 0,
      motionScore: 0,
      smileScore: 0,
    });

    expect(failed.phase).toBe("failed");
    expect(failed.failureReason).toBe("SMILE MISSING");
  });

  it("switches active rules inside obey-the-face", () => {
    const state = startGame(createInitialGameState(), 1000);
    const obeyRitual = { ...state, currentRitualIndex: 5, activeRuleId: "watcher-obey-face" };
    const smiling = tickGame(obeyRitual, 3500, {
      facePresent: true,
      blinkScore: 0,
      lookAwayScore: 0,
      motionScore: 0,
      smileScore: 0.8,
    });
    const stopped = tickGame(smiling, 4600, {
      facePresent: true,
      blinkScore: 0,
      lookAwayScore: 0,
      motionScore: 0,
      smileScore: 0,
    });

    expect(stopped.phase).toBe("playing");
    expect(stopped.activeRuleId).toBe("watcher-obey-face:stop-smiling:Stop smiling.");
    expect(stopped.violationStartedAt).toBeNull();
  });

  it("pauses on a ritual-complete beat before advancing", () => {
    const state = startGame(createInitialGameState(), 1000);
    const complete = tickGame(state, 8701, openEyesSample);

    expect(complete.phase).toBe("ritualComplete");
    expect(complete.currentRitualIndex).toBe(0);
    expect(complete.completedRitualIndex).toBe(0);
    expect(complete.ritualCompletedAt).toBe(8701);
  });

  it("advances to the next ritual after the success beat", () => {
    const state = startGame(createInitialGameState(), 1000);
    const complete = tickGame(state, 8701, openEyesSample);
    const next = tickGame(complete, 10301, openEyesSample);

    expect(next.phase).toBe("playing");
    expect(next.currentRitualIndex).toBe(1);
    expect(next.ritualStartedAt).toBe(10301);
    expect(next.activeRuleId).toBe("watcher-look-away");
  });

  it("wins after the final ritual success beat", () => {
    const state = {
      ...startGame(createInitialGameState(), 1000),
      currentRitualIndex: 5,
      activeRuleId: "watcher-obey-face",
    };
    const complete = tickGame(state, 13201, {
      facePresent: true,
      blinkScore: 0,
      lookAwayScore: 0,
      motionScore: 0,
      smileScore: 0,
    });
    const won = tickGame(complete, 14801, openEyesSample);

    expect(won.phase).toBe("won");
    expect(won.completedRitualIndex).toBe(5);
  });
});
