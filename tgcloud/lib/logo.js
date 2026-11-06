import { decodePng } from "./image.js";

export const MAX_LOGO_BYTES = 192 * 1024;
export const MAX_LOGO_EDGE = 512;
const prefix = "data:image/png;base64,";

export function validateLogo(dataUrl) {
  if (
    typeof dataUrl !== "string" ||
    !dataUrl.startsWith(prefix) ||
    dataUrl.length > prefix.length + 4 * Math.ceil(MAX_LOGO_BYTES / 3)
  )
    throw new Error("Invalid logo");
  const bytes = decodePng(dataUrl.slice(prefix.length));
  const header = new DataView(bytes.buffer);
  if (
    bytes.length > MAX_LOGO_BYTES ||
    header.getUint32(8) !== 13 ||
    header.getUint32(16) > MAX_LOGO_EDGE ||
    header.getUint32(20) > MAX_LOGO_EDGE
  )
    throw new Error("Invalid logo dimensions");
  return dataUrl;
}
