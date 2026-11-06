import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { SourceTextModule, SyntheticModule, createContext } from "node:vm";
import { decodePng } from "../tgcloud/lib/image.js";

const png =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=";
const source = await readFile(
  new URL("../tgcloud/endpoints/prepareInvoice.js", import.meta.url),
  "utf8",
);

async function endpoint(api) {
  // Exercise the actual module with an isolated SDK double; never contact Telegram.
  class EndpointError extends Error {}
  class BotApiError extends Error {}
  class InputFile {
    constructor(bytes, name, options) {
      Object.assign(this, { bytes, name, options });
    }
  }
  const context = createContext({ console: { warn() {} } });
  const sdk = new SyntheticModule(
    ["api", "InputFile", "EndpointError", "BotApiError"],
    function () {
      for (const [name, value] of Object.entries({
        api,
        InputFile,
        EndpointError,
        BotApiError,
      }))
        this.setExport(name, value);
    },
    { context },
  );
  const image = new SyntheticModule(
    ["decodePng"],
    function () {
      this.setExport("decodePng", decodePng);
    },
    { context },
  );
  const module = new SourceTextModule(source, { context });
  await module.link((name) => (name === "sdk" ? sdk : image));
  await module.evaluate();
  return { run: module.namespace.default, EndpointError };
}

test("sharing uses authenticated user, ignoring client-provided destinations", async () => {
  const calls = [];
  const { run } = await endpoint({
    async sendPhoto(input) {
      calls.push(input);
      return { message_id: 42, photo: [{ file_id: "cached_photo" }] };
    },
    async savePreparedInlineMessage(input) {
      calls.push(input);
      return { id: "prepared_invoice" };
    },
  });
  const result = await run(
    { imageBase64: png, caption: "Invoice", userId: 999, chat_id: 999 },
    { initData: { user: { id: 123 } } },
  );
  assert.equal(calls[0].chat_id, 123);
  assert.equal(calls[1].user_id, 123);
  assert.equal(calls[1].result.photo_file_id, "cached_photo");
  assert.equal(result.preparedId, "prepared_invoice");
});

test("missing identity and malformed images cannot call the Bot API", async () => {
  let calls = 0;
  const { run, EndpointError } = await endpoint({
    async sendPhoto() {
      calls++;
    },
  });
  await assert.rejects(run({ imageBase64: png }, {}), EndpointError);
  await assert.rejects(
    run({ imageBase64: "invalid" }, { initData: { user: { id: 123 } } }),
    EndpointError,
  );
  assert.equal(calls, 0);
});

test("saving delivers one image to the authenticated user without preparing a share", async () => {
  const recipients = [];
  let prepared = 0;
  const { run } = await endpoint({
    async sendPhoto(input) {
      recipients.push(input.chat_id);
      return { message_id: 42, photo: [{ file_id: "saved_photo" }] };
    },
    async savePreparedInlineMessage() {
      prepared++;
    },
  });
  const result = await run(
    { imageBase64: png, prepareShare: false, chat_id: 999 },
    { initData: { user: { id: 123 } } },
  );
  assert.deepEqual(recipients, [123]);
  assert.equal(prepared, 0);
  assert.equal(result.delivered, true);
});

test("a failed photo send cannot be reported as a successful save", async () => {
  const failure = new Error("Network unavailable");
  const { run } = await endpoint({
    async sendPhoto() {
      throw failure;
    },
  });
  await assert.rejects(
    run(
      { imageBase64: png, prepareShare: false },
      { initData: { user: { id: 123 } } },
    ),
    (error) => error === failure,
  );
});

test("prepared sharing failure preserves the successful bot-chat delivery", async () => {
  let sent = 0;
  const { run } = await endpoint({
    async sendPhoto() {
      sent++;
      return { message_id: 42, photo: [{ file_id: "cached_photo" }] };
    },
    async savePreparedInlineMessage() {
      throw new Error("Unavailable");
    },
  });
  const result = await run(
    { imageBase64: png },
    { initData: { user: { id: 123 } } },
  );
  assert.equal(sent, 1);
  assert.equal(result.preparedId, null);
});
