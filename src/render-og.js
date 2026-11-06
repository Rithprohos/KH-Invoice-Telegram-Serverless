import { calculate, money, minorUnits } from "./invoice.js";
import { text as translate } from "./i18n.js";
import { createTextMeasurer, wrapText } from "./text-layout.js";

// Traditional Cambodian invoice-pad layout; all details come from this invoice.
export function renderOg(canvas, invoice, language, logo, paymentQr) {
  const width = 900,
    scale = 2,
    ink = "#152a76",
    red = "#bd242b";
  canvas.width = width * scale;
  canvas.height = 1;
  const ctx = canvas.getContext("2d"),
    totals = calculate(invoice);
  const measure = createTextMeasurer(ctx, canvas.ownerDocument);
  const km = (key) => translate("km", key),
    en = (key) => translate("en", key);
  const font = (size, weight = "400") => {
    ctx.font =
      weight === "display"
        ? `400 ${size}px "Moul", "Kantumruy Pro Variable", sans-serif`
        : `${weight} ${size}px "Kantumruy Pro Variable", sans-serif`;
  };
  const lines = (value, max, size, weight = "400") => {
    font(size, weight);
    return wrapText(value, max, (s) => measure.width(s), language);
  };
  function text(
    value,
    x,
    y,
    size = 16,
    align = "left",
    color = ink,
    weight = "400",
    max = 800,
  ) {
    font(size, weight);
    while (measure.width(value) > max && size > 9) font(--size, weight);
    ctx.fillStyle = color;
    // Position the shaped text ourselves: native center/right alignment can
    // drift for Khmer in iOS WebViews, including mixed Khmer/Latin date labels.
    const advance = measure.width(value);
    const left =
      x - (align === "center" ? advance / 2 : align === "right" ? advance : 0);
    ctx.textAlign = "left";
    ctx.fillText(String(value), left, y);
  }
  function wrapped(
    value,
    x,
    y,
    max,
    size = 16,
    align = "left",
    weight = "400",
    color = ink,
  ) {
    for (const line of lines(value, max, size, weight)) {
      text(line, x, y, size, align, color, weight, max);
      y += size * 1.8;
    }
    return y;
  }
  function line(x1, y1, x2, y2, dashed = false) {
    ctx.strokeStyle = ink;
    ctx.lineWidth = 1.5;
    ctx.setLineDash(dashed ? [2, 3] : []);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  function bilingual(key, x, y, max, english = en(key)) {
    text(km(key), x, y, 15, "center", ink, "700", max);
    text(english, x, y + 19, 12, "center", ink, "400", max);
  }
  function draw() {
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.direction = "ltr";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, width, canvas.height / scale);
    if (logo) {
      const ratio = Math.min(112 / logo.naturalWidth, 112 / logo.naturalHeight);
      ctx.drawImage(
        logo,
        42,
        42,
        logo.naturalWidth * ratio,
        logo.naturalHeight * ratio,
      );
    }
    const nameX = logo ? 520 : 450,
      nameWidth = logo ? 640 : 816;
    let y = wrapped(
      invoice.sellerName || km("sellerPlaceholder"),
      nameX,
      72,
      nameWidth,
      30,
      "center",
      "display",
    );
    if (invoice.sellerAddress)
      y = wrapped(invoice.sellerAddress, nameX, y + 2, nameWidth, 15, "center");
    if (invoice.sellerEmail)
      y = wrapped(invoice.sellerEmail, nameX, y + 2, nameWidth, 15, "center");
    y = Math.max(y + 22, logo ? 180 : 142);
    text(km("invoice"), 450, y, 27, "center", ink, "display");
    text("INVOICE", 450, y + 29, 20, "center");
    line(395, y + 35, 505, y + 35);
    const metaY = y + 67;
    const clientBottom = wrapped(
      `${km("customer")} / Customer: ${invoice.clientName}`,
      42,
      metaY,
      460,
      16,
    );
    let detailsBottom = clientBottom;
    for (const detail of [invoice.clientEmail, invoice.clientAddress])
      if (detail) detailsBottom = wrapped(detail, 42, detailsBottom, 460, 14);
    text("No.", 548, metaY, 16);
    let metaBottom = wrapped(
      invoice.number,
      858,
      metaY,
      260,
      19,
      "right",
      "700",
      red,
    );
    text(
      `${km("date")} / Date: ${invoice.date}`,
      858,
      metaBottom + 2,
      14,
      "right",
      ink,
      "400",
      310,
    );
    metaBottom += 30;
    if (invoice.dueDate) {
      text(
        `${km("dueDate")} / Due: ${invoice.dueDate}`,
        858,
        metaBottom + 2,
        14,
        "right",
        ink,
        "400",
        310,
      );
      metaBottom += 30;
    }
    y = Math.max(detailsBottom, metaBottom) + 20;
    const cols = [42, 88, 492, 572, 710, 858],
      header = 54,
      tableTop = y;
    const rows = Array.from(
      { length: Math.max(15, invoice.items.length) },
      (_, i) => {
        const item = invoice.items[i];
        const content = item ? lines(item.description, 380, 16) : [];
        return {
          item,
          content,
          height: Math.max(34, content.length * 28 + 12),
        };
      },
    );
    const tableBottom =
      y + header + rows.reduce((sum, row) => sum + row.height, 0);
    if (logo) {
      const ratio = Math.min(360 / logo.naturalWidth, 360 / logo.naturalHeight);
      ctx.save();
      ctx.globalAlpha = 0.055;
      ctx.drawImage(
        logo,
        (width - logo.naturalWidth * ratio) / 2,
        tableTop +
          header +
          (tableBottom - tableTop - header - logo.naturalHeight * ratio) / 2,
        logo.naturalWidth * ratio,
        logo.naturalHeight * ratio,
      );
      ctx.restore();
    }
    line(42, y, 858, y);
    bilingual("ogNo", 65, y + 22, 38, "No.");
    bilingual("description", 290, y + 22, 390, "Description");
    bilingual("quantity", 532, y + 22, 72, "Qty");
    bilingual("rate", 641, y + 22, 130, "Unit price");
    bilingual("amount", 784, y + 22, 138, `Amount (${invoice.currency})`);
    y += header;
    line(42, y, 858, y);
    rows.forEach((row, i) => {
      text(i + 1, 65, y + 23, 14, "center");
      if (row.item) {
        row.content.forEach((value, j) =>
          text(value, 100, y + 24 + j * 28, 16),
        );
        text(row.item.quantity, 532, y + 24, 15, "center");
        const amount = (value) =>
          (value / 100).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
        text(
          amount(minorUnits(row.item.rate)),
          698,
          y + 24,
          15,
          "right",
          ink,
          "400",
          114,
        );
        text(
          amount(totals.lines[i]),
          846,
          y + 24,
          15,
          "right",
          ink,
          "400",
          124,
        );
      }
      y += row.height;
      line(42, y, 858, y);
    });
    for (const x of cols) line(x, tableTop, x, tableBottom);
    const footerY = y;
    [
      ["subtotal", totals.subtotal],
      ["tax", totals.tax],
      ["total", totals.total],
    ].forEach(([key, value], i) => {
      const rowY = footerY + i * 43;
      text(
        `${km(key)} / ${en(key)}${key === "tax" ? ` (${invoice.tax}%)` : ""}`,
        690,
        rowY + 28,
        14,
        "right",
        ink,
        key === "total" ? "700" : "400",
        235,
      );
      text(
        money(value, invoice.currency, language),
        846,
        rowY + 28,
        16,
        "right",
        ink,
        key === "total" ? "700" : "400",
        142,
      );
      line(710, rowY + 43, 858, rowY + 43);
    });
    line(710, footerY, 710, footerY + 129);
    line(858, footerY, 858, footerY + 129);
    let notesBottom = footerY + 28;
    if (invoice.notes.trim())
      notesBottom = wrapped(
        invoice.notes,
        42,
        notesBottom,
        385,
        14,
        "left",
        "400",
        red,
      );
    y = Math.max(footerY + 155, notesBottom + 24);
    if (paymentQr) {
      text(
        translate(language, "qrScan"),
        170,
        y + 8,
        15,
        "center",
        ink,
        "700",
        256,
      );
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(paymentQr, 42, y + 25, 256, 256);
      ctx.imageSmoothingEnabled = true;
    }
    const signatureY = Math.max(y + 115, 1170);
    line(355, signatureY, 535, signatureY, true);
    line(650, signatureY, 830, signatureY, true);
    bilingual("ogBuyer", 445, signatureY + 30, 180, "Buyer");
    bilingual("ogSeller", 740, signatureY + 30, 180, "Seller");
    return Math.max(1273, signatureY + 95, y + (paymentQr ? 310 : 0));
  }
  try {
    canvas.height = Math.ceil(draw() * scale);
    draw();
  } finally {
    measure.dispose();
  }
}
