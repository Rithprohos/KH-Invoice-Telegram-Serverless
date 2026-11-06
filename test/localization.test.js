import test from "node:test";
import assert from "node:assert/strict";
import { messages, text } from "../src/i18n.js";
import { wrapText } from "../src/text-layout.js";
import { newInvoice, validateInvoice, money } from "../src/invoice.js";

test("every English UI and export string has a Khmer translation", () => {
  assert.deepEqual(
    Object.keys(messages.km).sort(),
    Object.keys(messages.en).sort(),
  );
  for (const value of Object.values(messages.km))
    assert.match(value, /[\u1780-\u17ff]/);
  assert.equal(text("km", "invoice"), "វិក្កយបត្រ");
  assert.match(validateInvoice(newInvoice(), "km"), /សូម/);
  assert.match(money(12500, "KHR", "km"), /៛/);
});

test("wrapped Khmer text preserves grapheme boundaries and all characters", () => {
  const value = "សេវាកម្មរចនាអត្តសញ្ញាណអាជីវកម្ម";
  const segments = [
    ...new Intl.Segmenter("km", { granularity: "grapheme" }).segment(value),
  ];
  const boundaries = new Set(
    segments.map((segment) => segment.index + segment.segment.length),
  );
  const lines = wrapText(value, 7, (text) => [...text].length, "km");
  assert.ok(lines.length > 1);
  assert.equal(lines.join(""), value);
  let offset = 0;
  for (const line of lines) {
    offset += line.length;
    assert.ok(boundaries.has(offset));
  }
});

test("wrapping handles long Latin identifiers and bounds explicit line breaks", () => {
  assert.deepEqual(
    wrapText("ABCDEFGHIJK", 4, (value) => value.length, "en"),
    ["ABCD", "EFGH", "IJK"],
  );
  assert.equal(
    wrapText(Array(100).fill("line").join("\n"), 40, (value) => value.length)
      .length,
    10,
  );
});

test("zero canvas text widths fall back to DOM shaping and release the measurement node", async () => {
  const { createTextMeasurer } = await import("../src/text-layout.js");
  let attached = 0,
    removed = 0,
    measured = 0;
  const probe = {
    style: {},
    setAttribute() {},
    getBoundingClientRect() {
      measured++;
      return { width: 120 };
    },
    remove() {
      removed++;
    },
  };
  const doc = {
    body: {
      appendChild() {
        attached++;
      },
    },
    createElement() {
      return probe;
    },
  };
  const ctx = { font: '400 27px "Moul"', measureText: () => ({ width: 0 }) };
  const measure = createTextMeasurer(ctx, doc);
  assert.equal(measure.width("វិក្កយបត្រ"), 120);
  assert.equal(measure.width("វិក្កយបត្រ"), 120);
  assert.equal(probe.style.font, ctx.font);
  assert.equal(probe.textContent, "វិក្កយបត្រ");
  assert.equal(attached, 1);
  assert.equal(measured, 1);
  measure.dispose();
  assert.equal(removed, 1);
});
