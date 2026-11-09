import type {
  LifeCountConfig,
  LifeColor,
  LifePreset,
  LifeStage,
  LifeUnit
} from "@/data/lifecount";
import {
  lifeCountMessages,
  resolveLifeCountLocale,
  type LifeCountLocale,
  type LifeCountMessages
} from "@/i18n/lifecount";
import {
  cellColorKey,
  cellStatus,
  formatCellLabel,
  lifeCells,
  localDay,
  OPEN_ENDED_STAGE_END_DATE,
  stageDatesForPreset,
  type LifeCell
} from "@/utils/lifecount";

const UNITS: LifeUnit[] = ["day", "week", "month", "year"];
const COLOR_VARIABLES: Record<LifeColor, string> = {
  blue: "var(--life-blue)",
  cyan: "var(--life-cyan)",
  green: "var(--life-green)",
  orange: "var(--life-orange)",
  pink: "var(--life-pink)",
  purple: "var(--life-purple)",
  red: "var(--life-red)"
};
const MIN_CELL_SIZE_BY_UNIT: Record<LifeUnit, number> = {
  day: 4,
  week: 10,
  month: 20,
  year: 44
};
const DOM_GRID_GAP_BY_UNIT: Record<"month" | "year", number> = {
  month: 3,
  year: 5
};
const THEME_STORAGE_KEY = "vint-color-scheme";
const themeTransitionState: {
  generation: number;
  running: boolean;
  transition: ViewTransition | null;
  animation: Animation | null;
} = {
  generation: 0,
  running: false,
  transition: null,
  animation: null
};

interface LifeCountState {
  locale: LifeCountLocale;
  presetId: string;
}

function fitGrid(width: number, minimumCell: number, gap: number) {
  const columns = Math.max(1, Math.floor((width + gap) / (minimumCell + gap)));
  const cellSize = Math.max(1, (width - gap * (columns - 1)) / columns);
  return { columns, cellSize };
}

function readConfig(root: HTMLElement): LifeCountConfig | null {
  const element = document.getElementById("lifecount-config");
  if (!element?.textContent) return null;

  try {
    return JSON.parse(element.textContent) as LifeCountConfig;
  } catch {
    root.dataset.state = "error";
    return null;
  }
}

function validUnit(value: string | null, fallback: LifeUnit): LifeUnit {
  return value && UNITS.includes(value as LifeUnit) ? (value as LifeUnit) : fallback;
}

function validPreset(config: LifeCountConfig, value: string | null): LifePreset {
  return (
    config.presets.find((preset) => preset.id === value) ??
    config.presets.find((preset) => preset.id === config.defaultPresetId) ??
    config.presets[0]
  );
}

function ageAt(birthday: string, today: string) {
  let age = Number(today.slice(0, 4)) - Number(birthday.slice(0, 4));
  const birthdayThisYear = `${today.slice(0, 4)}${birthday.slice(4)}`;
  if (today < birthdayThisYear) age -= 1;
  return Math.max(0, age);
}

function updateUrl(entries: Record<string, string>) {
  const url = new URL(window.location.href);
  for (const [key, value] of Object.entries(entries)) {
    url.searchParams.set(key, value);
  }
  window.history.replaceState({}, "", url);
}

function setText(root: HTMLElement, selector: string, value: string) {
  const element = root.querySelector<HTMLElement>(selector);
  if (element) element.textContent = value;
}

function setLabel(root: HTMLElement, selector: string, value: string) {
  const element = root.querySelector<HTMLElement>(selector);
  if (!element) return;
  element.setAttribute("aria-label", value);
  element.setAttribute("title", value);
}

function presetLabel(preset: LifePreset, messages: LifeCountMessages) {
  return `${messages.countryLabels[preset.countryId]} · ${messages.pathLabels[preset.pathId]}`;
}

function setCellStyle(
  element: HTMLElement,
  key: ReturnType<typeof cellColorKey>,
  status: string
) {
  element.dataset.status = status;
  if (key === "elapsed" || key === "future" || key === "current") {
    element.style.removeProperty("--cell-color");
    return;
  }
  element.style.setProperty("--cell-color", COLOR_VARIABLES[key]);
}

function cellBackground(key: ReturnType<typeof cellColorKey>) {
  if (key === "elapsed") return "color-mix(in srgb, var(--fg-muted) 30%, var(--bg))";
  if (key === "future") return "color-mix(in srgb, var(--fg-muted) 10%, var(--bg))";
  if (key === "current") return "color-mix(in srgb, var(--fg-strong) 38%, var(--bg))";
  return `color-mix(in srgb, ${COLOR_VARIABLES[key]} 72%, var(--bg))`;
}

function resolveCssColor(element: HTMLElement, value: string) {
  const probe = document.createElement("span");
  probe.style.position = "absolute";
  probe.style.visibility = "hidden";
  probe.style.backgroundColor = value;
  element.append(probe);
  const resolved = getComputedStyle(probe).backgroundColor;
  probe.remove();
  return resolved || value;
}

function renderPresetOptions(
  root: HTMLElement,
  config: LifeCountConfig,
  state: LifeCountState,
  messages: LifeCountMessages
) {
  const select = root.querySelector<HTMLSelectElement>("[data-lifecount-preset]");
  if (!select) return;

  const grouped = new Map<string, LifePreset[]>();
  for (const preset of config.presets) {
    grouped.set(preset.countryId, [...(grouped.get(preset.countryId) ?? []), preset]);
  }

  select.replaceChildren(
    ...[...grouped.entries()].map(([countryId, presets]) => {
      const group = document.createElement("optgroup");
      group.label = messages.countryLabels[countryId as keyof typeof messages.countryLabels];
      for (const preset of presets) {
        const option = document.createElement("option");
        option.value = preset.id;
        option.textContent = presetLabel(preset, messages);
        group.append(option);
      }
      return group;
    })
  );
  select.value = state.presetId;
  select.setAttribute("aria-label", messages.selectPreset);
}

function renderLegend(root: HTMLElement, stages: LifeStage[], messages: LifeCountMessages) {
  const legend = root.querySelector<HTMLElement>("[data-lifecount-legend]");
  if (!legend) return;
  legend.replaceChildren();

  for (const stage of stages) {
    const item = document.createElement("span");
    item.className = "lifecount-legend-item";
    item.setAttribute("role", "listitem");
    const dot = document.createElement("i");
    dot.setAttribute("aria-hidden", "true");
    dot.style.setProperty("--legend-color", COLOR_VARIABLES[stage.color]);
    const label = document.createElement("span");
    label.textContent = messages.stageLabels[stage.id];
    item.append(dot, label);
    legend.append(item);
  }
}

function renderStages(
  root: HTMLElement,
  stages: LifeStage[],
  messages: LifeCountMessages,
  locale: LifeCountLocale
) {
  const list = root.querySelector<HTMLElement>("[data-lifecount-stage-list]");
  if (!list) return;
  list.replaceChildren();

  for (const stage of stages) {
    const row = document.createElement("article");
    row.className = "lifecount-stage-row";

    const dot = document.createElement("i");
    dot.className = "lifecount-stage-dot";
    dot.setAttribute("aria-hidden", "true");
    dot.style.background = COLOR_VARIABLES[stage.color];

    const copy = document.createElement("div");
    copy.className = "lifecount-stage-copy";
    const title = document.createElement("strong");
    title.textContent = messages.stageLabels[stage.id];
    const dates = document.createElement("span");
    const end =
      stage.endDate === OPEN_ENDED_STAGE_END_DATE
        ? messages.ongoing
        : formatDateForDisplay(stage.endDate, locale);
    dates.textContent = `${formatDateForDisplay(stage.startDate, locale)} — ${end}`;
    copy.append(title, dates);
    row.append(dot, copy);
    list.append(row);
  }
}

function formatDateForDisplay(value: string, locale: LifeCountLocale) {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC"
  }).format(new Date(`${value}T00:00:00Z`));
}

function renderStaticCopy(
  root: HTMLElement,
  messages: LifeCountMessages
) {
  setText(root, "[data-lifecount-title]", messages.pageTitle);
  setText(root, "[data-lifecount-stages-title]", messages.stages);
  setText(root, "[data-lifecount-settings-title]", messages.settingsTitle);
  setText(root, "[data-lifecount-birthday-label]", messages.birthday);
  setText(root, "[data-lifecount-display-age-label]", messages.displayAge);
  setText(root, "[data-lifecount-settings-cancel]", messages.cancel);
  setText(root, "[data-lifecount-settings-save]", messages.save);
  setLabel(root, "[data-lifecount-settings]", messages.settings);
  setLabel(root, "[data-lifecount-stages]", messages.stagesOpen);
  setLabel(root, "[data-lifecount-stages-close]", messages.close);
  setLabel(root, "[data-lifecount-language]", messages.languageButtonLabel);
  setLabel(root, "[data-lifecount-github]", messages.githubRepository);
  setText(root, "[data-lifecount-language]", messages.languageButton);
  setLabel(root, "[data-lifecount-legend]", messages.legend);

  const isDark = document.documentElement.classList.contains("dark");
  setLabel(
    root,
    "[data-lifecount-theme]",
    isDark ? messages.themeLight : messages.themeDark
  );

  const drawer = root.querySelector<HTMLElement>("[data-lifecount-stages-drawer]");
  drawer?.setAttribute("aria-label", messages.stages);
  const unitGroup = root.querySelector<HTMLElement>(".lifecount-unit-switch");
  unitGroup?.setAttribute("aria-label", messages.selectUnit);
}

function persistTheme(theme: "light" | "dark") {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Theme switching still works when storage is unavailable.
  }
}

function applyTheme(
  theme: "light" | "dark",
  renderPage: () => void
) {
  const isDark = theme === "dark";
  document.documentElement.classList.toggle("dark", isDark);
  document
    .querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    ?.setAttribute("content", isDark ? "#050505" : "#fafaf9");
  renderPage();
}

function resolveThemeTransitionOrigin(button: HTMLButtonElement) {
  const rect = button.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  return rect.width > 0 && rect.height > 0 && Number.isFinite(x) && Number.isFinite(y)
    ? { x, y }
    : null;
}

function resolveThemeTransitionRadius({ x, y }: { x: number; y: number }) {
  return Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  );
}

function setThemeButtonBusy(busy: boolean) {
  document
    .querySelectorAll<HTMLButtonElement>("[data-lifecount-theme]")
    .forEach((button) => {
      button.toggleAttribute("aria-disabled", busy);
      button.toggleAttribute("aria-busy", busy);
    });
}

function setBackgroundTransitionPaused(paused: boolean) {
  (
    window as Window & {
      __noiseDriftBackground?: {
        setTransitionPaused?: (value: boolean) => void;
      };
    }
  ).__noiseDriftBackground?.setTransitionPaused?.(paused);
}

function stopThemeTransition() {
  themeTransitionState.generation += 1;
  themeTransitionState.running = false;

  try {
    themeTransitionState.animation?.cancel();
  } catch {
    // The animation may already be finished.
  }

  try {
    themeTransitionState.transition?.skipTransition();
  } catch {
    // The transition may already be finished.
  }

  setBackgroundTransitionPaused(false);
  setThemeButtonBusy(false);
  themeTransitionState.animation = null;
  themeTransitionState.transition = null;
}

function finishThemeTransition(generation: number) {
  if (themeTransitionState.generation !== generation) return;
  themeTransitionState.running = false;
  themeTransitionState.animation = null;
  themeTransitionState.transition = null;
  setBackgroundTransitionPaused(false);
  setThemeButtonBusy(false);
}

function animateThemeTransition(
  button: HTMLButtonElement,
  nextTheme: "light" | "dark",
  renderPage: () => void
) {
  const origin = resolveThemeTransitionOrigin(button);
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!origin || reducedMotion || typeof document.startViewTransition !== "function") {
    applyTheme(nextTheme, renderPage);
    return;
  }

  const generation = themeTransitionState.generation + 1;
  themeTransitionState.generation = generation;
  themeTransitionState.running = true;
  setThemeButtonBusy(true);
  setBackgroundTransitionPaused(true);

  const radius = resolveThemeTransitionRadius(origin);
  const originX = `${(origin.x / window.innerWidth) * 100}%`;
  const originY = `${(origin.y / window.innerHeight) * 100}%`;
  const from = `circle(0px at ${originX} ${originY})`;
  const to = `circle(${radius}px at ${originX} ${originY})`;
  const isExpanding = nextTheme === "light";

  let transition: ViewTransition;
  try {
    transition = document.startViewTransition(() => {
      applyTheme(nextTheme, renderPage);
    });
    themeTransitionState.transition = transition;
  } catch {
    applyTheme(nextTheme, renderPage);
    finishThemeTransition(generation);
    return;
  }

  transition.ready
    .then(() => {
      if (themeTransitionState.generation !== generation) return;
      const animation = document.documentElement.animate(
        { clipPath: isExpanding ? [from, to] : [to, from] },
        {
          duration: isExpanding ? 400 : 370,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          composite: "replace",
          fill: "both",
          pseudoElement: isExpanding
            ? "::view-transition-new(root)"
            : "::view-transition-old(root)"
        }
      );
      themeTransitionState.animation = animation;
      return Promise.all([animation.finished, transition.finished]);
    })
    .catch(() => {
      try {
        transition.skipTransition();
      } catch {
        // The browser may have already completed the transition.
      }
    })
    .finally(() => finishThemeTransition(generation));
}

function setupThemeToggle(root: HTMLElement, renderPage: () => void) {
  const button = root.querySelector<HTMLButtonElement>("[data-lifecount-theme]");
  if (!button) return;

  button.addEventListener("click", () => {
    if (themeTransitionState.running) return;
    const nextTheme = document.documentElement.classList.contains("dark")
      ? "light"
      : "dark";
    persistTheme(nextTheme);
    animateThemeTransition(button, nextTheme, renderPage);
  });

  window.addEventListener("storage", (event) => {
    if (event.key !== THEME_STORAGE_KEY) return;
    stopThemeTransition();
    applyTheme(event.newValue === "light" ? "light" : "dark", renderPage);
  });
}

function setupSettings(
  root: HTMLElement,
  config: LifeCountConfig,
  renderPage: () => void
) {
  const dialog = root.querySelector<HTMLDialogElement>("[data-lifecount-settings-dialog]");
  const button = root.querySelector<HTMLButtonElement>("[data-lifecount-settings]");
  const form = root.querySelector<HTMLFormElement>("[data-lifecount-settings-form]");
  const birthday = root.querySelector<HTMLInputElement>("[data-lifecount-birthday]");
  const displayAge = root.querySelector<HTMLInputElement>("[data-lifecount-display-age]");
  const cancel = root.querySelector<HTMLButtonElement>("[data-lifecount-settings-cancel]");
  if (!dialog || !button || !form || !birthday || !displayAge || !cancel) return;

  button.addEventListener("click", () => {
    birthday.value = config.birthday;
    displayAge.value = String(config.displayAge);
    dialog.showModal();
  });
  cancel.addEventListener("click", () => dialog.close());
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    config.birthday = birthday.value;
    config.displayAge = Number(displayAge.value);
    dialog.close();
    renderPage();
  });
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
}

function setupStageDrawer(
  root: HTMLElement,
  state: LifeCountState,
  renderPage: () => void
) {
  const button = root.querySelector<HTMLButtonElement>("[data-lifecount-stages]");
  const overlay = root.querySelector<HTMLElement>("[data-lifecount-stages-overlay]");
  const drawer = root.querySelector<HTMLElement>("[data-lifecount-stages-drawer]");
  const close = root.querySelector<HTMLButtonElement>("[data-lifecount-stages-close]");
  const preset = root.querySelector<HTMLSelectElement>("[data-lifecount-preset]");
  if (!button || !overlay || !drawer || !close || !preset) return;

  const setOpen = (open: boolean) => {
    overlay.hidden = !open;
    overlay.dataset.open = String(open);
    button.setAttribute("aria-expanded", String(open));
    if (open) {
      requestAnimationFrame(() => preset.focus());
    } else {
      button.focus();
    }
  };
  button.addEventListener("click", () => setOpen(overlay.hasAttribute("hidden")));
  close.addEventListener("click", () => setOpen(false));
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) setOpen(false);
  });
  drawer.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setOpen(false);
  });
  preset.addEventListener("change", () => {
    state.presetId = preset.value;
    updateUrl({ preset: state.presetId });
    renderPage();
  });
}

function setupLanguageSwitcher(root: HTMLElement, state: LifeCountState, renderPage: () => void) {
  const button = root.querySelector<HTMLButtonElement>("[data-lifecount-language]");
  if (!button) return;
  button.addEventListener("click", () => {
    state.locale = state.locale === "zh-CN" ? "en" : "zh-CN";
    updateUrl({ lang: state.locale });
    renderPage();
  });
}

function renderDomGrid(
  root: HTMLElement,
  cells: LifeCell[],
  unit: LifeUnit,
  stages: LifeStage[],
  today: string,
  messages: LifeCountMessages,
  locale: LifeCountLocale
) {
  const map = root.querySelector<HTMLElement>("[data-lifecount-map]");
  if (!map) return;
  map.className = `lifecount-map lifecount-map-${unit}`;
  map.setAttribute("role", "group");
  map.setAttribute("aria-label", messages.views[unit]);
  const gap = DOM_GRID_GAP_BY_UNIT[unit as "month" | "year"];
  const { columns, cellSize } = fitGrid(map.clientWidth, MIN_CELL_SIZE_BY_UNIT[unit], gap);
  const rows = Math.ceil(cells.length / columns);
  map.dataset.columns = String(columns);
  map.dataset.cellSize = cellSize.toFixed(2);
  map.dataset.gap = String(gap);
  map.dataset.rows = String(rows);
  map.style.setProperty("--lifecount-cell-size", `${cellSize}px`);
  map.style.gridTemplateColumns = `repeat(${columns}, ${cellSize}px)`;
  map.style.gridAutoRows = `${cellSize}px`;
  map.style.justifyContent = "start";
  map.style.columnGap = `${gap}px`;
  map.style.rowGap = `${gap}px`;
  map.replaceChildren();

  const currentIndex = cells.findIndex(
    (cell) => cellStatus(cell, today) === "current"
  );
  const initialFocusIndex = currentIndex >= 0 ? currentIndex : 0;
  cells.forEach((cell, index) => {
    const key = cellColorKey(cell, stages, today);
    const status = cellStatus(cell, today);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "lifecount-cell";
    button.setAttribute(
      "aria-label",
      formatCellLabel(cell, stages, today, messages, locale)
    );
    button.dataset.index = String(index);
    button.tabIndex = index === initialFocusIndex ? 0 : -1;
    button.style.width = `${cellSize}px`;
    button.style.height = `${cellSize}px`;
    setCellStyle(button, key, status);
    button.style.background = cellBackground(key);
    map.append(button);
  });

  if (map.dataset.keyboardReady !== "true") {
    map.dataset.keyboardReady = "true";
    map.addEventListener("keydown", (event) => {
      const target = (event.target as HTMLElement).closest<HTMLButtonElement>(
        ".lifecount-cell"
      );
      if (!target) return;
      const columns = Number(map.dataset.columns);
      const current = Number(target.dataset.index);
      const direction =
        event.key === "ArrowRight"
          ? 1
          : event.key === "ArrowLeft"
            ? -1
            : event.key === "ArrowDown"
              ? columns
              : event.key === "ArrowUp"
                ? -columns
                : 0;
      if (!direction) return;
      const cellCount = map.querySelectorAll(".lifecount-cell").length;
      const nextIndex = Math.max(0, Math.min(cellCount - 1, current + direction));
      const next = map.querySelector<HTMLButtonElement>(
        `[data-index="${nextIndex}"]`
      );
      if (!next || next === target) return;
      event.preventDefault();
      target.tabIndex = -1;
      next.tabIndex = 0;
      next.focus();
    });
  }
}

function renderCanvas(
  root: HTMLElement,
  cells: LifeCell[],
  unit: "day" | "week",
  stages: LifeStage[],
  today: string,
  messages: LifeCountMessages,
  locale: LifeCountLocale
) {
  const map = root.querySelector<HTMLElement>("[data-lifecount-map]");
  if (!map) return;
  map.replaceChildren();
  map.className = `lifecount-map lifecount-map-${unit}`;
  map.setAttribute("role", "img");
  map.setAttribute("tabindex", "0");
  map.setAttribute("aria-label", messages.canvasView[unit]);

  const canvas = document.createElement("canvas");
  canvas.className = "lifecount-canvas";
  map.append(canvas);
  const context = canvas.getContext("2d");
  if (!context) return;

  const gap = unit === "day" ? 1 : 2;
  const { columns, cellSize: cell } = fitGrid(
    map.clientWidth,
    MIN_CELL_SIZE_BY_UNIT[unit],
    gap
  );
  const rows = Math.ceil(cells.length / columns);
  map.dataset.columns = String(columns);
  map.dataset.cellSize = cell.toFixed(2);
  map.dataset.gap = String(gap);
  map.dataset.rows = String(rows);
  const height = rows * (cell + gap) - gap;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.ceil(map.clientWidth * ratio);
  canvas.height = Math.ceil(height * ratio);
  canvas.style.width = `${map.clientWidth}px`;
  canvas.style.height = `${height}px`;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.clearRect(0, 0, map.clientWidth, height);
  const resolvedColors = new Map<string, string>();
  const resolveColor = (value: string) => {
    const cached = resolvedColors.get(value);
    if (cached) return cached;
    const resolved = resolveCssColor(map, value);
    resolvedColors.set(value, resolved);
    return resolved;
  };

  cells.forEach((cellData, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const x = column * (cell + gap);
    const y = row * (cell + gap);
    const key = cellColorKey(cellData, stages, today);
    const status = cellStatus(cellData, today);
    context.fillStyle = resolveColor(cellBackground(key));
    context.fillRect(x, y, cell, cell);
    if (status === "future") {
      context.strokeStyle = resolveColor(
        "color-mix(in srgb, var(--fg-muted) 35%, transparent)"
      );
      context.setLineDash([1, 1]);
      context.strokeRect(x + 0.5, y + 0.5, cell - 1, cell - 1);
      context.setLineDash([]);
    }
    if (status === "current") {
      context.strokeStyle = resolveColor("var(--fg-strong)");
      context.lineWidth = 2;
      context.strokeRect(x + 1, y + 1, cell - 2, cell - 2);
    }
  });

  let activeIndex = cells.findIndex(
    (cellData) => cellStatus(cellData, today) === "current"
  );
  if (activeIndex < 0) activeIndex = 0;
  const updateActive = () => {
    const cellData = cells[activeIndex];
    if (!cellData) return;
    map.setAttribute(
      "aria-label",
      formatCellLabel(cellData, stages, today, messages, locale)
    );
  };
  map.addEventListener("focus", updateActive);
  map.addEventListener("keydown", (event) => {
    const direction =
      event.key === "ArrowRight"
        ? 1
        : event.key === "ArrowLeft"
          ? -1
          : event.key === "ArrowDown"
            ? columns
            : event.key === "ArrowUp"
              ? -columns
              : 0;
    if (!direction) return;
    event.preventDefault();
    activeIndex = Math.max(0, Math.min(cells.length - 1, activeIndex + direction));
    updateActive();
  });
}

function render(root: HTMLElement, config: LifeCountConfig, state: LifeCountState) {
  const url = new URL(window.location.href);
  const unit = validUnit(url.searchParams.get("unit"), config.defaultUnit);
  const today = localDay();
  const preset = validPreset(config, state.presetId);
  const stages = stageDatesForPreset(config.birthday, preset);
  const cells = lifeCells(config.birthday, config.displayAge, unit);
  const elapsed = cells.filter((cell) => cell.end < today).length;
  const age = ageAt(config.birthday, today);
  const messages = lifeCountMessages[state.locale];
  const unitLabel =
    cells.length === 1 ? messages.units[unit].one : messages.units[unit].other;

  state.presetId = preset.id;
  root.dataset.unit = unit;
  root.dataset.preset = preset.id;
  root.dataset.locale = state.locale;
  document.documentElement.lang = state.locale;
  document.title = messages.documentTitle;
  document
    .querySelector<HTMLMetaElement>('meta[name="description"]')
    ?.setAttribute("content", messages.description);
  document
    .querySelector<HTMLMetaElement>('meta[property="og:title"]')
    ?.setAttribute("content", messages.documentTitle);
  document
    .querySelector<HTMLMetaElement>('meta[property="og:description"]')
    ?.setAttribute("content", messages.description);
  document
    .querySelector<HTMLMetaElement>('meta[name="twitter:title"]')
    ?.setAttribute("content", messages.documentTitle);
  document
    .querySelector<HTMLMetaElement>('meta[name="twitter:description"]')
    ?.setAttribute("content", messages.description);

  setText(root, "[data-lifecount-age]", messages.summaryAge(age));
  setText(
    root,
    "[data-lifecount-summary]",
    messages.summaryElapsed(
      elapsed.toLocaleString(state.locale),
      cells.length.toLocaleString(state.locale),
      unitLabel
    )
  );
  renderStaticCopy(root, messages);
  renderPresetOptions(root, config, state, messages);
  renderStages(root, stages, messages, state.locale);
  renderLegend(root, stages, messages);

  root.querySelectorAll<HTMLButtonElement>("[data-lifecount-unit]").forEach((button) => {
    const buttonUnit = validUnit(button.dataset.lifecountUnit ?? null, config.defaultUnit);
    const isActive = buttonUnit === unit;
    button.textContent = messages.units[buttonUnit].short;
    button.setAttribute("aria-label", messages.views[buttonUnit]);
    button.setAttribute("aria-pressed", String(isActive));
    button.classList.toggle("is-active", isActive);
  });

  if (unit === "day" || unit === "week") {
    renderCanvas(root, cells, unit, stages, today, messages, state.locale);
  } else {
    renderDomGrid(root, cells, unit, stages, today, messages, state.locale);
  }
}

export function initLifeCount() {
  const root = document.querySelector<HTMLElement>("[data-lifecount]");
  if (!root || root.dataset.initialized === "true") return;
  root.dataset.initialized = "true";
  const config = readConfig(root);
  if (!config) return;

  const url = new URL(window.location.href);
  const preset = validPreset(config, url.searchParams.get("preset"));
  const state: LifeCountState = {
    locale: resolveLifeCountLocale(url.searchParams.get("lang")),
    presetId: preset.id
  };
  const renderPage = () => render(root, config, state);

  setupSettings(root, config, renderPage);
  setupStageDrawer(root, state, renderPage);
  setupLanguageSwitcher(root, state, renderPage);
  setupThemeToggle(root, renderPage);

  root.querySelectorAll<HTMLButtonElement>("[data-lifecount-unit]").forEach((button) => {
    button.addEventListener("click", () => {
      updateUrl({
        unit: validUnit(button.dataset.lifecountUnit ?? null, config.defaultUnit)
      });
      renderPage();
    });
  });

  let resizeFrame = 0;
  window.addEventListener(
    "resize",
    () => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(renderPage);
    },
    { passive: true }
  );

  renderPage();
}
