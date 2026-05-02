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
    expect(state.violationStartedAt).toBeNull();
  });

  it("enters calibration before the ritual starts", () => {
    const state = startCalibration(createInitialGameState());

    expect(state.phase).toBe("calibrating");
    expect(state.failureReason).toBeNull();
  });

  it("does not fail during the ritual grace window", () => {
    const state = startGame(createInitialGameState(), 1000);
    const next = tickGame(state, 4500, {
      facePresent: true,
      blinkScore: 1,
      lookAwayScore: 0,
      motionScore: 0,
      smileScore: 0,
    });

    expect(next.phase).toBe("playing");
    expect(next.violationStartedAt).toBeNull();
  });

  it("waits for blink to stay above threshold before failing", () => {
    const state = startGame(createInitialGameState(), 1000);
    const firstViolation = tickGame(state, 5200, {
      facePresent: true,
      blinkScore: 1,
      lookAwayScore: 0,
      motionScore: 0,
      smileScore: 0,
    });

    expect(firstViolation.phase).toBe("playing");
    expect(firstViolation.violationStartedAt).toBe(5200);

    const failed = tickGame(firstViolation, 5360, {
      facePresent: true,
      blinkScore: 1,
      lookAwayScore: 0,
      motionScore: 0,
      smileScore: 0,
    });

    expect(failed.phase).toBe("failed");
    expect(failed.failureReason).toBe("BLINK DETECTED");
  });

  it("clears a pending blink violation when the player recovers", () => {
    const state = startGame(createInitialGameState(), 1000);
    const firstViolation = tickGame(state, 5200, {
      facePresent: true,
      blinkScore: 1,
      lookAwayScore: 0,
      motionScore: 0,
      smileScore: 0,
    });
    const recovered = tickGame(firstViolation, 5280, openEyesSample);

    expect(recovered.phase).toBe("playing");
    expect(recovered.violationStartedAt).toBeNull();
  });
});
