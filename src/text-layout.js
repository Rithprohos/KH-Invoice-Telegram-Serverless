// Some WebViews report zero canvas advances for shaped Khmer text. Use the
// browser's inline text layout as a fallback, with the exact same font.
export function createTextMeasurer(ctx, ownerDocument) {
  let probe;
  const cache = new Map();
  return {
    width(value) {
      const text = String(value);
      const key = `${ctx.font}\n${text}`;
      if (cache.has(key)) return cache.get(key);
      let width = ctx.measureText(text).width;
      if ((!Number.isFinite(width) || width <= 0) && text.trim()) {
        if (ownerDocument?.body) {
          if (!probe) {
            probe = ownerDocument.createElement("span");
            probe.setAttribute("aria-hidden", "true");
            Object.assign(probe.style, {
              position: "fixed",
              visibility: "hidden",
              pointerEvents: "none",
              whiteSpace: "pre",
              direction: "ltr",
              left: "0",
              top: "0",
            });
            ownerDocument.body.appendChild(probe);
          }
          probe.style.font = ctx.font;
          probe.textContent = text;
          width = probe.getBoundingClientRect().width;
        }
      }
      cache.set(key, width);
      return width;
    },
    dispose() {
      probe?.remove();
    },
  };
}

// Segment whole words first, then grapheme clusters for a long unbroken word.
// Khmer vowel signs and subscripts must not be separated from their base letter.
export function wrapText(value, maxWidth, measure, locale = "km") {
  const words = new Intl.Segmenter(locale, { granularity: "word" });
  const graphemes = new Intl.Segmenter(locale, { granularity: "grapheme" });
  const lines = [];
  for (const paragraph of String(value).split("\n").slice(0, 10)) {
    let line = "";
    for (const { segment: word } of words.segment(paragraph)) {
      if (measure(line + word) <= maxWidth) {
        line += word;
        continue;
      }
      if (line.trim()) {
        lines.push(line.trimEnd());
        line = "";
      }
      if (measure(word) <= maxWidth) {
        line = word.trimStart();
        continue;
      }
      for (const { segment } of graphemes.segment(word)) {
        if (line && measure(line + segment) > maxWidth) {
          lines.push(line);
          line = "";
        }
        line += segment;
      }
    }
    lines.push(line.trimEnd());
  }
  return lines;
}
