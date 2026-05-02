import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getWatcherAudioCue, type WatcherAudioCue, type WatcherAudioSnapshot } from "./audio/scareCues";
import { useTensionAudio } from "./audio/useTensionAudio";
import { createDemoStream } from "./camera/createDemoStream";
import { useCamera } from "./camera/useCamera";
import { CameraStage } from "./components/CameraStage";
import { CaughtCardView } from "./components/CaughtCardView";
import { DebugPanel } from "./components/DebugPanel";
import { EncounterStatus } from "./components/EncounterStatus";
import { RitualCurtain } from "./components/RitualCurtain";
import { RitualHud } from "./components/RitualHud";
import { getEncounterStatus } from "./game/encounter";
import { createInitialGameState, startCalibration, startGame, tickGame } from "./game/gameMachine";
import { watcherRituals } from "./game/rituals";
import { getActiveRitual } from "./game/ritualSegments";
import { getRitualTiming } from "./game/ritualTiming";
import { getWatcherScare } from "./game/scare";
import type { TrackingSample } from "./game/types";
import { buildCaughtCardCaption, renderCaughtCard } from "./share/caughtCard";

const waitingSample: TrackingSample = {
  facePresent: false,
  blinkScore: 0,
  lookAwayScore: 0,
  motionScore: 0,
  smileScore: 0,
};

export function App() {
  const { stream, error, diagnostic, devices, requestCamera } = useCamera();
  const [demoStream, setDemoStream] = useState<MediaStream | null>(null);
  const [gameState, setGameState] = useState(createInitialGameState);
  const [sample, setSample] = useState<TrackingSample>(waitingSample);
  const [hasTrackingSample, setHasTrackingSample] = useState(false);
  const [caughtCardUrl, setCaughtCardUrl] = useState<string | null>(null);
  const [debugOpen, setDebugOpen] = useState(false);
  const [trackerStatus, setTrackerStatus] = useState("Camera idle");
  const [now, setNow] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const stableFaceStartedAtRef = useRef<number | null>(null);
  const previousAudioSnapshotRef = useRef<WatcherAudioSnapshot | null>(null);
  const activeStream = stream ?? demoStream;
  const isDemoMode = Boolean(demoStream && !stream);
  const [audioCue, setAudioCue] = useState<WatcherAudioCue | null>(null);

  const ritual = watcherRituals[gameState.currentRitualIndex] ?? watcherRituals[0];
  const activeRitual = getActiveRitual(ritual, now, gameState.ritualStartedAt);
  const completedRituals =
    gameState.phase === "won"
      ? watcherRituals.length
      : gameState.phase === "ritualComplete"
        ? (gameState.completedRitualIndex ?? gameState.currentRitualIndex) + 1
        : gameState.currentRitualIndex;
  const encounterStatus = getEncounterStatus(gameState.currentRitualIndex, watcherRituals.length, completedRituals);
  const elapsedMs = gameState.phase === "playing" ? Math.max(0, now - gameState.ritualStartedAt) : 0;
  const ritualTiming = getRitualTiming(ritual, now, gameState.ritualStartedAt);
  const ritualPressure =
    activeRitual.kind === "smile"
      ? 1 - sample.smileScore
      : activeRitual.kind === "stop-smiling"
        ? sample.smileScore
        : Math.max(sample.blinkScore, sample.lookAwayScore, sample.motionScore);
  const threat = useMemo(() => {
    if (gameState.phase === "failed") return 1;
    if (gameState.phase !== "playing") return 0;
    if (elapsedMs < ritual.introMs) return 0;
    const activeElapsedMs = Math.max(0, elapsedMs - ritual.introMs);
    return Math.min(1, activeElapsedMs / ritual.durationMs + ritualPressure * 0.45);
  }, [elapsedMs, gameState.phase, ritual.durationMs, ritual.introMs, ritualPressure]);
  const violationProgress =
    gameState.phase === "playing" && gameState.violationStartedAt && activeRitual.failHoldMs > 0
      ? Math.min(1, Math.max(0, (now - gameState.violationStartedAt) / activeRitual.failHoldMs))
      : 0;
  const watcherScare = getWatcherScare({
    completedRituals,
    totalRituals: watcherRituals.length,
    threat,
    violationProgress,
    phase: gameState.phase,
  });

  useEffect(() => {
    const snapshot: WatcherAudioSnapshot = {
      phase: gameState.phase,
      ritualIndex: gameState.currentRitualIndex,
      violationProgress,
      threat,
    };
    const cue = getWatcherAudioCue(previousAudioSnapshotRef.current, snapshot);

    if (cue) {
      setAudioCue(cue);
    }

    previousAudioSnapshotRef.current = snapshot;
  }, [gameState.currentRitualIndex, gameState.phase, threat, violationProgress]);

  useTensionAudio(
    gameState.phase === "playing" || gameState.phase === "ritualComplete" || gameState.phase === "failed",
    threat,
    gameState.phase === "failed",
    audioCue,
  );

  const begin = useCallback(async () => {
    const granted = await requestCamera();
    if (!granted) return;

    stableFaceStartedAtRef.current = null;
    setSample(waitingSample);
    setHasTrackingSample(false);
    setCaughtCardUrl(null);
    setAudioCue(null);
    previousAudioSnapshotRef.current = null;
    setGameState(startCalibration(createInitialGameState()));
  }, [requestCamera]);

  const startDemo = useCallback(() => {
    demoStream?.getTracks().forEach((track) => {
      track.stop();
    });
    setDemoStream(createDemoStream());
    stableFaceStartedAtRef.current = null;
    setSample(waitingSample);
    setHasTrackingSample(false);
    setCaughtCardUrl(null);
    setAudioCue(null);
    previousAudioSnapshotRef.current = null;
    setGameState(startCalibration(createInitialGameState()));
  }, [demoStream]);

  useEffect(() => {
    return () => {
      demoStream?.getTracks().forEach((track) => {
        track.stop();
      });
    };
  }, [demoStream]);

  const retry = useCallback(() => {
    setSample(waitingSample);
    setHasTrackingSample(false);
    setCaughtCardUrl(null);
    setAudioCue(null);
    previousAudioSnapshotRef.current = null;
    stableFaceStartedAtRef.current = null;
    setGameState(startCalibration(createInitialGameState()));
  }, []);

  const handleVideoReady = useCallback((video: HTMLVideoElement | null) => {
    videoRef.current = video;
  }, []);

  const handleSample = useCallback(
    (nextSample: TrackingSample) => {
      setSample(nextSample);
      setHasTrackingSample(true);

      if (gameState.phase !== "calibrating") return;

      const timestamp = performance.now();
      if (!nextSample.facePresent) {
        stableFaceStartedAtRef.current = null;
        return;
      }

      stableFaceStartedAtRef.current ??= timestamp;

      if (timestamp - stableFaceStartedAtRef.current >= 900) {
        setGameState((state) => (state.phase === "calibrating" ? startGame(state, performance.now()) : state));
      }
    },
    [gameState.phase],
  );

  const triggerDemoBlink = useCallback(() => {
    if (!isDemoMode) return;

    setHasTrackingSample(true);
    setSample({
      facePresent: true,
      blinkScore: 1,
      lookAwayScore: 0,
      motionScore: 0,
      smileScore: 0,
    });
    setGameState((state) =>
      tickGame(state, performance.now(), {
        facePresent: true,
        blinkScore: 1,
        lookAwayScore: 0,
        motionScore: 0,
        smileScore: 0,
      }),
    );
  }, [isDemoMode]);

  useEffect(() => {
    if (gameState.phase !== "failed" || caughtCardUrl || !gameState.failureReason || !gameState.failedAt) return;

    const video = videoRef.current;
    if (!video) return;

    const failureElapsedMs = Math.max(0, gameState.failedAt - gameState.ritualStartedAt);
    setCaughtCardUrl(renderCaughtCard(video, gameState.failureReason, "The Watcher", failureElapsedMs));
  }, [caughtCardUrl, gameState]);

  useEffect(() => {
    let frame = 0;

    const tick = () => {
      const timestamp = performance.now();
      setNow(timestamp);
      if (hasTrackingSample) {
        setGameState((state) => tickGame(state, timestamp, sample));
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [hasTrackingSample, sample]);

  return (
    <main className="app-shell">
      {activeStream ? (
        <CameraStage
          stream={activeStream}
          threat={threat}
          signalPressure={gameState.phase === "playing" && ritualTiming.stage === "active" ? ritualPressure : 0}
          watcherScare={watcherScare}
          demoMode={isDemoMode}
          onSample={handleSample}
          onTrackerStatus={setTrackerStatus}
          onVideoReady={handleVideoReady}
        >
          {gameState.phase === "playing" || gameState.phase === "ritualComplete" ? (
            <EncounterStatus status={encounterStatus} />
          ) : null}
          {gameState.phase === "playing" && ritualTiming.stage === "intro" ? (
            <RitualCurtain ritual={ritual} introCountdown={ritualTiming.introCountdown} />
          ) : null}
          {gameState.phase === "playing" && ritualTiming.stage === "active" ? (
            <div className="active-rule-banner" aria-hidden="true">
              <span>{activeRitual.instruction}</span>
            </div>
          ) : null}
          <button type="button" className="debug-toggle" onClick={() => setDebugOpen((open) => !open)}>
            Debug
          </button>
          {debugOpen ? (
            <DebugPanel gameState={gameState} sample={sample} threat={threat} trackerStatus={trackerStatus} />
          ) : null}
          {gameState.phase === "calibrating" ? (
            <section className="calibration-panel">
              <p className="eyebrow">Camera linked</p>
              <h2>{sample.facePresent ? "Hold still." : "Center your face."}</h2>
              <p>{sample.facePresent ? "Signal acquired. Do not adjust the frame." : "You will not be judged until it sees you."}</p>
              <div className="calibration-lock" aria-hidden="true">
                <span className={sample.facePresent ? "is-locked" : ""} />
              </div>
            </section>
          ) : null}
          {gameState.phase === "playing" ? (
            <RitualHud
              ritual={ritual}
              activeRitual={activeRitual}
              ritualNumber={gameState.currentRitualIndex + 1}
              totalRituals={watcherRituals.length}
              timingStage={ritualTiming.stage}
              introCountdown={ritualTiming.introCountdown}
              secondsRemaining={ritualTiming.secondsRemaining}
              threat={threat}
              violationProgress={violationProgress}
            />
          ) : null}
          {isDemoMode && gameState.phase === "playing" ? (
            <button type="button" className="demo-blink-button" onClick={triggerDemoBlink}>
              Trigger Blink
            </button>
          ) : null}
          {gameState.phase === "failed" && caughtCardUrl && gameState.failureReason && gameState.failedAt ? (
            <CaughtCardView
              cardUrl={caughtCardUrl}
              caption={buildCaughtCardCaption(
                gameState.failureReason,
                "The Watcher",
                gameState.failedAt - gameState.ritualStartedAt,
              )}
              onRetry={retry}
            />
          ) : null}
          {gameState.phase === "failed" && !caughtCardUrl ? (
            <section className="failure-panel">
              <p className="eyebrow">Caught</p>
              <h2>Freezing the frame.</h2>
            </section>
          ) : null}
          {gameState.phase === "ritualComplete" ? (
            <section className="success-panel">
              <p className="eyebrow">Ritual survived</p>
              <h2>{encounterStatus.successMessage}</h2>
              <p>{watcherScare.revealMessage}</p>
              <p>{encounterStatus.completedLabel}</p>
            </section>
          ) : null}
          {gameState.phase === "won" ? (
            <section className="win-panel">
              <p className="eyebrow">Entity repelled</p>
              <h2>You survived The Watcher.</h2>
              <p>All {watcherRituals.length} rituals are complete. The phone has no evidence left to take.</p>
              <button type="button" onClick={retry}>
                Play again
              </button>
            </section>
          ) : null}
        </CameraStage>
      ) : (
        <section className="title-screen">
          <p className="eyebrow">The Watcher</p>
          <h1>The Watcher</h1>
          <p>Survive six short rituals while the phone watches your face. Blink, look away, or leave the frame and it keeps the evidence.</p>
          {error ? (
            <div className="permission-help">
              <p className="error-text">{error}</p>
              {diagnostic ? <p>{diagnostic}</p> : null}
              <p>{devices.length > 0 ? `Browser can see: ${devices.join(", ")}.` : "Browser has not exposed any camera devices yet."}</p>
              <p>Try the site controls in the address bar, or open localhost in a regular browser. The demo feed below keeps everything local and lets you test the loop.</p>
            </div>
          ) : null}
          <button type="button" onClick={begin}>
            Begin
          </button>
          {error ? (
            <button type="button" className="secondary-button" onClick={startDemo}>
              Play Demo Feed
            </button>
          ) : null}
        </section>
      )}
    </main>
  );
}
