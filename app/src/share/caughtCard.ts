export function formatTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

export function buildCaughtCardCaption(reason: string, _entityName: string, elapsedMs: number): string {
  return `${reason} AT ${formatTime(elapsedMs)}`;
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

  context.fillStyle = "rgba(90, 0, 16, 0.28)";
  context.fillRect(0, 0, canvas.width, canvas.height);

  const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "rgba(0, 0, 0, 0.36)");
  gradient.addColorStop(0.55, "rgba(0, 0, 0, 0.08)");
  gradient.addColorStop(1, "rgba(0, 0, 0, 0.82)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = "rgba(255, 255, 255, 0.42)";
  for (let y = 0; y < canvas.height; y += 10) {
    context.fillRect(0, y, canvas.width, 1);
  }

  context.fillStyle = "rgba(0, 0, 0, 0.78)";
  context.fillRect(56, canvas.height - 420, canvas.width - 112, 300);
  context.strokeStyle = "rgba(244, 239, 231, 0.18)";
  context.lineWidth = 2;
  context.strokeRect(56, canvas.height - 420, canvas.width - 112, 300);

  context.fillStyle = "#d15162";
  context.font = "800 42px Inter, Arial, sans-serif";
  context.fillText(entityName.toUpperCase(), 96, canvas.height - 330);

  context.fillStyle = "#fff8f0";
  context.font = "900 76px Inter, Arial, sans-serif";
  context.fillText(caption, 96, canvas.height - 225, canvas.width - 192);

  context.fillStyle = "rgba(244, 239, 231, 0.76)";
  context.font = "700 34px Inter, Arial, sans-serif";
  context.fillText("Your camera stayed local. You chose this share.", 96, canvas.height - 155, canvas.width - 192);

  return canvas.toDataURL("image/png");
}

export async function dataUrlToFile(dataUrl: string, fileName: string): Promise<File> {
  const response = await fetch(dataUrl);
  const blob = await response.blob();

  return new File([blob], fileName, { type: blob.type || "image/png" });
}
