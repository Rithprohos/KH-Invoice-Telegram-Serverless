import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { SourceTextModule, SyntheticModule, createContext } from "node:vm";
import { validatePaymentQr } from "../tgcloud/lib/payment-qr.js";

const dataUrl =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAIAAAB7GkOtAAAHHUlEQVR4nO3VMQEAIAzAMMC/5yFjRxMF/Xpn5gDQ87YDANhhAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGABBlAABRBgAQZQAAUQYAEGUAAFEGAHCaPnlhBv3lcgY4AAAAAElFTkSuQmCC";
const source = await readFile(
  new URL("../tgcloud/endpoints/paymentQr.js", import.meta.url),
  "utf8",
);

async function store() {
  const rows = new Map();
  class EndpointError extends Error {
    constructor(message, parameters) {
      super(message);
      this.parameters = parameters;
    }
  }
  const db = {
    select() {
      return {
        from() {
          return {
            where(userId) {
              return {
                async get() {
                  return rows.get(userId);
                },
              };
            },
          };
        },
      };
    },
    insert() {
      return {
        values(row) {
          return {
            onConflictDoUpdate({ set }) {
              return {
                async run() {
                  rows.set(
                    row.userId,
                    rows.has(row.userId)
                      ? { ...rows.get(row.userId), ...set }
                      : row,
                  );
                },
              };
            },
          };
        },
      };
    },
    delete() {
      return {
        where(userId) {
          return {
            async run() {
              rows.delete(userId);
            },
          };
        },
      };
    },
  };
  const context = createContext({});
  const exportsByModule = {
    sdk: { db, EndpointError },
    "sdk/db": { eq: (_column, userId) => userId },
    "../schema.js": { userPaymentQrs: { userId: "user_id" } },
    "../lib/payment-qr.js": { validatePaymentQr },
  };
  const module = new SourceTextModule(source, { context });
  await module.link(
    (name) =>
      new SyntheticModule(
        Object.keys(exportsByModule[name]),
        function () {
          for (const [key, value] of Object.entries(exportsByModule[name]))
            this.setExport(key, value);
        },
        { context },
      ),
  );
  await module.evaluate();
  return { run: module.namespace.default, rows };
}
const contextFor = (id) => ({ initData: { user: { id } } });

test("payment QR images are remembered per verified user across calls and replacement", async () => {
  const { run, rows } = await store();
  await run({ action: "set", dataUrl, userId: 999 }, contextFor(123));
  assert.equal(
    (await run({ action: "get", userId: 123 }, contextFor(999))).dataUrl,
    null,
  );
  assert.equal(
    (await run({ action: "get" }, contextFor(123))).dataUrl,
    dataUrl,
  );
  assert.deepEqual([...rows.keys()], [123]);
  await run({ action: "set", dataUrl }, contextFor(123));
  assert.equal(rows.size, 1);
});

test("removal affects only the caller, regardless of a supplied user ID", async () => {
  const { run } = await store();
  await run({ action: "set", dataUrl }, contextFor(123));
  await run({ action: "set", dataUrl }, contextFor(456));
  await run({ action: "remove", userId: 456 }, contextFor(123));
  assert.equal((await run({ action: "get" }, contextFor(123))).dataUrl, null);
  assert.equal(
    (await run({ action: "get" }, contextFor(456))).dataUrl,
    dataUrl,
  );
});

test("missing identities and rejected uploads leave existing payment QR images unchanged", async () => {
  const { run, rows } = await store();
  for (const action of ["get", "set", "remove"])
    await assert.rejects(run({ action, dataUrl }, {}), /Telegram/);
  await run({ action: "set", dataUrl }, contextFor(123));
  await assert.rejects(
    run(
      { action: "set", dataUrl: "data:image/svg+xml,<svg></svg>" },
      contextFor(123),
    ),
    (error) => error.parameters.code === "INVALID_QR",
  );
  await assert.rejects(
    run({ action: "unknown" }, contextFor(123)),
    (error) => error.parameters.code === "INVALID_ACTION",
  );
  assert.equal(rows.get(123).dataUrl, dataUrl);
});

test("QR images must be normalized to 512 square pixels", () => {
  assert.equal(validatePaymentQr(dataUrl), dataUrl);
  const bytes = Buffer.from(dataUrl.split(",")[1], "base64");
  bytes.writeUInt32BE(511, 16);
  assert.throws(() =>
    validatePaymentQr("data:image/png;base64," + bytes.toString("base64")),
  );
});
