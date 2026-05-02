import { useEffect, useRef, useState, type ReactNode } from "react";
import type { TrackingSample } from "../game/types";
import { createFaceTracker, type FaceTracker } from "../vision/faceTracker";

type CameraStageProps = {
  stream: MediaStream;
  threat: number;
  onSample: (sample: TrackingSample) => void;
  onVideoReady: (video: HTMLVideoElement | null) => void;
  children?: ReactNode;
};

export function CameraStage({ stream, threat, onSample, onVideoReady, children }: CameraStageProps) {
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
    let cancelled = false;

    createFaceTracker()
      .then((tracker) => {
        if (cancelled) return;
        trackerRef.current = tracker;
        setTrackerStatus("Keep your face in frame");
      })
      .catch(() => {
        if (cancelled) return;
        setTrackerStatus("Face tracking failed to load");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let frame = 0;

    const detect = () => {
      const video = videoRef.current;
      const tracker = trackerRef.current;

      if (video && tracker && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        onSample(tracker.detect(video, performance.now()));
      }

      frame = requestAnimationFrame(detect);
    };

    frame = requestAnimationFrame(detect);

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [onSample]);

  return (
    <div className="camera-stage">
      <video ref={videoRef} playsInline muted />
      <div className="entity-shadow" style={{ opacity: 0.12 + threat * 0.5, transform: `scale(${1 + threat * 0.28})` }} />
      <div className="scan-lines" />
      <div className="camera-vignette" />
      <p className="tracker-status">{trackerStatus}</p>
      {children}
    </div>
  );
}
