import type {
  LifeColor,
  LifePreset,
  LifeStage,
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

export function isDateInRange(date: string, start: string, end: string) {
  return date >= start && date <= end;
}

export function stageOverlapsRange(stage: LifeStage, start: string, end: string, today: string) {
  const effectiveEnd = stage.endDate === OPEN_ENDED_STAGE_END_DATE ? today : stage.endDate;
  return stage.startDate <= end && effectiveEnd >= start;
}

export function stageDatesForPreset(birthday: string, preset: LifePreset): LifeStage[] {
  return preset.stages.map((stage) => ({
    id: stage.id,
    startDate: anniversary(birthday, stage.startAge * 12),
    endDate:
      stage.endAge === null
        ? OPEN_ENDED_STAGE_END_DATE
        : addDays(anniversary(birthday, stage.endAge * 12), -1),
    color: stage.color
  }));
}

export function cellStatus(cell: LifeCell, today: string): LifeCellStatus {
  if (cell.end < today) return "elapsed";
  if (cell.start > today) return "future";
  return "current";
}

export function dominantStage(
  cell: LifeCell,
  stages: LifeStage[],
  today: string
): LifeStage | undefined {
  const counts = new Map<string, { stage: LifeStage | undefined; days: number; order: number }>();
  let date = cell.start;

  while (date <= cell.end) {
    const stage = stages.find((candidate) => stageOverlapsRange(candidate, date, date, today));
    const key = stage?.id ?? "__unassigned__";
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
  const stage = dominantStage(cell, stages, today);
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
  const stage = dominantStage(cell, stages, today);
  const details = [
    messages.cellStatus[status],
    stage ? messages.stageLabels[stage.id] : undefined
  ].filter(Boolean);

  return `${formatLifeDate(cell.start, locale)}${messages.dateRangeSeparator}${formatLifeDate(cell.end, locale)} · ${details.join(" · ")}`;
}
