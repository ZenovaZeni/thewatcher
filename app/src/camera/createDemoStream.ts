export function createDemoStream(): MediaStream {
  const canvas = document.createElement("canvas");
  canvas.width = 720;
  canvas.height = 1280;
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Could not create demo camera canvas.");
  }

  let frame = 0;
  let animation = 0;

  const draw = () => {
    const pulse = Math.sin(frame / 28);
    const scan = (frame * 6) % canvas.height;

    context.fillStyle = "#050505";
    context.fillRect(0, 0, canvas.width, canvas.height);

    const gradient = context.createRadialGradient(360, 420, 40, 360, 420, 620);
    gradient.addColorStop(0, "rgba(90, 12, 24, 0.5)");
    gradient.addColorStop(0.45, "rgba(24, 18, 18, 0.88)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 1)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = "rgba(220, 44, 66, 0.08)";
    context.fillRect(0, scan, canvas.width, 28);

    context.fillStyle = "rgba(244, 239, 231, 0.72)";
    context.font = "700 26px Inter, Arial, sans-serif";
    context.textAlign = "center";
    context.fillText("LOCAL DEMO CAMERA", canvas.width / 2, 86);

    context.fillStyle = "rgba(5, 5, 5, 0.76)";
    context.beginPath();
    context.ellipse(360, 430 + pulse * 4, 118, 158, 0, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = "#f4efe7";
    context.beginPath();
    context.ellipse(318, 392, 18, 9, 0, 0, Math.PI * 2);
    context.ellipse(402, 392, 18, 9, 0, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = "rgba(209, 81, 98, 0.88)";
    context.fillRect(318, 512, 84, 5);

    context.fillStyle = "rgba(255, 248, 240, 0.82)";
    context.font = "900 58px Inter, Arial, sans-serif";
    context.fillText("THE WATCHER", canvas.width / 2, 930);

    context.fillStyle = "rgba(201, 190, 182, 0.82)";
    context.font = "500 30px Inter, Arial, sans-serif";
    context.fillText("Demo feed for blocked camera browsers", canvas.width / 2, 984);

    frame += 1;
    animation = requestAnimationFrame(draw);
  };

  draw();

  const stream = canvas.captureStream(30);
  const stopTracks = () => {
    cancelAnimationFrame(animation);
  };

  stream.getTracks().forEach((track) => {
    track.addEventListener("ended", stopTracks, { once: true });
  });

  return stream;
}
