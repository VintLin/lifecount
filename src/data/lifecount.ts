export type LifeUnit = "day" | "week" | "month" | "year";

export type LifeColor =
  | "blue"
  | "cyan"
  | "green"
  | "orange"
  | "pink"
  | "purple"
  | "red";

export type LifePresetCountryId =
  | "cn"
  | "us"
  | "fr"
  | "uk"
  | "ru"
  | "jp"
  | "in";

export type LifePresetPathId =
  | "undergraduate-work"
  | "vocational-work"
  | "undergraduate-graduate"
  | "k12-undergraduate"
  | "community-college-transfer"
  | "high-school-vocational";

export type LifeStageId =
  | "preschool"
  | "kindergarten"
  | "primary"
  | "middle"
  | "high"
  | "undergraduate"
  | "graduate"
  | "work";

export interface LifeStage {
  id: LifeStageId;
  startDate: string;
  endDate: string;
  color: LifeColor;
}

export interface LifeStageTemplate {
  id: LifeStageId;
  startAge: number;
  endAge: number | null;
  color: LifeColor;
}

export interface LifePreset {
  id: string;
  countryId: LifePresetCountryId;
  pathId: LifePresetPathId;
  stages: LifeStageTemplate[];
}

export interface LifeCountConfig {
  birthday: string;
  displayAge: number;
  defaultUnit: LifeUnit;
  defaultPresetId: string;
  presets: LifePreset[];
}

export const lifeCountConfig: LifeCountConfig = {
  birthday: "2000-01-01",
  displayAge: 80,
  defaultUnit: "week",
  defaultPresetId: "cn-undergraduate-work",
  presets: [
    {
      id: "cn-undergraduate-work",
      countryId: "cn",
      pathId: "undergraduate-work",
      stages: [
        { id: "preschool", startAge: 0, endAge: 3, color: "cyan" },
        { id: "kindergarten", startAge: 3, endAge: 6, color: "green" },
        { id: "primary", startAge: 6, endAge: 12, color: "blue" },
        { id: "middle", startAge: 12, endAge: 15, color: "purple" },
        { id: "high", startAge: 15, endAge: 18, color: "pink" },
        { id: "undergraduate", startAge: 18, endAge: 22, color: "orange" },
        { id: "work", startAge: 22, endAge: null, color: "red" }
      ]
    }
  ]
};
