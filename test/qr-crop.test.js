import test from "node:test";
import assert from "node:assert/strict";
import { cropGeometry, drawQrCrop } from "../src/qr-crop.js";
test("initial crop contains the full image with a 32 pixel white margin", () => {
  for (const [w, h] of [
    [512, 512],
    [800, 1200],
    [1200, 800],
  ]) {
    const r = cropGeometry(w, h);
    assert.ok(r.x >= 32 && r.y >= 32);
    assert.ok(r.x + r.width <= 480 && r.y + r.height <= 480);
    assert.ok(Math.abs(r.width / r.height - w / h) < 1e-12);
  }
});
test("crop positions and zoom adjust without stretching and preserve a white border", () => {
  const r = cropGeometry(800, 1200, 2, 20, -30);
  assert.ok(Math.abs(r.width / r.height - 800 / 1200) < 1e-12);
  assert.ok(r.width > 448);
  const calls = [];
  const ctx = new Proxy(
    {},
    {
      get(_target, name) {
        return (...args) => calls.push([name, ...args]);
      },
      set() {
        return true;
      },
    },
  );
  const canvas = {
    getContext() {
      return ctx;
    },
  };
  drawQrCrop(canvas, { naturalWidth: 800, naturalHeight: 1200 }, 2, 20, -30);
  assert.equal(canvas.width, 512);
  assert.equal(canvas.height, 512);
  assert.deepEqual(
    calls.find((c) => c[0] === "fillRect"),
    ["fillRect", 0, 0, 512, 512],
  );
  assert.deepEqual(
    calls.find((c) => c[0] === "rect"),
    ["rect", 32, 32, 448, 448],
  );
  assert.ok(
    calls.findIndex((c) => c[0] === "clip") <
      calls.findIndex((c) => c[0] === "drawImage"),
  );
});
