import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  SourceTextModule,
  SyntheticModule,
  createContext,
  runInNewContext,
} from "node:vm";
import * as settings from "../tgcloud/lib/settings.js";
import { newInvoice } from "../src/invoice.js";

test("settings accept Khmer prefixes and format padding without truncating numbers", () => {
  const value = settings.validateSettings({
    ...settings.defaultSettings(),
    prefix: "ហាង-",
    nextNumber: 42,
  });
  assert.equal(settings.formatInvoiceNumber(value), "ហាង-0042");
  assert.equal(settings.formatInvoiceNumber(value, 12345), "ហាង-12345");
  assert.equal(settings.formatInvoiceNumber({ ...value, prefix: "" }), "0042");
});

test("invalid settings cannot introduce malformed counters, prefixes, or defaults", () => {
  for (const patch of [
    { nextNumber: 0 },
    { nextNumber: 1.5 },
    { nextNumber: 1e9 },
    { nextNumber: "1" },
    { padding: 7 },
    { prefix: "<script>" },
    { prefix: "x".repeat(17) },
    { currency: "XXX" },
    { tax: "-1" },
    { tax: "100.01" },
    { tax: "1.234" },
    { sellerEmail: "invalid" },
    { notes: "x\n".repeat(12) + "x" },
  ])
    assert.throws(() =>
      settings.validateSettings({ ...settings.defaultSettings(), ...patch }),
    );
});

test("new invoices inherit saved defaults while existing drafts remain unchanged", () => {
  const prefs = {
    ...settings.defaultSettings(),
    sellerName: "Test shop",
    currency: "KHR",
    tax: "10",
    notes: "Thank you",
  };
  const first = newInvoice(prefs, "SHOP-0042");
  prefs.sellerName = "Changed shop";
  const second = newInvoice(prefs, "SHOP-0043");
  assert.equal(first.sellerName, "Test shop");
  assert.equal(first.number, "SHOP-0042");
  assert.equal(second.sellerName, "Changed shop");
  assert.equal(second.currency, "KHR");
  assert.equal(second.tax, "10");
  assert.equal(second.notes, "Thank you");
  assert.equal(second.dueDate, "");
  assert.equal(second.clientName, "");
});

test("settings responses omit database identity and metadata", () => {
  assert.deepEqual(
    settings.publicSettings({
      ...settings.defaultSettings(),
      userId: 123,
      updatedAt: 1,
    }),
    settings.defaultSettings(),
  );
});

test("every settings action requires a verified Telegram identity before touching the database", async () => {
  const source = await readFile(
    new URL("../tgcloud/endpoints/settings.js", import.meta.url),
    "utf8",
  );
  const context = createContext({});
  const modules = {
    sdk: {
      db: new Proxy(
        {},
        {
          get() {
            throw new Error("Database reached");
          },
        },
      ),
      EndpointError: Error,
    },
    "sdk/db": { eq() {}, and() {}, lte() {}, sql() {} },
    "../schema.js": { userSettings: {} },
    "../lib/settings.js": settings,
  };
  const module = new SourceTextModule(source, { context });
  await module.link(
    (name) =>
      new SyntheticModule(
        Object.keys(modules[name]),
        function () {
          for (const [key, value] of Object.entries(modules[name]))
            this.setExport(key, value);
        },
        { context },
      ),
  );
  await module.evaluate();
  for (const action of ["get", "set", "next"])
    for (const ctx of [
      {},
      { initData: { user: { id: -1 } } },
      { initData: { user: { id: "123" } } },
    ])
      await assert.rejects(
        module.namespace.default({ action, userId: 123 }, ctx),
        /Open in Telegram/,
      );
});

async function counterStore() {
  const rows = new Map();
  const apply = (row, values) =>
    Object.fromEntries(
      Object.entries(values).map(([key, value]) => [
        key,
        typeof value === "function" ? value(row) : value,
      ]),
    );
  const db = {
    insert() {
      return {
        values(value) {
          return {
            onConflictDoUpdate({ set }) {
              return {
                returning() {
                  return {
                    async run() {
                      const previous = rows.get(value.userId);
                      const row = previous
                        ? { ...previous, ...apply(previous, set) }
                        : { ...value };
                      rows.set(value.userId, row);
                      return [row];
                    },
                  };
                },
              };
            },
            onConflictDoNothing() {
              return {
                async run() {
                  if (!rows.has(value.userId))
                    rows.set(value.userId, { ...value });
                },
              };
            },
          };
        },
      };
    },
    update() {
      return {
        set(values) {
          return {
            where(predicate) {
              return {
                returning() {
                  return {
                    async run() {
                      const updated = [];
                      for (const [id, row] of rows)
                        if (predicate(row)) {
                          const next = { ...row, ...apply(row, values) };
                          rows.set(id, next);
                          updated.push(next);
                        }
                      return updated;
                    },
                  };
                },
              };
            },
          };
        },
      };
    },
    select() {
      return {
        from() {
          return {
            where(predicate) {
              return {
                async get() {
                  return [...rows.values()].find(predicate);
                },
              };
            },
          };
        },
      };
    },
  };
  const context = createContext({});
  const modules = {
    sdk: { db, EndpointError: Error },
    "sdk/db": {
      eq: (column, value) => (row) => row[column] === value,
      lte: (column, value) => (row) => row[column] <= value,
      and:
        (...predicates) =>
        (row) =>
          predicates.every((predicate) => predicate(row)),
      sql: (parts, column, value) => {
        if (parts.join("?") === "max(?, ?)")
          return (row) => Math.max(row[column], value);
        if (parts.join("?") === "? + 1") return (row) => row[column] + 1;
        throw new Error("Unexpected SQL expression");
      },
    },
    "../schema.js": {
      userSettings: { userId: "userId", nextNumber: "nextNumber" },
    },
    "../lib/settings.js": settings,
  };
  const source = await readFile(
    new URL("../tgcloud/endpoints/settings.js", import.meta.url),
    "utf8",
  );
  const module = new SourceTextModule(source, { context });
  await module.link(
    (name) =>
      new SyntheticModule(
        Object.keys(modules[name]),
        function () {
          for (const [key, value] of Object.entries(modules[name]))
            this.setExport(key, value);
        },
        { context },
      ),
  );
  await module.evaluate();
  return module.namespace.default;
}

test("explicit counter reset persists at 1 and the next invoices start at 0001", async () => {
  const run = await counterStore();
  const ctx = { initData: { user: { id: 123 } } };
  const prefs = { ...settings.defaultSettings(), nextNumber: 43 };
  await run({ action: "set", settings: prefs }, ctx);
  const reset = await run(
    {
      action: "set",
      settings: { ...prefs, nextNumber: 1 },
      updateNextNumber: true,
    },
    ctx,
  );
  assert.equal(reset.settings.nextNumber, 1);
  assert.equal((await run({ action: "get" }, ctx)).settings.nextNumber, 1);
  assert.equal((await run({ action: "next" }, ctx)).number, "INV-0001");
  assert.equal((await run({ action: "next" }, ctx)).number, "INV-0002");
});

test("ordinary stale settings saves preserve a counter advanced by another device", async () => {
  const run = await counterStore();
  const ctx = { initData: { user: { id: 123 } } };
  const prefs = { ...settings.defaultSettings(), nextNumber: 43 };
  await run({ action: "set", settings: prefs }, ctx);
  await run({ action: "next" }, ctx);
  const saved = await run(
    {
      action: "set",
      settings: { ...prefs, sellerName: "Updated shop" },
      updateNextNumber: false,
    },
    ctx,
  );
  assert.equal(saved.settings.nextNumber, 44);
  assert.equal(saved.settings.sellerName, "Updated shop");
});

test("the settings form saves a deliberate reset in Telegram and browser preview", async () => {
  const source = await readFile(
    new URL("../src/main.js", import.meta.url),
    "utf8",
  );
  const saveSource = source.slice(
    source.indexOf("async function saveSettings("),
    source.indexOf("async function allocateNumber("),
  );
  for (const inTelegram of [true, false]) {
    const previous = { ...settings.defaultSettings(), nextNumber: 43 };
    const candidate = { ...previous, nextNumber: 1 };
    let stored = JSON.stringify(previous);
    const preferences = { data: previous, ready: true, loading: false };
    const save = runInNewContext(saveSource + "; saveSettings", {
      preferences,
      inTelegram,
      busy: false,
      SETTINGS_KEY: "settings",
      settingsInput: () => candidate,
      validateSettings: settings.validateSettings,
      setBusy() {},
      renderSettingsState() {},
      populateSettings() {},
      localStorage: {
        getItem: () => stored,
        setItem: (_key, value) => {
          stored = value;
        },
      },
      callEndpoint: async (name, input) => {
        assert.equal(name, "settings");
        assert.equal(input.action, "set");
        assert.equal(input.updateNextNumber, true);
        assert.equal(input.settings.nextNumber, 1);
        return { settings: input.settings };
      },
    });
    await save({ preventDefault() {} });
    assert.equal(preferences.data.nextNumber, 1);
    assert.equal(preferences.message, "settingsSaved");
    if (!inTelegram) assert.equal(JSON.parse(stored).nextNumber, 1);
  }
});
