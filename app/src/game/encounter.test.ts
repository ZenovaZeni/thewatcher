import { describe, expect, it } from "vitest";
import { getEncounterStatus } from "./encounter";

describe("getEncounterStatus", () => {
  it("reports the run objective before the first ritual is banked", () => {
    expect(getEncounterStatus(0, 3)).toEqual({
      label: "Ritual 1 of 3",
      objective: "Survive all 3 rituals.",
      progressPercent: 0,
      completedLabel: "0 survived / 3 required",
      message: "The phone has found your eyes.",
      successMessage: "First stare survived.",
    });
  });

  it("reports completed ritual progress", () => {
    expect(getEncounterStatus(2, 3, 2)).toMatchObject({
      label: "Ritual 3 of 3",
      progressPercent: 67,
      completedLabel: "2 survived / 3 required",
    });
  });

  it("clamps completed progress at the final ritual", () => {
    expect(getEncounterStatus(5, 3, 9)).toMatchObject({
      progressPercent: 100,
      completedLabel: "3 survived / 3 required",
    });
  });
});
