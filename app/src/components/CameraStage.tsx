import { useEffect, useRef, useState, type ReactNode } from "react";
import type { WatcherScare } from "../game/scare";
import type { TrackingSample } from "../game/types";
import { createFaceTracker, type FaceTracker } from "../vision/faceTracker";

type CameraStageProps = {
  stream: MediaStream;
  threat: number;
  signalPressure: number;
  watcherScare: WatcherScare;
  demoMode?: boolean;
  onSample: (sample: TrackingSample) => void;
  onTrackerStatus?: (status: string) => void;
  onVideoReady: (video: HTMLVideoElement | null) => void;
  children?: ReactNode;
};

const demoSample: TrackingSample = {
  facePresent: true,
  blinkScore: 0,
  lookAwayScore: 0.02,
  motionScore: 0.03,
  smileScore: 0,
};

export function CameraStage({
  stream,
  threat,
  signalPressure,
  watcherScare,
  demoMode = false,
  onSample,
  onTrackerStatus,
  onVideoReady,
  children,
}: CameraStageProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const trackerRef = useRef<FaceTracker | null>(null);
  const [trackerStatus, setTrackerStatus] = useState("Warming camera");

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.srcObject = stream;
    onVideoReady(video);
    void video.play();

    return () => {
      onVideoReady(null);
    };
  }, [onVideoReady, stream]);

  useEffect(() => {
    if (demoMode) {
      setTrackerStatus("Demo feed active");
      onTrackerStatus?.("Demo feed active");
      return;
    }

    let cancelled = false;

    createFaceTracker()
      .then((tracker) => {
        if (cancelled) return;
        trackerRef.current = tracker;
        setTrackerStatus("Keep your face in frame");
        onTrackerStatus?.("Keep your face in frame");
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        const message = error instanceof Error ? error.message : "Unknown MediaPipe error";
        const status = `Face tracking failed: ${message.slice(0, 90)}`;
        setTrackerStatus(status);
        onTrackerStatus?.(status);
      });

    return () => {
      cancelled = true;
    };
  }, [demoMode, onTrackerStatus]);

  useEffect(() => {
    let frame = 0;

    const detect = () => {
      const video = videoRef.current;
      const tracker = trackerRef.current;

      if (demoMode) {
        onSample(demoSample);
      } else if (video && tracker && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        onSample(tracker.detect(video, performance.now()));
      }

      frame = requestAnimationFrame(detect);
    };

    frame = requestAnimationFrame(detect);

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [demoMode, onSample]);

  return (
    <div className="camera-stage">
      <video ref={videoRef} playsInline muted />
      <div
        className={`watcher-presence watcher-presence-${watcherScare.peekSide}`}
        style={{
          opacity: watcherScare.presence,
          transform: `translateY(${18 - watcherScare.presence * 42}px) scale(${watcherScare.scale})`,
        }}
      >
        <span className="watcher-eye watcher-eye-left" style={{ opacity: watcherScare.eyeGlow }} />
        <span className="watcher-eye watcher-eye-right" style={{ opacity: watcherScare.eyeGlow }} />
      </div>
      <div
        className="watcher-smear"
        style={{
          opacity: watcherScare.distortion * 0.44,
          transform: `translateX(${(watcherScare.peekSide === "left" ? -1 : 1) * watcherScare.distortion * 18}px)`,
        }}
      />
      <div
        className="edge-presence edge-presence-left"
        style={{ opacity: Math.max(0, threat - 0.18) * 0.72, transform: `translateY(${12 - threat * 30}px)` }}
      />
      <div
        className="edge-presence edge-presence-right"
        style={{ opacity: Math.max(0, threat - 0.45) * 0.62, transform: `translateY(${-8 + threat * 24}px)` }}
      />
      <div className="reflection-face" style={{ opacity: Math.max(0, threat - 0.62) * 0.58 }} />
      <div className="camera-breath" style={{ opacity: 0.08 + threat * 0.28 }} />
      <div
        className="rule-static"
        style={{ opacity: Math.max(0, signalPressure - 0.42) * 0.82, transform: `translateX(${signalPressure * 8}px)` }}
      />
      <div className="scan-lines" />
      <div className="camera-vignette" />
      <p className="tracker-status">{trackerStatus}</p>
      {children}
    </div>
  );
}
