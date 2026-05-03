import { useCallback, useEffect, useState } from "react";

export type CameraState = {
  stream: MediaStream | null;
  error: string | null;
  diagnostic: string | null;
  devices: string[];
  requestCamera: () => Promise<boolean>;
};

export function useCamera(): CameraState {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [diagnostic, setDiagnostic] = useState<string | null>(null);
  const [devices, setDevices] = useState<string[]>([]);

  const refreshDevices = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) return;

    const nextDevices = await navigator.mediaDevices.enumerateDevices();
    setDevices(
      nextDevices
        .filter((device) => device.kind === "videoinput")
        .map((device, index) => device.label || `Camera ${index + 1}`),
    );
  }, []);

  const requestCamera = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("This browser cannot open the camera.");
      setDiagnostic("navigator.mediaDevices.getUserMedia is unavailable.");
      return false;
    }

    try {
      await refreshDevices();
      const preferredConstraints: MediaStreamConstraints = {
        video: {
          facingMode: "user",
          width: { ideal: 480 },
          height: { ideal: 640 },
          frameRate: { ideal: 24, max: 30 },
        },
        audio: false,
      };
      const basicConstraints: MediaStreamConstraints = {
        video: true,
        audio: false,
      };
      const nextStream = await navigator.mediaDevices
        .getUserMedia(preferredConstraints)
        .catch(() => navigator.mediaDevices.getUserMedia(basicConstraints));

      setStream(nextStream);
      setError(null);
      setDiagnostic(null);
      await refreshDevices();
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
      await refreshDevices();
      return false;
    }
  }, [refreshDevices]);

  useEffect(() => {
    void refreshDevices();
  }, [refreshDevices]);

  useEffect(() => {
    return () => {
      stream?.getTracks().forEach((track) => {
        track.stop();
      });
    };
  }, [stream]);

  return { stream, error, diagnostic, devices, requestCamera };
}
