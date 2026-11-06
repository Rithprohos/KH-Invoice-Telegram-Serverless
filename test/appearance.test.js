import test from "node:test";
import assert from "node:assert/strict";
import { resolveAppearance } from "../src/appearance.js";

test("automatic appearance follows Telegram first, then device preference", () => {
  assert.equal(resolveAppearance("auto", "dark", false), "dark");
  assert.equal(resolveAppearance("auto", "light", true), "light");
  assert.equal(resolveAppearance("auto", undefined, true), "dark");
  assert.equal(resolveAppearance("auto", undefined, false), "light");
});

test("explicit appearance overrides host and device changes", () => {
  assert.equal(resolveAppearance("light", "dark", true), "light");
  assert.equal(resolveAppearance("dark", "light", false), "dark");
});
