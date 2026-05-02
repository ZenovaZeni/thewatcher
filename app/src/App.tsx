import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTensionAudio } from "./audio/useTensionAudio";
import { createDemoStream } from "./camera/createDemoStream";
import { useCamera } from "./camera/useCamera";
import { CameraStage } from "./components/CameraStage";
import { CaughtCardView } from "./components/CaughtCardView";
import { DebugPanel } from "./components/DebugPanel";
import { RitualHud } from "./components/RitualHud";
import { createInitialGameState, startCalibration, startGame, tickGame } from "./game/gameMachine";
import { watcherRituals } from "./game/rituals";
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
  const activeStream = stream ?? demoStream;
  const isDemoMode = Boolean(demoStream && !stream);

  const ritual = watcherRituals[gameState.currentRitualIndex] ?? watcherRituals[0];
  const elapsedMs = gameState.phase === "playing" ? Math.max(0, now - gameState.ritualStartedAt) : 0;
  const threat = useMemo(() => {
    if (gameState.phase === "failed") return 1;
    if (gameState.phase !== "playing") return 0;
    const pressure = Math.max(sample.blinkScore, sample.lookAwayScore, sample.motionScore);
    return Math.min(1, elapsedMs / ritual.durationMs + pressure * 0.45);
  }, [elapsedMs, gameState.phase, ritual.durationMs, sample]);
  const secondsRemaining = Math.max(0, Math.ceil((ritual.durationMs - elapsedMs) / 1000));

  useTensionAudio(gameState.phase === "playing" || gameState.phase === "failed", threat, gameState.phase === "failed");

  const begin = useCallback(async () => {
    const granted = await requestCamera();
    if (!granted) return;

    stableFaceStartedAtRef.current = null;
    setSample(waitingSample);
    setHasTrackingSample(false);
    setCaughtCardUrl(null);
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
          demoMode={isDemoMode}
          onSample={handleSample}
          onTrackerStatus={setTrackerStatus}
          onVideoReady={handleVideoReady}
        >
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
              <p>{sample.facePresent ? "The Watcher is learning where not to look." : "You will not be judged until it sees you."}</p>
            </section>
          ) : null}
          {gameState.phase === "playing" ? (
            <RitualHud ritual={ritual} secondsRemaining={secondsRemaining} threat={threat} />
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
          {gameState.phase === "won" ? (
            <section className="failure-panel">
              <p className="eyebrow">Survived</p>
              <h2>It stopped watching.</h2>
              <p>For now.</p>
              <button type="button" onClick={retry}>
                Again
              </button>
            </section>
          ) : null}
        </CameraStage>
      ) : (
        <section className="title-screen">
          <p className="eyebrow">The Watcher</p>
          <h1>The Watcher</h1>
          <p>Your camera stays on this device. Blink, look away, or leave the frame and it gets closer.</p>
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
