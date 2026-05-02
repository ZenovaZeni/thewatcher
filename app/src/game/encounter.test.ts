import { describe, expect, it } from "vitest";
import { getEncounterStatus } from "./encounter";

describe("getEncounterStatus", () => {
  it("reports ritual progress and watcher copy", () => {
    expect(getEncounterStatus(0, 3)).toEqual({
      label: "Ritual 1 / 3",
      progressPercent: 33,
      message: "The phone has found your eyes.",
    });
  });

  it("clamps progress at the final ritual", () => {
    expect(getEncounterStatus(5, 3).progressPercent).toBe(100);
  });
});
