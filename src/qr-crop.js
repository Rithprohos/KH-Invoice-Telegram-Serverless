// Keep a white border around the selected square; never stretch the payment code.
export function cropGeometry(width, height, zoom = 1, x = 0, y = 0) {
  const size = 448;
  const scale = Math.min(size / width, size / height) * zoom;
  const w = width * scale,
    h = height * scale;
  return {
    x: 32 + (size - w) / 2 + ((x / 100) * w) / 2,
    y: 32 + (size - h) / 2 + ((y / 100) * h) / 2,
    width: w,
    height: h,
  };
}
export function drawQrCrop(canvas, image, zoom, x, y) {
  canvas.width = canvas.height = 512;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, 512, 512);
  const rect = cropGeometry(
    image.naturalWidth,
    image.naturalHeight,
    zoom,
    x,
    y,
  );
  ctx.save();
  ctx.beginPath();
  ctx.rect(32, 32, 448, 448);
  ctx.clip();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(image, rect.x, rect.y, rect.width, rect.height);
  ctx.restore();
}
