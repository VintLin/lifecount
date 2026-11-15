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
const MAP_GRID_MAX_WIDTH = 672;
const FULL_ANNOTATION_RAIL_WIDTH = 168;
const FULL_ANNOTATION_GAP = 48;
const COMPACT_ANNOTATION_RAIL_WIDTH = 18;
const COMPACT_ANNOTATION_GAP = 12;
const COMPACT_GRID_GUTTER = 30;
const MIN_TEXT_ANNOTATION_RAIL_WIDTH = 120;
const MIN_TEXT_ANNOTATION_GAP = 16;
const MAP_STAGE_MAX_WIDTH = MAP_GRID_MAX_WIDTH +
  (FULL_ANNOTATION_RAIL_WIDTH + FULL_ANNOTATION_GAP) * 2;
const MAP_STAGE_VIEWPORT_PADDING = 32;
interface LifeCountState {
  locale: LifeCountLocale;
  settingsTab: "me" | "biography";
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
  picker.hidden = false;
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
  locale: LifeCountLocale,
  selector = "[data-lifecount-stage-list]"
) {
  const list = root.querySelector<HTMLElement>(selector);
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
  setText(
    root,
    "[data-lifecount-country-field-label]",
    messages.selectCountry === "选择国家" ? "预设国家" : "Preset country"
  );
  setText(
    root,
    "[data-lifecount-preset-field-label]",
    messages.selectCase === "选择典型人生案例" ? "预设人生" : "Preset life path"
  );
  setLabel(root, "[data-lifecount-settings]", messages.settings);
  setLabel(root, "[data-lifecount-stages]", messages.stagesOpen);
  setLabel(root, "[data-lifecount-stages-close]", messages.close);
  setLabel(root, "[data-lifecount-country]", messages.selectCountry);
  setLabel(root, "[data-lifecount-preset]", messages.selectCase);
  setLabel(root, "[data-lifecount-gender]", messages.selectGender);
  setLabel(root, "[data-lifecount-language]", messages.languageButtonLabel);
  setText(
    root,
    "[data-lifecount-language-label]",
    messages.languageButton === "EN" ? "中文" : "English"
  );
  setLabel(root, "[data-lifecount-stage-annotations-toggle]", messages.stageAnnotationsToggle);
  setLabel(root, "[data-lifecount-celebrity-annotations-toggle]", messages.celebrityDeathsToggle);
  setLabel(root, "[data-lifecount-biography-toggle]", messages.biographyToggle);
  setLabel(root, "[data-lifecount-github]", messages.githubRepository);
  setLabel(root, "[data-lifecount-legend]", messages.legend);

  const language = root.querySelector<HTMLSelectElement>("[data-lifecount-language]");
  if (language) {
    const isEnglish = messages.languageButton !== "EN";
    language.value = isEnglish ? "en" : "zh-CN";
    language.closest(".lifecount-language-select")?.classList.toggle("is-english", isEnglish);
  }

  const drawer = root.querySelector<HTMLDialogElement>("[data-lifecount-stages-drawer]");
  drawer?.setAttribute("aria-label", messages.stages);
  root.querySelector<HTMLSelectElement>("[data-lifecount-unit-select]")?.setAttribute("aria-label", messages.selectUnit);
}

function closeCustomSelectMenus(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>("[data-lifecount-select-menu]").forEach((menu) => {
    menu.hidden = true;
    menu.closest<HTMLElement>("[data-lifecount-custom-select]")
      ?.querySelector<HTMLButtonElement>("[data-lifecount-select-trigger]")
      ?.setAttribute("aria-expanded", "false");
  });
}

function syncCustomSelectMenus(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>("[data-lifecount-custom-select]").forEach((wrapper) => {
    const select = wrapper.querySelector<HTMLSelectElement>(".lifecount-native-select");
    const trigger = wrapper.querySelector<HTMLButtonElement>("[data-lifecount-select-trigger]");
    const menu = wrapper.querySelector<HTMLElement>("[data-lifecount-select-menu]");
    if (!select || !trigger || !menu) return;

    const selectedOption = select.selectedOptions[0];
    const value = wrapper.querySelector<HTMLElement>(
      "[data-lifecount-language-label], [data-lifecount-unit-label], [data-lifecount-country-value], [data-lifecount-preset-value], [data-lifecount-biography-value]"
    );
    if (value) value.textContent = selectedOption?.textContent ?? "";
    trigger.disabled = select.disabled;
    trigger.setAttribute("aria-label", select.getAttribute("aria-label") ?? "");
    trigger.setAttribute("aria-expanded", "false");

    menu.replaceChildren(
      ...[...select.options].map((option) => {
        const item = document.createElement("button");
        item.type = "button";
        item.className = "lifecount-select-option";
        item.setAttribute("role", "option");
        item.setAttribute("aria-selected", String(option.value === select.value));
        item.dataset.value = option.value;
        const check = document.createElement("span");
        check.className = "lifecount-select-option-check";
        check.textContent = "✓";
        check.setAttribute("aria-hidden", "true");
        const label = document.createElement("span");
        label.textContent = option.textContent ?? option.value;
        item.append(label, check);
        item.addEventListener("click", () => {
          select.value = option.value;
          select.dispatchEvent(new Event("change", { bubbles: true }));
          closeCustomSelectMenus(root);
          trigger.focus();
        });
        return item;
      })
    );
    menu.hidden = true;
  });
}

function setupCustomSelectMenus(root: HTMLElement) {
  const wrappers = [...root.querySelectorAll<HTMLElement>("[data-lifecount-custom-select]")];
  if (!wrappers.length) return;

  const closeMenus = () => closeCustomSelectMenus(root);
  wrappers.forEach((wrapper) => {
    const trigger = wrapper.querySelector<HTMLButtonElement>("[data-lifecount-select-trigger]");
    const menu = wrapper.querySelector<HTMLElement>("[data-lifecount-select-menu]");
    if (!trigger || !menu) return;

    trigger.addEventListener("click", () => {
      if (trigger.disabled) return;
      const willOpen = menu.hidden;
      closeMenus();
      menu.hidden = !willOpen;
      trigger.setAttribute("aria-expanded", String(willOpen));
    });
    trigger.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " " && event.key !== "ArrowDown") return;
      event.preventDefault();
      trigger.click();
    });
  });

  document.addEventListener("click", (event) => {
    const target = event.target as Node;
    if (!wrappers.some((wrapper) => wrapper.contains(target))) closeMenus();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenus();
  });
  syncCustomSelectMenus(root);
}

function setupSettings(
  root: HTMLElement,
  config: LifeCountConfig,
  state: LifeCountState,
  renderPage: () => void
) {
  const dialog = root.querySelector<HTMLDialogElement>("[data-lifecount-settings-dialog]");
  const button = root.querySelector<HTMLButtonElement>("[data-lifecount-settings]");
  const birthday = root.querySelector<HTMLInputElement>("[data-lifecount-birthday]");
  const displayAge = root.querySelector<HTMLInputElement>("[data-lifecount-display-age]");
  const country = root.querySelector<HTMLSelectElement>("[data-lifecount-country]");
  const preset = root.querySelector<HTMLSelectElement>("[data-lifecount-preset]");
  if (!dialog || !button || !birthday || !displayAge || !country || !preset) return;

  const positionDialog = () => {
    if (!dialog.open) return;
    const buttonRect = button.getBoundingClientRect();
    const dialogHeight = dialog.getBoundingClientRect().height;
    const top = Math.min(
      buttonRect.bottom + 8,
      Math.max(8, window.innerHeight - dialogHeight - 8)
    );
    const right = Math.max(8, window.innerWidth - buttonRect.right);
    dialog.style.setProperty("--lifecount-settings-top", `${top}px`);
    dialog.style.setProperty("--lifecount-settings-right", `${right}px`);
  };

  button.addEventListener("click", () => {
    birthday.value = state.birthday;
    displayAge.value = String(config.displayAge);
    requestAnimationFrame(positionDialog);
  });
  window.addEventListener("resize", positionDialog);

  const commitMeSettings = () => {
    if (!birthday.value || !displayAge.validity.valid) return;
    config.birthday = birthday.value;
    state.birthday = birthday.value;
    state.biographyId = null;
    state.settingsTab = "me";
    config.displayAge = Number(displayAge.value);
    renderPage();
  };

  birthday.addEventListener("input", commitMeSettings);
  displayAge.addEventListener("input", commitMeSettings);

  country.addEventListener("change", () => {
    const countryId = country.value as LifePresetCountryId;
    const nextPreset = config.presets.find((item) => item.countryId === countryId);
    if (!nextPreset) return;
    state.countryId = countryId;
    state.presetId = nextPreset.id;
    state.biographyId = null;
    state.settingsTab = "me";
    updateUrl({ biography: "", preset: nextPreset.id });
    renderPage();
  });

  preset.addEventListener("change", () => {
    const nextPreset = validPreset(config, preset.value);
    state.presetId = nextPreset.id;
    state.countryId = nextPreset.countryId;
    state.biographyId = null;
    state.settingsTab = "me";
    updateUrl({ biography: "", preset: nextPreset.id });
    renderPage();
  });
}

function setupLanguageSwitcher(root: HTMLElement, state: LifeCountState, renderPage: () => void) {
  const select = root.querySelector<HTMLSelectElement>("[data-lifecount-language]");
  if (!select) return;
  select.addEventListener("change", () => {
    state.locale = resolveLifeCountLocale(select.value);
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
  const select = root.querySelector<HTMLSelectElement>("[data-lifecount-biography]");
  const tabs = [...root.querySelectorAll<HTMLButtonElement>("[data-lifecount-settings-tab]")];
  if (!select || !tabs.length) return;

  const activate = (profile: LifeBiographyProfile) => {
    if (!state.biographyId) {
      state.biographyRestoreBirthday = state.birthday;
      state.biographyRestorePresetId = state.presetId;
      state.biographyRestoreShowStageAnnotations = state.showStageAnnotations;
      state.biographyRestoreShowCelebrityAnnotations = state.showCelebrityAnnotations;
    }
    state.settingsTab = "biography";
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
    state.settingsTab = "me";
    state.biographyId = null;
    state.birthday = state.biographyRestoreBirthday;
    state.presetId = state.biographyRestorePresetId;
    state.showStageAnnotations = state.biographyRestoreShowStageAnnotations;
    state.showCelebrityAnnotations = state.biographyRestoreShowCelebrityAnnotations;
    state.countryId = validPreset(config, state.presetId).countryId;
    updateUrl({ biography: "", preset: state.presetId });
    renderPage();
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const nextTab = tab.dataset.lifecountSettingsTab;
      if (nextTab === "biography") {
        const profile = biographyById(state.biographyId) ?? lifeBiographyProfiles[0];
        if (profile) activate(profile);
        return;
      }
      if (state.biographyId) {
        deactivate();
        return;
      }
      state.settingsTab = "me";
      renderPage();
    });
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

function prepareMapStageLayout(root: HTMLElement) {
  const container = root.querySelector<HTMLElement>(".lifecount-map-stage");
  if (!container) return;

  const pageWidth = Math.min(root.clientWidth, MAP_GRID_MAX_WIDTH);
  const availableStageWidth = Math.max(
    pageWidth,
    0,
    Math.min(window.innerWidth - MAP_STAGE_VIEWPORT_PADDING, MAP_STAGE_MAX_WIDTH)
  );
  const externalSpace = Math.max(0, (availableStageWidth - pageWidth) / 2);
  const showText = externalSpace >=
    MIN_TEXT_ANNOTATION_RAIL_WIDTH + MIN_TEXT_ANNOTATION_GAP;
  const compact = !showText;
  const railWidth = showText
    ? Math.min(
      FULL_ANNOTATION_RAIL_WIDTH,
      Math.max(MIN_TEXT_ANNOTATION_RAIL_WIDTH, externalSpace - MIN_TEXT_ANNOTATION_GAP)
    )
    : COMPACT_ANNOTATION_RAIL_WIDTH;
  const annotationGap = showText
    ? railWidth >= FULL_ANNOTATION_RAIL_WIDTH
      ? FULL_ANNOTATION_GAP
      : MIN_TEXT_ANNOTATION_GAP
    : COMPACT_ANNOTATION_GAP;
  const gridGutter = compact
    ? COMPACT_GRID_GUTTER
    : railWidth + annotationGap;
  const gridWidth = Math.max(
    0,
    Math.min(pageWidth, availableStageWidth - gridGutter * 2)
  );
  // Set the stage before the grid or canvas measures its width. Otherwise a
  // resize can leave the canvas one render behind the visible grid.
  container.style.width = `${availableStageWidth}px`;
  container.style.left = "50%";
  container.style.marginInline = "0";
  container.style.transform = "translateX(-50%)";
  container.style.setProperty("--lifecount-grid-width", `${gridWidth}px`);
  container.dataset.annotationMode = compact ? "compact" : "full";
  container.style.setProperty("--annotation-rail-width", `${railWidth}px`);
  container.style.setProperty("--annotation-grid-gap", `${annotationGap}px`);
  container.style.setProperty("--lifecount-grid-gutter", `${gridGutter}px`);
  root.querySelector<HTMLElement>(".lifecount-panel")?.style.setProperty(
    "--lifecount-grid-width",
    `${gridWidth}px`
  );
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
  const annotationPopover = root.querySelector<HTMLElement>("[data-lifecount-annotation-popover]");
  const container = root.querySelector<HTMLElement>(".lifecount-map-stage");
  if (!map || !annotations || !container || !cells.length) return;
  annotations.replaceChildren();
  if (annotationPopover) {
    annotationPopover.replaceChildren();
    annotationPopover.hidden = true;
  }
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
  const compact = container.dataset.annotationMode === "compact";
  const layout = getComputedStyle(container);
  const railWidth = Number.parseFloat(layout.getPropertyValue("--annotation-rail-width"));
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
  type AnnotationLabel = {
    group: HTMLElement;
    element: HTMLElement;
    dot: HTMLButtonElement;
    anchor: AnnotationPoint;
    side: "left" | "right";
    inset: number;
    height: number;
    top: number;
  };
  const labels: AnnotationLabel[] = [];
  let annotationPopoverHideTimer: number | undefined;
  const clearAnnotationPopoverHide = () => {
    if (annotationPopoverHideTimer !== undefined) {
      window.clearTimeout(annotationPopoverHideTimer);
      annotationPopoverHideTimer = undefined;
    }
  };
  const scheduleAnnotationPopoverHide = () => {
    clearAnnotationPopoverHide();
    annotationPopoverHideTimer = window.setTimeout(() => {
      if (annotationPopover) annotationPopover.hidden = true;
    }, 180);
  };
  const showAnnotationPopover = (label: AnnotationLabel) => {
    if (!annotationPopover || !compact) return;
    clearAnnotationPopoverHide();
    annotationPopover.replaceChildren();
    const heading = document.createElement("strong");
    heading.textContent = label.element.querySelector("strong")?.textContent ?? label.dot.title;
    annotationPopover.append(heading);
    const detail = label.element.querySelector<HTMLElement>(":scope > span");
    if (detail?.textContent) {
      const detailElement = document.createElement("span");
      detailElement.textContent = detail.textContent;
      annotationPopover.append(detailElement);
    }
    const sourceLink = label.element.querySelector<HTMLAnchorElement>(".lifecount-source-link");
    if (sourceLink) {
      const link = sourceLink.cloneNode(true) as HTMLAnchorElement;
      link.classList.add("lifecount-source-link");
      annotationPopover.append(link);
    }
    annotationPopover.hidden = false;
    const stageRect = container.getBoundingClientRect();
    const dotRect = label.dot.getBoundingClientRect();
    const popoverWidth = annotationPopover.getBoundingClientRect().width;
    const popoverHeight = annotationPopover.getBoundingClientRect().height;
    const desiredLeft = label.side === "left"
      ? dotRect.left - popoverWidth - 12
      : dotRect.right + 12;
    const left = Math.max(8, Math.min(
      desiredLeft,
      window.innerWidth - popoverWidth - 8
    ));
    const desiredTop = dotRect.top - 12;
    const top = Math.max(8, Math.min(
      desiredTop,
      window.innerHeight - popoverHeight - 8
    ));
    annotationPopover.style.left = `${left - stageRect.left}px`;
    annotationPopover.style.top = `${top - stageRect.top}px`;
    annotationPopover.onmouseenter = clearAnnotationPopoverHide;
    annotationPopover.onmouseleave = scheduleAnnotationPopoverHide;
  };
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
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "lifecount-annotation-dot";
    dot.setAttribute("aria-label", title);
    dot.title = title;
    group.append(dot);
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
    const label: AnnotationLabel = {
      group, element, dot, anchor, side, inset,
      height: element.getBoundingClientRect().height,
      top: 0
    };
    labels.push(label);
    dot.addEventListener("mouseenter", () => showAnnotationPopover(label));
    dot.addEventListener("focus", () => showAnnotationPopover(label));
    dot.addEventListener("click", () => showAnnotationPopover(label));
    dot.addEventListener("mouseleave", scheduleAnnotationPopoverHide);
    dot.addEventListener("blur", scheduleAnnotationPopoverHide);
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
      const endpointGap = compact
        ? 24
        : Math.max(8, Number.parseFloat(layout.getPropertyValue("--annotation-grid-gap")) - 8);
      const endpoint = {
        x: side === "left"
          ? map.offsetLeft - endpointGap
          : map.offsetLeft + map.clientWidth + endpointGap,
        y: item.top + item.height / 2
      };
      item.dot.style.left = `${endpoint.x}px`;
      item.dot.style.top = `${endpoint.y}px`;
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
  const settingsButton = root.querySelector<HTMLButtonElement>("[data-lifecount-settings]");
  const stageAnnotationToggle = root.querySelector<HTMLButtonElement>("[data-lifecount-stage-annotations-toggle]");
  const celebrityAnnotationToggle = root.querySelector<HTMLButtonElement>("[data-lifecount-celebrity-annotations-toggle]");
  if (settingsButton) settingsButton.disabled = false;
  if (stageAnnotationToggle) {
    setText(root, "[data-lifecount-stage-label]", messages.stageAnnotations);
    stageAnnotationToggle.setAttribute("aria-pressed", String(state.showStageAnnotations));
    stageAnnotationToggle.disabled = false;
  }
  if (celebrityAnnotationToggle) {
    setText(root, "[data-lifecount-celebrity-label]", messages.celebrityDeaths);
    celebrityAnnotationToggle.setAttribute("aria-pressed", String(state.showCelebrityAnnotations));
    celebrityAnnotationToggle.disabled = false;
  }
  setText(
    root,
    "[data-lifecount-settings-tab-label=\"me\"]",
    state.locale === "en" ? "Me" : "我"
  );
  setText(
    root,
    "[data-lifecount-settings-tab-label=\"biography\"]",
    state.locale === "en" ? "Biography" : "名人履历"
  );
  root.querySelectorAll<HTMLButtonElement>("[data-lifecount-settings-tab]").forEach((tab) => {
    const selected = tab.dataset.lifecountSettingsTab === state.settingsTab;
    tab.setAttribute("aria-selected", String(selected));
  });
  root.querySelector<HTMLElement>("[data-lifecount-settings-panel=\"me\"]")?.toggleAttribute("hidden", state.settingsTab !== "me");
  root.querySelector<HTMLElement>("[data-lifecount-settings-panel=\"biography\"]")?.toggleAttribute("hidden", state.settingsTab !== "biography");
  renderCountryOptions(root, config, state, messages);
  renderPresetOptions(root, config, state, messages, state.locale);
  renderBiographyOptions(root, state, messages);
  renderStages(root, stages, messages, state.locale, "[data-lifecount-stage-list]");
  renderStages(root, stages, messages, state.locale, "[data-lifecount-biography-stage-list]");
  renderLegend(root, stages, messages, preset.countryId, state.locale, biography);

  const unitSelect = root.querySelector<HTMLSelectElement>("[data-lifecount-unit-select]");
  if (unitSelect) {
    const isEnglish = state.locale === "en";
    unitSelect.value = unit;
    unitSelect.closest(".lifecount-unit-select")?.classList.toggle("is-english", isEnglish);
    setText(
      root,
      "[data-lifecount-unit-label]",
      isEnglish
        ? messages.units[unit].one.charAt(0).toUpperCase() + messages.units[unit].one.slice(1)
        : messages.units[unit].short
    );
    unitSelect.querySelectorAll<HTMLOptionElement>("option").forEach((option) => {
      const optionUnit = validUnit(option.value, config.defaultUnit);
      option.textContent = isEnglish
        ? messages.units[optionUnit].one.charAt(0).toUpperCase() + messages.units[optionUnit].one.slice(1)
        : messages.units[optionUnit].short;
    });
  }

  syncCustomSelectMenus(root);
  prepareMapStageLayout(root);
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
  if (url.searchParams.has("gender")) {
    updateUrl({ gender: "" });
  }
  const state: LifeCountState = {
    locale: resolveLifeCountLocale(url.searchParams.get("lang")),
    settingsTab: requestedBiography ? "biography" : "me",
    presetId: preset.id,
    countryId: preset.countryId,
    birthday: requestedBiography?.birthDate ?? config.birthday,
    biographyId: requestedBiography?.id ?? null,
    biographyRestoreBirthday: config.birthday,
    biographyRestorePresetId: validPreset(config, requestedPresetId).id,
    biographyRestoreShowStageAnnotations: false,
    biographyRestoreShowCelebrityAnnotations: false,
    gender: "unspecified",
    showStageAnnotations: false,
    showCelebrityAnnotations: false
  };
  const renderPage = () => render(root, config, state);

  setupCustomSelectMenus(root);
  setupSettings(root, config, state, renderPage);
  setupLanguageSwitcher(root, state, renderPage);
  setupBiographyControls(root, config, state, renderPage);
  setupAnnotationToggles(root, state, renderPage);

  root.querySelector<HTMLSelectElement>("[data-lifecount-unit-select]")?.addEventListener("change", (event) => {
    const select = event.currentTarget as HTMLSelectElement;
    updateUrl({ unit: validUnit(select.value, config.defaultUnit) });
    renderPage();
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
