import type {
  LifeColor,
  LifeGender,
  LifePreset,
  LifeStage,
  LifeStageTemplate,
  LifeUnit
} from "@/data/lifecount";
import type { LifeCountMessages } from "@/i18n/lifecount";

export const DAY = 86_400_000;
export const OPEN_ENDED_STAGE_END_DATE = "9999-12-31";

export interface LifeCell {
  start: string;
  end: string;
}

export type LifeCellStatus = "elapsed" | "current" | "future";

export function parseDay(value: string) {
  return new Date(`${value}T00:00:00Z`);
}

export function isoDay(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function localDay(now = new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export function addDays(day: string, count: number) {
  return isoDay(new Date(parseDay(day).getTime() + count * DAY));
}

function utcDate(year: number, month: number, day: number) {
  const date = new Date(0);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCFullYear(year, month, day);
  return date;
}

export function anniversary(birthday: string, months: number) {
  const date = parseDay(birthday);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + months;
  const lastDay = utcDate(year, month + 1, 0).getUTCDate();
  return isoDay(utcDate(year, month, Math.min(date.getUTCDate(), lastDay)));
}

export function lifeCells(
  birthday: string,
  displayAge: number,
  unit: LifeUnit
): LifeCell[] {
  const horizon = anniversary(birthday, displayAge * 12);
  const days = Math.round((parseDay(horizon).getTime() - parseDay(birthday).getTime()) / DAY);
  const total =
    unit === "day"
      ? days
      : unit === "week"
        ? Math.ceil(days / 7)
        : unit === "month"
          ? displayAge * 12
          : displayAge;

  return Array.from({ length: total }, (_, index) => {
    const start =
      unit === "day"
        ? addDays(birthday, index)
        : unit === "week"
          ? addDays(birthday, index * 7)
          : anniversary(birthday, index * (unit === "month" ? 1 : 12));
    const next =
      unit === "day"
        ? addDays(start, 1)
        : unit === "week"
          ? addDays(start, 7)
          : anniversary(birthday, (index + 1) * (unit === "month" ? 1 : 12));

    return {
      start,
      end: addDays(next < horizon ? next : horizon, -1)
    };
  });
}

export function lifeCellsUntil(
  birthday: string,
  endExclusive: string,
  unit: LifeUnit
): LifeCell[] {
  const cells: LifeCell[] = [];
  let start = birthday;
  let index = 0;

  while (start < endExclusive) {
    const next =
      unit === "day"
        ? addDays(start, 1)
        : unit === "week"
          ? addDays(start, 7)
          : anniversary(birthday, (index + 1) * (unit === "month" ? 1 : 12));
    const end = next < endExclusive ? next : endExclusive;
    cells.push({ start, end: addDays(end, -1) });
    if (end >= endExclusive) break;
    start = end;
    index += 1;
  }

  return cells;
}

export function isDateInRange(date: string, start: string, end: string) {
  return date >= start && date <= end;
}

export function stageOverlapsRange(stage: LifeStage, start: string, end: string) {
  return stage.startDate <= end && stage.endDate >= start;
}

export function stageDatesForPreset(
  birthday: string,
  preset: LifePreset,
  gender: LifeGender
): LifeStage[] {
  const retirementAge = preset.retirementAges[gender];
  const retirementStart = anniversary(birthday, retirementAge * 12);

  const calendar = academicCalendarForPreset(preset);
  const isAcademic = (stage: LifeStageTemplate) => [
    "preschool",
    "kindergarten",
    "primary",
    "middle",
    "secondary",
    "high",
    "sixth-form",
    "upper-secondary-vocational",
    "undergraduate",
    "graduate",
    "associate",
    "tertiary-vocational",
    "foundation",
    "preparatory",
    "vocational",
    "specialist",
    "integrated-technical"
  ].includes(stage.id);
  const starts = preset.stages.map((stage) => {
    const stageCalendar = calendar && isAcademic(stage)
      ? stage.id === "undergraduate" || stage.id === "graduate" || stage.id === "associate"
        ? calendar.higher
        : calendar.school
      : null;
    return stageCalendar
      ? calendarStartDate(birthday, stage.startAge, stageCalendar)
      : anniversary(birthday, stage.startAge * 12);
  });

  let previousEnd: string | null = null;
  return preset.stages.flatMap((stage, index) => {
    const stageIsAcademic = Boolean(calendar && isAcademic(stage));
    const nextStage = preset.stages[index + 1];
    const nextStart = starts[index + 1];
    const stageCalendar = calendar && stageIsAcademic
      ? stage.id === "undergraduate" || stage.id === "graduate" || stage.id === "associate"
        ? calendar.higher
        : calendar.school
      : null;
    let startDate = starts[index];
    if (previousEnd) {
      startDate = addDays(previousEnd, 1);
    }
    if (stage.id === "work" && stage.endAge === null) {
      previousEnd = addDays(retirementStart, -1);
      return [
        {
          id: "work",
          startDate,
          endDate: addDays(retirementStart, -1),
          color: stage.color
        },
        {
          id: "retirement",
          startDate: retirementStart,
          endDate: OPEN_ENDED_STAGE_END_DATE,
          color: "sand"
        }
      ] satisfies LifeStage[];
    }

    let endDate = stage.endAge === null
      ? OPEN_ENDED_STAGE_END_DATE
      : stageCalendar
        ? calendarEndDate(birthday, stage.endAge, stageCalendar)
        : addDays(anniversary(birthday, stage.endAge * 12), -1);
    if (
      stage.endAge !== null &&
      nextStage &&
      nextStart &&
      stage.endAge === nextStage.startAge &&
      !stageIsAcademic &&
      isAcademic(nextStage)
    ) {
      endDate = addDays(nextStart, -1);
    }
    previousEnd = endDate;

    return [
      {
        id: stage.id,
        startDate,
        endDate,
        color: stage.color
      }
    ] satisfies LifeStage[];
  });
}

interface AcademicCalendarBoundary {
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
}

interface AcademicCalendars {
  school: AcademicCalendarBoundary;
  higher: AcademicCalendarBoundary;
}

function academicCalendarForPreset(preset: LifePreset): AcademicCalendars {
  if (preset.countryId === "cn") {
    return {
      school: { startMonth: 9, startDay: 1, endMonth: 7, endDay: 15 },
      higher: { startMonth: 9, startDay: 1, endMonth: 6, endDay: 30 }
    };
  }
  if (preset.countryId === "fr") {
    return {
      school: { startMonth: 9, startDay: 1, endMonth: 7, endDay: 7 },
      higher: { startMonth: 9, startDay: 15, endMonth: 6, endDay: 30 }
    };
  }
  if (preset.countryId === "uk") {
    const scotland = preset.pathId === "scotland-bachelor";
    return {
      school: scotland
        ? { startMonth: 8, startDay: 15, endMonth: 6, endDay: 30 }
        : { startMonth: 9, startDay: 1, endMonth: 7, endDay: 20 },
      higher: { startMonth: 9, startDay: 15, endMonth: 6, endDay: 30 }
    };
  }
  if (preset.countryId === "ru") {
    return {
      school: { startMonth: 9, startDay: 1, endMonth: 6, endDay: 30 },
      higher: { startMonth: 9, startDay: 1, endMonth: 6, endDay: 30 }
    };
  }
  if (preset.countryId === "jp") {
    return {
      school: { startMonth: 4, startDay: 1, endMonth: 3, endDay: 31 },
      higher: { startMonth: 4, startDay: 1, endMonth: 3, endDay: 31 }
    };
  }
  if (preset.countryId === "in") {
    return {
      school: { startMonth: 4, startDay: 1, endMonth: 3, endDay: 31 },
      higher: { startMonth: 7, startDay: 1, endMonth: 4, endDay: 30 }
    };
  }
  return {
    school: { startMonth: 9, startDay: 1, endMonth: 6, endDay: 30 },
    higher: { startMonth: 9, startDay: 1, endMonth: 5, endDay: 31 }
  };
}

function calendarStartDate(
  birthday: string,
  age: number,
  calendar: AcademicCalendarBoundary
) {
  const birthYear = parseDay(birthday).getUTCFullYear();
  return isoDay(utcDate(birthYear + Math.floor(age), calendar.startMonth - 1, calendar.startDay));
}

function calendarEndDate(
  birthday: string,
  age: number,
  calendar: AcademicCalendarBoundary
) {
  const birthYear = parseDay(birthday).getUTCFullYear();
  return isoDay(utcDate(birthYear + Math.floor(age), calendar.endMonth - 1, calendar.endDay));
}

export function cellStatus(cell: LifeCell, today: string): LifeCellStatus {
  if (cell.end < today) return "elapsed";
  if (cell.start > today) return "future";
  return "current";
}

export function dominantStage(
  cell: LifeCell,
  stages: LifeStage[]
): LifeStage | undefined {
  // A biography can contain several distinct stages with the semantic id
  // `work`. Use the stage instance as the bucket key so those colors remain
  // independent while the id still powers the generic label fallback.
  const counts = new Map<LifeStage | "__unassigned__", { stage: LifeStage | undefined; days: number; order: number }>();
  let date = cell.start;

  while (date <= cell.end) {
    const stage = stages.find((candidate) => stageOverlapsRange(candidate, date, date));
    const key = stage ?? "__unassigned__";
    const current = counts.get(key) ?? {
      stage,
      days: 0,
      order: stage ? stages.indexOf(stage) : Number.MAX_SAFE_INTEGER
    };
    current.days += 1;
    counts.set(key, current);
    date = addDays(date, 1);
  }

  return [...counts.values()]
    .sort((left, right) => right.days - left.days || left.order - right.order)
    .find((entry) => entry.stage)?.stage;
}

export function cellColorKey(
  cell: LifeCell,
  stages: LifeStage[],
  today: string
): LifeColor | "elapsed" | "future" | "current" {
  const stage = dominantStage(cell, stages);
  if (stage) return stage.color;

  return cellStatus(cell, today);
}

export function formatLifeDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC"
  }).format(parseDay(value));
}

export function formatCellLabel(
  cell: LifeCell,
  stages: LifeStage[],
  today: string,
  messages: LifeCountMessages,
  locale: string
) {
  const status = cellStatus(cell, today);
  const stage = dominantStage(cell, stages);
  const details = [
    messages.cellStatus[status],
    stage
      ? locale === "en"
        ? stage.labelEn ?? messages.stageLabels[stage.id]
        : stage.labelZh ?? messages.stageLabels[stage.id]
      : undefined
  ].filter(Boolean);

  return `${formatLifeDate(cell.start, locale)}${messages.dateRangeSeparator}${formatLifeDate(cell.end, locale)} · ${details.join(" · ")}`;
}
