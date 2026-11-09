import type {
  LifePresetCountryId,
  LifePresetPathId,
  LifeStageId,
  LifeUnit
} from "@/data/lifecount";

export type LifeCountLocale = "zh-CN" | "en";

interface LifeCountUnitLabel {
  short: string;
  one: string;
  other: string;
}

export interface LifeCountMessages {
  documentTitle: string;
  pageTitle: string;
  description: string;
  settings: string;
  settingsTitle: string;
  stages: string;
  stagesOpen: string;
  close: string;
  selectPreset: string;
  birthday: string;
  displayAge: string;
  cancel: string;
  save: string;
  selectUnit: string;
  units: Record<LifeUnit, LifeCountUnitLabel>;
  views: Record<LifeUnit, string>;
  canvasView: Record<"day" | "week", string>;
  legend: string;
  summaryAge: (age: number) => string;
  summaryElapsed: (elapsed: string, total: string, unit: string) => string;
  dateRangeSeparator: string;
  ongoing: string;
  cellStatus: Record<"elapsed" | "current" | "future", string>;
  languageButton: string;
  languageButtonLabel: string;
  stageLabels: Record<LifeStageId, string>;
  countryLabels: Record<LifePresetCountryId, string>;
  pathLabels: Record<LifePresetPathId, string>;
}

const zhCN: LifeCountMessages = {
  documentTitle: "人生计数 · LifeCount | Vint",
  pageTitle: "人生计数",
  description: "用日、周、月和年观察已经过去、正在经历和即将到来的时间。",
  settings: "人生计数设置",
  settingsTitle: "人生计数设置",
  stages: "人生阶段",
  stagesOpen: "查看人生阶段",
  close: "关闭",
  selectPreset: "选择人生阶段预设",
  birthday: "出生日期",
  displayAge: "最高年龄",
  cancel: "取消",
  save: "保存",
  selectUnit: "选择时间单位",
  units: {
    day: { short: "日", one: "日", other: "日" },
    week: { short: "周", one: "周", other: "周" },
    month: { short: "月", one: "月", other: "月" },
    year: { short: "年", one: "年", other: "年" }
  },
  views: {
    day: "日视图",
    week: "周视图",
    month: "月视图",
    year: "年视图"
  },
  canvasView: {
    day: "日视图，使用方向键浏览时间格子",
    week: "周视图，使用方向键浏览时间格子"
  },
  legend: "图例",
  summaryAge: (age) => `${age} 岁`,
  summaryElapsed: (elapsed, total, unit) => `已过去 ${elapsed} / ${total} ${unit}`,
  dateRangeSeparator: " 至 ",
  ongoing: "进行中",
  cellStatus: {
    elapsed: "已过去",
    current: "现在",
    future: "未来"
  },
  languageButton: "EN",
  languageButtonLabel: "View this page in English",
  stageLabels: {
    preschool: "学前",
    kindergarten: "幼儿园",
    primary: "小学",
    middle: "初中",
    high: "高中",
    undergraduate: "本科",
    graduate: "研究生",
    work: "工作"
  },
  countryLabels: {
    cn: "中国",
    us: "美国",
    fr: "法国",
    uk: "英国",
    ru: "俄罗斯",
    jp: "日本",
    in: "印度"
  },
  pathLabels: {
    "undergraduate-work": "普通本科后就业",
    "vocational-work": "专科或高职后就业",
    "undergraduate-graduate": "本科后研究生",
    "k12-undergraduate": "K-12 后四年制本科",
    "community-college-transfer": "社区大学转学",
    "high-school-vocational": "高中后职业路径"
  }
};

const en: LifeCountMessages = {
  documentTitle: "LifeCount | Vint",
  pageTitle: "LifeCount",
  description: "See elapsed, present, and future time through day, week, month, and year views.",
  settings: "LifeCount settings",
  settingsTitle: "LifeCount settings",
  stages: "Life stages",
  stagesOpen: "View life stages",
  close: "Close",
  selectPreset: "Choose a life-stage preset",
  birthday: "Birthday",
  displayAge: "Maximum age",
  cancel: "Cancel",
  save: "Save",
  selectUnit: "Choose a time unit",
  units: {
    day: { short: "D", one: "day", other: "days" },
    week: { short: "W", one: "week", other: "weeks" },
    month: { short: "M", one: "month", other: "months" },
    year: { short: "Y", one: "year", other: "years" }
  },
  views: {
    day: "Day view",
    week: "Week view",
    month: "Month view",
    year: "Year view"
  },
  canvasView: {
    day: "Day view. Use the arrow keys to browse time cells.",
    week: "Week view. Use the arrow keys to browse time cells."
  },
  legend: "Legend",
  summaryAge: (age) => `${age} ${age === 1 ? "year" : "years"} old`,
  summaryElapsed: (elapsed, total, unit) => `${elapsed} / ${total} ${unit} elapsed`,
  dateRangeSeparator: " to ",
  ongoing: "Present",
  cellStatus: {
    elapsed: "Elapsed",
    current: "Current",
    future: "Future"
  },
  languageButton: "中",
  languageButtonLabel: "以中文查看此页面",
  stageLabels: {
    preschool: "Preschool",
    kindergarten: "Kindergarten",
    primary: "Primary school",
    middle: "Middle school",
    high: "High school",
    undergraduate: "Undergraduate",
    graduate: "Graduate school",
    work: "Work"
  },
  countryLabels: {
    cn: "China",
    us: "United States",
    fr: "France",
    uk: "United Kingdom",
    ru: "Russia",
    jp: "Japan",
    in: "India"
  },
  pathLabels: {
    "undergraduate-work": "Undergraduate then work",
    "vocational-work": "Vocational education then work",
    "undergraduate-graduate": "Undergraduate then graduate school",
    "k12-undergraduate": "K-12 then four-year university",
    "community-college-transfer": "Community college transfer",
    "high-school-vocational": "Career path after high school"
  }
};

export const lifeCountMessages: Record<LifeCountLocale, LifeCountMessages> = {
  "zh-CN": zhCN,
  en
};

export function resolveLifeCountLocale(value: string | null): LifeCountLocale {
  return value?.toLowerCase().startsWith("en") ? "en" : "zh-CN";
}
