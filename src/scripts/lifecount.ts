import type {
  LifeCountConfig,
  LifeColor,
  LifeGender,
  LifePreset,
  LifePresetCountryId,
  LifePresetPathId,
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
  addDays,
  anniversary,
  cellColorKey,
  cellStatus,
  dominantStage,
  formatCellLabel,
  lifeCells,
  lifeCellsUntil,
  localDay,
  OPEN_ENDED_STAGE_END_DATE,
  stageDatesForPreset,
  type LifeCell,
  type LifeCellStatus
} from "@/utils/lifecount";
import {
  lifeCountryAnnotations,
  lifeCountryWikiSources,
  type LifeAnnotationEvent,
  type LifeSpecialPeriod
} from "@/data/lifecount-annotations";
import { biographyById, lifeBiographyProfiles, type LifeBiographyProfile } from "@/data/lifecount-biographies";

const UNITS: LifeUnit[] = ["day", "week", "month", "year"];
const GENDERS: LifeGender[] = ["unspecified", "female", "male"];
const COLOR_VARIABLES: Record<LifeColor, string> = {
  blue: "var(--life-blue)",
  cyan: "var(--life-cyan)",
  green: "var(--life-green)",
  orange: "var(--life-orange)",
  pink: "var(--life-pink)",
  purple: "var(--life-purple)",
  red: "var(--life-red)",
  sand: "var(--life-sand)"
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
  countryId: LifePresetCountryId;
  birthday: string;
  biographyId: string | null;
  biographyRestoreBirthday: string;
  biographyRestorePresetId: string;
  biographyRestoreShowStageAnnotations: boolean;
  biographyRestoreShowCelebrityAnnotations: boolean;
  gender: LifeGender;
  showStageAnnotations: boolean;
  showCelebrityAnnotations: boolean;
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

function validGender(value: string | null): LifeGender {
  return value && GENDERS.includes(value as LifeGender)
    ? (value as LifeGender)
    : "unspecified";
}

function validCountry(
  config: LifeCountConfig,
  value: string | null,
  fallback: LifePresetCountryId
) {
  return config.presets.some((preset) => preset.countryId === value)
    ? (value as LifePresetCountryId)
    : fallback;
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
    if (value) url.searchParams.set(key, value);
    else url.searchParams.delete(key);
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

const CASE_LABELS: Record<LifePresetPathId, { zh: string; en: string }> = {
  "undergraduate-work": { zh: "本科学历", en: "Bachelor degree" },
  "academic-graduate": { zh: "硕士学历", en: "Master degree" },
  "secondary-vocational": { zh: "中职教育", en: "Secondary vocational" },
  "bachelor-work": { zh: "四年制本科", en: "Four-year bachelor" },
  "community-college-transfer": { zh: "社区学院转本科", en: "Community college transfer" },
  "high-school-work": { zh: "高中就业", en: "High school to work" },
  "licence-work": { zh: "Licence 学位", en: "Licence degree" },
  "licence-master": { zh: "Master 学位", en: "Master degree" },
  "vocational-bts": { zh: "BTS 职业文凭", en: "BTS vocational diploma" },
  "england-alevel-bachelor": { zh: "A-level→本科", en: "A levels to bachelor" },
  "england-tlevel-work": { zh: "T Level 就业", en: "T Level to work" },
  "scotland-bachelor": { zh: "苏格兰四年制本科", en: "Scottish four-year bachelor" },
  "eleven-year-bachelor": { zh: "本科学历", en: "Bachelor degree" },
  "eleven-year-specialist": { zh: "专家学位", en: "Specialist degree" },
  "after-grade9-vocational": { zh: "中职教育", en: "Vocational education" },
  "university-work": { zh: "大学学历", en: "University degree" },
  "senmon-work": { zh: "专门学校", en: "Professional training college" },
  "kosen-work": { zh: "高专教育", en: "KOSEN education" },
  "traditional-10plus2-bachelor3": { zh: "三年制本科", en: "Three-year bachelor" },
  "nep-four-year-bachelor": { zh: "四年制本科", en: "Four-year bachelor" },
  "class10-iti": { zh: "ITI 职业培训", en: "ITI vocational training" }
};

function presetCaseLabel(preset: LifePreset, locale: LifeCountLocale) {
  const labels = CASE_LABELS[preset.pathId];
  return locale === "en" ? labels.en : labels.zh;
}

function setCellStyle(
  element: HTMLElement,
  key: ReturnType<typeof cellColorKey>,
  status: LifeCellStatus
) {
  element.dataset.status = status;
  element.dataset.color = key;
  if (key === "elapsed" || key === "future" || key === "current") {
    element.style.removeProperty("--cell-color");
    return;
  }
  element.style.setProperty("--cell-color", COLOR_VARIABLES[key]);
}

function cellBackground(
  key: ReturnType<typeof cellColorKey>,
  status: LifeCellStatus,
  neutralFuture = false
) {
  if (neutralFuture) {
    return "color-mix(in srgb, var(--fg-muted) 24%, var(--bg))";
  }
  if (key === "elapsed") return "color-mix(in srgb, var(--fg-muted) 30%, var(--bg))";
  if (key === "future") return "color-mix(in srgb, var(--fg-muted) 10%, var(--bg))";
  if (key === "current") return "color-mix(in srgb, var(--fg-strong) 38%, var(--bg))";
  if (status === "future") {
    return `color-mix(in srgb, ${COLOR_VARIABLES[key]} 34%, color-mix(in srgb, var(--fg-muted) 14%, var(--bg)))`;
  }
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

function renderCountryOptions(
  root: HTMLElement,
  config: LifeCountConfig,
  state: LifeCountState,
  messages: LifeCountMessages
) {
  const select = root.querySelector<HTMLSelectElement>("[data-lifecount-country]");
  if (!select) return;

  select.replaceChildren(
    ...[...new Set(config.presets.map((preset) => preset.countryId))].map((countryId) => {
      const option = document.createElement("option");
      option.value = countryId;
      option.textContent = messages.countryLabels[countryId];
      return option;
    })
  );
  select.value = state.countryId;
  select.disabled = Boolean(state.biographyId);
  select.setAttribute("aria-label", messages.selectCountry);
}

function renderPresetOptions(
  root: HTMLElement,
  config: LifeCountConfig,
  state: LifeCountState,
  messages: LifeCountMessages,
  locale: LifeCountLocale
) {
  const select = root.querySelector<HTMLSelectElement>("[data-lifecount-preset]");
  if (!select) return;

  select.replaceChildren(
    ...config.presets
      .filter((preset) => preset.countryId === state.countryId)
      .map((preset) => {
        const option = document.createElement("option");
        option.value = preset.id;
        option.textContent = presetCaseLabel(preset, locale);
        return option;
      })
  );
  select.value = state.presetId;
  select.disabled = Boolean(state.biographyId);
  select.setAttribute("aria-label", messages.selectCase);
}

function renderGenderOptions(
  root: HTMLElement,
  state: LifeCountState,
  messages: LifeCountMessages
) {
  const select = root.querySelector<HTMLSelectElement>("[data-lifecount-gender]");
  if (!select) return;

  select.replaceChildren(
    ...GENDERS.map((gender) => {
      const option = document.createElement("option");
      option.value = gender;
      option.textContent = messages.genders[gender];
      return option;
    })
  );
  select.value = state.gender;
  select.disabled = Boolean(state.biographyId);
  select.setAttribute("aria-label", messages.selectGender);
}

function renderBiographyOptions(
  root: HTMLElement,
  state: LifeCountState,
  messages: LifeCountMessages
) {
  const picker = root.querySelector<HTMLElement>("[data-lifecount-biography-picker]");
  const select = root.querySelector<HTMLSelectElement>("[data-lifecount-biography]");
  if (!picker || !select) return;

  select.replaceChildren(
    ...lifeBiographyProfiles.map((profile) => {
      const option = document.createElement("option");
      option.value = profile.id;
      option.textContent = state.locale === "en" ? profile.nameEn : profile.nameZh;
      return option;
    })
  );
  select.value = state.biographyId ?? lifeBiographyProfiles[0]?.id ?? "";
  select.setAttribute("aria-label", messages.selectBiography);
  picker.hidden = !state.biographyId;
}

function createSourceLink(url: string, label: string, className = "lifecount-source-link") {
  const link = document.createElement("a");
  link.className = className;
  link.href = url;
  link.target = "_blank";
  link.rel = "noreferrer";
  link.setAttribute("aria-label", label);
  link.title = label;
  link.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3h7v7"></path><path d="M10 14 21 3"></path><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"></path></svg>';
  return link;
}

function sourceUrlForEvent(countryId: LifePresetCountryId, event: LifeAnnotationEvent) {
  if (event.sourceUrl) return event.sourceUrl;
  const sources = lifeCountryWikiSources[countryId];
  if (event.type === "demographic") return sources.demographics;
  if (event.label.includes("驾驶")) return sources.driving;
  if (/退休|养老金|退出劳动/.test(event.label)) return sources.retirement;
  return sources.ageOfMajority;
}

function sourceLinkLabel(url: string, locale: LifeCountLocale) {
  const isWikipedia = url.includes("wikipedia.org");
  if (locale === "en") {
    return isWikipedia ? "Open Wikipedia source" : "Open data source";
  }
  return isWikipedia ? "打开 Wikipedia 来源" : "打开数据来源";
}

function splitEventReference(label: string) {
  const match = label.match(/^(.+?)[（(]((?:\d{4})(?:[–-]\d{4})?(?:[，,].*)?)[）)]$/);
  return match
    ? { title: match[1], reference: match[2] }
    : { title: label, reference: null };
}

function formatEventDataYear(reference: string, locale: LifeCountLocale) {
  const match = reference.match(/^(\d{4}(?:[–-]\d{4})?)(?:[，,](.+))?$/);
  if (!match) return reference;
  const year = match[1];
  const context = match[2]?.trim();
  if (locale === "en") {
    return context ? `${year} data (${context})` : `${year} data`;
  }
  return context ? `${year} 年数据（${context}）` : `${year} 年数据`;
}

function sourceUrlForSpecialPeriod(countryId: LifePresetCountryId, period: LifeSpecialPeriod) {
  if (period.sourceUrl) return period.sourceUrl;
  return period.label.includes("雇主")
    ? lifeCountryWikiSources[countryId].jobTenure
    : lifeCountryWikiSources[countryId].demographics;
}

function renderLegend(
  root: HTMLElement,
  stages: LifeStage[],
  messages: LifeCountMessages,
  countryId: LifePresetCountryId,
  locale: LifeCountLocale,
  biography: LifeBiographyProfile | null
) {
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
    label.textContent = locale === "en"
      ? stage.labelEn ?? messages.stageLabels[stage.id]
      : stage.labelZh ?? messages.stageLabels[stage.id];
    item.append(dot, label);
    legend.append(item);
  }

  const sourceItem = document.createElement("span");
  sourceItem.className = "lifecount-legend-source";
  sourceItem.setAttribute("role", "listitem");
  sourceItem.append(
    createSourceLink(
      biography?.sourceUrl ?? lifeCountryWikiSources[countryId].education,
      biography
        ? sourceLinkLabel(biography.sourceUrl, locale)
        : locale === "en"
          ? "Open education source on Wikipedia"
          : "在 Wikipedia 查看教育阶段来源"
    )
  );
  legend.append(sourceItem);
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
    title.textContent = locale === "en"
      ? stage.labelEn ?? messages.stageLabels[stage.id]
      : stage.labelZh ?? messages.stageLabels[stage.id];
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

function stageDatesForBiography(
  birthday: string,
  profile: LifeBiographyProfile
): LifeStage[] {
  return profile.stages.flatMap((stage): LifeStage[] => {
    const startDate = anniversary(birthday, stage.startAge * 12);
    if (stage.id === "work" && stage.endAge === null) {
      return [{
        id: "work",
        startDate,
        endDate: profile.deathDate ?? OPEN_ENDED_STAGE_END_DATE,
        color: stage.color,
        labelZh: stage.labelZh,
        labelEn: stage.labelEn
      } satisfies LifeStage];
    }
    const endDate = anniversary(birthday, (stage.endAge ?? stage.startAge) * 12);
    return [{
      id: stage.id,
      startDate,
      endDate: addDays(endDate, -1),
      color: stage.color,
      labelZh: stage.labelZh,
      labelEn: stage.labelEn
    } satisfies LifeStage];
  });
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
  setLabel(root, "[data-lifecount-country]", messages.selectCountry);
  setLabel(root, "[data-lifecount-preset]", messages.selectCase);
  setLabel(root, "[data-lifecount-gender]", messages.selectGender);
  setLabel(root, "[data-lifecount-language]", messages.languageButtonLabel);
  setText(root, "[data-lifecount-language-label]", messages.languageButton);
  root.querySelectorAll<HTMLElement>("[data-lifecount-language-icon]").forEach((icon) => {
    icon.hidden = icon.dataset.lifecountLanguageIcon !== (messages.languageButton === "EN" ? "en" : "zh");
    icon.style.display = icon.hidden ? "none" : "";
  });
  setLabel(root, "[data-lifecount-stage-annotations-toggle]", messages.stageAnnotationsToggle);
  setLabel(root, "[data-lifecount-celebrity-annotations-toggle]", messages.celebrityDeathsToggle);
  setLabel(root, "[data-lifecount-biography-toggle]", messages.biographyToggle);
  setLabel(root, "[data-lifecount-github]", messages.githubRepository);
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
  state: LifeCountState,
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
    birthday.value = state.birthday;
    displayAge.value = String(config.displayAge);
    dialog.showModal();
  });
  cancel.addEventListener("click", () => dialog.close());
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    config.birthday = birthday.value;
    state.birthday = birthday.value;
    state.biographyId = null;
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
  config: LifeCountConfig,
  state: LifeCountState,
  renderPage: () => void
) {
  const button = root.querySelector<HTMLButtonElement>("[data-lifecount-stages]");
  const overlay = root.querySelector<HTMLElement>("[data-lifecount-stages-overlay]");
  const drawer = root.querySelector<HTMLElement>("[data-lifecount-stages-drawer]");
  const close = root.querySelector<HTMLButtonElement>("[data-lifecount-stages-close]");
  const country = root.querySelector<HTMLSelectElement>("[data-lifecount-country]");
  const preset = root.querySelector<HTMLSelectElement>("[data-lifecount-preset]");
  const gender = root.querySelector<HTMLSelectElement>("[data-lifecount-gender]");
  if (!button || !overlay || !drawer || !close || !country || !preset || !gender) return;

  const setOpen = (open: boolean) => {
    overlay.hidden = !open;
    overlay.dataset.open = String(open);
    button.setAttribute("aria-expanded", String(open));
    if (open) {
      requestAnimationFrame(() => country.focus());
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
  country.addEventListener("change", () => {
    state.countryId = validCountry(config, country.value, state.countryId);
    const nextPreset = config.presets.find((item) => item.countryId === state.countryId);
    if (nextPreset) state.presetId = nextPreset.id;
    updateUrl({ preset: state.presetId });
    renderPage();
  });
  preset.addEventListener("change", () => {
    const nextPreset = config.presets.find((item) => item.id === preset.value);
    if (!nextPreset) return;
    state.presetId = nextPreset.id;
    state.countryId = nextPreset.countryId;
    updateUrl({ preset: state.presetId });
    renderPage();
  });
  gender.addEventListener("change", () => {
    state.gender = validGender(gender.value);
    updateUrl({ gender: state.gender });
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

function setupBiographyControls(
  root: HTMLElement,
  config: LifeCountConfig,
  state: LifeCountState,
  renderPage: () => void
) {
  const toggle = root.querySelector<HTMLButtonElement>("[data-lifecount-biography-toggle]");
  const select = root.querySelector<HTMLSelectElement>("[data-lifecount-biography]");
  if (!toggle || !select) return;

  const activate = (profile: LifeBiographyProfile) => {
    if (!state.biographyId) {
      state.biographyRestoreBirthday = state.birthday;
      state.biographyRestorePresetId = state.presetId;
      state.biographyRestoreShowStageAnnotations = state.showStageAnnotations;
      state.biographyRestoreShowCelebrityAnnotations = state.showCelebrityAnnotations;
    }
    state.biographyId = profile.id;
    state.birthday = profile.birthDate;
    state.presetId = profile.basePresetId;
    state.showStageAnnotations = false;
    state.showCelebrityAnnotations = false;
    const preset = validPreset(config, state.presetId);
    state.countryId = preset.countryId;
    updateUrl({ biography: profile.id, preset: state.presetId });
    renderPage();
  };

  const deactivate = () => {
    state.biographyId = null;
    state.birthday = state.biographyRestoreBirthday;
    state.presetId = state.biographyRestorePresetId;
    state.showStageAnnotations = state.biographyRestoreShowStageAnnotations;
    state.showCelebrityAnnotations = state.biographyRestoreShowCelebrityAnnotations;
    state.countryId = validPreset(config, state.presetId).countryId;
    updateUrl({ biography: "", preset: state.presetId });
    renderPage();
  };

  toggle.addEventListener("click", () => {
    if (state.biographyId) {
      deactivate();
      return;
    }
    const profile = lifeBiographyProfiles[0];
    if (profile) activate(profile);
  });

  select.addEventListener("change", () => {
    const profile = biographyById(select.value);
    if (profile) activate(profile);
  });
}

function setupAnnotationToggles(
  root: HTMLElement,
  state: LifeCountState,
  renderPage: () => void
) {
  const stageToggle = root.querySelector<HTMLButtonElement>("[data-lifecount-stage-annotations-toggle]");
  const celebrityToggle = root.querySelector<HTMLButtonElement>("[data-lifecount-celebrity-annotations-toggle]");
  if (!stageToggle || !celebrityToggle) return;

  stageToggle.addEventListener("click", () => {
    state.showStageAnnotations = !state.showStageAnnotations;
    renderPage();
  });
  celebrityToggle.addEventListener("click", () => {
    state.showCelebrityAnnotations = !state.showCelebrityAnnotations;
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
  locale: LifeCountLocale,
  state: LifeCountState,
  countryId: LifePresetCountryId,
  biography: LifeBiographyProfile | null
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
    const neutralBiographyCell = Boolean(
      biography &&
      (status === "future" || (biography.deathDate && cell.start > biography.deathDate))
    );
    const label = formatCellLabel(cell, stages, today, messages, locale);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "lifecount-cell";
    button.setAttribute("aria-label", label);
    button.title = label;
    button.dataset.index = String(index);
    button.tabIndex = index === initialFocusIndex ? 0 : -1;
    button.style.width = `${cellSize}px`;
    button.style.height = `${cellSize}px`;
    setCellStyle(button, key, status);
    button.style.background = cellBackground(key, status, neutralBiographyCell);
    map.append(button);
  });

  renderLifeAnnotations(root, cells, state, countryId, biography);
  setupCellPopover(root, cells, unit, stages, today, messages, locale, countryId, biography);

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
  locale: LifeCountLocale,
  state: LifeCountState,
  countryId: LifePresetCountryId,
  biography: LifeBiographyProfile | null
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
    const neutralBiographyCell = Boolean(
      biography &&
      (status === "future" || (biography.deathDate && cellData.start > biography.deathDate))
    );
    context.fillStyle = resolveColor(cellBackground(key, status, neutralBiographyCell));
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
    map.dataset.activeCell = String(activeIndex);
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

  renderLifeAnnotations(root, cells, state, countryId, biography);
  setupCellPopover(root, cells, unit, stages, today, messages, locale, countryId, biography);
}

function setupCellPopover(
  root: HTMLElement,
  cells: LifeCell[],
  unit: LifeUnit,
  stages: LifeStage[],
  today: string,
  messages: LifeCountMessages,
  locale: LifeCountLocale,
  countryId: LifePresetCountryId,
  biography: LifeBiographyProfile | null
) {
  const map = root.querySelector<HTMLElement>("[data-lifecount-map]");
  const popover = root.querySelector<HTMLElement>("[data-lifecount-cell-popover]");
  const container = root.querySelector<HTMLElement>(".lifecount-map-stage");
  if (!map || !popover || !container || !cells.length) return;

  let hideTimer: number | undefined;
  const clearHideTimer = () => {
    if (hideTimer !== undefined) window.clearTimeout(hideTimer);
  };
  const scheduleHide = () => {
    clearHideTimer();
    hideTimer = window.setTimeout(() => {
      popover.hidden = true;
    }, 160);
  };
  popover.onmouseenter = clearHideTimer;
  popover.onmouseleave = scheduleHide;

  const birthday = cells[0].start;
  const country = lifeCountryAnnotations[countryId];
  const events = [...(biography?.events ?? country?.events ?? [])];
  if (
    biography?.deathDate &&
    !events.some((event) => event.type === "demographic" && event.label.includes("去世"))
  ) {
    events.push({
      age: ageAt(birthday, biography.deathDate),
      label: "去世",
      type: "demographic",
      year: biography.deathDate,
      detail: `${biography.deathDate}；享年 ${ageAt(birthday, biography.deathDate)} 岁。`,
      status: "verified",
      sourceUrl: biography.sourceUrl
    });
  }

  const dateAtAge = (age: number) => {
    const start = new Date(`${birthday}T00:00:00Z`);
    const year = Math.floor(age);
    start.setUTCFullYear(start.getUTCFullYear() + year);
    const next = new Date(start);
    next.setUTCFullYear(next.getUTCFullYear() + 1);
    return new Date(start.getTime() + (next.getTime() - start.getTime()) * (age - year))
      .toISOString().slice(0, 10);
  };
  const eventDate = (event: LifeAnnotationEvent) =>
    biography?.deathDate && event.label.includes("去世")
      ? biography.deathDate
      : dateAtAge(event.age);
  const stageLabel = (stage: LifeStage | undefined) => {
    if (!stage) return locale === "en" ? "Unassigned stage" : "未分配阶段";
    return locale === "en"
      ? stage.labelEn ?? messages.stageLabels[stage.id]
      : stage.labelZh ?? messages.stageLabels[stage.id];
  };
  const text = (value: string) => document.createTextNode(value);
  const appendRow = (dl: HTMLElement, label: string, value: string) => {
    const row = document.createElement("div");
    const term = document.createElement("dt");
    term.textContent = label;
    const description = document.createElement("dd");
    description.textContent = value;
    row.append(term, description);
    dl.append(row);
  };
  const formatPopoverDate = (cell: LifeCell) => {
    const start = new Date(`${cell.start}T00:00:00Z`);
    const end = new Date(`${cell.end}T00:00:00Z`);
    const year = start.getUTCFullYear();
    const month = start.getUTCMonth() + 1;
    const day = start.getUTCDate();
    if (locale !== "zh-CN") {
      if (unit === "year") return String(year);
      if (unit === "month") {
        return new Intl.DateTimeFormat(locale, { year: "numeric", month: "short", timeZone: "UTC" }).format(start);
      }
      const startText = new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "short",
        day: "numeric",
        timeZone: "UTC"
      }).format(start);
      const endText = new Intl.DateTimeFormat(locale, {
        year: end.getUTCFullYear() === year ? undefined : "numeric",
        month: "short",
        day: "numeric",
        timeZone: "UTC"
      }).format(end);
      return startText === endText ? startText : `${startText}–${endText}`;
    }
    if (unit === "year") return `${year}年`;
    if (unit === "month") return `${year}年${month}月`;
    const startText = `${year}年${month}月${day}日`;
    const endYear = end.getUTCFullYear();
    const endMonth = end.getUTCMonth() + 1;
    const endDay = end.getUTCDate();
    if (unit === "day" || cell.start === cell.end) return startText;
    const endText = endYear === year
      ? `${endMonth}月${endDay}日`
      : `${endYear}年${endMonth}月${endDay}日`;
    return `${startText}-${endText}`;
  };

  const show = (index: number, targetRect: DOMRect) => {
    const cell = cells[index];
    if (!cell) return;
    clearHideTimer();
    const status = cellStatus(cell, today);
    const stage = dominantStage(cell, stages);
    const startAge = ageAt(birthday, cell.start);
    const endAge = ageAt(birthday, cell.end);
    const ageLabel = startAge === endAge
      ? `${startAge}${locale === "en" ? " years" : " 岁"}`
      : `${startAge}–${endAge}${locale === "en" ? " years" : " 岁"}`;
    const cellEvents = events.filter((event) => {
      const date = eventDate(event);
      return cell.start <= date && date <= cell.end;
    });

    popover.replaceChildren();
    const kicker = document.createElement("div");
    kicker.className = "lifecount-cell-popover-kicker";
    kicker.textContent = locale === "en" ? "Life stage" : "人生阶段";
    const heading = document.createElement("h3");
    heading.textContent = stageLabel(stage);
    const details = document.createElement("dl");
    appendRow(details, locale === "en" ? "Age" : "年龄", ageLabel);
    appendRow(
      details,
      locale === "en" ? "Date" : "日期",
      formatPopoverDate(cell)
    );
    appendRow(details, locale === "en" ? "Status" : "状态", messages.cellStatus[status]);
    popover.append(kicker, heading, details);

    if (cellEvents.length) {
      const eventSection = document.createElement("div");
      eventSection.className = "lifecount-cell-popover-events";
      for (const event of cellEvents) {
        const eventRow = document.createElement("div");
        eventRow.className = "lifecount-cell-popover-event";
        const eventCopy = document.createElement("div");
        const eventTitle = document.createElement("strong");
        eventTitle.append(text(event.label));
        if (event.sourceUrl) {
          eventTitle.append(createSourceLink(event.sourceUrl, sourceLinkLabel(event.sourceUrl, locale)));
        }
        eventCopy.append(eventTitle);
        if (event.detail) {
          const eventDetail = document.createElement("div");
          eventDetail.className = "lifecount-cell-popover-event-detail";
          eventDetail.textContent = event.detail;
          eventCopy.append(eventDetail);
        }
        eventRow.append(eventCopy);
        eventSection.append(eventRow);
      }
      popover.append(eventSection);
    }

    popover.hidden = false;
    const stageRect = container.getBoundingClientRect();
    const gap = 12;
    const maxLeft = Math.max(8, container.clientWidth - popover.offsetWidth - 8);
    let left = targetRect.right - stageRect.left + gap;
    if (left + popover.offsetWidth > container.clientWidth - 8) {
      left = targetRect.left - stageRect.left - popover.offsetWidth - gap;
    }
    left = Math.max(8, Math.min(maxLeft, left));
    const maxTop = Math.max(8, container.clientHeight - popover.offsetHeight - 8);
    const top = Math.max(8, Math.min(maxTop, targetRect.top - stageRect.top));
    popover.style.left = `${left}px`;
    popover.style.top = `${top}px`;
  };

  if (unit === "month" || unit === "year") {
    map.querySelectorAll<HTMLButtonElement>(".lifecount-cell").forEach((button) => {
      const index = Number(button.dataset.index);
      button.onmouseenter = () => show(index, button.getBoundingClientRect());
      button.onmouseleave = scheduleHide;
      button.onfocus = () => show(index, button.getBoundingClientRect());
      button.onblur = scheduleHide;
      button.onclick = () => show(index, button.getBoundingClientRect());
    });
    return;
  }

  const canvas = map.querySelector<HTMLCanvasElement>(".lifecount-canvas");
  if (!canvas) return;
  const columns = Number(map.dataset.columns);
  const cellSize = Number(map.dataset.cellSize);
  const gap = Number(map.dataset.gap);
  const indexAtPointer = (event: MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const column = Math.floor(x / (cellSize + gap));
    const row = Math.floor(y / (cellSize + gap));
    if (column < 0 || row < 0 || column >= columns) return null;
    const index = row * columns + column;
    return index >= 0 && index < cells.length ? index : null;
  };
  map.onmousemove = (event) => {
    const index = indexAtPointer(event);
    if (index === null) return;
    const rect = canvas.getBoundingClientRect();
    const column = index % columns;
    const row = Math.floor(index / columns);
    const targetRect = new DOMRect(
      rect.left + column * (cellSize + gap),
      rect.top + row * (cellSize + gap),
      cellSize,
      cellSize
    );
    show(index, targetRect);
  };
  map.onmouseleave = scheduleHide;
  map.onclick = (event) => {
    const index = indexAtPointer(event);
    if (index === null) return;
    const rect = canvas.getBoundingClientRect();
    const column = index % columns;
    const row = Math.floor(index / columns);
    show(index, new DOMRect(
      rect.left + column * (cellSize + gap),
      rect.top + row * (cellSize + gap),
      cellSize,
      cellSize
    ));
  };
  map.onfocus = () => {
    const index = Number(map.dataset.activeCell ?? 0);
    const rect = canvas.getBoundingClientRect();
    const column = index % columns;
    const row = Math.floor(index / columns);
    show(index, new DOMRect(
      rect.left + column * (cellSize + gap),
      rect.top + row * (cellSize + gap),
      cellSize,
      cellSize
    ));
  };
}

interface AnnotationPoint {
  x: number;
  y: number;
}

function renderLifeAnnotations(
  root: HTMLElement,
  cells: LifeCell[],
  state: LifeCountState,
  countryId: LifePresetCountryId,
  biography: LifeBiographyProfile | null
) {
  const map = root.querySelector<HTMLElement>("[data-lifecount-map]");
  const annotations = root.querySelector<HTMLElement>("[data-lifecount-annotations]");
  const container = root.querySelector<HTMLElement>(".lifecount-map-stage");
  if (!map || !annotations || !container || !cells.length) return;
  annotations.replaceChildren();
  container.style.minHeight = "";

  const columns = Number(map.dataset.columns);
  const cellSize = Number(map.dataset.cellSize);
  const gap = Number(map.dataset.gap);
  if (!columns || !cellSize || !Number.isFinite(gap)) return;

  const diameter = Math.max(6, cellSize * 1.8);
  const radius = diameter / 2;
  const stroke = Math.max(1, Math.min(3, cellSize * 0.18));
  const axisHeight = 18;
  annotations.style.setProperty("--lifecount-annotation-pin-size", `${diameter}px`);
  annotations.style.setProperty("--lifecount-annotation-stroke", `${stroke}px`);
  container.style.paddingTop = `${radius + stroke + axisHeight}px`;
  const layout = getComputedStyle(container);
  const railWidth = Number.parseFloat(layout.getPropertyValue("--annotation-rail-width"));
  const width = container.clientWidth;
  const gridHeight = map.offsetTop + map.getBoundingClientRect().height + radius + stroke;
  const labelGap = 20;
  const padding = 16;
  const birthday = cells[0].start;
  const country = lifeCountryAnnotations[countryId];
  const specialPeriods = biography?.specialPeriods ?? country?.specialPeriods ?? [];
  const events = [...(biography?.events ?? country?.events ?? [])];
  if (
    biography?.deathDate &&
    !events.some((event) => event.type === "demographic" && event.label.includes("去世"))
  ) {
    events.push({
      age: ageAt(birthday, biography.deathDate),
      label: "去世",
      type: "demographic",
      year: biography.deathDate,
      detail: `${biography.deathDate}；享年 ${ageAt(birthday, biography.deathDate)} 岁。`,
      status: "verified",
      sourceUrl: biography.sourceUrl
    });
  }

  const positionForDate = (date: string): AnnotationPoint | null => {
    const index = cells.findIndex((cell) => cell.start <= date && date <= cell.end);
    if (index < 0) return null;
    return {
      x: map.offsetLeft + (index % columns) * (cellSize + gap) + cellSize / 2,
      y: map.offsetTop + Math.floor(index / columns) * (cellSize + gap) + cellSize / 2
    };
  };
  const dateAtAge = (age: number) => {
    const start = new Date(`${birthday}T00:00:00Z`);
    const year = Math.floor(age);
    start.setUTCFullYear(start.getUTCFullYear() + year);
    const next = new Date(start);
    next.setUTCFullYear(next.getUTCFullYear() + 1);
    return new Date(start.getTime() + (next.getTime() - start.getTime()) * (age - year))
      .toISOString().slice(0, 10);
  };
  const drawLine = (
    parent: HTMLElement,
    start: AnnotationPoint,
    end: AnnotationPoint,
    className: string,
    startInset = 0,
    endInset = 0
  ) => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const distance = Math.hypot(dx, dy);
    if (distance <= startInset + endInset) return;
    const x = start.x + dx / distance * startInset;
    const y = start.y + dy / distance * startInset;
    const line = document.createElement("span");
    line.className = `lifecount-connector ${className}`;
    line.style.left = `${x}px`;
    line.style.top = `${y}px`;
    line.style.width = `${distance - startInset - endInset}px`;
    line.style.transform = `translateY(-50%) rotate(${Math.atan2(dy, dx)}rad)`;
    line.dataset.startX = String(x);
    line.dataset.startY = String(y);
    line.dataset.endX = String(end.x - dx / distance * endInset);
    line.dataset.endY = String(end.y - dy / distance * endInset);
    line.setAttribute("aria-hidden", "true");
    parent.append(line);
  };
  const drawPin = (parent: HTMLElement, point: AnnotationPoint) => {
    const pin = document.createElement("span");
    pin.className = "lifecount-stage-pin";
    pin.style.left = `${point.x}px`;
    pin.style.top = `${point.y}px`;
    pin.setAttribute("aria-hidden", "true");
    parent.append(pin);
  };
  const labels: Array<{
    group: HTMLElement;
    element: HTMLElement;
    anchor: AnnotationPoint;
    side: "left" | "right";
    inset: number;
    height: number;
    top: number;
  }> = [];
  const appendLabel = (
    group: HTMLElement,
    anchor: AnnotationPoint,
    title: string,
    detail: string,
    inset: number,
    sourceUrl: string | null
  ) => {
    const side = anchor.x < map.offsetLeft + map.clientWidth / 2 ? "left" : "right";
    const element = document.createElement("span");
    element.className = `lifecount-annotation-text lifecount-annotation-text-${side}`;
    element.style.width = `${railWidth}px`;
    element.dataset.side = side;
    const heading = document.createElement("div");
    heading.className = "lifecount-annotation-heading";
    const titleElement = document.createElement("strong");
    titleElement.textContent = title;
    heading.append(titleElement);
    if (sourceUrl) {
      heading.append(
        createSourceLink(
          sourceUrl,
          sourceLinkLabel(sourceUrl, state.locale)
        )
      );
    }
    const description = document.createElement("span");
    description.textContent = detail;
    element.append(heading, description);
    group.append(element);
    annotations.append(group);
    labels.push({
      group, element, anchor, side, inset,
      height: element.getBoundingClientRect().height,
      top: 0
    });
  };
  const appendPoint = (
    age: number,
    title: string,
    detail: string,
    className: string,
    sourceUrl: string | null
  ) => {
    appendPointAtDate(dateAtAge(age), title, detail, className, sourceUrl);
  };
  const appendPointAtDate = (
    date: string,
    title: string,
    detail: string,
    className: string,
    sourceUrl: string | null
  ) => {
    const point = positionForDate(date);
    if (!point) return;
    const group = document.createElement("span");
    group.className = `lifecount-annotation-group ${className}`;
    drawPin(group, point);
    appendLabel(group, point, title, detail, radius, sourceUrl);
  };

  if (state.showStageAnnotations || biography) {
    for (const period of specialPeriods) {
      const start = positionForDate(dateAtAge(period.startAge));
      const end = positionForDate(
        period.endAge === null ? localDay() : dateAtAge(period.endAge)
      );
      if (!start || !end) continue;
      const group = document.createElement("span");
      group.className = "lifecount-annotation-group lifecount-special-period-annotation";
      drawPin(group, start);
      drawPin(group, end);
      drawLine(group, start, end, "lifecount-special-period-line", radius, radius);
      appendLabel(
        group,
        { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 },
        period.label,
        period.detail,
        0,
        sourceUrlForSpecialPeriod(countryId, period)
      );
    }
    const eventsByDate = new Map<string, LifeAnnotationEvent[]>();
    for (const event of events) {
      const date = biography?.deathDate && event.label.includes("去世")
        ? biography.deathDate
        : dateAtAge(event.age);
      eventsByDate.set(date, [...(eventsByDate.get(date) ?? []), event]);
    }
    for (const eventGroup of eventsByDate.values()) {
      const firstEvent = eventGroup[0];
      const parsedLabels = eventGroup.map((event) => splitEventReference(event.label));
      const title = parsedLabels.map((item) => item.title).join("、");
      const detail = [...new Set(
        eventGroup
          .flatMap((event, index) => {
            if (event.detail) return [event.detail];
            const reference = parsedLabels[index].reference;
            return reference
              ? [formatEventDataYear(reference, state.locale)]
              : event.year === null
                ? []
                : [formatEventDataYear(String(event.year), state.locale)];
          })
          .filter(Boolean)
      )].join("、");
      const eventDate = biography?.deathDate && parsedLabels.some((item) => item.title.includes("去世"))
        ? biography.deathDate
        : dateAtAge(firstEvent.age);
      appendPointAtDate(
        eventDate,
        title,
        detail,
        "lifecount-event-annotation",
        sourceUrlForEvent(countryId, firstEvent)
      );
    }
  }
  if (state.showCelebrityAnnotations) {
    for (const person of country?.celebrities ?? []) {
      if (person.age === null) continue;
      const celebrityTitle =
        state.locale === "en"
          ? `${person.name} (${person.age})`
          : `${person.name}（${person.age}岁）`;
      appendPoint(
        person.age,
        celebrityTitle,
        `${state.locale === "en" ? "Died" : "去世"} ${person.death}`,
        "lifecount-celebrity-annotation",
        person.sourceUrl
      );
    }
  }

  // All labels, including their secondary text, share the same two rail layouts.
  const sides = ["left", "right"] as const;
  const requiredHeight = Math.max(gridHeight, ...sides.map((side) => {
    const items = labels.filter((label) => label.side === side);
    return padding * 2 + items.reduce((sum, item) => sum + item.height, 0)
      + Math.max(0, items.length - 1) * labelGap;
  }));
  container.style.minHeight = `${requiredHeight}px`;
  for (const side of sides) {
    const items = labels.filter((label) => label.side === side).sort((a, b) => a.anchor.y - b.anchor.y);
    let nextTop = padding;
    for (const item of items) {
      item.top = Math.max(nextTop, item.anchor.y - 24 - item.height / 2);
      nextTop = item.top + item.height + labelGap;
    }
    let bottom = requiredHeight - padding;
    for (const item of [...items].reverse()) {
      item.top = Math.min(item.top, bottom - item.height);
      bottom = item.top - labelGap;
    }
    for (const item of items) {
      item.element.style.top = `${item.top}px`;
      const endpoint = {
        x: side === "left" ? railWidth + 8 : width - railWidth - 8,
        y: item.top + item.height / 2
      };
      drawLine(item.group, item.anchor, endpoint, "lifecount-label-connector", item.inset);
    }
  }

  const xAxis = root.querySelector<HTMLElement>("[data-lifecount-axis-x]");
  const yAxis = root.querySelector<HTMLElement>("[data-lifecount-axis-y]");
  if (xAxis && yAxis) {
    const createAxisLabel = (text: string) => {
      const label = document.createElement("span");
      label.className = "lifecount-axis-label";
      label.textContent = text;
      return label;
    };
    xAxis.replaceChildren();
    yAxis.replaceChildren();
    xAxis.style.left = `${map.offsetLeft}px`;
    xAxis.style.top = `${Math.max(0, map.offsetTop - 18)}px`;
    xAxis.style.width = `${map.clientWidth}px`;
    xAxis.style.height = "1rem";
    yAxis.style.left = "0";
    yAxis.style.top = `${map.offsetTop}px`;
    yAxis.style.width = `${map.offsetLeft}px`;
    yAxis.style.height = `${map.offsetHeight}px`;

    for (let column = 0; column < columns; column += 5) {
      const value = column;
      const label = createAxisLabel(String(value));
      label.style.left = `${column * (cellSize + gap) + cellSize / 2}px`;
      xAxis.append(label);
    }

    const lastCell = cells.at(-1);
    if (lastCell) {
      const birth = new Date(`${birthday}T00:00:00Z`).getTime();
      const last = new Date(`${lastCell.end}T00:00:00Z`).getTime();
      const maxAge = Math.ceil((last - birth) / (365.2425 * 24 * 60 * 60 * 1000));
      for (let age = 5; age <= maxAge; age += 5) {
        const point = positionForDate(dateAtAge(age));
        if (!point) continue;
        const label = createAxisLabel(String(age));
        label.style.top = `${point.y - map.offsetTop}px`;
        yAxis.append(label);
      }
    }
  }
}

function render(root: HTMLElement, config: LifeCountConfig, state: LifeCountState) {
  const url = new URL(window.location.href);
  const unit = validUnit(url.searchParams.get("unit"), config.defaultUnit);
  const today = localDay();
  const preset = validPreset(config, state.presetId);
  const biography = biographyById(state.biographyId);
  const stages = biography
    ? stageDatesForBiography(state.birthday, biography)
    : stageDatesForPreset(state.birthday, preset, state.gender);
  const cells = biography?.deathDate
    ? lifeCellsUntil(state.birthday, addDays(biography.deathDate, 1), unit)
    : lifeCells(state.birthday, config.displayAge, unit);
  const lifeEnd = biography?.deathDate ?? today;
  const elapsed = cells.filter((cell) => cell.end < lifeEnd).length;
  const age = ageAt(state.birthday, lifeEnd);
  const messages = lifeCountMessages[state.locale];
  const unitLabel =
    cells.length === 1 ? messages.units[unit].one : messages.units[unit].other;

  state.presetId = preset.id;
  state.countryId = preset.countryId;
  root.dataset.unit = unit;
  root.dataset.preset = preset.id;
  root.dataset.gender = state.gender;
  root.dataset.locale = state.locale;
  root.dataset.biography = biography?.id ?? "";
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
  setText(
    root,
    "[data-lifecount-stages-title]",
    biography
      ? `${state.locale === "en" ? biography.nameEn : biography.nameZh} · ${messages.stages}`
      : messages.stages
  );
  const settingsButton = root.querySelector<HTMLButtonElement>("[data-lifecount-settings]");
  const stageAnnotationToggle = root.querySelector<HTMLButtonElement>("[data-lifecount-stage-annotations-toggle]");
  const celebrityAnnotationToggle = root.querySelector<HTMLButtonElement>("[data-lifecount-celebrity-annotations-toggle]");
  const biographyToggle = root.querySelector<HTMLButtonElement>("[data-lifecount-biography-toggle]");
  if (settingsButton) settingsButton.disabled = Boolean(biography);
  if (stageAnnotationToggle) {
    setText(root, "[data-lifecount-stage-label]", messages.stageAnnotations);
    stageAnnotationToggle.setAttribute("aria-pressed", String(state.showStageAnnotations));
    stageAnnotationToggle.disabled = Boolean(biography);
  }
  if (celebrityAnnotationToggle) {
    setText(root, "[data-lifecount-celebrity-label]", messages.celebrityDeaths);
    celebrityAnnotationToggle.setAttribute("aria-pressed", String(state.showCelebrityAnnotations));
    celebrityAnnotationToggle.disabled = Boolean(biography);
  }
  if (biographyToggle) {
    setText(root, "[data-lifecount-biography-label]", messages.biography);
    biographyToggle.setAttribute("aria-pressed", String(Boolean(state.biographyId)));
  }
  renderCountryOptions(root, config, state, messages);
  renderPresetOptions(root, config, state, messages, state.locale);
  renderGenderOptions(root, state, messages);
  renderBiographyOptions(root, state, messages);
  renderStages(root, stages, messages, state.locale);
  renderLegend(root, stages, messages, preset.countryId, state.locale, biography);

  root.querySelectorAll<HTMLButtonElement>("[data-lifecount-unit]").forEach((button) => {
    const buttonUnit = validUnit(button.dataset.lifecountUnit ?? null, config.defaultUnit);
    const isActive = buttonUnit === unit;
    button.textContent = messages.units[buttonUnit].short;
    button.setAttribute("aria-label", messages.views[buttonUnit]);
    button.setAttribute("aria-pressed", String(isActive));
    button.classList.toggle("is-active", isActive);
  });

  if (unit === "day" || unit === "week") {
    renderCanvas(root, cells, unit, stages, today, messages, state.locale, state, preset.countryId, biography);
  } else {
    renderDomGrid(root, cells, unit, stages, today, messages, state.locale, state, preset.countryId, biography);
  }
}

export function initLifeCount() {
  const root = document.querySelector<HTMLElement>("[data-lifecount]");
  if (!root || root.dataset.initialized === "true") return;
  root.dataset.initialized = "true";
  const config = readConfig(root);
  if (!config) return;

  const url = new URL(window.location.href);
  const requestedPresetId = url.searchParams.get("preset");
  const requestedBiography = biographyById(url.searchParams.get("biography"));
  const preset = validPreset(config, requestedBiography?.basePresetId ?? requestedPresetId);
  if (requestedPresetId && requestedPresetId !== preset.id) {
    updateUrl({ preset: preset.id });
  }
  const requestedGender = url.searchParams.get("gender");
  const gender = validGender(requestedGender);
  if (requestedGender && requestedGender !== gender) {
    updateUrl({ gender });
  }
  const state: LifeCountState = {
    locale: resolveLifeCountLocale(url.searchParams.get("lang")),
    presetId: preset.id,
    countryId: preset.countryId,
    birthday: requestedBiography?.birthDate ?? config.birthday,
    biographyId: requestedBiography?.id ?? null,
    biographyRestoreBirthday: config.birthday,
    biographyRestorePresetId: validPreset(config, requestedPresetId).id,
    biographyRestoreShowStageAnnotations: false,
    biographyRestoreShowCelebrityAnnotations: false,
    gender,
    showStageAnnotations: false,
    showCelebrityAnnotations: false
  };
  const renderPage = () => render(root, config, state);

  setupSettings(root, config, state, renderPage);
  setupStageDrawer(root, config, state, renderPage);
  setupLanguageSwitcher(root, state, renderPage);
  setupBiographyControls(root, config, state, renderPage);
  setupAnnotationToggles(root, state, renderPage);
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
