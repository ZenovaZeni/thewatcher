export function formatTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

export function buildCaughtCardCaption(reason: string, _entityName: string, elapsedMs: number): string {
  const roasts: Record<string, string> = {
    "BLINK DETECTED": "BLINKED LIKE THE PHONE OWED YOU MONEY",
    "YOU LOOKED AWAY": "YOU LOOKED AWAY. IT DID NOT.",
    "FACE LOST": "LEFT THE FRAME LIKE THAT WOULD HELP",
    "MOVEMENT DETECTED": "PANICKED ON CAMERA",
    "SMILE MISSING": "REFUSED TO SMILE FOR THE HAUNTED PHONE",
    "SMILE DETECTED": "SMILED AT THE WORST POSSIBLE TIME",
  };

  return `${roasts[reason] ?? reason} AT ${formatTime(elapsedMs)}`;
}

export function buildCaughtCardEvidenceDetails(reason: string, entityName: string, elapsedMs: number) {
  return {
    label: "EVIDENCE FRAME",
    entity: entityName.toUpperCase(),
    failure: reason,
    timestamp: formatTime(elapsedMs),
  };
}

export function renderCaughtCard(video: HTMLVideoElement, reason: string, entityName: string, elapsedMs: number): string {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1920;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Could not create caught card canvas.");
  }

  const videoRatio = video.videoWidth / video.videoHeight || 9 / 16;
  const canvasRatio = canvas.width / canvas.height;
  const drawHeight = videoRatio > canvasRatio ? canvas.height : canvas.width / videoRatio;
  const drawWidth = videoRatio > canvasRatio ? canvas.height * videoRatio : canvas.width;
  const drawX = (canvas.width - drawWidth) / 2;
  const drawY = (canvas.height - drawHeight) / 2;

  context.save();
  context.translate(canvas.width, 0);
  context.scale(-1, 1);
  context.drawImage(video, drawX, drawY, drawWidth, drawHeight);
  context.restore();

  const caption = buildCaughtCardCaption(reason, entityName, elapsedMs);
  const evidence = buildCaughtCardEvidenceDetails(reason, entityName, elapsedMs);

  context.fillStyle = "rgba(52, 0, 12, 0.2)";
  context.fillRect(0, 0, canvas.width, canvas.height);

  const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "rgba(0, 0, 0, 0.48)");
  gradient.addColorStop(0.38, "rgba(0, 0, 0, 0.06)");
  gradient.addColorStop(0.72, "rgba(0, 0, 0, 0.34)");
  gradient.addColorStop(1, "rgba(0, 0, 0, 0.9)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = "rgba(236, 247, 242, 0.12)";
  for (let y = 0; y < canvas.height; y += 6) {
    context.fillRect(0, y, canvas.width, y % 18 === 0 ? 2 : 1);
  }

  const glitchSeed = Math.max(1, Math.floor(elapsedMs / 137) + reason.length * 11 + entityName.length * 7);
  for (let index = 0; index < 11; index += 1) {
    const y = 140 + ((glitchSeed * (index + 3) * 53) % (canvas.height - 520));
    const height = 4 + ((glitchSeed + index * 17) % 18);
    const offset = ((index % 2 === 0 ? 1 : -1) * (18 + ((glitchSeed + index * 23) % 58)));
    context.fillStyle = index % 3 === 0 ? "rgba(173, 35, 56, 0.2)" : "rgba(217, 245, 236, 0.12)";
    context.fillRect(Math.max(0, offset), y, canvas.width - Math.abs(offset), height);
  }

  context.strokeStyle = "rgba(236, 247, 242, 0.48)";
  context.lineWidth = 2;
  const markerLength = 96;
  const markerInset = 54;
  context.beginPath();
  context.moveTo(markerInset, markerInset + markerLength);
  context.lineTo(markerInset, markerInset);
  context.lineTo(markerInset + markerLength, markerInset);
  context.moveTo(canvas.width - markerInset - markerLength, markerInset);
  context.lineTo(canvas.width - markerInset, markerInset);
  context.lineTo(canvas.width - markerInset, markerInset + markerLength);
  context.moveTo(markerInset, canvas.height - markerInset - markerLength);
  context.lineTo(markerInset, canvas.height - markerInset);
  context.lineTo(markerInset + markerLength, canvas.height - markerInset);
  context.moveTo(canvas.width - markerInset - markerLength, canvas.height - markerInset);
  context.lineTo(canvas.width - markerInset, canvas.height - markerInset);
  context.lineTo(canvas.width - markerInset, canvas.height - markerInset - markerLength);
  context.stroke();

  context.fillStyle = "rgba(0, 0, 0, 0.54)";
  context.fillRect(54, 62, 420, 88);
  context.strokeStyle = "rgba(209, 81, 98, 0.62)";
  context.strokeRect(54, 62, 420, 88);

  context.fillStyle = "#d15162";
  context.font = "900 34px Inter, Arial, sans-serif";
  context.fillText(evidence.label, 84, 118);

  context.fillStyle = "rgba(236, 247, 242, 0.72)";
  context.font = "700 24px Inter, Arial, sans-serif";
  context.fillText(`TIME ${evidence.timestamp}`, canvas.width - 250, 118);

  context.fillStyle = "rgba(0, 0, 0, 0.72)";
  context.fillRect(56, canvas.height - 486, canvas.width - 112, 360);
  context.strokeStyle = "rgba(236, 247, 242, 0.2)";
  context.strokeRect(56, canvas.height - 486, canvas.width - 112, 360);
  context.strokeStyle = "rgba(209, 81, 98, 0.56)";
  context.beginPath();
  context.moveTo(56, canvas.height - 486);
  context.lineTo(canvas.width - 56, canvas.height - 486);
  context.moveTo(56, canvas.height - 126);
  context.lineTo(canvas.width - 56, canvas.height - 126);
  context.stroke();

  context.fillStyle = "rgba(236, 247, 242, 0.62)";
  context.font = "800 26px Inter, Arial, sans-serif";
  context.fillText("ENTITY", 96, canvas.height - 408);
  context.fillText("FAILURE", 96, canvas.height - 282);
  context.fillText("TIMESTAMP", 670, canvas.height - 408);

  context.fillStyle = "#fff8f0";
  context.font = "900 50px Inter, Arial, sans-serif";
  context.fillText(evidence.entity, 96, canvas.height - 354, 520);

  context.fillStyle = "#d15162";
  context.font = "900 42px Inter, Arial, sans-serif";
  context.fillText(evidence.failure, 96, canvas.height - 228, canvas.width - 192);

  context.fillStyle = "#fff8f0";
  context.font = "900 56px Inter, Arial, sans-serif";
  context.fillText(evidence.timestamp, 670, canvas.height - 354, 300);

  context.fillStyle = "#fff8f0";
  context.font = "900 58px Inter, Arial, sans-serif";
  context.fillText(caption, 96, canvas.height - 166, canvas.width - 192);

  context.fillStyle = "rgba(236, 247, 242, 0.66)";
  context.font = "700 28px Inter, Arial, sans-serif";
  context.fillText("LOCAL CAMERA CAPTURE / SHARE AUTHORIZED", 96, canvas.height - 94, canvas.width - 192);

  return canvas.toDataURL("image/png");
}

export async function dataUrlToFile(dataUrl: string, fileName: string): Promise<File> {
  const response = await fetch(dataUrl);
  const blob = await response.blob();

  return new File([blob], fileName, { type: blob.type || "image/png" });
}
