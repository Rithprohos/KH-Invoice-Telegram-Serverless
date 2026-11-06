import { renderOg } from "./render-og.js";
import { calculate, money } from "./invoice.js";
import { text as translate } from "./i18n.js";
import { wrapText } from "./text-layout.js";
export function renderInvoice(
  canvas,
  invoice,
  language = "km",
  logo = null,
  paymentQr = null,
) {
  if (invoice.theme === "og")
    return renderOg(canvas, invoice, language, logo, paymentQr);
  const t = (key) => translate(language, key);
  const small = language === "km" ? 14 : 11;
  const width = 900,
    scale = 2;
  canvas.width = width * scale;
  canvas.height = 1;
  const ctx = canvas.getContext("2d"),
    totals = calculate(invoice);
  function draw() {
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, canvas.height / scale);
    const text = (
      value,
      x,
      y,
      size = 16,
      color = "#25334b",
      weight = "400",
      align = "left",
    ) => {
      ctx.font = `${weight} ${size}px "Kantumruy Pro Variable", sans-serif`;
      ctx.fillStyle = color;
      ctx.textAlign = align;
      ctx.fillText(String(value), x, y);
    };
    function wrapped(
      value,
      x,
      y,
      maxWidth,
      size = 16,
      color = "#25334b",
      weight = "400",
    ) {
      ctx.font = `${weight} ${size}px "Kantumruy Pro Variable", sans-serif`;
      for (const line of wrapText(
        value,
        maxWidth,
        (value) => ctx.measureText(value).width,
        language,
      )) {
        text(line, x, y, size, color, weight);
        y += size * 1.85;
      }
      return y;
    }
    const rule = (y) => {
      ctx.fillStyle = "#e6eaf1";
      ctx.fillRect(60, y, 780, 1);
    };
    // Reserve vertical space for any aspect ratio; never stretch or crop a logo.
    const headingOffset = logo ? 112 : 0;
    if (logo) {
      const ratio = Math.min(200 / logo.naturalWidth, 90 / logo.naturalHeight);
      ctx.drawImage(
        logo,
        60,
        45,
        logo.naturalWidth * ratio,
        logo.naturalHeight * ratio,
      );
    } else {
      ctx.fillStyle = "#3167e3";
      ctx.fillRect(60, 58, 36, 5);
    }
    text(t("invoice"), 60, 115 + headingOffset, 38, "#14233d", "700");
    const numberBottom = wrapped(
      invoice.number || t("number"),
      60,
      150 + headingOffset,
      430,
      16,
      "#718096",
    );
    text(t("date"), 610, 86, small, "#718096", "700");
    text(invoice.date || "—", 840, 86, 16, "#25334b", "400", "right");
    if (invoice.dueDate) {
      text(t("dueDate"), 610, 122, small, "#718096", "700");
      text(invoice.dueDate, 840, 122, 16, "#25334b", "400", "right");
    }
    const partyStart = Math.max(210 + headingOffset, numberBottom + 35);
    text(t("from"), 60, partyStart, small, "#718096", "700");
    text(t("billTo"), 470, partyStart, small, "#718096", "700");
    const party = (name, email, address, x) => {
      let y = wrapped(name, x, partyStart + 32, 350, 20, "#14233d", "700");
      if (email) y = wrapped(email, x, y + 8, 350, 15, "#718096");
      if (address) y = wrapped(address, x, y + 5, 350, 15, "#718096");
      return y;
    };
    let y =
      Math.max(
        party(
          invoice.sellerName || t("sellerPlaceholder"),
          invoice.sellerEmail,
          invoice.sellerAddress,
          60,
        ),
        party(
          invoice.clientName || t("customer"),
          invoice.clientEmail,
          invoice.clientAddress,
          470,
        ),
      ) + 42;
    ctx.fillStyle = "#f3f6fb";
    ctx.fillRect(60, y, 780, 42);
    text(t("description"), 75, y + 26, small, "#66758c", "700");
    text(t("quantity"), 533, y + 26, small, "#66758c", "700", "right");
    text(t("rate"), 682, y + 26, small, "#66758c", "700", "right");
    text(t("amount"), 825, y + 26, small, "#66758c", "700", "right");
    y += 73;
    invoice.items.forEach((item, index) => {
      const bottom = wrapped(
        item.description || t("description"),
        75,
        y,
        385,
        16,
      );
      text(item.quantity || "0", 533, y, 14, "#25334b", "400", "right");
      const amount = (value) =>
        (value / 100).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      text(
        amount(totals.lines[index] / (Number(item.quantity) || 1)),
        682,
        y,
        13,
        "#25334b",
        "400",
        "right",
      );
      text(amount(totals.lines[index]), 825, y, 13, "#25334b", "500", "right");
      y = Math.max(y + 58, bottom + 30);
      rule(y - 28);
    });
    y += 18;
    text(t("subtotal"), 520, y, 16, "#718096");
    text(
      money(totals.subtotal, invoice.currency, language),
      825,
      y,
      17,
      "#25334b",
      "400",
      "right",
    );
    y += 35;
    text(`${t("tax")} (${invoice.tax || 0}%)`, 520, y, 16, "#718096");
    text(
      money(totals.tax, invoice.currency, language),
      825,
      y,
      17,
      "#25334b",
      "400",
      "right",
    );
    y += 25;
    ctx.fillStyle = "#edf3ff";
    ctx.fillRect(490, y, 350, 90);
    text(
      `${t("total")} · ${invoice.currency}`,
      510,
      y + 25,
      small,
      "#3167e3",
      "700",
    );
    text(
      money(totals.total, invoice.currency, language),
      820,
      y + 66,
      25,
      "#2558c8",
      "700",
      "right",
    );
    y += 130;
    if (invoice.notes.trim()) {
      text(t("notes"), 60, y, small, "#718096", "700");
      y = wrapped(invoice.notes, 60, y + 30, 780, 15, "#66758c") + 30;
    }
    if (paymentQr) {
      rule(y);
      text(t("qrScan"), width / 2, y + 38, 18, "#25334b", "700", "center");
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(paymentQr, (width - 256) / 2, y + 60, 256, 256);
      ctx.imageSmoothingEnabled = true;
      y += 350;
    }
    rule(y);
    text(t("thanks"), 60, y + 35, 14, "#718096");
    return y + 85;
  }
  const height = draw();
  canvas.height = Math.ceil(height * scale);
  draw();
}
