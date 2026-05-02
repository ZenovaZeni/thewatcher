# Survival Run Feedback Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make The Watcher feel like a beatable survival run instead of an open-ended camera tracking demo.

**Architecture:** Keep ritual simulation in `app/src/game/gameMachine.ts`, encounter copy/progress in `app/src/game/encounter.ts`, and presentation in React components. Add a short interstitial phase after each completed ritual, then advance automatically to the next ritual or the victory screen.

**Tech Stack:** Vite, React, TypeScript, Vitest, browser camera APIs, MediaPipe Tasks Vision.

---

### Task 1: Model A Clear Run Objective

**Files:**
- Modify: `app/src/game/encounter.ts`
- Test: `app/src/game/encounter.test.ts`

- [ ] Add encounter status fields for objective, completed ritual count, and next success message.
- [ ] Make total progress represent completed rituals, not the active ritual.
- [ ] Verify with Vitest that the first ritual starts at 0% and final completion reaches 100%.

### Task 2: Add Ritual Success Beats

**Files:**
- Modify: `app/src/game/gameMachine.ts`
- Test: `app/src/game/gameMachine.test.ts`

- [ ] Add a `ritualComplete` phase with the completed ritual index and timestamp.
- [ ] When a ritual timer expires, enter `ritualComplete` before the next ritual.
- [ ] After a short pause, auto-advance to the next ritual.
- [ ] When the last ritual completes, enter `won`.

### Task 3: Present The Objective

**Files:**
- Modify: `app/src/components/EncounterStatus.tsx`
- Modify: `app/src/components/RitualHud.tsx`
- Modify: `app/src/App.tsx`
- Modify: `app/src/styles.css`

- [ ] Show “survive all rituals” as the run goal.
- [ ] Show completed rituals, active ritual number, countdown, and fail condition clearly.
- [ ] Show a full-screen ritual survived beat between rituals.
- [ ] Replace the current win panel with a proper survival result.

### Task 4: Verify

**Files:**
- Read: `app/package.json`

- [ ] Run `npm test -- --run`.
- [ ] Run `npm run build`.
- [ ] Commit and push if green.
