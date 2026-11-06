import { loadLogoImage } from "./logo.js";
import { drawQrCrop } from "./qr-crop.js";
const KEY = "invoice-studio:browser-payment-qr:v1";
export function paymentQrController({
  t,
  inTelegram,
  callEndpoint,
  onChange,
  isBusy,
}) {
  const state = {
    dataUrl: null,
    image: null,
    enabled: false,
    ready: false,
    loading: true,
    message: "qrLoading",
  };
  let original = null;
  const el = (id) => document.getElementById(id);
  const notify = () => {
    render();
    onChange();
  };
  const markup = () =>
    `<section class="card qr-card"><div class="section-heading"><h2>${t("qrTitle")}</h2><span class="optional">${t("optional")}</span></div><p class="settings-help">${t("qrHelp")}</p><img id="qr-thumbnail" class="qr-thumbnail" alt="${t("qrTitle")}" hidden /><label class="qr-toggle"><input id="qr-enabled" type="checkbox" />${t("qrDisplay")}</label><div class="qr-actions"><button id="qr-upload" class="button secondary" type="button">${t("qrUpload")}</button><button id="qr-remove" class="text-button" type="button" hidden>${t("qrRemove")}</button></div><input id="qr-file" type="file" accept="image/png,image/jpeg,image/webp" hidden /><div id="qr-crop" hidden><h3>${t("qrCrop")}</h3><p class="settings-help">${t("qrCropHelp")}</p><canvas id="qr-canvas" class="qr-canvas" role="img" aria-label="${t("qrCrop")}"></canvas><label>${t("qrZoom")}<input id="qr-zoom" type="range" min="1" max="6" step="0.01" value="1" /></label><label>${t("qrHorizontal")}<input id="qr-x" type="range" min="-100" max="100" step="1" value="0" /></label><label>${t("qrVertical")}<input id="qr-y" type="range" min="-100" max="100" step="1" value="0" /></label><div class="qr-actions"><button id="qr-use" type="button" class="button primary">${t("qrUse")}</button><button id="qr-cancel" type="button" class="button secondary">${t("cancelSettings")}</button></div></div><p id="qr-status" role="status" class="logo-status"></p><button id="qr-retry" type="button" class="button secondary" hidden>${t("logoRetry")}</button><p class="settings-help">${t(inTelegram ? "qrCloud" : "qrLocal")}</p></section>`;
  function render() {
    if (!el("qr-thumbnail")) return;
    el("qr-thumbnail").hidden = !state.image;
    if (state.dataUrl) el("qr-thumbnail").src = state.dataUrl;
    else el("qr-thumbnail").removeAttribute("src");
    el("qr-enabled").checked = state.enabled;
    el("qr-enabled").disabled = !state.image || state.loading || isBusy();
    el("qr-remove").hidden = !state.image;
    for (const id of [
      "qr-remove",
      "qr-upload",
      "qr-use",
      "qr-cancel",
      "qr-zoom",
      "qr-x",
      "qr-y",
      "qr-retry",
    ])
      el(id).disabled = state.loading || isBusy();
    el("qr-status").textContent = state.message ? t(state.message) : "";
    el("qr-retry").hidden = state.ready || state.loading;
  }
  async function request(input) {
    if (inTelegram) return callEndpoint("paymentQr", input);
    const saved = JSON.parse(localStorage.getItem(KEY) || "null") || {
      dataUrl: null,
      enabled: false,
    };
    const result =
      input.action === "set"
        ? { dataUrl: input.dataUrl, enabled: true }
        : input.action === "remove"
          ? { dataUrl: null, enabled: false }
          : input.action === "toggle"
            ? { ...saved, enabled: input.enabled }
            : saved;
    if (input.action !== "get")
      localStorage.setItem(KEY, JSON.stringify(result));
    return result;
  }
  async function apply(input) {
    if (state.loading || isBusy()) return false;
    state.loading = true;
    state.message = "qrSaving";
    notify();
    try {
      const result = await request(input);
      const image = result.dataUrl ? await loadLogoImage(result.dataUrl) : null;
      Object.assign(state, result, { image, ready: true, message: "qrSaved" });
      return true;
    } catch {
      state.message = "qrError";
      return false;
    } finally {
      state.loading = false;
      notify();
    }
  }
  async function load() {
    state.loading = true;
    state.message = "qrLoading";
    notify();
    try {
      const result = await request({ action: "get" });
      const image = result.dataUrl ? await loadLogoImage(result.dataUrl) : null;
      Object.assign(state, result, { image, ready: true, message: "" });
    } catch {
      state.ready = false;
      state.message = "qrLoadError";
    } finally {
      state.loading = false;
      notify();
    }
  }
  const draw = () => {
    if (original)
      drawQrCrop(
        el("qr-canvas"),
        original,
        +el("qr-zoom").value,
        +el("qr-x").value,
        +el("qr-y").value,
      );
  };
  function bind() {
    original = null;
    el("qr-upload").onclick = () => el("qr-file").click();
    el("qr-file").onchange = async (event) => {
      const file = event.target.files[0];
      event.target.value = "";
      if (!file) return;
      if (
        !["image/png", "image/jpeg", "image/webp"].includes(file.type) ||
        !file.size ||
        file.size > 5 * 1024 * 1024
      ) {
        state.message = "qrFileError";
        render();
        return;
      }
      state.loading = true;
      state.message = "qrLoading";
      notify();
      const url = URL.createObjectURL(file);
      try {
        const image = new Image();
        await new Promise((resolve, reject) => {
          image.onload = resolve;
          image.onerror = reject;
          image.src = url;
        });
        if (
          !image.naturalWidth ||
          image.naturalWidth * image.naturalHeight > 16000000
        )
          throw Error();
        original = image;
        el("qr-zoom").value = 1;
        el("qr-x").value = el("qr-y").value = 0;
        el("qr-crop").hidden = false;
        draw();
        state.message = "";
      } catch {
        state.message = "qrFileError";
      } finally {
        URL.revokeObjectURL(url);
        state.loading = false;
        notify();
      }
    };
    for (const id of ["qr-zoom", "qr-x", "qr-y"]) el(id).oninput = draw;
    el("qr-cancel").onclick = () => {
      original = null;
      el("qr-crop").hidden = true;
    };
    el("qr-use").onclick = async () => {
      if (!original) return;
      const dataUrl = el("qr-canvas").toDataURL("image/png");
      try {
        await loadLogoImage(dataUrl);
      } catch {
        state.message = "qrFileError";
        render();
        return;
      }
      if (await apply({ action: "set", dataUrl })) {
        original = null;
        el("qr-crop").hidden = true;
      }
    };
    el("qr-remove").onclick = async () => {
      if (await apply({ action: "remove" })) {
        original = null;
        el("qr-crop").hidden = true;
      }
    };
    el("qr-enabled").onchange = () =>
      apply({ action: "toggle", enabled: el("qr-enabled").checked });
    el("qr-retry").onclick = load;
    render();
  }
  return { state, markup, bind, render, load };
}
