// Normalize user images to a small, metadata-free PNG with transparency intact.
const PREFIX = "data:image/png;base64,";
const MAX_BYTES = 192 * 1024;

export function loadLogoImage(dataUrl) {
  if (
    typeof dataUrl !== "string" ||
    !dataUrl.startsWith(PREFIX) ||
    dataUrl.length > PREFIX.length + 4 * Math.ceil(MAX_BYTES / 3)
  )
    return Promise.reject(new Error("logoInvalid"));
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () =>
      image.naturalWidth <= 512 && image.naturalHeight <= 512
        ? resolve(image)
        : reject(new Error("logoInvalid"));
    image.onerror = () => reject(new Error("logoInvalid"));
    image.src = dataUrl;
  });
}

export async function normalizeLogo(file) {
  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type))
    throw new Error("logoTypeError");
  if (!file.size || file.size > 5 * 1024 * 1024)
    throw new Error("logoSizeError");
  const url = URL.createObjectURL(file);
  try {
    const original = new Image();
    await new Promise((resolve, reject) => {
      original.onload = resolve;
      original.onerror = () => reject(new Error("logoInvalid"));
      original.src = url;
    });
    const width = original.naturalWidth,
      height = original.naturalHeight;
    if (
      !width ||
      !height ||
      width * height > 16000000 ||
      Math.max(width / height, height / width) > 20
    )
      throw new Error("logoSizeError");
    const canvas = document.createElement("canvas");
    for (const edge of [512, 384, 256, 128]) {
      const scale = Math.min(1, edge / Math.max(width, height));
      canvas.width = Math.max(1, Math.round(width * scale));
      canvas.height = Math.max(1, Math.round(height * scale));
      const ctx = canvas.getContext("2d");
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(original, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/png");
      if (dataUrl.length <= PREFIX.length + 4 * Math.ceil(MAX_BYTES / 3))
        return { dataUrl, image: await loadLogoImage(dataUrl) };
    }
    throw new Error("logoSizeError");
  } finally {
    URL.revokeObjectURL(url);
  }
}
