import { describe, expect, it } from "vitest";
import { buildCaughtCardCaption, buildCaughtCardEvidenceDetails } from "./caughtCard";

describe("buildCaughtCardCaption", () => {
  it("combines the failure reason and elapsed timestamp", () => {
    expect(buildCaughtCardCaption("BLINK DETECTED", "The Watcher", 133000)).toBe("BLINKED LIKE THE PHONE OWED YOU MONEY AT 02:13");
  });

  it("roasts look-away failures instead of sounding clinical", () => {
    expect(buildCaughtCardCaption("YOU LOOKED AWAY", "The Watcher", 7000)).toBe("YOU LOOKED AWAY. IT DID NOT. AT 00:07");
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
