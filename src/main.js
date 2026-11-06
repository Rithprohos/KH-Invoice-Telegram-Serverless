import "@fontsource-variable/kantumruy-pro";
import "@fontsource/moul";
import "./style.css";
import { appearanceController } from "./appearance.js";
import {
  calculate,
  money,
  newInvoice,
  restoreInvoice,
  validateInvoice,
} from "./invoice.js";
import { paymentQrController } from "./payment-qr.js";
import { renderInvoice } from "./render-invoice.js";
import { text } from "./i18n.js";
import { loadLogoImage, normalizeLogo } from "./logo.js";
import {
  defaultSettings,
  validateSettings,
  formatInvoiceNumber,
  MAX_INVOICE_NUMBER,
} from "../tgcloud/lib/settings.js";

const STORAGE_KEY = "invoice-studio:draft:v1";
const LANGUAGE_KEY = "invoice-studio:language";
let hadDraft = false,
  draftTouched = false;
let invoice = newInvoice(),
  language = "km",
  view = "edit";
try {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    invoice = restoreInvoice(JSON.parse(saved));
    hadDraft = true;
  }
  if (localStorage.getItem(LANGUAGE_KEY) === "en") language = "en";
} catch {
  /* Editing is still available without device storage. */
}
const tg = window.Telegram?.WebApp,
  inTelegram = Boolean(tg?.initData);
if (inTelegram) {
  tg.ready();
  tg.expand();
}
const appearance = appearanceController(inTelegram ? tg : null);
const mobile = matchMedia("(max-width: 760px)");
const t = (key) => text(language, key);
const formatMoney = (value) => money(value, invoice.currency, language);
const SETTINGS_KEY = "invoice-studio:browser-settings:v1";
const preferences = {
  data: defaultSettings(),
  ready: false,
  loading: true,
  configured: false,
  message: "settingsLoading",
};
const LOCAL_LOGO_KEY = "invoice-studio:browser-logo:v1";
// Telegram logos are loaded from the verified-user endpoint, never a shared local cache.
const logo = {
  dataUrl: null,
  image: null,
  loading: true,
  ready: false,
  message: "logoLoading",
};
let form,
  canvas,
  status,
  share,
  downloadButton,
  dockObserver,
  fontsLoaded = false,
  busy = false;

const qr = paymentQrController({
  t,
  inTelegram,
  callEndpoint,
  isBusy: () => busy,
  onChange: () => {
    update();
    setBusy(busy);
  },
});

function mount() {
  document.documentElement.lang = language;
  document.title =
    language === "km" ? `${t("app")} · Invoice Studio` : "Invoice Studio";
  document.querySelector("#app").innerHTML = `
    <header class="topbar"><div class="brand"><span class="brand-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 3h9l4 4v14H6zM14 3v5h5M9 12h7M9 16h7"/></svg></span><span>${t("app")}</span></div><div class="header-actions"><button class="button subtle" id="new-invoice" type="button" aria-label="${t("newInvoice")}">＋ ${t("newShort")}</button><button class="settings-trigger" id="open-settings" type="button" aria-label="${t("settings")}" title="${t("settings")}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m10 3-.7 2.3-2 .9L5 5.6 3 9l1.6 1.8v2.4L3 15l2 3.4 2.3-.6 2 .9L10 21h4l.7-2.3 2-.9 2.3.6 2-3.4-1.6-1.8v-2.4L21 9l-2-3.4-2.3.6-2-.9L14 3z"/><circle cx="12" cy="12" r="3"/></svg></button></div></header>
    <main><h1 class="sr-only">${t("title")}</h1>
      <nav class="view-tabs" role="tablist" aria-label="${t("view")}">${["edit", "items", "preview"].map((step, index) => `<button role="tab" id="${step}-tab" aria-controls="${step === "preview" ? "preview-panel" : step === "items" ? "items-step" : "details-step"}" type="button"><span class="step-number" aria-hidden="true">${index + 1}</span>${t(step === "edit" ? "stepCustomer" : step === "items" ? "stepItems" : "preview")}</button>`).join("")}</nav>
      <div class="workspace">
        <form id="invoice-form" class="editor"><div class="business-summary" data-step="edit"><div><span>${t("from")}</span><strong id="business-summary-name"></strong></div><button id="business-settings" class="text-button" type="button">${t("settings")}</button></div><p id="preferences-banner" class="preferences-banner" role="status"></p>

          <section class="card" id="details-step" data-step="edit"><div class="section-heading"><h2>${t("customerStepTitle")}</h2><span id="save-state" class="save-state" role="status"></span></div><p class="step-hint">${t("customerStepHint")}</p>
            <div class="invoice-customer">${partyFields("client", "billTo", "customer", "customerPlaceholder")}</div>
            <details class="invoice-meta"><summary><span>${t("essentials")}</span><span id="invoice-meta-summary"></span></summary><div class="fields three"><label>${t("number")}<input name="number" maxlength="40" required /></label><label>${t("date")}<input name="date" type="date" required /></label><label>${t("dueDate")} <span class="optional">${t("optional")}</span><input name="dueDate" type="date" /></label></div></details>
            <details class="sender-override"><summary>${t("senderOverride")}</summary>${partyFields("seller", "from", "seller", "sellerPlaceholder")}</details>
          </section>
          <section class="card" id="items-step" data-step="items"><div class="section-heading"><h2>${t("items")}</h2><label class="currency-label"><span class="sr-only">${t("currency")}</span><select name="currency"><option>USD</option><option>KHR</option><option>EUR</option><option>GBP</option><option>THB</option></select></label></div><p class="step-hint">${t("itemsStepHint")}</p>
            <div id="items"></div><button class="add-item" id="add-item" type="button">＋ ${t("addItem")}</button>
            <div class="calculation"><label>${t("tax")} (%)<input name="tax" type="number" min="0" max="100" step="0.01" inputmode="decimal" required /></label><dl><div><dt>${t("subtotal")}</dt><dd id="subtotal"></dd></div><div><dt>${t("tax")}</dt><dd id="tax-total"></dd></div><div class="total"><dt>${t("total")}</dt><dd id="total"></dd></div></dl></div>
          </section>
          <details class="card notes-section" data-step="items"><summary>${t("notesTitle")}<span class="optional">${t("optional")}</span></summary><label><span class="sr-only">${t("notes")}</span><textarea name="notes" rows="3" maxlength="600" placeholder="${t("notesPlaceholder")}"></textarea></label></details>
          <p class="privacy-note">${t("privacy")}</p>
        </form>
        <div class="preview-column"><section class="preview-panel" id="preview-panel"><div class="preview-heading"><h2>${t("preview")}</h2><span class="preview-tag">PNG</span><button id="theme-toggle" class="theme-toggle" type="button" aria-controls="preview-themes" aria-expanded="false"><span id="theme-current"></span><span aria-hidden="true">⌄</span></button></div>${themePicker()}<div class="paper-wrap"><canvas id="invoice-canvas" role="img" aria-label="${t("preview")}"></canvas></div><p class="helper">${t(inTelegram ? "shareHelpTelegram" : "shareHelpBrowser")}</p></section>      <section class="action-dock" aria-label="${t("invoice")}"><div class="dock-summary"><span>${t("total")}</span><strong id="dock-total"></strong></div><div class="step-actions"><button id="step-back" type="button" class="button secondary">${t("back")}</button><button id="step-next" type="button" class="button primary"></button></div><div class="action-buttons"><button id="download" type="button" class="button secondary" disabled>↓ ${t(inTelegram ? "saveToChat" : "save")}</button><button id="share" type="button" class="button primary" disabled>↗ ${t("share")}</button></div>${inTelegram ? `<button id="download-local" type="button" class="local-download" disabled>${t("downloadFile")}</button>` : ""}<p id="status" class="status" role="status" aria-live="polite"></p></section></div>
      </div>

    </main>
    ${settingsMarkup()}
    <dialog id="reset-dialog"><h2>${t("resetTitle")}</h2><p>${t("resetBody")}</p><div class="dialog-actions"><button class="button secondary" id="cancel-reset">${t("cancelReset")}</button><button class="button primary" id="confirm-reset">${t("newInvoice")}</button></div></dialog>`;
  form = document.querySelector("#invoice-form");
  canvas = document.querySelector("#invoice-canvas");
  status = document.querySelector("#status");
  share = document.querySelector("#share");
  downloadButton = document.querySelector("#download");
  const appearanceSelect = document.querySelector("#appearance");
  appearanceSelect.value = appearance.value;
  appearanceSelect.addEventListener("change", () =>
    appearance.set(appearanceSelect.value),
  );
  const languageSelect = document.querySelector("#language");
  languageSelect.value = language;
  languageSelect.addEventListener("change", () => {
    const wasOpen = document.querySelector("#settings-dialog").open;
    const pendingSettings = wasOpen ? settingsInput() : null;
    const openSections = [
      ...document.querySelectorAll(".settings-section[open]"),
    ].map((section) => section.id);
    language = languageSelect.value;
    try {
      localStorage.setItem(LANGUAGE_KEY, language);
    } catch {
      /* Optional. */
    }
    mount();
    if (wasOpen) {
      for (const [key, value] of Object.entries(pendingSettings))
        document.querySelector("#settings-form").elements.namedItem(key).value =
          value;
      for (const id of openSections) document.getElementById(id).open = true;
      updateNumberExample();
      document.querySelector("#settings-dialog").showModal();
    }
    document.querySelector("#language").focus();
  });
  for (const [key, value] of Object.entries(invoice)) {
    const control = form.elements.namedItem(key);
    if (control) control.value = value;
  }
  bindThemePicker();
  form.addEventListener("submit", (event) => event.preventDefault());
  form.addEventListener("input", (event) => {
    const { target } = event;
    draftTouched = true;
    target.setCustomValidity?.("");
    if (target.dataset.field)
      invoice.items[Number(target.dataset.index)][target.dataset.field] =
        target.value;
    else if (target.name) invoice[target.name] = target.value;
    status.textContent = "";
    update();
  });
  document.querySelector("#add-item").addEventListener("click", () => {
    if (invoice.items.length >= 20) return;
    invoice.items.push({ description: "", quantity: "1", rate: "0.00" });
    renderItems();
    update();
    document
      .querySelector("#items")
      .lastElementChild.querySelector("input")
      .focus();
  });
  const steps = ["edit", "items", "preview"];
  for (const [index, name] of steps.entries()) {
    const tab = document.querySelector(`#${name}-tab`);
    tab.addEventListener("click", () => navigateStep(name));
    tab.addEventListener("keydown", (event) => {
      if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
        event.preventDefault();
        const next =
          event.key === "Home"
            ? 0
            : event.key === "End"
              ? 2
              : (index + (event.key === "ArrowRight" ? 1 : 2)) % 3;
        navigateStep(steps[next]);
        document.querySelector(`#${steps[next]}-tab`).focus();
      }
    });
  }
  document.querySelector("#step-next").addEventListener("click", () => {
    if (valid(view === "edit" ? "edit" : null))
      navigateStep(view === "edit" ? "items" : "preview");
  });
  document
    .querySelector("#step-back")
    .addEventListener("click", () =>
      navigateStep(view === "preview" ? "items" : "edit"),
    );
  document.querySelector(".invoice-meta").open = !mobile.matches;
  if (!invoice.sellerName)
    document.querySelector(".sender-override").open = true;
  const dialog = document.querySelector("#reset-dialog");
  document
    .querySelector("#new-invoice")
    .addEventListener("click", () => dialog.showModal());
  document
    .querySelector("#cancel-reset")
    .addEventListener("click", () => dialog.close());
  document
    .querySelector("#confirm-reset")
    .addEventListener("click", async () => {
      dialog.close();
      await createNextInvoice();
    });
  bindSettings();
  qr.bind();
  downloadButton.addEventListener("click", () => saveImage());
  document
    .querySelector("#download-local")
    ?.addEventListener("click", () => saveImage(true));
  share.addEventListener("click", shareInvoice);
  document
    .querySelector("#upload-logo")
    .addEventListener("click", () =>
      document.querySelector("#logo-file").click(),
    );
  document.querySelector("#logo-file").addEventListener("change", uploadLogo);
  document.querySelector("#remove-logo").addEventListener("click", removeLogo);
  document.querySelector("#retry-logo").addEventListener("click", loadLogo);
  dockObserver?.disconnect();
  dockObserver = new ResizeObserver(() =>
    document.documentElement.style.setProperty(
      "--dock-height",
      `${document.querySelector(".action-dock").getBoundingClientRect().height}px`,
    ),
  );
  dockObserver.observe(document.querySelector(".action-dock"));
  renderItems();
  update();
  setView(view);
  setBusy(busy);
}
function partyFields(prefix, heading, name, placeholder) {
  return `<div class="party"><h3>${t(heading)}</h3><label>${t(name)}<input name="${prefix}Name" placeholder="${t(placeholder)}" maxlength="100" required /></label><details><summary>${t("contactDetails")} <span class="optional">· ${t("optional")}</span></summary><label>${t("email")}<input name="${prefix}Email" type="email" inputmode="email" placeholder="name@example.com" maxlength="120" /></label><label>${t("address")}<textarea name="${prefix}Address" rows="2" maxlength="240" placeholder="${t("addressPlaceholder")}"></textarea></label></details></div>`;
}
function renderItems() {
  const container = document.querySelector("#items");
  container.replaceChildren();
  invoice.items.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "item-row";
    const heading = document.createElement("div");
    heading.className = "item-heading";
    const title = document.createElement("span");
    title.textContent = `${t("item")} ${index + 1}`;
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "remove-item";
    remove.textContent = "×";
    remove.setAttribute("aria-label", `${t("remove")} ${index + 1}`);
    remove.disabled = invoice.items.length === 1;
    remove.addEventListener("click", () => {
      invoice.items.splice(index, 1);
      renderItems();
      update();
    });
    heading.append(title, remove);
    row.append(heading);
    for (const key of ["description", "quantity", "rate"]) {
      const label = document.createElement("label");
      label.className = `item-${key}`;
      label.textContent = t(key);
      const input = document.createElement("input");
      input.value = item[key];
      input.dataset.index = index;
      input.dataset.field = key;
      input.setAttribute("aria-label", `${t(key)}, ${t("item")} ${index + 1}`);
      input.required = true;
      if (key === "description") {
        input.placeholder = t("itemPlaceholder");
        input.maxLength = 140;
      } else {
        input.type = "number";
        input.min = key === "quantity" ? "1" : "0";
        input.max = key === "quantity" ? "999" : "10000000";
        input.step = key === "quantity" ? "1" : "0.01";
        input.inputMode = key === "quantity" ? "numeric" : "decimal";
      }
      label.append(input);
      row.append(label);
    }
    container.append(row);
  });
  document.querySelector("#add-item").disabled = invoice.items.length >= 20;
}
function update() {
  document.querySelector("#theme-current").textContent =
    `${t("themeLabel")}: ${invoice.theme === "og" ? "OG" : t("themeModern")}`;
  const totals = calculate(invoice);
  for (const [id, value] of [
    ["subtotal", totals.subtotal],
    ["tax-total", totals.tax],
    ["total", totals.total],
    ["dock-total", totals.total],
  ])
    document.getElementById(id).textContent = formatMoney(value);
  renderInvoice(
    canvas,
    invoice,
    language,
    logo.image,
    qr.state.enabled ? qr.state.image : null,
  );
  document.querySelector("#invoice-meta-summary").textContent =
    invoice.number || "—";
  renderLogoControls();
  document.querySelector("#business-summary-name").textContent =
    invoice.sellerName || t("setupBusiness");
  renderSettingsState();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(invoice));
    document.querySelector("#save-state").textContent = t("saved");
  } catch {
    document.querySelector("#save-state").textContent = t("unsaved");
  }
}
function navigateStep(next) {
  if (busy) return;
  setView(next);
  if (mobile.matches) {
    document.activeElement?.blur();
    window.scrollTo({ top: 0, behavior: "instant" });
  }
}
function setView(next) {
  view = next;
  document.documentElement.dataset.invoiceStep = view;
  setThemePicker(false);
  form.hidden = mobile.matches && view === "preview";
  document.querySelector("#preview-panel").hidden =
    mobile.matches && view !== "preview";
  for (const section of document.querySelectorAll("[data-step]"))
    section.hidden = mobile.matches && section.dataset.step !== view;
  for (const name of ["edit", "items", "preview"]) {
    const tab = document.querySelector(`#${name}-tab`);
    tab.setAttribute("aria-selected", String(view === name));
    tab.tabIndex = view === name ? 0 : -1;
    const panel = document.querySelector(
      name === "preview"
        ? "#preview-panel"
        : name === "items"
          ? "#items-step"
          : "#details-step",
    );
    if (mobile.matches) {
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", `${name}-tab`);
    } else {
      panel.removeAttribute("role");
      panel.removeAttribute("aria-labelledby");
    }
  }
  document.querySelector("#step-back").hidden = view === "edit";
  document.querySelector("#step-next").hidden = view === "preview";
  document.querySelector("#step-next").textContent = t(
    view === "edit" ? "continueItems" : "reviewInvoice",
  );
}
mobile.addEventListener("change", () => setView(view));
function updateKeyboardState() {
  const editing = /^(INPUT|TEXTAREA|SELECT)$/.test(
    document.activeElement?.tagName,
  );
  document.documentElement.classList.toggle(
    "keyboard-open",
    mobile.matches &&
      editing &&
      window.visualViewport &&
      innerHeight - window.visualViewport.height > 150,
  );
}
window.visualViewport?.addEventListener("resize", updateKeyboardState);
document.addEventListener("focusin", updateKeyboardState);
document.addEventListener("focusout", () =>
  requestAnimationFrame(updateKeyboardState),
);
function setBusy(value) {
  busy = value;
  const blocked =
    busy ||
    !fontsLoaded ||
    logo.loading ||
    !logo.ready ||
    qr.state.loading ||
    !qr.state.ready ||
    !preferences.ready ||
    preferences.loading;
  share.disabled = blocked;
  downloadButton.disabled = blocked;
  document
    .querySelector("#download-local")
    ?.toggleAttribute("disabled", blocked);
  document.querySelector("#language").disabled = busy;
  document.querySelector("#new-invoice").disabled =
    busy || !preferences.ready || preferences.loading;
  document.querySelector("#confirm-reset").disabled = busy;
  form.inert = busy;
  for (const button of document.querySelectorAll(
    ".view-tabs button, .step-actions button",
  ))
    button.disabled = busy;
  document.querySelector("#preview-themes").disabled = busy;
  document.querySelector("#theme-toggle").disabled = busy;
  document.querySelector("#settings-fields").disabled =
    busy || preferences.loading;
  document.querySelector("#save-settings").disabled =
    busy || preferences.loading || !preferences.ready;
  document.querySelector("#close-settings").disabled = busy;
  document.querySelector("#cancel-settings").disabled = busy;
  renderLogoControls();
  qr.render();
}
function renderLogoControls() {
  const thumbnail = document.querySelector("#logo-thumbnail");
  thumbnail.hidden = !logo.image;
  if (logo.dataUrl) thumbnail.src = logo.dataUrl;
  else thumbnail.removeAttribute("src");
  document.querySelector("#logo-placeholder").hidden = Boolean(logo.image);
  const upload = document.querySelector("#upload-logo");
  upload.textContent = t(logo.image ? "logoReplace" : "logoUpload");
  upload.disabled = busy || logo.loading;
  const remove = document.querySelector("#remove-logo");
  remove.hidden = !logo.image;
  remove.disabled = busy || logo.loading;
  const retry = document.querySelector("#retry-logo");
  retry.hidden =
    logo.loading || (logo.ready && logo.message !== "logoSaveError");
  retry.disabled = busy;
  document.querySelector("#logo-status").textContent = logo.message
    ? t(logo.message)
    : "";
}
async function logoRequest(input) {
  if (!tg?.Serverless?.call) throw new Error("logoLoadError");
  return callEndpoint("logo", input);
}
async function loadLogo() {
  logo.loading = true;
  logo.message = "logoLoading";
  setBusy(busy);
  try {
    const dataUrl = inTelegram
      ? (await logoRequest({ action: "get" })).dataUrl
      : localStorage.getItem(LOCAL_LOGO_KEY);
    const image = dataUrl ? await loadLogoImage(dataUrl) : null;
    Object.assign(logo, {
      dataUrl,
      image,
      ready: true,
      message: dataUrl
        ? inTelegram
          ? "logoCloudSaved"
          : "logoLocalSaved"
        : "",
    });
  } catch {
    logo.ready = !inTelegram;
    logo.message = inTelegram ? "logoLoadError" : "logoLocalError";
  } finally {
    logo.loading = false;
    update();
    setBusy(busy);
  }
}
async function uploadLogo(event) {
  const file = event.target.files?.[0];
  event.target.value = "";
  if (!file || busy || logo.loading) return;
  logo.loading = true;
  logo.message = "logoSaving";
  setBusy(busy);
  try {
    const normalized = await normalizeLogo(file);
    if (inTelegram)
      await logoRequest({ action: "set", dataUrl: normalized.dataUrl });
    else localStorage.setItem(LOCAL_LOGO_KEY, normalized.dataUrl);
    Object.assign(logo, normalized, {
      ready: true,
      message: inTelegram ? "logoCloudSaved" : "logoLocalSaved",
    });
  } catch (error) {
    const known = ["logoInvalid", "logoTypeError", "logoSizeError"];
    logo.message = known.includes(error.message)
      ? error.message
      : error.parameters?.code === "INVALID_LOGO"
        ? "logoInvalid"
        : "logoSaveError";
  } finally {
    logo.loading = false;
    update();
    setBusy(busy);
  }
}
async function removeLogo() {
  if (busy || logo.loading) return;
  logo.loading = true;
  logo.message = "logoSaving";
  setBusy(busy);
  try {
    if (inTelegram) await logoRequest({ action: "remove" });
    else localStorage.removeItem(LOCAL_LOGO_KEY);
    Object.assign(logo, {
      dataUrl: null,
      image: null,
      ready: true,
      message: "logoRemoved",
    });
  } catch {
    logo.message = "logoSaveError";
  } finally {
    logo.loading = false;
    update();
    setBusy(busy);
  }
}
function valid(step = null) {
  for (const control of form.elements) {
    if (step && control.closest("[data-step]")?.dataset.step !== step) continue;
    if (!control.setCustomValidity) continue;
    control.setCustomValidity("");
    if (
      control.validity.valueMissing ||
      (control.required && !control.value.trim())
    )
      control.setCustomValidity(t("required"));
    else if (control.validity.typeMismatch)
      control.setCustomValidity(t("invalidEmail"));
    else if (!control.validity.valid)
      control.setCustomValidity(t("invalidNumber"));
    if (!control.validity.valid) {
      setView(control.closest("[data-step]")?.dataset.step || "edit");
      for (
        let parent = control.parentElement;
        parent;
        parent = parent.parentElement
      )
        if (parent.tagName === "DETAILS") parent.open = true;
      control.reportValidity();
      control.focus();
      return false;
    }
  }
  if (step) return true;
  const error = validateInvoice(invoice, language);
  if (error) {
    setView("edit");
    status.textContent = error;
    return false;
  }
  return true;
}
function filename() {
  return `invoice-${invoice.number.replace(/[^a-zA-Z0-9_-]/g, "_") || "export"}.png`;
}
function blobFromCanvas() {
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error(t("imageError")))),
      "image/png",
    ),
  );
}
async function download() {
  const blob = await blobFromCanvas(),
    url = URL.createObjectURL(blob),
    link = document.createElement("a");
  link.href = url;
  link.download = filename();
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
  status.textContent = t("downloading");
}
async function saveImage(downloadOnly = false) {
  if (
    !valid() ||
    !fontsLoaded ||
    busy ||
    logo.loading ||
    !logo.ready ||
    qr.state.loading ||
    !qr.state.ready ||
    !preferences.ready ||
    preferences.loading
  )
    return;
  setBusy(true);
  try {
    if (inTelegram && !downloadOnly) {
      await sendToBot(false);
      status.textContent = t("savedToChat");
    } else await download();
  } catch (error) {
    showActionError(
      error,
      inTelegram && !downloadOnly ? "saveError" : "imageError",
    );
  } finally {
    setBusy(false);
  }
}
function callEndpoint(name, input) {
  return new Promise((resolve, reject) =>
    tg.Serverless.call(name, input, (error, result) =>
      error ? reject(error) : resolve(result),
    ),
  );
}
async function sendToBot(prepareShare) {
  // Snapshot the image and caption before opening Telegram's permission prompt.
  const imageBase64 = canvas.toDataURL("image/png").split(",")[1];
  const caption = `${t("invoice")} ${invoice.number} · ${invoice.sellerName}\n${t("total")}: ${formatMoney(calculate(invoice).total)}`;
  if (!tg.Serverless?.call) throw new Error(t("updateTelegram"));
  if (
    !tg.initDataUnsafe?.user?.allows_write_to_pm &&
    tg.isVersionAtLeast("6.9")
  ) {
    const allowed = await new Promise((resolve) =>
      tg.requestWriteAccess(resolve),
    );
    if (!allowed) throw new Error(t("allowMessages"));
  }
  status.textContent = t("sending");
  return callEndpoint("prepareInvoice", { imageBase64, caption, prepareShare });
}
function showActionError(error, fallback) {
  const codes = {
    OPEN_TELEGRAM: "openTelegram",
    INVALID_IMAGE: "imageTooLarge",
    START_BOT: "startBot",
  };
  const key = codes[error.parameters?.code];
  status.textContent =
    error.name === "AbortError"
      ? t("cancelled")
      : key
        ? t(key)
        : error.type || error.status
          ? t(fallback)
          : error.message || t(fallback);
}
async function shareInvoice() {
  if (
    !valid() ||
    !fontsLoaded ||
    busy ||
    logo.loading ||
    !logo.ready ||
    qr.state.loading ||
    !qr.state.ready ||
    !preferences.ready ||
    preferences.loading
  )
    return;
  const fileName = filename();
  setBusy(true);
  status.textContent = "";
  try {
    if (inTelegram) {
      const result = await sendToBot(true);
      if (result.preparedId && tg.isVersionAtLeast("8.0")) {
        status.textContent = t("chooseChat");
        const sent = await new Promise((resolve) =>
          tg.shareMessage(result.preparedId, resolve),
        );
        status.textContent = t(sent ? "sent" : "shareClosed");
      } else status.textContent = t("forwardCopy");
    } else {
      const blob = await blobFromCanvas(),
        file = new File([blob], fileName, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: t("invoice") });
        status.textContent = t("deviceShared");
      } else {
        await download();
        status.textContent = t("attachImage");
      }
    }
  } catch (error) {
    showActionError(error, "shareError");
  } finally {
    setBusy(false);
  }
}
mount();
loadLogo();
qr.load();
loadSettings();
// Explicitly load both writing systems and weights before enabling image export.
Promise.all([
  document.fonts.load(
    '400 28px "Moul"',
    "\u179c\u17b7\u1780\u17d2\u1780\u1799\u1794\u178f\u17d2\u179a Invoice",
  ),
  ...[400, 700].map((weight) =>
    document.fonts.load(
      `${weight} 18px "Kantumruy Pro Variable"`,
      "វិក្កយបត្រ Invoice",
    ),
  ),
])
  .then(() => {
    fontsLoaded = true;
    update();
    setBusy(busy);
  })
  .catch(() => {
    status.textContent = t("fontError");
  });

function logoMarkup() {
  return `<section class="card logo-card"><div class="section-heading"><h2>${t("logoTitle")}</h2><span class="optional">${t("optional")}</span></div><div class="logo-row"><div class="logo-thumbnail"><img id="logo-thumbnail" alt="${t("logoTitle")}" hidden /><span id="logo-placeholder" aria-hidden="true">▧</span></div><div class="logo-actions"><button id="upload-logo" class="button secondary" type="button">${t("logoUpload")}</button><button id="remove-logo" class="logo-remove" type="button" hidden>${t("logoRemove")}</button></div></div><input id="logo-file" type="file" accept="image/png,image/jpeg,image/webp" hidden /><p class="logo-help">${t(inTelegram ? "logoCloudHelp" : "logoBrowserHelp")}</p><p id="logo-status" class="logo-status" role="status"></p><button id="retry-logo" type="button" class="button subtle" hidden>${t("logoRetry")}</button></section>`;
}

function settingsMarkup() {
  return `<dialog id="settings-dialog" class="settings-dialog" aria-labelledby="settings-title">
    <header class="settings-header"><div><h2 id="settings-title">${t("settings")}</h2><p>${t(inTelegram ? "settingsCloudHint" : "settingsLocalHint")}</p></div><button id="close-settings" class="settings-close" type="button" aria-label="${t("closeSettings")}">×</button></header>
    <div class="settings-body">
      <label class="settings-language"><span>${t("appearance")}</span><select id="appearance"><option value="auto">${t("appearanceAuto")}</option><option value="light">${t("appearanceLight")}</option><option value="dark">${t("appearanceDark")}</option></select></label><p class="appearance-help">${t("appearanceHelp")}</p>
      <label class="settings-language"><span>${t("language")}</span><select id="language"><option value="km" lang="km">ខ្មែរ</option><option value="en" lang="en">English</option></select></label>
      <details class="settings-section" id="logo-settings-section"><summary>${t("logoTitle")}</summary>${logoMarkup()}<p class="settings-logo-note">${t("logoImmediate")}</p></details>
      <details class="settings-section" id="qr-settings-section"><summary>${t("qrTitle")}</summary>${qr.markup()}</details>
      <form id="settings-form"><fieldset id="settings-fields">
        <details class="settings-section" id="business-settings-section"><summary>${t("businessDetails")}</summary><section class="card"><label>${t("seller")}<input name="sellerName" maxlength="100" placeholder="${t("sellerPlaceholder")}" /></label><label>${t("email")}<input name="sellerEmail" type="email" maxlength="120" inputmode="email" placeholder="name@example.com" /></label><label>${t("address")}<textarea name="sellerAddress" rows="2" maxlength="240" placeholder="${t("addressPlaceholder")}"></textarea></label></section></details>
        <details class="settings-section" id="numbering-settings-section"><summary>${t("numbering")}</summary><section class="card"><div class="settings-grid"><label>${t("numberPrefix")}<input name="prefix" maxlength="16" placeholder="INV-" autocapitalize="characters" /></label><label>${t("numberDigits")}<select name="padding"><option value="3">001</option><option value="4">0001</option><option value="5">00001</option><option value="6">000001</option></select></label></div><label>${t("nextNumber")}<input name="nextNumber" type="number" min="1" max="999999999" step="1" inputmode="numeric" required /></label><div class="number-example"><span>${t("numberPreview")}</span><strong id="number-example"></strong></div><p class="settings-help">${t("numberingHelp")}</p></section></details>
        <details class="settings-section" id="defaults-settings-section"><summary>${t("invoiceDefaults")}</summary><section class="card"><label>${t("defaultTheme")}<select name="theme"><option value="modern">${t("themeModern")}</option><option value="og">${t("themeOg")}</option></select></label><div class="settings-grid"><label>${t("currency")}<select name="currency"><option>USD</option><option>KHR</option><option>EUR</option><option>GBP</option><option>THB</option></select></label><label>${t("tax")} (%)<input name="tax" type="number" min="0" max="100" step="0.01" inputmode="decimal" required /></label></div><label>${t("notes")}<textarea name="notes" rows="3" maxlength="600" placeholder="${t("notesPlaceholder")}"></textarea></label></section></details>
      </fieldset></form>
      <button id="retry-settings" class="button secondary" type="button" hidden>${t("retrySettings")}</button>
    </div>
    <footer class="settings-footer"><p id="settings-status" class="settings-status" role="status"></p><p>${t("defaultsHelp")}</p><div><button id="cancel-settings" type="button" class="button secondary">${t("cancelSettings")}</button><button id="save-settings" type="submit" form="settings-form" class="button primary">${t("saveSettings")}</button></div></footer>
  </dialog>`;
}
function bindSettings() {
  const dialog = document.querySelector("#settings-dialog");
  const open = () => {
    populateSettings();
    if (!qr.state.ready)
      document.querySelector("#qr-settings-section").open = true;
    if (!logo.ready)
      document.querySelector("#logo-settings-section").open = true;
    dialog.showModal();
  };
  document.querySelector("#open-settings").addEventListener("click", open);
  document.querySelector("#business-settings").addEventListener("click", () => {
    open();
    document.querySelector("#business-settings-section").open = true;
  });
  for (const id of ["close-settings", "cancel-settings"])
    document.getElementById(id).addEventListener("click", () => dialog.close());
  dialog.addEventListener("cancel", (event) => {
    if (busy || qr.state.loading) event.preventDefault();
  });
  document.querySelector("#settings-form").addEventListener(
    "invalid",
    (event) => {
      for (
        let parent = event.target.parentElement;
        parent;
        parent = parent.parentElement
      )
        if (parent.tagName === "DETAILS") parent.open = true;
    },
    true,
  );
  document.querySelector("#settings-form").addEventListener("input", () => {
    preferences.message = "";
    renderSettingsState();
    updateNumberExample();
  });
  document
    .querySelector("#settings-form")
    .addEventListener("submit", saveSettings);
  document
    .querySelector("#retry-settings")
    .addEventListener("click", loadSettings);
  populateSettings();
}
function populateSettings() {
  const settingsForm = document.querySelector("#settings-form");
  for (const [key, value] of Object.entries(preferences.data))
    if (settingsForm.elements.namedItem(key))
      settingsForm.elements.namedItem(key).value = value;
  updateNumberExample();
  renderSettingsState();
}
function settingsInput() {
  const controls = document.querySelector("#settings-form").elements;
  const values = Object.fromEntries(
    Object.keys(defaultSettings()).map((key) => [
      key,
      controls.namedItem(key).value,
    ]),
  );
  return {
    ...values,
    padding: Number(values.padding),
    nextNumber: Number(values.nextNumber),
  };
}
function updateNumberExample() {
  const candidate = settingsInput();
  document.querySelector("#number-example").textContent =
    Number.isInteger(candidate.nextNumber) &&
    candidate.nextNumber > 0 &&
    candidate.nextNumber <= MAX_INVOICE_NUMBER
      ? formatInvoiceNumber(candidate)
      : "—";
}
function renderSettingsState() {
  document.querySelector("#settings-status").textContent = preferences.message
    ? t(preferences.message)
    : "";
  document.querySelector("#retry-settings").hidden =
    preferences.loading ||
    (preferences.ready && preferences.message !== "settingsSaveError");
  const banner = document.querySelector("#preferences-banner");
  banner.textContent = preferences.loading
    ? t("settingsLoading")
    : !preferences.ready
      ? t("settingsLoadBanner")
      : !qr.state.ready && !qr.state.loading
        ? t("qrLoadError")
        : "";
  banner.hidden = !banner.textContent;
}
async function loadSettings() {
  preferences.loading = true;
  preferences.message = "settingsLoading";
  setBusy(busy);
  renderSettingsState();
  try {
    let result;
    if (inTelegram) result = await callEndpoint("settings", { action: "get" });
    else {
      const saved = localStorage.getItem(SETTINGS_KEY);
      result = {
        settings: saved
          ? validateSettings(JSON.parse(saved))
          : defaultSettings(),
        configured: Boolean(saved),
      };
    }
    preferences.data = result.settings;
    preferences.configured = result.configured;
    preferences.ready = true;
    preferences.message = "";
    // Seed a first-time setup from the existing invoice without changing that draft.
    if (!result.configured && hadDraft)
      for (const key of [
        "sellerName",
        "sellerEmail",
        "sellerAddress",
        "currency",
        "tax",
        "notes",
      ])
        preferences.data[key] = invoice[key];
    populateSettings();
  } catch {
    preferences.ready = false;
    preferences.message = "settingsLoadError";
  } finally {
    preferences.loading = false;
    setBusy(busy);
    renderSettingsState();
  }
  if (preferences.ready && !hadDraft && !draftTouched)
    await createNextInvoice(true);
}
async function saveSettings(event) {
  event.preventDefault();
  if (busy || preferences.loading || !preferences.ready) return;
  let candidate;
  try {
    candidate = validateSettings(settingsInput());
  } catch {
    preferences.message = "settingsInvalid";
    renderSettingsState();
    return;
  }
  setBusy(true);
  preferences.message = "settingsSaving";
  renderSettingsState();
  const updateNextNumber = candidate.nextNumber !== preferences.data.nextNumber;
  try {
    if (inTelegram)
      preferences.data = (
        await callEndpoint("settings", {
          action: "set",
          settings: candidate,
          updateNextNumber,
        })
      ).settings;
    else {
      const previous = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "null");
      if (!updateNextNumber)
        candidate.nextNumber = Math.max(
          candidate.nextNumber,
          previous?.nextNumber || 1,
        );
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(candidate));
      preferences.data = candidate;
    }
    preferences.configured = true;
    preferences.message = "settingsSaved";
    populateSettings();
  } catch {
    preferences.message = "settingsSaveError";
    renderSettingsState();
  } finally {
    setBusy(false);
  }
}
async function allocateNumber() {
  if (inTelegram) return callEndpoint("settings", { action: "next" });
  const allocate = () => {
    const saved = localStorage.getItem(SETTINGS_KEY);
    const settings = saved
      ? validateSettings(JSON.parse(saved))
      : defaultSettings();
    if (settings.nextNumber > MAX_INVOICE_NUMBER)
      throw new Error("NUMBER_EXHAUSTED");
    const number = formatInvoiceNumber(settings);
    settings.nextNumber++;
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    return { number, settings };
  };
  return navigator.locks
    ? navigator.locks.request("invoice-studio-number", allocate)
    : allocate();
}
async function createNextInvoice(initial = false) {
  if (busy || !preferences.ready) return;
  setBusy(true);
  try {
    const next = await allocateNumber();
    preferences.data = next.settings;
    invoice = newInvoice(next.settings, next.number);
    hadDraft = true;
    draftTouched = false;
    view = "edit";
    mount();
    if (!initial) document.querySelector("[name=clientName]").focus();
  } catch {
    status.textContent = t("newInvoiceError");
  } finally {
    setBusy(false);
  }
}

function themePicker() {
  return `<fieldset id="preview-themes" class="theme-picker"><legend>${t("invoiceTheme")}</legend><div class="theme-options">${["modern", "og"].map((theme) => `<label class="theme-option"><input type="radio" name="theme" value="${theme}" /><span class="theme-swatch ${theme}" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span><span><strong>${t(theme === "og" ? "themeOg" : "themeModern")}</strong><small>${t(theme === "og" ? "themeOgHint" : "themeModernHint")}</small></span></label>`).join("")}</div></fieldset>`;
}

function setThemePicker(open) {
  const picker = document.querySelector("#preview-themes");
  const toggle = document.querySelector("#theme-toggle");
  picker.hidden = mobile.matches && !open;
  toggle.hidden = !mobile.matches;
  toggle.setAttribute("aria-expanded", String(!picker.hidden));
}
function bindThemePicker() {
  const picker = document.querySelector("#preview-themes");
  const toggle = document.querySelector("#theme-toggle");
  for (const input of picker.querySelectorAll("input"))
    input.checked = input.value === invoice.theme;
  toggle.addEventListener("click", () => setThemePicker(picker.hidden));
  picker.addEventListener("change", (event) => {
    if (busy || !["modern", "og"].includes(event.target.value)) return;
    invoice.theme = event.target.value;
    draftTouched = true;
    status.textContent = "";
    update();
    if (mobile.matches) {
      setThemePicker(false);
      toggle.focus();
    }
  });
  picker.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && mobile.matches) {
      event.preventDefault();
      setThemePicker(false);
      toggle.focus();
    }
  });
}
