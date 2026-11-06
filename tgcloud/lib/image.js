// Pure JavaScript: Telegram's runtime does not provide Node Buffer.
export function decodePng(value) {
  if (
    typeof value !== "string" ||
    value.length < 44 ||
    value.length > 5500000 ||
    value.length % 4 ||
    !/^[A-Za-z0-9+/]+={0,2}$/.test(value)
  )
    throw new Error("Invalid image");
  const alphabet =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  const padding = value.endsWith("==") ? 2 : value.endsWith("=") ? 1 : 0;
  const bytes = new Uint8Array((value.length / 4) * 3 - padding);
  let offset = 0;
  for (let i = 0; i < value.length; i += 4) {
    const chunk =
      (alphabet.indexOf(value[i]) << 18) |
      (alphabet.indexOf(value[i + 1]) << 12) |
      (Math.max(0, alphabet.indexOf(value[i + 2])) << 6) |
      Math.max(0, alphabet.indexOf(value[i + 3]));
    if (offset < bytes.length) bytes[offset++] = (chunk >> 16) & 255;
    if (offset < bytes.length) bytes[offset++] = (chunk >> 8) & 255;
    if (offset < bytes.length) bytes[offset++] = chunk & 255;
  }
  const signature = [137, 80, 78, 71, 13, 10, 26, 10];
  if (
    !signature.every((byte, index) => bytes[index] === byte) ||
    String.fromCharCode(...bytes.slice(12, 16)) !== "IHDR"
  )
    throw new Error("Invalid PNG");
  const header = new DataView(bytes.buffer),
    width = header.getUint32(16),
    height = header.getUint32(20);
  if (
    !width ||
    !height ||
    width + height > 10000 ||
    Math.max(width / height, height / width) > 20
  )
    throw new Error("Image dimensions exceed Telegram photo limits");
  return bytes;
}
