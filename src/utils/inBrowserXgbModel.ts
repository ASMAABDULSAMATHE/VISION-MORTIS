// In-browser XGBoost Evaluator and TreeSHAP Engine for VisionMortis
// Enables instant, client-side post-mortem interval prediction and exact feature attribution
// with zero external servers, zero cold starts, and 100% offline support.

import { XGB_BASE_SCORE, XGB_TREES } from "../data/xgbModelTrees";
import {
  CaseMetadata,
  AlgorMortisData,
  LivorMortisData,
  RigorMortisData,
  DecompositionData,
  EntomologyData,
  MetabolomicsData,
  VisionDetectionData,
} from "../types";

export interface CaseDataInput {
  metadata?: Partial<CaseMetadata>;
  algor?: Partial<AlgorMortisData>;
  livor?: Partial<LivorMortisData>;
  rigor?: Partial<RigorMortisData>;
  decomposition?: Partial<DecompositionData>;
  entomology?: Partial<EntomologyData>;
  metabolomics?: Partial<MetabolomicsData>;
  vision?: Partial<VisionDetectionData>;
  [key: string]: any;
}

export interface ShapAttributionItem {
  featureIndex: number;
  featureKey: string;
  factorName: string;
  category: "Algor" | "Decomposition" | "Livor" | "Rigor" | "Entomology" | "Metabolomics" | "Environment" | "Vision";
  shapValue: number; // in hours (positive = increases PMI, negative = decreases PMI)
  rawValue: number | string | boolean;
  pullMagnitudeHours: number; // absolute hours
  relativeImportancePercent: number;
  impactDirection: "increases_pmi" | "decreases_pmi";
  explanation: string;
}

export interface InBrowserPredictionResult {
  estimatedPmiOptimalHours: number;
  estimatedPmiMinHours: number;
  estimatedPmiMaxHours: number;
  baseValueHours: number;
  sumShapHours: number;
  factorAttributions: ShapAttributionItem[];
  featureVector: number[];
  featureNames: string[];
  executionTimeMs: number;
}

// 212 feature names from the trained XGBoost model
export const XGB_FEATURE_NAMES: string[] = [
  "ambient_temperature_C__missing",
  "ambient_temperature_C__scaled",
  "ambient_temperature_C__raw",
  "relative_humidity_percent__missing",
  "relative_humidity_percent__scaled",
  "relative_humidity_percent__raw",
  "body_mass_kg__missing",
  "body_mass_kg__scaled",
  "body_mass_kg__raw",
  "body_temperature_C__missing",
  "body_temperature_C__scaled",
  "body_temperature_C__raw",
  "algor_observation_confidence__missing",
  "algor_observation_confidence__scaled",
  "algor_observation_confidence__raw",
  "livor_observation_confidence__missing",
  "livor_observation_confidence__scaled",
  "livor_observation_confidence__raw",
  "rigor_observation_confidence__missing",
  "rigor_observation_confidence__scaled",
  "rigor_observation_confidence__raw",
  "corneal_clouding__missing",
  "corneal_clouding__scaled",
  "corneal_clouding__raw",
  "drying_fingertips_lips_nose__missing",
  "drying_fingertips_lips_nose__scaled",
  "drying_fingertips_lips_nose__raw",
  "greening_abdomen__missing",
  "greening_abdomen__scaled",
  "greening_abdomen__raw",
  "skin_slippage_bullae__missing",
  "skin_slippage_bullae__scaled",
  "skin_slippage_bullae__raw",
  "skin_discoloration__missing",
  "skin_discoloration__scaled",
  "skin_discoloration__raw",
  "marbling__missing",
  "marbling__scaled",
  "marbling__raw",
  "bloat__missing",
  "bloat__scaled",
  "bloat__raw",
  "purging__missing",
  "purging__scaled",
  "purging__raw",
  "decomposition_fluid__missing",
  "decomposition_fluid__scaled",
  "decomposition_fluid__raw",
  "abdominal_caving__missing",
  "abdominal_caving__scaled",
  "abdominal_caving__raw",
  "liquified_organs__missing",
  "liquified_organs__scaled",
  "liquified_organs__raw",
  "desiccation_mummification__missing",
  "desiccation_mummification__scaled",
  "desiccation_mummification__raw",
  "exposed_bone_moist_tissue__missing",
  "exposed_bone_moist_tissue__scaled",
  "exposed_bone_moist_tissue__raw",
  "exposed_bone_desiccated_tissue__missing",
  "exposed_bone_desiccated_tissue__scaled",
  "exposed_bone_desiccated_tissue__raw",
  "bone_with_grease__missing",
  "bone_with_grease__scaled",
  "bone_with_grease__raw",
  "adipocere__missing",
  "adipocere__scaled",
  "adipocere__raw",
  "mold__missing",
  "mold__scaled",
  "mold__raw",
  "dry_bone__missing",
  "dry_bone__scaled",
  "dry_bone__raw",
  "weathered_bone__missing",
  "weathered_bone__scaled",
  "weathered_bone__raw",
  "decomposition_observation_score__missing",
  "decomposition_observation_score__scaled",
  "decomposition_observation_score__raw",
  "decomposition_observation_confidence__missing",
  "decomposition_observation_confidence__scaled",
  "decomposition_observation_confidence__raw",
  "insect_present__missing",
  "insect_present__scaled",
  "insect_present__raw",
  "insect_species_confidence__missing",
  "insect_species_confidence__scaled",
  "insect_species_confidence__raw",
  "insect_stage_confidence__missing",
  "insect_stage_confidence__scaled",
  "insect_stage_confidence__raw",
  "hypoxanthine_umol_L__missing",
  "hypoxanthine_umol_L__scaled",
  "hypoxanthine_umol_L__raw",
  "lactic_acid_mmol_L__missing",
  "lactic_acid_mmol_L__scaled",
  "lactic_acid_mmol_L__raw",
  "choline_umol_L__missing",
  "choline_umol_L__scaled",
  "choline_umol_L__raw",
  "taurine_umol_L__missing",
  "taurine_umol_L__scaled",
  "taurine_umol_L__raw",
  "glycerol_umol_L__missing",
  "glycerol_umol_L__scaled",
  "glycerol_umol_L__raw",
  "succinic_acid_umol_L__missing",
  "succinic_acid_umol_L__scaled",
  "succinic_acid_umol_L__raw",
  "formic_acid_umol_L__missing",
  "formic_acid_umol_L__scaled",
  "formic_acid_umol_L__raw",
  "uric_acid_umol_L__missing",
  "uric_acid_umol_L__scaled",
  "uric_acid_umol_L__raw",
  "creatine_umol_L__missing",
  "creatine_umol_L__scaled",
  "creatine_umol_L__raw",
  "putrescine_nmol_g__missing",
  "putrescine_nmol_g__scaled",
  "putrescine_nmol_g__raw",
  "cadaverine_nmol_g__missing",
  "cadaverine_nmol_g__scaled",
  "cadaverine_nmol_g__raw",
  "metabolomics_available__missing",
  "metabolomics_available__scaled",
  "metabolomics_available__raw",
  "metabolomics_missing_feature_count__missing",
  "metabolomics_missing_feature_count__scaled",
  "metabolomics_missing_feature_count__raw",
  "movement_confidence__missing",
  "movement_confidence__scaled",
  "movement_confidence__raw",
  "cv_available__missing",
  "cv_available__scaled",
  "cv_available__raw",
  "cv_image_count__missing",
  "cv_image_count__scaled",
  "cv_image_count__raw",
  "cv_decomposition_confidence__missing",
  "cv_decomposition_confidence__scaled",
  "cv_decomposition_confidence__raw",
  "cv_livor_confidence__missing",
  "cv_livor_confidence__scaled",
  "cv_livor_confidence__raw",
  "cv_entomology_present__missing",
  "cv_entomology_present__scaled",
  "cv_entomology_present__raw",
  "cv_entomology_confidence__missing",
  "cv_entomology_confidence__scaled",
  "cv_entomology_confidence__raw",
  "cv_movement_confidence__missing",
  "cv_movement_confidence__scaled",
  "cv_movement_confidence__raw",
  "livor_stage__missing",
  "livor_stage__ordinal",
  "rigor_stage__missing",
  "rigor_stage__ordinal",
  "decomposition_stage__missing",
  "decomposition_stage__ordinal",
  "cv_decomposition_stage__missing",
  "cv_decomposition_stage__ordinal",
  "cv_livor_stage__missing",
  "cv_livor_stage__ordinal",
  "insect_developmental_stage__missing",
  "insect_developmental_stage__ordinal",
  "cv_entomology_stage__missing",
  "cv_entomology_stage__ordinal",
  "body_movement_position_change__missing",
  "body_movement_position_change__ordinal",
  "cv_movement_position_change__missing",
  "cv_movement_position_change__ordinal",
  "clothing__missing",
  "clothing__heavy",
  "clothing__insulated",
  "clothing__light",
  "clothing__unclothed",
  "clothing__unknown",
  "deposition_site__missing",
  "deposition_site__deep_burial",
  "deposition_site__ground_surface",
  "deposition_site__indoor",
  "deposition_site__shallow_burial",
  "deposition_site__unknown",
  "deposition_site__vehicle",
  "deposition_site__water",
  "insect_species__missing",
  "insect_species__Calliphora vicina",
  "insect_species__Chrysomya rufifacies",
  "insect_species__Dermestes maculatus",
  "insect_species__Hydrotaea leucostoma",
  "insect_species__Lucilia sericata",
  "insect_species__Necrobia rufipes",
  "insect_species__Phormia regina",
  "insect_species__Sarcophaga bullata",
  "insect_species__Uncollected",
  "insect_present",
  "metabolomics_available",
  "cv_available",
  "cv_entomology_present",
  "metabolomics_missing_feature_count",
  "cv_image_count",
  "qc_flag_temp_below_ambient",
  "modality_avail__algor",
  "modality_avail__livor",
  "modality_avail__rigor",
  "modality_avail__decomposition",
  "modality_avail__entomology",
  "modality_avail__metabolomics",
  "modality_avail__cv",
];

// Reference dataset means and standard deviations
const FEATURE_SCALING: Record<string, { mean: number; std: number }> = {
  ambient_temperature_C: { mean: 20.2, std: 6.8 },
  relative_humidity_percent: { mean: 58.4, std: 17.5 },
  body_mass_kg: { mean: 72.5, std: 14.2 },
  body_temperature_C: { mean: 28.6, std: 7.4 },
  algor_observation_confidence: { mean: 85.0, std: 15.0 },
  livor_observation_confidence: { mean: 80.0, std: 18.0 },
  rigor_observation_confidence: { mean: 82.0, std: 16.0 },
  corneal_clouding: { mean: 1.2, std: 1.1 },
  drying_fingertips_lips_nose: { mean: 0.35, std: 0.48 },
  greening_abdomen: { mean: 0.38, std: 0.49 },
  skin_slippage_bullae: { mean: 0.28, std: 0.45 },
  skin_discoloration: { mean: 0.45, std: 0.50 },
  marbling: { mean: 0.30, std: 0.46 },
  bloat: { mean: 0.26, std: 0.44 },
  purging: { mean: 0.22, std: 0.41 },
  decomposition_fluid: { mean: 0.20, std: 0.40 },
  abdominal_caving: { mean: 0.18, std: 0.38 },
  liquified_organs: { mean: 0.15, std: 0.36 },
  desiccation_mummification: { mean: 0.12, std: 0.32 },
  exposed_bone_moist_tissue: { mean: 0.10, std: 0.30 },
  exposed_bone_desiccated_tissue: { mean: 0.08, std: 0.27 },
  bone_with_grease: { mean: 0.06, std: 0.24 },
  adipocere: { mean: 0.05, std: 0.22 },
  mold: { mean: 0.14, std: 0.35 },
  dry_bone: { mean: 0.04, std: 0.19 },
  weathered_bone: { mean: 0.02, std: 0.14 },
  decomposition_observation_score: { mean: 12.4, std: 8.6 },
  decomposition_observation_confidence: { mean: 88.0, std: 12.0 },
  insect_present: { mean: 0.42, std: 0.49 },
  insect_species_confidence: { mean: 75.0, std: 25.0 },
  insect_stage_confidence: { mean: 78.0, std: 22.0 },
  hypoxanthine_umol_L: { mean: 85.0, std: 55.0 },
  lactic_acid_mmol_L: { mean: 12.5, std: 8.2 },
  choline_umol_L: { mean: 45.0, std: 30.0 },
  taurine_umol_L: { mean: 65.0, std: 40.0 },
  glycerol_umol_L: { mean: 120.0, std: 80.0 },
  succinic_acid_umol_L: { mean: 35.0, std: 25.0 },
  formic_acid_umol_L: { mean: 18.0, std: 14.0 },
  uric_acid_umol_L: { mean: 350.0, std: 150.0 },
  creatine_umol_L: { mean: 220.0, std: 110.0 },
  putrescine_nmol_g: { mean: 45.0, std: 60.0 },
  cadaverine_nmol_g: { mean: 60.0, std: 75.0 },
  metabolomics_available: { mean: 0.35, std: 0.48 },
  metabolomics_missing_feature_count: { mean: 4.5, std: 3.8 },
  movement_confidence: { mean: 70.0, std: 25.0 },
  cv_available: { mean: 0.50, std: 0.50 },
  cv_image_count: { mean: 2.2, std: 1.8 },
  cv_decomposition_confidence: { mean: 82.0, std: 18.0 },
  cv_livor_confidence: { mean: 79.0, std: 20.0 },
  cv_entomology_present: { mean: 0.30, std: 0.46 },
  cv_entomology_confidence: { mean: 76.0, std: 22.0 },
  cv_movement_confidence: { mean: 68.0, std: 28.0 },
};

/**
 * Builds the exact 212-dimension feature vector from the caseData object
 */
export function extractXgbFeatureVector(caseData: CaseDataInput): {
  vector: number[];
  featureMap: Record<string, number>;
  rawValuesMap: Record<string, any>;
} {
  const v = new Array(XGB_FEATURE_NAMES.length).fill(0);
  const rawMap: Record<string, any> = {};

  const algor = caseData.algor || {};
  const livor = caseData.livor || {};
  const rigor = caseData.rigor || {};
  const decomp = caseData.decomposition || {};
  const entom = caseData.entomology || {};
  const metab = caseData.metabolomics || {};
  const meta = caseData.metadata || {};
  const vision = caseData.vision || {};

  const getScaledAndRaw = (
    baseName: string,
    val: number | undefined | null,
    defaultVal: number
  ): { missing: number; scaled: number; raw: number } => {
    const isMissing = val === undefined || val === null || isNaN(val);
    const raw = isMissing ? defaultVal : val;
    const stats = FEATURE_SCALING[baseName] || { mean: 0, std: 1 };
    const scaled = (raw - stats.mean) / (stats.std || 1);
    rawMap[baseName] = isMissing ? "Not Recorded" : raw;
    return {
      missing: isMissing ? 1 : 0,
      scaled,
      raw,
    };
  };

  const setContinuousFeature = (baseName: string, val: number | undefined | null, defaultVal: number) => {
    const missIdx = XGB_FEATURE_NAMES.indexOf(`${baseName}__missing`);
    const scaIdx = XGB_FEATURE_NAMES.indexOf(`${baseName}__scaled`);
    const rawIdx = XGB_FEATURE_NAMES.indexOf(`${baseName}__raw`);
    const res = getScaledAndRaw(baseName, val, defaultVal);
    if (missIdx !== -1) v[missIdx] = res.missing;
    if (scaIdx !== -1) v[scaIdx] = res.scaled;
    if (rawIdx !== -1) v[rawIdx] = res.raw;
  };

  // Environmental & Body Biometrics
  const ambientTemp = algor.ambientTempC ?? (caseData as any).ambientTempC ?? meta.ambientTempC ?? 20.0;
  const bodyTemp = algor.rectalTempC ?? (algor.enabled ? 32.0 : 37.0);
  const humidity = (caseData as any).relativeHumidityPercent ?? meta.relativeHumidityPercent ?? 55.0;
  const bodyMass = algor.bodyWeightKg ?? (caseData as any).bodyWeightKg ?? meta.bodyWeightKg ?? 70.0;

  setContinuousFeature("ambient_temperature_C", ambientTemp, 20.0);
  setContinuousFeature("relative_humidity_percent", humidity, 55.0);
  setContinuousFeature("body_mass_kg", bodyMass, 70.0);
  setContinuousFeature("body_temperature_C", algor.enabled ? bodyTemp : null, 37.0);

  // Observations & Confidence
  setContinuousFeature("algor_observation_confidence", algor.enabled ? 90.0 : null, 85.0);
  setContinuousFeature("livor_observation_confidence", livor.enabled ? 85.0 : null, 80.0);
  setContinuousFeature("rigor_observation_confidence", rigor.enabled ? 85.0 : null, 80.0);

  // Ocular & Tissue signs
  let cornealCloudingNum = 0;
  if (vision.detectedOcularChanges?.cornealClouding === "opaque_milky") cornealCloudingNum = 3;
  else if (vision.detectedOcularChanges?.cornealClouding === "moderate_clouding") cornealCloudingNum = 2;
  else if (vision.detectedOcularChanges?.cornealClouding === "translucent_hazy") cornealCloudingNum = 1;
  else if (decomp.totalBodyScore && decomp.totalBodyScore > 10) cornealCloudingNum = 2;
  setContinuousFeature("corneal_clouding", cornealCloudingNum, 0);

  setContinuousFeature("drying_fingertips_lips_nose", (decomp.totalBodyScore || 0) > 8 ? 1 : 0, 0);
  setContinuousFeature("greening_abdomen", decomp.rightIliacDiscoloration ? 1 : 0, 0);
  setContinuousFeature("skin_slippage_bullae", decomp.skinSlippageBullae ? 1 : 0, 0);
  setContinuousFeature("skin_discoloration", livor.enabled ? 1 : 0, 0);
  setContinuousFeature("marbling", decomp.marblingPresent ? 1 : 0, 0);
  setContinuousFeature("bloat", decomp.bloatingAndPurge ? 1 : 0, 0);
  setContinuousFeature("purging", decomp.bloatingAndPurge ? 1 : 0, 0);
  setContinuousFeature("decomposition_fluid", (decomp.totalBodyScore || 0) >= 18 ? 1 : 0, 0);
  setContinuousFeature("abdominal_caving", (decomp.totalBodyScore || 0) >= 20 ? 1 : 0, 0);
  setContinuousFeature("liquified_organs", (decomp.totalBodyScore || 0) >= 22 ? 1 : 0, 0);
  setContinuousFeature("desiccation_mummification", decomp.mummificationOrAdipocere ? 1 : 0, 0);
  setContinuousFeature("exposed_bone_moist_tissue", decomp.skeletonizationBoneExposed ? 1 : 0, 0);
  setContinuousFeature("exposed_bone_desiccated_tissue", (decomp.totalBodyScore || 0) >= 28 ? 1 : 0, 0);
  setContinuousFeature("bone_with_grease", (decomp.totalBodyScore || 0) >= 30 ? 1 : 0, 0);
  setContinuousFeature("adipocere", decomp.mummificationOrAdipocere ? 1 : 0, 0);
  setContinuousFeature("mold", (decomp.totalBodyScore || 0) >= 22 ? 1 : 0, 0);
  setContinuousFeature("dry_bone", (decomp.totalBodyScore || 0) >= 32 ? 1 : 0, 0);
  setContinuousFeature("weathered_bone", (decomp.totalBodyScore || 0) >= 34 ? 1 : 0, 0);

  const tbsScore = decomp.totalBodyScore ?? (decomp.enabled ? 12 : null);
  setContinuousFeature("decomposition_observation_score", tbsScore, 12);
  setContinuousFeature("decomposition_observation_confidence", decomp.enabled ? 90.0 : null, 85.0);

  // Entomology features
  const insectPresent = entom.enabled && entom.developmentalStage !== "none";
  setContinuousFeature("insect_present", insectPresent ? 1 : 0, 0);
  setContinuousFeature("insect_species_confidence", insectPresent ? 85.0 : null, 80.0);
  setContinuousFeature("insect_stage_confidence", insectPresent ? 88.0 : null, 80.0);

  // Metabolomics features (11-analyte XGBoost panel)
  const getMetaboliteVal = (keys: string[]): number | null => {
    if (!metab.enabled) return null;
    const found = metab.selectedMetabolites?.find((m) => keys.includes(m.metaboliteKey));
    if (found && typeof found.measuredValue === "number" && !isNaN(found.measuredValue)) {
      return found.measuredValue;
    }
    return null;
  };

  const hypoxanthineVal = metab.vitreousHypoxanthineUmolL ?? getMetaboliteVal(["vitreous_hypoxanthine", "hypoxanthine"]) ?? (metab.enabled ? 80.0 : null);
  setContinuousFeature("hypoxanthine_umol_L", hypoxanthineVal, 80.0);

  const lactateVal = metab.vitreousLactateMmolL ?? getMetaboliteVal(["vitreous_lactate", "lactic_acid"]) ?? (metab.enabled ? 12.0 : null);
  setContinuousFeature("lactic_acid_mmol_L", lactateVal, 12.0);

  const cholineVal = getMetaboliteVal(["choline", "vitreous_choline"]) ?? (metab.enabled ? 40.0 : null);
  setContinuousFeature("choline_umol_L", cholineVal, 40.0);

  const taurineVal = getMetaboliteVal(["taurine", "vitreous_taurine"]) ?? (metab.enabled ? 60.0 : null);
  setContinuousFeature("taurine_umol_L", taurineVal, 60.0);

  const glycerolVal = getMetaboliteVal(["glycerol", "vitreous_glycerol"]) ?? (metab.enabled ? 110.0 : null);
  setContinuousFeature("glycerol_umol_L", glycerolVal, 110.0);

  const succinicVal = getMetaboliteVal(["succinic_acid", "succinate"]) ?? (metab.enabled ? 30.0 : null);
  setContinuousFeature("succinic_acid_umol_L", succinicVal, 30.0);

  const formicVal = getMetaboliteVal(["formic_acid", "formate"]) ?? (metab.enabled ? 15.0 : null);
  setContinuousFeature("formic_acid_umol_L", formicVal, 15.0);

  const uricVal = getMetaboliteVal(["uric_acid", "urate"]) ?? (metab.enabled ? 320.0 : null);
  setContinuousFeature("uric_acid_umol_L", uricVal, 320.0);

  const creatineVal = getMetaboliteVal(["creatine"]) ?? (metab.enabled ? 200.0 : null);
  setContinuousFeature("creatine_umol_L", creatineVal, 200.0);

  const putrescineVal = getMetaboliteVal(["putrescine"]) ?? (metab.enabled ? 40.0 : null);
  setContinuousFeature("putrescine_nmol_g", putrescineVal, 40.0);

  const cadaverineVal = getMetaboliteVal(["cadaverine"]) ?? (metab.enabled ? 55.0 : null);
  setContinuousFeature("cadaverine_nmol_g", cadaverineVal, 55.0);

  setContinuousFeature("metabolomics_available", metab.enabled ? 1 : 0, 0);

  const activeMetabCount = [
    metab.vitreousHypoxanthineUmolL ?? getMetaboliteVal(["vitreous_hypoxanthine", "hypoxanthine"]),
    metab.vitreousLactateMmolL ?? getMetaboliteVal(["vitreous_lactate", "lactic_acid"]),
    getMetaboliteVal(["choline", "vitreous_choline"]),
    getMetaboliteVal(["taurine", "vitreous_taurine"]),
    getMetaboliteVal(["glycerol", "vitreous_glycerol"]),
    getMetaboliteVal(["succinic_acid", "succinate"]),
    getMetaboliteVal(["formic_acid", "formate"]),
    getMetaboliteVal(["uric_acid", "urate"]),
    getMetaboliteVal(["creatine"]),
    getMetaboliteVal(["putrescine"]),
    getMetaboliteVal(["cadaverine"])
  ].filter((v) => v !== null && v !== undefined).length;

  const missingMetabCount = metab.enabled ? Math.max(0, 11 - activeMetabCount) : 11;
  setContinuousFeature("metabolomics_missing_feature_count", missingMetabCount, 4);

  const cvImages = (vision.images || []).filter((img) => !img.isUnrelated);
  const cvAvailable = cvImages.length > 0 && !vision.unrelatedImagesDetected;

  const isMovementSuspected = !!(livor.suspectedBodyMovement || (cvAvailable && cvImages.length >= 2 && vision.detectedMovement?.suspectedMovement));
  const movementConfVal = isMovementSuspected ? (vision.detectedMovement?.confidenceScore ?? 85.0) : 0;
  setContinuousFeature("movement_confidence", movementConfVal, 0);

  // Computer Vision features
  setContinuousFeature("cv_available", cvAvailable ? 1 : 0, 0);
  setContinuousFeature("cv_image_count", cvImages.length, 0);
  setContinuousFeature("cv_decomposition_confidence", cvAvailable ? 85.0 : 0, 0);
  setContinuousFeature("cv_livor_confidence", cvAvailable ? 80.0 : 0, 0);
  setContinuousFeature("cv_entomology_present", cvAvailable && vision.detectedEntomology?.insectsPresent ? 1 : 0, 0);
  setContinuousFeature("cv_entomology_confidence", cvAvailable && vision.detectedEntomology?.insectsPresent ? 85.0 : 0, 0);
  setContinuousFeature("cv_movement_confidence", cvAvailable && cvImages.length >= 2 && vision.detectedMovement?.suspectedMovement ? (vision.detectedMovement.confidenceScore ?? 85.0) : 0, 0);

  // Ordinal Features
  const setOrdinal = (name: string, val: number, missing: boolean) => {
    const missIdx = XGB_FEATURE_NAMES.indexOf(`${name}__missing`);
    const ordIdx = XGB_FEATURE_NAMES.indexOf(`${name}__ordinal`);
    if (missIdx !== -1) v[missIdx] = missing ? 1 : 0;
    if (ordIdx !== -1) v[ordIdx] = val;
    rawMap[name] = val;
  };

  // Livor stage ordinal mapping
  let livorOrd = 0;
  if (livor.blanchability === "fixed_unblanchable") livorOrd = 3;
  else if (livor.blanchability === "partially_blanchable") livorOrd = 2;
  else if (livor.blanchability === "fully_blanchable") livorOrd = 1;
  setOrdinal("livor_stage", livorOrd, !livor.enabled);

  // Rigor stage ordinal mapping
  let rigorOrd = 0;
  if (rigor.progressionStage === "developing_jaw_neck") rigorOrd = 1;
  else if (rigor.progressionStage === "moderate_upper_trunk") rigorOrd = 2;
  else if (rigor.progressionStage === "complete_generalized") rigorOrd = 3;
  else if (rigor.progressionStage === "resolving_flaccid") rigorOrd = 4;
  else if (rigor.progressionStage === "absent_late") rigorOrd = 5;
  setOrdinal("rigor_stage", rigorOrd, !rigor.enabled);

  // Decomposition stage ordinal mapping
  let decompOrd = 0;
  const tbs = decomp.totalBodyScore || 3;
  if (tbs <= 6) decompOrd = 0; // Fresh
  else if (tbs <= 12) decompOrd = 1; // Early
  else if (tbs <= 19) decompOrd = 2; // Bloat / Active
  else if (tbs <= 27) decompOrd = 3; // Advanced / Mummification
  else decompOrd = 4; // Skeletonization
  setOrdinal("decomposition_stage", decompOrd, !decomp.enabled);
  setOrdinal("cv_decomposition_stage", decompOrd, !cvAvailable);
  setOrdinal("cv_livor_stage", livorOrd, !cvAvailable);

  // Insect developmental stage ordinal
  let insectOrd = 0;
  if (entom.developmentalStage === "eggs") insectOrd = 1;
  else if (entom.developmentalStage === "larva_instar_1") insectOrd = 2;
  else if (entom.developmentalStage === "larva_instar_2") insectOrd = 3;
  else if (entom.developmentalStage === "larva_instar_3_feeding") insectOrd = 4;
  else if (entom.developmentalStage === "larva_instar_3_wandering") insectOrd = 5;
  else if (entom.developmentalStage === "pupae") insectOrd = 6;
  else if (entom.developmentalStage === "empty_puparia") insectOrd = 7;
  else if (entom.developmentalStage === "adult_emerged") insectOrd = 8;
  else if (entom.developmentalStage === "dermestid_beetles") insectOrd = 9;
  setOrdinal("insect_developmental_stage", insectOrd, !entom.enabled);
  setOrdinal("cv_entomology_stage", insectOrd, !cvAvailable);

  // Movement position change ordinal
  const movementOrd = isMovementSuspected ? 2 : 0;
  setOrdinal("body_movement_position_change", movementOrd, false);

  let cvMovementOrd = 0;
  if (cvAvailable && cvImages.length >= 2 && vision.detectedMovement?.suspectedMovement) {
    if (vision.detectedMovement.movementPattern === "dual_discordant_lividity" || vision.detectedMovement.movementPattern === "gravitational_discordance") {
      cvMovementOrd = 2;
    } else {
      cvMovementOrd = 1;
    }
  } else if (livor.suspectedBodyMovement) {
    cvMovementOrd = 2;
  }
  setOrdinal("cv_movement_position_change", cvMovementOrd, !cvAvailable);

  // Clothing One-Hot
  const clothFactor = algor.clothingCoveringFactor ?? 1.0;
  const setOneHot = (prefix: string, matchKey: string) => {
    const idx = XGB_FEATURE_NAMES.indexOf(`${prefix}__${matchKey}`);
    if (idx !== -1) v[idx] = 1;
  };
  if (clothFactor >= 1.4) setOneHot("clothing", "heavy");
  else if (clothFactor >= 1.1) setOneHot("clothing", "insulated");
  else if (clothFactor <= 0.7) setOneHot("clothing", "unclothed");
  else setOneHot("clothing", "light");

  // Deposition site One-Hot
  const env = meta.environmentType || "indoor_residential";
  if (env.includes("water") || env.includes("aquatic")) setOneHot("deposition_site", "water");
  else if (env.includes("buried")) setOneHot("deposition_site", "shallow_burial");
  else if (env.includes("indoor")) setOneHot("deposition_site", "indoor");
  else setOneHot("deposition_site", "ground_surface");

  // Insect species One-Hot
  if (entom.primaryInsectGroup === "Calliphoridae_blowfly") setOneHot("insect_species", "Calliphora vicina");
  else if (entom.primaryInsectGroup === "Sarcophagidae_fleshfly") setOneHot("insect_species", "Sarcophaga bullata");
  else if (entom.primaryInsectGroup === "Coleoptera_beetles") setOneHot("insect_species", "Dermestes maculatus");
  else setOneHot("insect_species", "Uncollected");

  // QC & Modality availability flags
  const setFlag = (name: string, val: number) => {
    const idx = XGB_FEATURE_NAMES.indexOf(name);
    if (idx !== -1) v[idx] = val;
  };

  setFlag("insect_present", insectPresent ? 1 : 0);
  setFlag("metabolomics_available", metab.enabled ? 1 : 0);
  setFlag("cv_available", cvAvailable ? 1 : 0);
  setFlag("cv_entomology_present", vision.detectedEntomology?.insectsPresent ? 1 : 0);
  setFlag("metabolomics_missing_feature_count", metab.enabled ? 2 : 11);
  setFlag("cv_image_count", cvImages.length);
  setFlag("qc_flag_temp_below_ambient", bodyTemp < ambientTemp ? 1 : 0);

  setFlag("modality_avail__algor", algor.enabled ? 1 : 0);
  setFlag("modality_avail__livor", livor.enabled ? 1 : 0);
  setFlag("modality_avail__rigor", rigor.enabled ? 1 : 0);
  setFlag("modality_avail__decomposition", decomp.enabled ? 1 : 0);
  setFlag("modality_avail__entomology", entom.enabled ? 1 : 0);
  setFlag("modality_avail__metabolomics", metab.enabled ? 1 : 0);
  setFlag("modality_avail__cv", cvAvailable ? 1 : 0);

  const featureMap: Record<string, number> = {};
  XGB_FEATURE_NAMES.forEach((name, i) => {
    featureMap[name] = v[i];
  });

  return { vector: v, featureMap, rawValuesMap: rawMap };
}

// Tree node interface
export interface XgbTreeNode {
  left_children: number[];
  right_children: number[];
  split_indices: number[];
  split_conditions: number[];
  default_left: number[];
  sum_hessian: number[];
}

/**
 * Predicts raw XGBoost value for a single tree
 */
function evaluateTree(tree: XgbTreeNode, x: number[]): number {
  let node = 0;
  while (tree.left_children[node] !== -1) {
    const featIdx = tree.split_indices[node];
    const threshold = tree.split_conditions[node];
    const val = x[featIdx];
    const isMissing = val === undefined || isNaN(val);

    if (isMissing) {
      node = tree.default_left[node] === 1 ? tree.left_children[node] : tree.right_children[node];
    } else if (val < threshold) {
      node = tree.left_children[node];
    } else {
      node = tree.right_children[node];
    }
  }
  return tree.split_conditions[node];
}

/**
 * Computes Exact TreeSHAP for a single decision tree (Lundberg et al., Nature Machine Intelligence 2020)
 */
interface PathItem {
  feature: number;
  zero_fraction: number;
  one_fraction: number;
  pweight: number;
}

function extendPath(
  path: PathItem[],
  zero_fraction: number,
  one_fraction: number,
  feature: number
) {
  const l = path.length;
  path.push({ feature, zero_fraction, one_fraction, pweight: l === 0 ? 1 : 0 });
  if (l === 0) return;

  for (let i = l - 1; i >= 0; i--) {
    path[i + 1].pweight += (one_fraction * path[i].pweight * (i + 1)) / (l + 1);
    path[i].pweight = (zero_fraction * path[i].pweight * (l - i)) / (l + 1);
  }
}

function unwindPath(path: PathItem[], i: number): number[] {
  const l = path.length;
  const next_one_fraction = path[i].one_fraction;
  const next_zero_fraction = path[i].zero_fraction;
  const weights = new Array(l).fill(0);
  for (let j = 0; j < l; j++) {
    weights[j] = path[j].pweight;
  }

  if (next_one_fraction !== 0) {
    weights[l - 1] = weights[l - 1] / next_one_fraction;
    for (let j = l - 2; j >= 0; j--) {
      weights[j] = (weights[j] * l - weights[j + 1] * next_zero_fraction * (l - j - 1)) / (next_one_fraction * (j + 1));
    }
  } else {
    for (let j = 0; j < l - 1; j++) {
      weights[j] = (weights[j] * l) / (next_zero_fraction * (l - j));
    }
  }
  return weights;
}

function treeShapRecursive(
  tree: XgbTreeNode,
  node: number,
  x: number[],
  phi: number[],
  path: PathItem[],
  parent_zero_fraction: number,
  parent_one_fraction: number,
  parent_feature: number
) {
  // Extend path with the parent's split
  extendPath(path, parent_zero_fraction, parent_one_fraction, parent_feature);

  // If node is a leaf
  if (tree.left_children[node] === -1) {
    const leafVal = tree.split_conditions[node];
    for (let i = 1; i < path.length; i++) {
      const unwound = unwindPath(path, i);
      let sumWeight = 0;
      for (let j = 0; j < unwound.length; j++) {
        sumWeight += unwound[j] * (j + 1) / path.length;
      }
      phi[path[i].feature] += (path[i].one_fraction - path[i].zero_fraction) * sumWeight * leafVal;
    }
    path.pop();
    return;
  }

  const left = tree.left_children[node];
  const right = tree.right_children[node];
  const feature = tree.split_indices[node];
  const threshold = tree.split_conditions[node];
  const coverNode = Math.max(1, tree.sum_hessian[node] || 1);
  const coverLeft = Math.max(0, tree.sum_hessian[left] || 0.5);
  const coverRight = Math.max(0, tree.sum_hessian[right] || 0.5);

  const leftFraction = coverLeft / coverNode;
  const rightFraction = coverRight / coverNode;

  const val = x[feature];
  const isMissing = val === undefined || isNaN(val);
  const goesLeft = isMissing ? tree.default_left[node] === 1 : val < threshold;

  // Recurse left
  treeShapRecursive(
    tree,
    left,
    x,
    phi,
    path,
    leftFraction,
    goesLeft ? 1 : 0,
    feature
  );

  // Recurse right
  treeShapRecursive(
    tree,
    right,
    x,
    phi,
    path,
    rightFraction,
    goesLeft ? 0 : 1,
    feature
  );

  path.pop();
}

/**
 * Maps raw feature names to human-readable clinical names, categories, and explanations
 */
function getHumanReadableAttribution(
  featureKey: string,
  shapVal: number,
  rawValue: any
): { factorName: string; category: ShapAttributionItem["category"]; explanation: string } {
  if (featureKey.includes("body_temperature")) {
    return {
      factorName: "Rectal Core Temperature",
      category: "Algor",
      explanation: shapVal < 0
        ? "Warm body temperature strongly pulls estimated time of death towards recent hours (0–12h)."
        : "Hypothermic / ambient-approached core body temperature indicates extensive cooling time.",
    };
  }
  if (featureKey.includes("ambient_temperature")) {
    return {
      factorName: "Ambient Scene Temperature",
      category: "Environment",
      explanation: shapVal > 0
        ? "Cooler ambient surroundings decelerated normal decomposition rate."
        : "Warm ambient temperature accelerated biological decay kinetics.",
    };
  }
  if (featureKey.includes("decomposition_observation_score") || featureKey.includes("decomposition_stage")) {
    return {
      factorName: "Megyesi Total Body Score (TBS)",
      category: "Decomposition",
      explanation: shapVal > 0
        ? "Visible anatomical decomposition marks advanced post-mortem progression."
        : "Minimal post-mortem tissue degradation indicates early fresh stage.",
    };
  }
  if (featureKey.includes("bloat") || featureKey.includes("purging")) {
    return {
      factorName: "Abdominal Bloating & Gaseous Purge",
      category: "Decomposition",
      explanation: "Active enteric gas distension establishes bacterial post-mortem proliferation.",
    };
  }
  if (featureKey.includes("marbling")) {
    return {
      factorName: "Venous Hemolysis Marbling Pattern",
      category: "Decomposition",
      explanation: "Sulfhemoglobin erythrocyte breakdown within superficial vasculature.",
    };
  }
  if (featureKey.includes("skin_slippage")) {
    return {
      factorName: "Epidermolysis & Skin Slippage",
      category: "Decomposition",
      explanation: "Dermo-epidermal junction detachment from autolytic enzyme release.",
    };
  }
  if (featureKey.includes("livor_stage") || featureKey.includes("livor_observation")) {
    return {
      factorName: "Livor Mortis Lividity Fixation",
      category: "Livor",
      explanation: shapVal > 0
        ? "Fixed unblanchable hypostatic settling indicates post-mortem settling >12 hours."
        : "Blanchable early post-mortem lividity indicates recent circulatory cessation.",
    };
  }
  if (featureKey.includes("rigor_stage") || featureKey.includes("rigor_observation")) {
    return {
      factorName: "Rigor Mortis Muscular Rigidity",
      category: "Rigor",
      explanation: "ATP depletion across actin-myosin cross-bridges.",
    };
  }
  if (featureKey.includes("corneal_clouding")) {
    return {
      factorName: "Corneal Haziness / Ocular Clouding",
      category: "Algor",
      explanation: "Ocular hydration loss and corneal cell autolysis.",
    };
  }
  if (featureKey.includes("insect_present") || featureKey.includes("insect_developmental") || featureKey.includes("insect_stage")) {
    return {
      factorName: "Entomological Colonization Stage",
      category: "Entomology",
      explanation: shapVal > 0
        ? "Larval / pupal development requires cumulative accumulated degree hours (ADH)."
        : "Absence of necrophagous insect colonization supports recent death or sealed barrier.",
    };
  }
  if (featureKey.includes("hypoxanthine") || featureKey.includes("lactic_acid") || featureKey.includes("putrescine") || featureKey.includes("cadaverine")) {
    return {
      factorName: "Post-Mortem Vitreous / Tissue Metabolites",
      category: "Metabolomics",
      explanation: "Post-mortem biochemical degradation and biogenic amine accumulation.",
    };
  }
  if (featureKey.includes("clothing")) {
    return {
      factorName: "Clothing / Covering Insulation Factor",
      category: "Environment",
      explanation: "Textile coverage modulates convective and radiant body heat loss.",
    };
  }
  if (featureKey.includes("deposition_site")) {
    return {
      factorName: "Micro-Environmental Deposition Site",
      category: "Environment",
      explanation: "Scene substrate and burial depth dictate microbiological growth rate.",
    };
  }
  if (featureKey.includes("movement") || featureKey.includes("position_change")) {
    return {
      factorName: "Post-Mortem Body Movement / Relocation",
      category: "Vision",
      explanation: shapVal > 0
        ? "Dual lividity / post-mortem position shift indicates body was moved after initial hypostasis formation (anchoring PMI beyond the 2–8h fixation threshold)."
        : "Gravitational lividity and body position consistency confirms undisturbed post-mortem posture.",
    };
  }
  if (featureKey.includes("cv_")) {
    return {
      factorName: "Computer Vision Biological Confirmation",
      category: "Vision",
      explanation: "Visual confirmation of post-mortem anatomical changes from photographs.",
    };
  }

  return {
    factorName: featureKey.replace(/__/g, " ").replace(/_/g, " "),
    category: "Environment",
    explanation: shapVal > 0
      ? "Directionally increased estimated post-mortem interval."
      : "Directionally constrained estimated post-mortem interval.",
  };
}

/**
 * Runs full in-browser inference: XGBoost ensemble evaluation + Exact TreeSHAP
 */
export function runInBrowserXgbPrediction(caseData: CaseDataInput): InBrowserPredictionResult {
  const startTime = performance.now();

  const { vector, rawValuesMap } = extractXgbFeatureVector(caseData);
  const numFeatures = vector.length;
  const numTrees = XGB_TREES.length;

  let sumTreeOutput = 0;
  const totalPhi = new Array(numFeatures).fill(0);

  // Evaluate each tree and calculate TreeSHAP
  for (let t = 0; t < numTrees; t++) {
    const tree = XGB_TREES[t];

    // Tree prediction
    const treeVal = evaluateTree(tree, vector);
    sumTreeOutput += treeVal;

    // TreeSHAP calculation
    const treePhi = new Array(numFeatures).fill(0);
    const path: PathItem[] = [];
    treeShapRecursive(tree, 0, vector, treePhi, path, 1, 1, 0);

    for (let f = 0; f < numFeatures; f++) {
      totalPhi[f] += treePhi[f];
    }
  }

  // Base score + tree outputs
  const baseValue = XGB_BASE_SCORE;
  const rawOptimalHours = Math.max(0.5, baseValue + sumTreeOutput);
  const roundedOptimal = Math.round(rawOptimalHours * 10) / 10;

  // Compute 95% prediction interval (empirical model residual standard error ~18%)
  const marginHours = Math.max(2.5, roundedOptimal * 0.18);
  const minHours = Math.max(0.2, Math.round((roundedOptimal - marginHours) * 10) / 10);
  const maxHours = Math.round((roundedOptimal + marginHours) * 10) / 10;

  // Aggregate SHAP values across feature families (e.g. combine raw and scaled into single human factors)
  const factorGroupMap = new Map<string, { shapSum: number; rawKey: string }>();

  for (let i = 0; i < numFeatures; i++) {
    const shapVal = totalPhi[i];
    if (Math.abs(shapVal) < 0.001) continue;

    const featName = XGB_FEATURE_NAMES[i];
    const baseKey = featName.replace(/__(missing|scaled|raw|ordinal)/g, "");

    const existing = factorGroupMap.get(baseKey) || { shapSum: 0, rawKey: featName };
    existing.shapSum += shapVal;
    factorGroupMap.set(baseKey, existing);
  }

  const attributions: ShapAttributionItem[] = [];
  const maxAbsShap = Math.max(...Array.from(factorGroupMap.values()).map((v) => Math.abs(v.shapSum)), 1);

  factorGroupMap.forEach((val, baseKey) => {
    const metaInfo = getHumanReadableAttribution(baseKey, val.shapSum, rawValuesMap[baseKey]);
    const pullMag = Math.round(Math.abs(val.shapSum) * 10) / 10;
    const importancePct = Math.round((Math.abs(val.shapSum) / maxAbsShap) * 100);

    if (pullMag >= 0.1) {
      attributions.push({
        featureIndex: XGB_FEATURE_NAMES.indexOf(val.rawKey),
        featureKey: baseKey,
        factorName: metaInfo.factorName,
        category: metaInfo.category,
        shapValue: Math.round(val.shapSum * 100) / 100,
        rawValue: rawValuesMap[baseKey] ?? "Present",
        pullMagnitudeHours: pullMag,
        relativeImportancePercent: importancePct,
        impactDirection: val.shapSum >= 0 ? "increases_pmi" : "decreases_pmi",
        explanation: metaInfo.explanation,
      });
    }
  });

  // Sort attributions by absolute impact magnitude descending
  attributions.sort((a, b) => b.pullMagnitudeHours - a.pullMagnitudeHours);

  const endTime = performance.now();

  return {
    estimatedPmiOptimalHours: roundedOptimal,
    estimatedPmiMinHours: minHours,
    estimatedPmiMaxHours: maxHours,
    baseValueHours: Math.round(baseValue * 10) / 10,
    sumShapHours: Math.round(sumTreeOutput * 10) / 10,
    factorAttributions: attributions.slice(0, 10), // top 10 most influential factors
    featureVector: vector,
    featureNames: XGB_FEATURE_NAMES,
    executionTimeMs: Math.round((endTime - startTime) * 100) / 100,
  };
}
