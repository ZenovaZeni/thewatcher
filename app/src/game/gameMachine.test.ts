import { describe, expect, it } from "vitest";
import { createInitialGameState, startCalibration, startGame, tickGame } from "./gameMachine";

describe("gameMachine", () => {
  it("starts on the first watcher ritual", () => {
    const state = startGame(createInitialGameState(), 1000);

    expect(state.phase).toBe("playing");
    expect(state.currentRitualIndex).toBe(0);
    expect(state.ritualStartedAt).toBe(1000);
  });

  it("enters calibration before the ritual starts", () => {
    const state = startCalibration(createInitialGameState());

    expect(state.phase).toBe("calibrating");
    expect(state.failureReason).toBeNull();
  });

  it("creates a failure state with a reason", () => {
    const state = startGame(createInitialGameState(), 1000);
    const failed = tickGame(state, 1100, {
      facePresent: true,
      blinkScore: 1,
      lookAwayScore: 0,
      motionScore: 0,
      smileScore: 0,
    });

    expect(failed.phase).toBe("failed");
    expect(failed.failureReason).toBe("BLINK DETECTED");
  });
});
