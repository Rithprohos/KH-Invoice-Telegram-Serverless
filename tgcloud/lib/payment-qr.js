import { validateLogo } from "./logo.js";
import { decodePng } from "./image.js";
export function validatePaymentQr(dataUrl) {
  validateLogo(dataUrl);
  const bytes = decodePng(dataUrl.split(",")[1]);
  const header = new DataView(bytes.buffer);
  if (header.getUint32(16) !== 512 || header.getUint32(20) !== 512)
    throw new Error("Invalid QR dimensions");
  return dataUrl;
}
