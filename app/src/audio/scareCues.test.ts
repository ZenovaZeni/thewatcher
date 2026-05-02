import { describe, expect, it } from "vitest";
import { getWatcherAudioCue } from "./scareCues";

describe("getWatcherAudioCue", () => {
  it("plays a breath when a ritual is survived", () => {
    const cue = getWatcherAudioCue(
      { phase: "playing", ritualIndex: 0, violationProgress: 0, threat: 0.4 },
      { phase: "ritualComplete", ritualIndex: 0, violationProgress: 0, threat: 0 },
    );

    expect(cue).toEqual({
      id: "ritualComplete:0:breath",
      type: "breath",
      intensity: 0.35,
    });
  });

  it("plays a glitch when a violation crosses the warning line", () => {
    const cue = getWatcherAudioCue(
      { phase: "playing", ritualIndex: 1, violationProgress: 0.4, threat: 0.3 },
      { phase: "playing", ritualIndex: 1, violationProgress: 0.64, threat: 0.7 },
    );

    expect(cue).toEqual({
      id: "nearFail:1:0.64",
      type: "glitch",
      intensity: 0.78,
    });
  });

  it("plays a failure impact exactly once on failure entry", () => {
    const cue = getWatcherAudioCue(
      { phase: "playing", ritualIndex: 2, violationProgress: 0.9, threat: 0.9 },
      { phase: "failed", ritualIndex: 2, violationProgress: 0, threat: 1 },
    );
    const repeated = getWatcherAudioCue(
      { phase: "failed", ritualIndex: 2, violationProgress: 0, threat: 1 },
      { phase: "failed", ritualIndex: 2, violationProgress: 0, threat: 1 },
    );

    expect(cue).toEqual({
      id: "failed:2:impact",
      type: "impact",
      intensity: 1,
    });
    expect(repeated).toBeNull();
  });
});
