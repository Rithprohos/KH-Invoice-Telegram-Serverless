import test from "node:test";
import assert from "node:assert/strict";
import {
  calculate,
  minorUnits,
  newInvoice,
  restoreInvoice,
  validateInvoice,
} from "../src/invoice.js";
import { decodePng } from "../tgcloud/lib/image.js";

test("decimal rates and tax round to the nearest cent without float drift", () => {
  const invoice = {
    items: [
      { quantity: "3", rate: "0.10" },
      { quantity: "2", rate: "19.99" },
    ],
    tax: "7.25",
  };
  assert.deepEqual(calculate(invoice), {
    lines: [30, 3998],
    subtotal: 4028,
    tax: 292,
    total: 4320,
  });
  assert.equal(
    calculate({ items: [{ quantity: "1", rate: "0.05" }], tax: "10" }).tax,
    1,
  );
  assert.equal(minorUnits("10000000.01"), 1000000001);
});
test("large totals calculate tax exactly", () => {
  const invoice = {
    items: Array.from({ length: 20 }, () => ({
      quantity: "999",
      rate: "9999999.99",
    })),
    tax: "99.99",
  };
  const result = calculate(invoice);
  assert.equal(
    result.tax,
    Number((BigInt(result.subtotal) * 9999n + 5000n) / 10000n),
  );
  assert.ok(Number.isSafeInteger(result.total));
});
test("invalid quantities and unsupported precision cannot be exported", () => {
  const invoice = {
    ...newInvoice(),
    sellerName: "Studio",
    clientName: "Client",
    items: [{ description: "Design", quantity: "1", rate: "30.00" }],
  };
  assert.equal(validateInvoice(invoice), "");
  invoice.items[0].quantity = "-1";
  assert.match(validateInvoice(invoice), /Quantities/);
  invoice.items[0].quantity = "1";
  invoice.items[0].rate = "0.001";
  assert.match(validateInvoice(invoice), /rates/);
  invoice.items[0].rate = "30";
  invoice.dueDate = "2000-01-01";
  assert.match(validateInvoice(invoice), /due date/);
});
test("draft recovery bounds corrupt data and new invoices get distinct numbers", () => {
  const draft = restoreInvoice({
    currency: "BAD",
    sellerName: "a".repeat(1000),
    items: Array(50).fill(null),
  });
  assert.equal(draft.currency, "USD");
  assert.equal(draft.sellerName.length, 100);
  assert.equal(draft.items.length, 20);
  assert.equal(restoreInvoice(null).items.length, 1);
  assert.notEqual(newInvoice().number, newInvoice().number);
});
test("PNG decoding preserves bytes and rejects malformed or oversized images", () => {
  const png =
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=";
  assert.deepEqual(Buffer.from(decodePng(png)), Buffer.from(png, "base64"));
  for (const value of [
    null,
    "",
    "bad",
    "A".repeat(5500004),
    Buffer.from("not a png".repeat(10)).toString("base64"),
  ])
    assert.throws(() => decodePng(value));
  const huge = Buffer.from(png, "base64");
  huge.writeUInt32BE(10001, 16);
  assert.throws(() => decodePng(huge.toString("base64")));
});
