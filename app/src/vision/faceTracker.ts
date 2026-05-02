import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import type { TrackingSample } from "../game/types";

export type FaceTracker = {
  detect: (video: HTMLVideoElement, now: number) => TrackingSample;
};

const emptySample: TrackingSample = {
  facePresent: false,
  blinkScore: 0,
  lookAwayScore: 0,
  motionScore: 0,
  smileScore: 0,
};

export async function createFaceTracker(): Promise<FaceTracker> {
  const fileset = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm",
  );

  const modelAssetPath =
    "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task";
  const createLandmarker = (delegate: "GPU" | "CPU") =>
    FaceLandmarker.createFromOptions(fileset, {
      baseOptions: {
        modelAssetPath,
        delegate,
      },
      runningMode: "VIDEO",
      numFaces: 1,
      outputFaceBlendshapes: true,
      outputFacialTransformationMatrixes: true,
    });

  const landmarker = await createLandmarker("GPU").catch(() => createLandmarker("CPU"));

  let previousCenter: { x: number; y: number } | null = null;

  return {
    detect(video, now) {
      const result = landmarker.detectForVideo(video, now);
      const face = result.faceLandmarks[0];

      if (!face) {
        previousCenter = null;
        return emptySample;
      }

      const blendshapes = result.faceBlendshapes[0]?.categories ?? [];
      const findScore = (name: string) => blendshapes.find((shape) => shape.categoryName === name)?.score ?? 0;
      const blinkScore = Math.max(findScore("eyeBlinkLeft"), findScore("eyeBlinkRight"));
      const smileScore = Math.max(findScore("mouthSmileLeft"), findScore("mouthSmileRight"));
      const lookAwayScore = Math.max(
        findScore("eyeLookOutLeft"),
        findScore("eyeLookOutRight"),
        findScore("eyeLookDownLeft"),
        findScore("eyeLookDownRight"),
        findScore("eyeLookUpLeft"),
        findScore("eyeLookUpRight"),
      );

      const center = face.reduce(
        (total, point) => ({ x: total.x + point.x / face.length, y: total.y + point.y / face.length }),
        { x: 0, y: 0 },
      );
      const motionScore = previousCenter
        ? Math.min(1, Math.hypot(center.x - previousCenter.x, center.y - previousCenter.y) * 18)
        : 0;
      previousCenter = center;

      return {
        facePresent: true,
        blinkScore,
        lookAwayScore,
        motionScore,
        smileScore,
      };
    },
  };
}
