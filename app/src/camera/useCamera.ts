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
        video: {
          facingMode: "user",
          width: { ideal: 720 },
          height: { ideal: 1280 },
        },
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
      stream?.getTracks().forEach((track) => {
        track.stop();
      });
    };
  }, [stream]);

  return { stream, error, requestCamera };
}
