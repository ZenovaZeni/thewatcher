import { useCallback, useEffect, useState } from "react";

export type CameraState = {
  stream: MediaStream | null;
  error: string | null;
  diagnostic: string | null;
  requestCamera: () => Promise<boolean>;
};

export function useCamera(): CameraState {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [diagnostic, setDiagnostic] = useState<string | null>(null);

  const requestCamera = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("This browser cannot open the camera.");
      setDiagnostic("navigator.mediaDevices.getUserMedia is unavailable.");
      return false;
    }

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
      setDiagnostic(null);
      return true;
    } catch (caught) {
      const cameraError = caught instanceof DOMException ? caught : null;
      const name = cameraError?.name ?? "CameraError";

      if (name === "NotAllowedError" || name === "SecurityError") {
        setError("Camera is blocked for this browser or site.");
      } else if (name === "NotFoundError" || name === "OverconstrainedError") {
        setError("No usable camera was found.");
      } else if (name === "NotReadableError") {
        setError("The camera is already in use by another app.");
      } else {
        setError("Camera permission is required to play.");
      }

      setDiagnostic(`${name}: ${cameraError?.message || "getUserMedia was rejected without a permission prompt."}`);
      return false;
    }
  }, []);

  useEffect(() => {
    return () => {
      stream?.getTracks().forEach((track) => {
        track.stop();
      });
    };
  }, [stream]);

  return { stream, error, diagnostic, requestCamera };
}
