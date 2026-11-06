import { text } from "./i18n.js";
export const currencies = ["USD", "KHR", "EUR", "GBP", "THB"];
const localDate = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
export function newInvoice(settings = null, number = null) {
  const today = new Date();
  return {
    number:
      number ??
      `INV-${localDate(today).replaceAll("-", "")}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`,
    date: localDate(today),
    dueDate: "",
    theme: settings?.theme === "og" ? "og" : "modern",
    sellerName: settings?.sellerName ?? "",
    sellerEmail: settings?.sellerEmail ?? "",
    sellerAddress: settings?.sellerAddress ?? "",
    clientName: "",
    clientEmail: "",
    clientAddress: "",
    currency: settings?.currency ?? "USD",
    tax: settings?.tax ?? "0",
    notes: settings?.notes ?? "",
    items: [{ description: "", quantity: "1", rate: "0.00" }],
  };
}
export function minorUnits(value) {
  const match = /^(\d+)(?:\.(\d{0,2}))?$/.exec(String(value));
  if (!match) return 0;
  return Number(match[1]) * 100 + Number((match[2] || "").padEnd(2, "0"));
}
export function calculate(invoice) {
  const lines = invoice.items.map((item) => {
    const quantity = Number(item.quantity),
      rate = minorUnits(item.rate);
    return Number.isInteger(quantity) &&
      quantity > 0 &&
      quantity <= 999 &&
      rate <= 1000000000
      ? rate * quantity
      : 0;
  });
  const subtotal = lines.reduce((sum, value) => sum + value, 0);
  const basisPoints = Math.min(10000, Math.max(0, minorUnits(invoice.tax)));
  // Integer arithmetic also stays exact for very large invoice totals.
  const tax = Number((BigInt(subtotal) * BigInt(basisPoints) + 5000n) / 10000n);
  return { lines, subtotal, tax, total: subtotal + tax };
}
export function money(cents, currency, language = "en") {
  return new Intl.NumberFormat(
    language === "km" ? "km-KH-u-nu-latn" : "en-US",
    {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  ).format(cents / 100);
}
export function restoreInvoice(saved) {
  const result = newInvoice();
  if (!saved || typeof saved !== "object") return result;
  const limits = {
    number: 40,
    date: 10,
    dueDate: 10,
    sellerName: 100,
    sellerEmail: 120,
    sellerAddress: 240,
    clientName: 100,
    clientEmail: 120,
    clientAddress: 240,
    notes: 600,
    tax: 8,
  };
  for (const [key, length] of Object.entries(limits))
    if (typeof saved[key] === "string")
      result[key] = saved[key].slice(0, length);
  if (["modern", "og"].includes(saved.theme)) result.theme = saved.theme;
  if (currencies.includes(saved.currency)) result.currency = saved.currency;
  if (Array.isArray(saved.items) && saved.items.length)
    result.items = saved.items.slice(0, 20).map((item) => ({
      description: String(item?.description ?? "").slice(0, 140),
      quantity: String(item?.quantity ?? "1").slice(0, 3),
      rate: String(item?.rate ?? "0").slice(0, 11),
    }));
  return result;
}
export function validateInvoice(invoice, language = "en") {
  const t = (key) => text(language, key);
  if (
    ![invoice.number, invoice.sellerName, invoice.clientName].every((value) =>
      value.trim(),
    )
  )
    return t("missingDetails");
  if (!invoice.date || (invoice.dueDate && invoice.dueDate < invoice.date))
    return t("invalidDate");
  if (
    [invoice.sellerAddress, invoice.clientAddress].some(
      (value) => value.split("\n").length > 5,
    ) ||
    invoice.notes.split("\n").length > 10
  )
    return t("tooManyLines");
  if (!invoice.items.length || invoice.items.length > 20)
    return t("invalidItems");
  for (const item of invoice.items) {
    if (!item.description.trim()) return t("missingDescription");
    if (
      !/^\d+$/.test(item.quantity) ||
      Number(item.quantity) < 1 ||
      Number(item.quantity) > 999
    )
      return t("invalidQuantity");
    if (!/^\d+(\.\d{0,2})?$/.test(item.rate) || Number(item.rate) > 10000000)
      return t("invalidRate");
  }
  if (!/^\d+(\.\d{0,2})?$/.test(invoice.tax) || Number(invoice.tax) > 100)
    return t("invalidTax");
  return "";
}
