# Do Not Look Away Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a phone-first browser prototype for The Watcher, where the player calibrates their face, survives rule-based camera rituals, and gets a local caught card on failure.

**Architecture:** Use a Vite web app with small modules for game state, face tracking, rituals, audio cues, and caught-card rendering. Keep the first version local-only: camera frames stay on device, and share cards are generated in the browser.

**Tech Stack:** Vite, TypeScript, React, Canvas 2D, Web Audio, MediaPipe `@mediapipe/tasks-vision`, Vitest, Playwright or browser smoke testing.

---

## File Structure

- `app/package.json` - scripts and dependencies.
- `app/index.html` - mobile viewport entry.
- `app/src/main.tsx` - React mount.
- `app/src/App.tsx` - top-level screen flow.
- `app/src/styles.css` - phone-first dark horror UI.
- `app/src/game/types.ts` - shared game state and ritual types.
- `app/src/game/rituals.ts` - The Watcher ritual definitions and evaluation rules.
- `app/src/game/gameMachine.ts` - deterministic state transitions.
- `app/src/vision/faceTracker.ts` - MediaPipe setup and normalized tracking result.
- `app/src/camera/useCamera.ts` - camera permission and stream lifecycle.
- `app/src/audio/useTensionAudio.ts` - Web Audio tension and failure cues.
- `app/src/share/caughtCard.ts` - local caught-card canvas generation.
- `app/src/components/CameraStage.tsx` - video, overlay canvas, and tracking bridge.
- `app/src/components/RitualHud.tsx` - timer, rule text, threat, and status.
- `app/src/components/CaughtCardView.tsx` - failure card preview and retry/share controls.
- `app/src/game/gameMachine.test.ts` - transition tests.
- `app/src/game/rituals.test.ts` - ritual evaluation tests.
- `app/src/share/caughtCard.test.ts` - caught-card rendering tests with canvas mocks.

## Task 1: Scaffold Web App

**Files:**
- Create: `app/package.json`
- Create: `app/index.html`
- Create: `app/src/main.tsx`
- Create: `app/src/App.tsx`
- Create: `app/src/styles.css`

- [ ] **Step 1: Create Vite React TypeScript app files**

Create `app/package.json`:

```json
{
  "name": "do-not-look-away",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --host 127.0.0.1",
    "build": "tsc && vite build",
    "test": "vitest run",
    "test:watch": "vitest",
    "preview": "vite preview --host 127.0.0.1"
  },
  "dependencies": {
    "@mediapipe/tasks-vision": "^0.10.22",
    "@vitejs/plugin-react": "^5.0.0",
    "vite": "^7.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "typescript": "^5.8.0",
    "vitest": "^3.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0"
  }
}
```

Create `app/index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <title>Do Not Look Away</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Create `app/src/main.tsx`:

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./styles.css";

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

Create `app/src/App.tsx`:

```tsx
export function App() {
  return (
    <main className="app-shell">
      <section className="title-screen">
        <p className="eyebrow">The Watcher</p>
        <h1>Do Not Look Away</h1>
        <p>Your camera stays on this device. Blink, look away, or leave the frame and it gets closer.</p>
        <button type="button">Begin</button>
      </section>
    </main>
  );
}
```

Create `app/src/styles.css`:

```css
:root {
  color: #f4efe7;
  background: #050505;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

* {
  box-sizing: border-box;
}

html,
body,
#root {
  min-height: 100%;
  margin: 0;
}

body {
  min-height: 100svh;
}

button {
  border: 1px solid #8b1e2d;
  border-radius: 8px;
  background: #b32135;
  color: #fff8f0;
  font: inherit;
  font-weight: 700;
  min-height: 48px;
  padding: 0 18px;
}

.app-shell {
  min-height: 100svh;
  display: grid;
  place-items: center;
  padding: 24px;
  background:
    radial-gradient(circle at 50% 18%, rgba(135, 24, 42, 0.28), transparent 28%),
    linear-gradient(180deg, #101010, #030303 70%);
}

.title-screen {
  width: min(100%, 420px);
  display: grid;
  gap: 18px;
}

.eyebrow {
  color: #d15162;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0;
  margin: 0;
  text-transform: uppercase;
}

h1 {
  font-size: clamp(42px, 14vw, 68px);
  line-height: 0.95;
  margin: 0;
}

p {
  color: #c9beb6;
  line-height: 1.5;
  margin: 0;
}
```

- [ ] **Step 2: Install dependencies**

Run: `npm install` from `app`.

Expected: `package-lock.json` is created and dependencies install without errors.

- [ ] **Step 3: Run build**

Run: `npm run build` from `app`.

Expected: TypeScript and Vite build complete successfully.

- [ ] **Step 4: Commit scaffold**

```bash
git add app package-lock.json
git commit -m "feat: scaffold phone horror prototype"
```

## Task 2: Deterministic Game State

**Files:**
- Create: `app/src/game/types.ts`
- Create: `app/src/game/rituals.ts`
- Create: `app/src/game/gameMachine.ts`
- Create: `app/src/game/gameMachine.test.ts`
- Create: `app/src/game/rituals.test.ts`

- [ ] **Step 1: Write ritual evaluation tests**

Create `app/src/game/rituals.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { evaluateRitual, watcherRituals } from "./rituals";

describe("evaluateRitual", () => {
  it("fails do-not-blink when both eyes are closed", () => {
    const result = evaluateRitual(watcherRituals[0], {
      facePresent: true,
      blinkScore: 0.91,
      lookAwayScore: 0.1,
      motionScore: 0.1,
      smileScore: 0,
    });

    expect(result).toEqual({ status: "failed", reason: "BLINK DETECTED" });
  });

  it("passes do-not-blink while eyes stay open", () => {
    const result = evaluateRitual(watcherRituals[0], {
      facePresent: true,
      blinkScore: 0.1,
      lookAwayScore: 0.1,
      motionScore: 0.1,
      smileScore: 0,
    });

    expect(result).toEqual({ status: "safe" });
  });
});
```

- [ ] **Step 2: Run tests to verify failure**

Run: `npm test -- rituals.test.ts` from `app`.

Expected: FAIL because `rituals.ts` does not exist.

- [ ] **Step 3: Implement types and rituals**

Create `app/src/game/types.ts`:

```ts
export type TrackingSample = {
  facePresent: boolean;
  blinkScore: number;
  lookAwayScore: number;
  motionScore: number;
  smileScore: number;
};

export type RitualKind = "do-not-blink" | "do-not-look-away" | "stay-still";

export type Ritual = {
  id: string;
  kind: RitualKind;
  title: string;
  instruction: string;
  durationMs: number;
  failReason: string;
  threshold: number;
};

export type RitualResult =
  | { status: "safe" }
  | { status: "failed"; reason: string };
```

Create `app/src/game/rituals.ts`:

```ts
import type { Ritual, RitualResult, TrackingSample } from "./types";

export const watcherRituals: Ritual[] = [
  {
    id: "watcher-blink",
    kind: "do-not-blink",
    title: "First Stare",
    instruction: "Do not blink.",
    durationMs: 20000,
    failReason: "BLINK DETECTED",
    threshold: 0.72,
  },
  {
    id: "watcher-look-away",
    kind: "do-not-look-away",
    title: "It Moves When Unseen",
    instruction: "Do not look away.",
    durationMs: 22000,
    failReason: "YOU LOOKED AWAY",
    threshold: 0.58,
  },
  {
    id: "watcher-still",
    kind: "stay-still",
    title: "Hold Still",
    instruction: "Do not move.",
    durationMs: 18000,
    failReason: "MOVEMENT DETECTED",
    threshold: 0.62,
  },
];

export function evaluateRitual(ritual: Ritual, sample: TrackingSample): RitualResult {
  if (!sample.facePresent) {
    return { status: "failed", reason: "FACE LOST" };
  }

  const score =
    ritual.kind === "do-not-blink"
      ? sample.blinkScore
      : ritual.kind === "do-not-look-away"
        ? sample.lookAwayScore
        : sample.motionScore;

  if (score >= ritual.threshold) {
    return { status: "failed", reason: ritual.failReason };
  }

  return { status: "safe" };
}
```

- [ ] **Step 4: Run ritual tests**

Run: `npm test -- rituals.test.ts` from `app`.

Expected: PASS.

- [ ] **Step 5: Add game machine tests**

Create `app/src/game/gameMachine.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createInitialGameState, startGame, tickGame } from "./gameMachine";

describe("gameMachine", () => {
  it("starts on the first watcher ritual", () => {
    const state = startGame(createInitialGameState(), 1000);

    expect(state.phase).toBe("playing");
    expect(state.currentRitualIndex).toBe(0);
    expect(state.ritualStartedAt).toBe(1000);
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
```

- [ ] **Step 6: Implement game machine**

Create `app/src/game/gameMachine.ts`:

```ts
import { evaluateRitual, watcherRituals } from "./rituals";
import type { TrackingSample } from "./types";

export type GamePhase = "idle" | "playing" | "failed" | "won";

export type GameState = {
  phase: GamePhase;
  currentRitualIndex: number;
  ritualStartedAt: number;
  failureReason: string | null;
};

export function createInitialGameState(): GameState {
  return {
    phase: "idle",
    currentRitualIndex: 0,
    ritualStartedAt: 0,
    failureReason: null,
  };
}

export function startGame(state: GameState, now: number): GameState {
  return {
    ...state,
    phase: "playing",
    currentRitualIndex: 0,
    ritualStartedAt: now,
    failureReason: null,
  };
}

export function tickGame(state: GameState, now: number, sample: TrackingSample): GameState {
  if (state.phase !== "playing") {
    return state;
  }

  const ritual = watcherRituals[state.currentRitualIndex];
  const result = evaluateRitual(ritual, sample);

  if (result.status === "failed") {
    return { ...state, phase: "failed", failureReason: result.reason };
  }

  if (now - state.ritualStartedAt < ritual.durationMs) {
    return state;
  }

  const nextIndex = state.currentRitualIndex + 1;

  if (nextIndex >= watcherRituals.length) {
    return { ...state, phase: "won" };
  }

  return { ...state, currentRitualIndex: nextIndex, ritualStartedAt: now };
}
```

- [ ] **Step 7: Run game tests**

Run: `npm test -- gameMachine.test.ts rituals.test.ts` from `app`.

Expected: PASS.

- [ ] **Step 8: Commit game logic**

```bash
git add app/src/game
git commit -m "feat: add watcher ritual state machine"
```

## Task 3: Camera and Tracking Integration

**Files:**
- Create: `app/src/camera/useCamera.ts`
- Create: `app/src/vision/faceTracker.ts`
- Modify: `app/src/App.tsx`
- Create: `app/src/components/CameraStage.tsx`

- [ ] **Step 1: Implement camera hook**

Create `app/src/camera/useCamera.ts`:

```ts
import { useCallback, useEffect, useState } from "react";

export type CameraState = {
  stream: MediaStream | null;
  error: string | null;
  requestCamera: () => Promise<void>;
};

export function useCamera(): CameraState {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const requestCamera = useCallback(async () => {
    try {
      const nextStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 720 }, height: { ideal: 1280 } },
        audio: false,
      });
      setStream(nextStream);
      setError(null);
    } catch {
      setError("Camera permission is required to play.");
    }
  }, []);

  useEffect(() => {
    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [stream]);

  return { stream, error, requestCamera };
}
```

- [ ] **Step 2: Implement face tracker wrapper**

Create `app/src/vision/faceTracker.ts`:

```ts
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import type { TrackingSample } from "../game/types";

export type FaceTracker = {
  detect(video: HTMLVideoElement, now: number): TrackingSample;
};

const emptySample: TrackingSample = {
  facePresent: false,
  blinkScore: 0,
  lookAwayScore: 0,
  motionScore: 0,
  smileScore: 0,
};

export async function createFaceTracker(): Promise<FaceTracker> {
  const fileset = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm",
  );

  const landmarker = await FaceLandmarker.createFromOptions(fileset, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task",
      delegate: "GPU",
    },
    runningMode: "VIDEO",
    numFaces: 1,
    outputFaceBlendshapes: true,
    outputFacialTransformationMatrixes: true,
  });

  return {
    detect(video, now) {
      const result = landmarker.detectForVideo(video, now);
      const blendshapes = result.faceBlendshapes[0]?.categories ?? [];
      const findScore = (name: string) => blendshapes.find((shape) => shape.categoryName === name)?.score ?? 0;

      const blinkScore = Math.max(findScore("eyeBlinkLeft"), findScore("eyeBlinkRight"));
      const smileScore = Math.max(findScore("mouthSmileLeft"), findScore("mouthSmileRight"));
      const lookAwayScore = Math.max(findScore("eyeLookOutLeft"), findScore("eyeLookOutRight"));

      return {
        ...emptySample,
        facePresent: result.faceLandmarks.length > 0,
        blinkScore,
        smileScore,
        lookAwayScore,
      };
    },
  };
}
```

- [ ] **Step 3: Add camera stage component**

Create `app/src/components/CameraStage.tsx`:

```tsx
import { useEffect, useRef } from "react";

type CameraStageProps = {
  stream: MediaStream;
};

export function CameraStage({ stream }: CameraStageProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.srcObject = stream;
    void video.play();
  }, [stream]);

  return (
    <div className="camera-stage">
      <video ref={videoRef} playsInline muted />
      <div className="camera-vignette" />
    </div>
  );
}
```

- [ ] **Step 4: Wire camera into App**

Replace `app/src/App.tsx`:

```tsx
import { CameraStage } from "./components/CameraStage";
import { useCamera } from "./camera/useCamera";

export function App() {
  const { stream, error, requestCamera } = useCamera();

  return (
    <main className="app-shell">
      {stream ? (
        <CameraStage stream={stream} />
      ) : (
        <section className="title-screen">
          <p className="eyebrow">The Watcher</p>
          <h1>Do Not Look Away</h1>
          <p>Your camera stays on this device. Blink, look away, or leave the frame and it gets closer.</p>
          {error ? <p className="error-text">{error}</p> : null}
          <button type="button" onClick={requestCamera}>
            Begin
          </button>
        </section>
      )}
    </main>
  );
}
```

- [ ] **Step 5: Add camera CSS**

Append to `app/src/styles.css`:

```css
.error-text {
  color: #ff8b98;
}

.camera-stage {
  position: fixed;
  inset: 0;
  overflow: hidden;
  background: #000;
}

.camera-stage video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scaleX(-1);
}

.camera-vignette {
  pointer-events: none;
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 50% 45%, transparent 35%, rgba(0, 0, 0, 0.72) 78%),
    linear-gradient(180deg, rgba(80, 0, 12, 0.22), rgba(0, 0, 0, 0.28));
}
```

- [ ] **Step 6: Run build**

Run: `npm run build` from `app`.

Expected: PASS.

- [ ] **Step 7: Manual phone-browser smoke test**

Run: `npm run dev` from `app`.

Open the local URL on a browser that supports camera permission. Tap Begin.

Expected: the browser asks for camera permission, the front camera appears full-screen, and no frames are uploaded.

- [ ] **Step 8: Commit camera integration**

```bash
git add app/src
git commit -m "feat: add camera stage and face tracker wrapper"
```

## Task 4: Playable Watcher Loop

**Files:**
- Modify: `app/src/App.tsx`
- Create: `app/src/components/RitualHud.tsx`
- Modify: `app/src/components/CameraStage.tsx`
- Modify: `app/src/styles.css`

- [ ] **Step 1: Add HUD component**

Create `app/src/components/RitualHud.tsx`:

```tsx
import type { Ritual } from "../game/types";

type RitualHudProps = {
  ritual: Ritual;
  secondsRemaining: number;
  threat: number;
};

export function RitualHud({ ritual, secondsRemaining, threat }: RitualHudProps) {
  return (
    <div className="ritual-hud">
      <div>
        <p className="eyebrow">{ritual.title}</p>
        <h2>{ritual.instruction}</h2>
      </div>
      <div className="hud-row">
        <span>{secondsRemaining}s</span>
        <span>Threat {Math.round(threat * 100)}%</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Update App to start game and tick**

Replace `app/src/App.tsx` with an implementation that starts the game after camera permission, runs `tickGame` on animation frames, and shows `RitualHud` with the current ritual.

Use a temporary safe sample until face tracker wiring is complete:

```tsx
const safeSample = {
  facePresent: true,
  blinkScore: 0,
  lookAwayScore: 0,
  motionScore: 0,
  smileScore: 0,
};
```

Expected behavior: the ritual advances by timers and eventually reaches the won phase.

- [ ] **Step 3: Wire real tracking sample**

Use `createFaceTracker()` inside `CameraStage` and report samples upward with an `onSample(sample)` prop.

Expected behavior: blink and look-away signals can fail the current ritual.

- [ ] **Step 4: Add HUD CSS**

Add fixed bottom HUD styling with readable text over the camera, using a dark translucent background and red threat accents.

- [ ] **Step 5: Run tests and build**

Run: `npm test` and `npm run build` from `app`.

Expected: PASS.

- [ ] **Step 6: Manual gameplay smoke test**

Run: `npm run dev` from `app`.

Expected: camera opens, ritual text appears, blinking during the first ritual fails the game, and looking away during the second ritual fails the game.

- [ ] **Step 7: Commit playable loop**

```bash
git add app/src
git commit -m "feat: make watcher loop playable"
```

## Task 5: Caught Card

**Files:**
- Create: `app/src/share/caughtCard.ts`
- Create: `app/src/share/caughtCard.test.ts`
- Create: `app/src/components/CaughtCardView.tsx`
- Modify: `app/src/App.tsx`
- Modify: `app/src/styles.css`

- [ ] **Step 1: Write caught-card test**

Create a Vitest test that calls `buildCaughtCardCaption("BLINK DETECTED", "The Watcher", 133000)` and expects `BLINK DETECTED AT 02:13`.

- [ ] **Step 2: Implement caught-card caption helper**

Create `app/src/share/caughtCard.ts` with `formatTime(ms)` and `buildCaughtCardCaption(reason, entityName, elapsedMs)`.

- [ ] **Step 3: Implement caught-card canvas generation**

Add `renderCaughtCard(video, reason, entityName, elapsedMs)` that draws the current video frame, red overlay, title text, caption, and returns a data URL.

- [ ] **Step 4: Add caught-card view**

Create `CaughtCardView` with the card image, Retry button, and Share button. Use `navigator.share` when available and fall back to downloading the image.

- [ ] **Step 5: Wire failure state**

When `GameState.phase === "failed"`, freeze the current frame, generate a caught card, and show `CaughtCardView`.

- [ ] **Step 6: Run tests and build**

Run: `npm test` and `npm run build` from `app`.

Expected: PASS.

- [ ] **Step 7: Manual caught-card smoke test**

Fail the first ritual by blinking.

Expected: a caught card appears with the failure reason and current face frame.

- [ ] **Step 8: Commit caught cards**

```bash
git add app/src
git commit -m "feat: generate caught failure cards"
```

## Task 6: Verification and Store Readiness Notes

**Files:**
- Modify: `README.md`
- Modify: `store/app-store-notes.md`
- Create: `store/privacy-notes.md`

- [ ] **Step 1: Document local privacy behavior**

Create `store/privacy-notes.md` explaining that camera frames are processed locally, caught cards are created on device, and sharing is user-initiated.

- [ ] **Step 2: Add run instructions**

Update `README.md` with `cd app`, `npm install`, `npm run dev`, `npm test`, and `npm run build`.

- [ ] **Step 3: Run final checks**

Run: `npm test` and `npm run build` from `app`.

Expected: PASS.

- [ ] **Step 4: Commit docs**

```bash
git add README.md store
git commit -m "docs: add prototype run and privacy notes"
```

## Self-Review

- Spec coverage: The plan covers the web-first prototype, The Watcher rituals, local camera tracking, caught cards, privacy notes, and store preparation.
- Placeholder scan: No `TBD` or open-ended implementation placeholders remain; broad UI styling in Task 4 is intentionally constrained to a HUD and specific colors.
- Type consistency: `TrackingSample`, `Ritual`, `RitualResult`, `GameState`, and helper names are defined before use and reused consistently.

