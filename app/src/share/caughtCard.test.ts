import { describe, expect, it } from "vitest";
import { buildCaughtCardCaption, buildCaughtCardEvidenceDetails } from "./caughtCard";

describe("buildCaughtCardCaption", () => {
  it("combines the failure reason and elapsed timestamp", () => {
    expect(buildCaughtCardCaption("BLINK DETECTED", "The Watcher", 133000)).toBe("BLINK DETECTED AT 02:13");
  });
});

describe("buildCaughtCardEvidenceDetails", () => {
  it("formats evidence labels for the caught card overlay", () => {
    expect(buildCaughtCardEvidenceDetails("BLINK DETECTED", "The Watcher", 133000)).toEqual({
      label: "EVIDENCE FRAME",
      entity: "THE WATCHER",
      failure: "BLINK DETECTED",
      timestamp: "02:13",
    });
  });
});
