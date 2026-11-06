const KEY = "invoice-studio:appearance:v1";
export function resolveAppearance(preference, telegramScheme, systemDark) {
  if (preference === "light" || preference === "dark") return preference;
  if (telegramScheme === "light" || telegramScheme === "dark")
    return telegramScheme;
  return systemDark ? "dark" : "light";
}

export function appearanceController(telegram) {
  const system = matchMedia("(prefers-color-scheme: dark)");
  let preference = "auto";
  try {
    const saved = localStorage.getItem(KEY);
    if (["auto", "light", "dark"].includes(saved)) preference = saved;
  } catch {
    /* Device storage is optional. */
  }
  let applied;
  const apply = () => {
    const theme = resolveAppearance(
      preference,
      telegram?.colorScheme,
      system.matches,
    );
    document.documentElement.dataset.appearance = theme;
    const surface = theme === "dark" ? "#171e29" : "#ffffff";
    const background = theme === "dark" ? "#10151d" : "#f7f8fa";
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", surface);
    if (theme === applied) return;
    applied = theme;
    // Older Telegram clients can still use the CSS theme without these methods.
    for (const [method, version, color] of [
      ["setHeaderColor", "6.9", surface],
      ["setBackgroundColor", "6.1", background],
      ["setBottomBarColor", "7.10", surface],
    ]) {
      try {
        if (telegram?.isVersionAtLeast?.(version)) telegram[method]?.(color);
      } catch {
        /* Host chrome must not block the editor. */
      }
    }
  };
  system.addEventListener("change", apply);
  telegram?.onEvent?.("themeChanged", apply);
  apply();
  return {
    get value() {
      return preference;
    },
    set(value) {
      if (!["auto", "light", "dark"].includes(value)) return;
      preference = value;
      try {
        localStorage.setItem(KEY, value);
      } catch {
        /* Optional. */
      }
      apply();
    },
  };
}
