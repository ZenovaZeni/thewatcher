import { describe, expect, it } from "vitest";
import { buildCaughtCardCaption } from "./caughtCard";

describe("buildCaughtCardCaption", () => {
  it("combines the failure reason and elapsed timestamp", () => {
    expect(buildCaughtCardCaption("BLINK DETECTED", "The Watcher", 133000)).toBe("BLINK DETECTED AT 02:13");
  });
});
