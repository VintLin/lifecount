import { lifePresets } from "./lifecount-presets";

export type LifeUnit = "day" | "week" | "month" | "year";

export type LifeColor =
  | "blue"
  | "cyan"
  | "green"
  | "orange"
  | "pink"
  | "purple"
  | "red"
  | "sand";

export type LifeGender = "unspecified" | "female" | "male";

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
  | "academic-graduate"
  | "secondary-vocational"
  | "bachelor-work"
  | "community-college-transfer"
  | "high-school-work"
  | "licence-work"
  | "licence-master"
  | "vocational-bts"
  | "england-alevel-bachelor"
  | "england-tlevel-work"
  | "scotland-bachelor"
  | "eleven-year-bachelor"
  | "eleven-year-specialist"
  | "after-grade9-vocational"
  | "university-work"
  | "senmon-work"
  | "kosen-work"
  | "traditional-10plus2-bachelor3"
  | "nep-four-year-bachelor"
  | "class10-iti";

export type LifeStageId =
  | "early-childhood"
  | "preschool"
  | "kindergarten"
  | "reception"
  | "primary"
  | "middle"
  | "secondary"
  | "high"
  | "sixth-form"
  | "upper-secondary-vocational"
  | "undergraduate"
  | "graduate"
  | "associate"
  | "tertiary-vocational"
  | "foundation"
  | "preparatory"
  | "vocational"
  | "specialist"
  | "integrated-technical"
  | "work"
  | "retirement";

export interface LifeStage {
  id: LifeStageId;
  startDate: string;
  endDate: string;
  color: LifeColor;
  labelZh?: string;
  labelEn?: string;
}

export interface LifeStageTemplate {
  id: LifeStageId;
  startAge: number;
  endAge: number | null;
  color: LifeColor;
}

export interface LifeRetirementAges {
  unspecified: number;
  female: number;
  male: number;
}

export interface LifePreset {
  id: string;
  countryId: LifePresetCountryId;
  pathId: LifePresetPathId;
  nameZh: string;
  nameEn: string;
  retirementAges: LifeRetirementAges;
  stages: LifeStageTemplate[];
}

export interface LifeCountConfig {
  birthday: string;
  displayAge: number;
  defaultUnit: LifeUnit;
  defaultPresetId: string;
  presets: LifePreset[];
}

const requiredCountryIds: LifePresetCountryId[] = [
  "cn",
  "us",
  "fr",
  "uk",
  "ru",
  "jp",
  "in"
];

function validateLifePresets(presets: readonly LifePreset[]): LifePreset[] {
  const presetIds = new Set<string>();
  const pathIds = new Set<string>();
  const countries = new Set<LifePresetCountryId>();

  for (const preset of presets) {
    if (presetIds.has(preset.id)) {
      throw new Error(`Duplicate life preset id: ${preset.id}`);
    }
    if (pathIds.has(preset.pathId)) {
      throw new Error(`Duplicate life preset path id: ${preset.pathId}`);
    }
    if (!preset.nameZh.trim() || !preset.nameEn.trim()) {
      throw new Error(`Life preset ${preset.id} must have bilingual names`);
    }
    for (const gender of ["unspecified", "female", "male"] as const) {
      const retirementAge = preset.retirementAges[gender];
      if (
        !Number.isInteger(retirementAge) ||
        retirementAge < 1 ||
        retirementAge > 120
      ) {
        throw new Error(
          `Life preset ${preset.id} has an invalid ${gender} retirement age`
        );
      }
    }
    if (preset.stages.length === 0 || preset.stages[0].startAge !== 0) {
      throw new Error(`Life preset ${preset.id} must start at age 0`);
    }

    const stageIds = new Set<LifeStageId>();
    for (const [index, stage] of preset.stages.entries()) {
      if (stageIds.has(stage.id)) {
        throw new Error(`Life preset ${preset.id} repeats stage ${stage.id}`);
      }
      stageIds.add(stage.id);

      if (stage.endAge === null) {
        if (index !== preset.stages.length - 1 || stage.id !== "work") {
          throw new Error(`Life preset ${preset.id} may only end with an open work stage`);
        }
        continue;
      }

      if (stage.endAge <= stage.startAge) {
        throw new Error(`Life preset ${preset.id} has an invalid ${stage.id} age range`);
      }

      const nextStage = preset.stages[index + 1];
      if (nextStage && nextStage.startAge !== stage.endAge) {
        throw new Error(
          `Life preset ${preset.id} has a gap or overlap between ${stage.id} and ${nextStage.id}`
        );
      }
    }

    const finalStage = preset.stages.at(-1);
    if (!finalStage || finalStage.endAge !== null) {
      throw new Error(`Life preset ${preset.id} must end with an open stage`);
    }
    if (finalStage.id !== "work") {
      throw new Error(`Life preset ${preset.id} must end with work`);
    }
    for (const retirementAge of new Set(Object.values(preset.retirementAges))) {
      if (retirementAge <= finalStage.startAge) {
        throw new Error(
          `Life preset ${preset.id} retires before the work stage begins`
        );
      }
    }

    presetIds.add(preset.id);
    pathIds.add(preset.pathId);
    countries.add(preset.countryId);
  }

  for (const countryId of requiredCountryIds) {
    if (!countries.has(countryId)) {
      throw new Error(`Missing life presets for country: ${countryId}`);
    }
  }

  return [...presets];
}

export const lifeCountConfig: LifeCountConfig = {
  birthday: "1995-01-01",
  displayAge: 85,
  defaultUnit: "week",
  defaultPresetId: "cn-undergraduate-work",
  presets: validateLifePresets(lifePresets)
};
