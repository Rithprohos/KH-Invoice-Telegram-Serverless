import test from "node:test";
import assert from "node:assert/strict";
import {
  newInvoice,
  restoreInvoice,
  calculate,
  money,
} from "../src/invoice.js";
import { defaultSettings, validateSettings } from "../tgcloud/lib/settings.js";
import { renderInvoice } from "../src/render-invoice.js";

function surface() {
  let height = 0;
  const ctx = {
    texts: [],
    images: [],
    font: "400 16px sans-serif",
    textAlign: "left",
    measureText(s) {
      return {
        width: [...s].length * Number(this.font.match(/([\d.]+)px/)[1]) * 0.6,
      };
    },
    fillText(value, x, y) {
      this.texts.push({
        value,
        x,
        y,
        width: this.measureText(value).width,
        align: this.textAlign,
      });
    },
    drawImage(...args) {
      this.images.push(args);
    },
    setTransform() {},
    fillRect() {},
    save() {},
    restore() {},
    setLineDash() {},
    beginPath() {},
    moveTo() {},
    lineTo() {},
    stroke() {},
  };
  return {
    getContext() {
      return ctx;
    },
    get height() {
      return height;
    },
    set height(value) {
      height = value;
      ctx.texts = [];
      ctx.images = [];
    },
    ctx,
  };
}

test("old drafts and saved settings default to Modern, new drafts inherit OG", () => {
  const old = { ...defaultSettings() };
  delete old.theme;
  assert.equal(validateSettings(old).theme, "modern");
  assert.equal(restoreInvoice({ number: "LEGACY" }).theme, "modern");
  assert.equal(restoreInvoice({ theme: "unknown" }).theme, "modern");
  assert.equal(newInvoice({ ...defaultSettings(), theme: "og" }).theme, "og");
  assert.equal(restoreInvoice({ theme: "og" }).theme, "og");
  assert.throws(() =>
    validateSettings({ ...defaultSettings(), theme: "unknown" }),
  );
});

test("OG preserves invoice data and totals, includes bilingual labels and fifteen numbered rows", () => {
  const invoice = {
    ...newInvoice(),
    theme: "og",
    sellerName: "Example shop",
    clientName: "Buyer",
    tax: "7.25",
    items: [{ description: "Service", quantity: "3", rate: "19.99" }],
  };
  const before = JSON.stringify(invoice),
    canvas = surface();
  renderInvoice(canvas, invoice, "en");
  assert.equal(JSON.stringify(invoice), before);
  const strings = canvas.ctx.texts.map((t) => t.value);
  assert.ok(strings.includes("INVOICE"));
  assert.ok(strings.includes("Buyer") && strings.includes("Seller"));
  assert.ok(strings.includes(money(calculate(invoice).total, "USD", "en")));
  for (let n = 1; n <= 15; n++) assert.ok(strings.includes(String(n)));
  assert.equal(canvas.width, 1800);
  assert.ok(canvas.height >= 2546);
});

test("long OG invoices expand without clipping text or the payment QR", () => {
  const canvas = surface();
  const logo = { naturalWidth: 500, naturalHeight: 200 },
    qr = { naturalWidth: 512, naturalHeight: 512 };
  const invoice = {
    ...newInvoice(),
    theme: "og",
    sellerName: "Long business name ".repeat(5),
    sellerAddress: "Street one\nStreet two\nCity",
    clientName: "Customer ".repeat(10),
    number: "LONG-NUMBER-".repeat(3),
    dueDate: "2027-01-31",
    notes: "A lengthy payment note. ".repeat(20),
    items: Array.from({ length: 20 }, () => ({
      description: "Detailed design services and materials ".repeat(3),
      quantity: "999",
      rate: "10000000",
    })),
    tax: "100",
  };
  renderInvoice(canvas, invoice, "en", logo, qr);
  assert.ok(canvas.height > 2546);
  for (const t of canvas.ctx.texts) {
    assert.ok(
      t.y >= 0 && t.y < canvas.height / 2,
      `Vertical clipping: ${t.value}`,
    );
    const left =
      t.align === "right"
        ? t.x - t.width
        : t.align === "center"
          ? t.x - t.width / 2
          : t.x;
    assert.ok(
      left >= 0 && left + t.width <= 900,
      `Horizontal clipping: ${t.value}`,
    );
  }
  const payment = canvas.ctx.images.find((args) => args[0] === qr);
  assert.ok(payment && payment[2] + payment[4] < canvas.height / 2);
});

test("OG omits blank due dates and absent QR, while Modern stays available", () => {
  const canvas = surface(),
    invoice = { ...newInvoice(), theme: "og" };
  renderInvoice(canvas, invoice, "en");
  assert.equal(canvas.ctx.images.length, 0);
  assert.ok(!canvas.ctx.texts.some((t) => t.value.includes("/ Due:")));
  invoice.theme = "modern";
  renderInvoice(canvas, invoice, "en");
  assert.ok(!canvas.ctx.texts.some((t) => t.value === "Buyer"));
});

test("OG positions Khmer headings and dates explicitly inside the page", () => {
  const canvas = surface();
  const invoice = {
    ...newInvoice(),
    theme: "og",
    sellerName: "KD service",
    clientName: "Boy pong",
    number: "INV-0003",
    date: "2026-11-06",
    dueDate: "2026-11-20",
    items: [{ description: "សេវាកម្ម / Service", quantity: "1", rate: "25" }],
  };
  renderInvoice(canvas, invoice, "km");
  const title = canvas.ctx.texts.find((t) => t.value === "វិក្កយបត្រ");
  const date = canvas.ctx.texts.find((t) => t.value.includes("/ Date:"));
  const due = canvas.ctx.texts.find((t) => t.value.includes("/ Due:"));
  assert.equal(title.align, "left");
  assert.equal(title.x + title.width / 2, 450);
  for (const field of [date, due]) {
    assert.equal(field.align, "left");
    assert.equal(field.x + field.width, 858);
    assert.ok(field.x >= 548);
  }
  assert.ok(canvas.ctx.texts.every((t) => t.align === "left"));
});
