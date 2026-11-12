import type {
  LifeGender,
  LifePresetCountryId,
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
  selectCountry: string;
  selectCase: string;
  gender: string;
  selectGender: string;
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
  stageAnnotations: string;
  stageAnnotationsToggle: string;
  celebrityDeaths: string;
  celebrityDeathsToggle: string;
  biography: string;
  biographyToggle: string;
  selectBiography: string;
  themeLight: string;
  themeDark: string;
  githubRepository: string;
  genders: Record<LifeGender, string>;
  stageLabels: Record<LifeStageId, string>;
  countryLabels: Record<LifePresetCountryId, string>;
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
  selectCountry: "选择国家",
  selectCase: "选择典型人生案例",
  gender: "性别",
  selectGender: "选择性别，用于计算退休年龄",
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
  stageAnnotations: "典型人生阶段和事件",
  stageAnnotationsToggle: "显示或隐藏典型人生阶段和事件",
  celebrityDeaths: "名人去世时间",
  celebrityDeathsToggle: "显示或隐藏名人去世时间",
  biography: "名人履历",
  biographyToggle: "显示或隐藏名人履历",
  selectBiography: "选择名人",
  themeLight: "切换到浅色模式",
  themeDark: "切换到深色模式",
  githubRepository: "在 GitHub 查看 LifeCount",
  genders: {
    unspecified: "未指定",
    female: "女",
    male: "男"
  },
  stageLabels: {
    "early-childhood": "婴幼儿期",
    preschool: "学前期",
    kindergarten: "幼儿园",
    reception: "学前衔接班",
    primary: "小学",
    middle: "初中",
    secondary: "中学",
    high: "高中",
    "sixth-form": "高中后两年",
    "upper-secondary-vocational": "中等职业教育",
    undergraduate: "本科",
    graduate: "研究生",
    associate: "副学士",
    "tertiary-vocational": "高等职业教育",
    foundation: "基础阶段",
    preparatory: "预备阶段",
    vocational: "职业技能培训",
    specialist: "专家学位",
    "integrated-technical": "五年制高等专门教育",
    work: "工作",
    retirement: "退休"
  },
  countryLabels: {
    cn: "中国",
    us: "美国",
    fr: "法国",
    uk: "英国",
    ru: "俄罗斯",
    jp: "日本",
    in: "印度"
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
  selectCountry: "Choose a country",
  selectCase: "Choose a typical life case",
  gender: "Gender",
  selectGender: "Choose gender for retirement age",
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
  stageAnnotations: "Typical life stages and events",
  stageAnnotationsToggle: "Show or hide typical life stages and events",
  celebrityDeaths: "Celebrity death dates",
  celebrityDeathsToggle: "Show or hide celebrity death dates",
  biography: "Celebrity biographies",
  biographyToggle: "Show or hide celebrity biography",
  selectBiography: "Choose a celebrity",
  themeLight: "Switch to light mode",
  themeDark: "Switch to dark mode",
  githubRepository: "View LifeCount on GitHub",
  genders: {
    unspecified: "Not specified",
    female: "Female",
    male: "Male"
  },
  stageLabels: {
    "early-childhood": "Early childhood",
    preschool: "Preschool",
    kindergarten: "Kindergarten",
    reception: "Reception",
    primary: "Primary school",
    middle: "Middle school",
    secondary: "Secondary school",
    high: "High school",
    "sixth-form": "Sixth form",
    "upper-secondary-vocational": "Upper-secondary vocational",
    undergraduate: "Bachelor degree",
    graduate: "Graduate school",
    associate: "Associate degree",
    "tertiary-vocational": "Tertiary vocational",
    foundation: "Foundation stage",
    preparatory: "Preparatory stage",
    vocational: "Vocational training",
    specialist: "Specialist degree",
    "integrated-technical": "Integrated technical education",
    work: "Work",
    retirement: "Retirement"
  },
  countryLabels: {
    cn: "China",
    us: "United States",
    fr: "France",
    uk: "United Kingdom",
    ru: "Russia",
    jp: "Japan",
    in: "India"
  }
};

export const lifeCountMessages: Record<LifeCountLocale, LifeCountMessages> = {
  "zh-CN": zhCN,
  en
};

export function resolveLifeCountLocale(value: string | null): LifeCountLocale {
  return value?.toLowerCase().startsWith("en") ? "en" : "zh-CN";
}
