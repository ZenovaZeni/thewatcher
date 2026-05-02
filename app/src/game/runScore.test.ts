import { describe, expect, it } from "vitest";
import { getRunScore } from "./runScore";

describe("getRunScore", () => {
  it("reports command streak while playing", () => {
    expect(getRunScore("playing", 2, 6)).toEqual({
      commandsCleared: 2,
      streakLabel: "2-command streak",
      paceLabel: "4 commands left",
    });
  });

  it("reports perfect run on victory", () => {
    expect(getRunScore("won", 5, 6)).toEqual({
      commandsCleared: 6,
      streakLabel: "6-command streak",
      paceLabel: "Perfect run",
    });
  });
});
