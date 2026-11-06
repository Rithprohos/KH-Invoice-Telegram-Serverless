export const SETTINGS_CURRENCIES = ["USD", "KHR", "EUR", "GBP", "THB"];
export const MAX_INVOICE_NUMBER = 999999999;

export function defaultSettings() {
  return {
    sellerName: "",
    sellerEmail: "",
    sellerAddress: "",
    prefix: "INV-",
    padding: 4,
    nextNumber: 1,
    currency: "USD",
    tax: "0",
    notes: "",
    theme: "modern",
  };
}

export function validateSettings(input) {
  if (!input || typeof input !== "object") throw new Error("INVALID_SETTINGS");
  const result = {};
  const limits = {
    sellerName: 100,
    sellerEmail: 120,
    sellerAddress: 240,
    prefix: 16,
    notes: 600,
    tax: 6,
  };
  for (const [key, limit] of Object.entries(limits)) {
    if (typeof input[key] !== "string" || input[key].length > limit)
      throw new Error("INVALID_SETTINGS");
    result[key] = input[key].trim();
  }
  if (!/^[\p{L}\p{M}\p{N} _/\-]*$/u.test(result.prefix))
    throw new Error("INVALID_PREFIX");
  if (
    result.sellerEmail &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result.sellerEmail)
  )
    throw new Error("INVALID_SETTINGS");
  if (
    result.sellerAddress.split("\n").length > 5 ||
    result.notes.split("\n").length > 10
  )
    throw new Error("INVALID_SETTINGS");
  if (!/^\d+(\.\d{0,2})?$/.test(result.tax) || Number(result.tax) > 100)
    throw new Error("INVALID_SETTINGS");
  if (!SETTINGS_CURRENCIES.includes(input.currency))
    throw new Error("INVALID_SETTINGS");
  if (
    !Number.isInteger(input.padding) ||
    input.padding < 3 ||
    input.padding > 6
  )
    throw new Error("INVALID_SETTINGS");
  if (
    !Number.isInteger(input.nextNumber) ||
    input.nextNumber < 1 ||
    input.nextNumber > MAX_INVOICE_NUMBER
  )
    throw new Error("INVALID_NUMBER");
  if (input.theme !== undefined && !["modern", "og"].includes(input.theme))
    throw new Error("INVALID_SETTINGS");
  return {
    ...result,
    theme: input.theme ?? "modern",
    currency: input.currency,
    padding: input.padding,
    nextNumber: input.nextNumber,
  };
}

export function formatInvoiceNumber(settings, number = settings.nextNumber) {
  return `${settings.prefix}${String(number).padStart(settings.padding, "0")}`;
}

export function publicSettings(row) {
  const result = defaultSettings();
  if (row)
    for (const key of Object.keys(result))
      result[key] = row[key] ?? result[key];
  return result;
}
