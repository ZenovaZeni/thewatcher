import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTensionAudio } from "./audio/useTensionAudio";
import { useCamera } from "./camera/useCamera";
import { CameraStage } from "./components/CameraStage";
import { RitualHud } from "./components/RitualHud";
import { createInitialGameState, startGame, tickGame } from "./game/gameMachine";
import { watcherRituals } from "./game/rituals";
import type { TrackingSample } from "./game/types";

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
  const [now, setNow] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

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
    await requestCamera();
    setGameState(startGame(createInitialGameState(), performance.now()));
  }, [requestCamera]);

  const retry = useCallback(() => {
    setSample(waitingSample);
    setHasTrackingSample(false);
    setGameState(startGame(createInitialGameState(), performance.now()));
  }, []);

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
          onSample={(nextSample) => {
            setSample(nextSample);
            setHasTrackingSample(true);
          }}
          onVideoReady={(video) => (videoRef.current = video)}
        >
          {gameState.phase === "playing" ? (
            <RitualHud ritual={ritual} secondsRemaining={secondsRemaining} threat={threat} />
          ) : null}
          {gameState.phase === "failed" ? (
            <section className="failure-panel">
              <p className="eyebrow">Caught</p>
              <h2>{gameState.failureReason}</h2>
              <p>The Watcher moved while the frame was yours.</p>
              <button type="button" onClick={retry}>
                Retry
              </button>
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
