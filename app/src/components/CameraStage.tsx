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
  const lastDetectAtRef = useRef(0);
  const sampleCountRef = useRef(0);
  const statusAtRef = useRef(0);
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
        const status = "Face tracking loaded";
        setTrackerStatus(status);
        onTrackerStatus?.(status);
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
      const now = performance.now();

      if (demoMode) {
        sampleCountRef.current += 1;
        onSample(demoSample);
      } else if (
        video &&
        tracker &&
        video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
        video.videoWidth > 0 &&
        video.videoHeight > 0 &&
        now - lastDetectAtRef.current >= 80
      ) {
        lastDetectAtRef.current = now;

        try {
          const nextSample = tracker.detect(video, now);
          sampleCountRef.current += 1;
          onSample(nextSample);

          if (now - statusAtRef.current > 1000) {
            statusAtRef.current = now;
            const status = nextSample.facePresent
              ? `Face tracking active (${sampleCountRef.current} samples)`
              : `Tracking active, no face (${video.videoWidth}x${video.videoHeight})`;
            setTrackerStatus(status);
            onTrackerStatus?.(status);
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unknown tracking error";
          const status = `Tracking error: ${message.slice(0, 90)}`;
          setTrackerStatus(status);
          onTrackerStatus?.(status);
        }
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
      <video ref={videoRef} playsInline muted autoPlay />
      <div
        className={`watcher-presence watcher-presence-${watcherScare.peekSide} watcher-presence-${watcherScare.asset}`}
        style={{
          opacity: watcherScare.creatureOpacity,
          transform: `translateY(${20 - watcherScare.presence * 42}px) translateX(${
            (watcherScare.peekSide === "left" ? 1 : -1) * watcherScare.movementJump * 52
          }px) scale(${watcherScare.scale})`,
        }}
      >
        <img
          src={
            watcherScare.asset === "lean"
              ? "/assets/watcher/watcher-lean.png"
              : "/assets/watcher/watcher-front.png"
          }
          alt=""
          aria-hidden="true"
        />
        <span className="watcher-eye watcher-eye-left" style={{ opacity: watcherScare.eyeGlow * 0.72 }} />
        <span className="watcher-eye watcher-eye-right" style={{ opacity: watcherScare.eyeGlow * 0.72 }} />
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
