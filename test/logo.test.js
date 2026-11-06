import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { SourceTextModule, SyntheticModule, createContext } from "node:vm";
import { validateLogo, MAX_LOGO_BYTES } from "../tgcloud/lib/logo.js";

const dataUrl =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=";
const source = await readFile(
  new URL("../tgcloud/endpoints/logo.js", import.meta.url),
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
    "../schema.js": { userLogos: { userId: "user_id" } },
    "../lib/logo.js": { validateLogo },
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

test("logos are remembered per verified user across calls and replacement", async () => {
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

test("missing identities and rejected uploads leave existing logos unchanged", async () => {
  const { run, rows } = await store();
  for (const action of ["get", "set", "remove"])
    await assert.rejects(run({ action, dataUrl }, {}), /Telegram/);
  await run({ action: "set", dataUrl }, contextFor(123));
  await assert.rejects(
    run(
      { action: "set", dataUrl: "data:image/svg+xml,<svg></svg>" },
      contextFor(123),
    ),
    (error) => error.parameters.code === "INVALID_LOGO",
  );
  await assert.rejects(
    run({ action: "unknown" }, contextFor(123)),
    (error) => error.parameters.code === "INVALID_ACTION",
  );
  assert.equal(rows.get(123).dataUrl, dataUrl);
});

test("logo upload limits bound bytes, format and image dimensions", () => {
  assert.equal(validateLogo(dataUrl), dataUrl);
  const bytes = Buffer.from(dataUrl.split(",")[1], "base64");
  bytes.writeUInt32BE(513, 16);
  bytes.writeUInt32BE(128, 20);
  assert.throws(() =>
    validateLogo("data:image/png;base64," + bytes.toString("base64")),
  );
  assert.throws(() =>
    validateLogo("data:image/png;base64," + "A".repeat(MAX_LOGO_BYTES * 2)),
  );
  assert.throws(() => validateLogo("https://example.com/logo.png"));
});
