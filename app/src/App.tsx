import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTensionAudio } from "./audio/useTensionAudio";
import { useCamera } from "./camera/useCamera";
import { CameraStage } from "./components/CameraStage";
import { CaughtCardView } from "./components/CaughtCardView";
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
  const { stream, error, requestCamera } = useCamera();
  const [gameState, setGameState] = useState(createInitialGameState);
  const [sample, setSample] = useState<TrackingSample>(waitingSample);
  const [hasTrackingSample, setHasTrackingSample] = useState(false);
  const [caughtCardUrl, setCaughtCardUrl] = useState<string | null>(null);
  const [now, setNow] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const stableFaceStartedAtRef = useRef<number | null>(null);

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
      {stream ? (
        <CameraStage
          stream={stream}
          threat={threat}
          onSample={handleSample}
          onVideoReady={handleVideoReady}
        >
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
          {error ? <p className="error-text">{error}</p> : null}
          <button type="button" onClick={begin}>
            Begin
          </button>
        </section>
      )}
    </main>
  );
}
