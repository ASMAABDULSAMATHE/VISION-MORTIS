export type EnvironmentType =
  | "indoor_residential"
  | "indoor_heated"
  | "indoor_unheated"
  | "outdoor_shade"
  | "outdoor_sun_exposed"
  | "aquatic_freshwater"
  | "aquatic_marine"
  | "buried_shallow"
  | "refrigerated_morgue";

export type BodyPosition =
  | "supine"
  | "prone"
  | "left_lateral"
  | "right_lateral"
  | "sitting"
  | "suspended"
  | "indeterminate";

export type BlanchabilityStage =
  | "absent"
  | "fully_blanchable"
  | "partially_blanchable"
  | "fixed_unblanchable";

export type LivorColorHue =
  | "violaceous"
  | "cherry_red"
  | "chocolate_brown"
  | "pale_anemic"
  | "indeterminate";

export type RigorProgressionStage =
  | "absent_early"
  | "developing_jaw_neck"
  | "moderate_upper_trunk"
  | "complete_generalized"
  | "resolving_flaccid"
  | "absent_late";

export type EntomologyInsectStage =
  | "none"
  | "eggs"
  | "larva_instar_1"
  | "larva_instar_2"
  | "larva_instar_3_feeding"
  | "larva_instar_3_wandering"
  | "pupae"
  | "empty_puparia"
  | "adult_emerged"
  | "dermestid_beetles";

export interface CaseMetadata {
  caseNumber: string;
  examinerName: string;
  jurisdiction: string;
  discoveryDateTime: string; // ISO format or YYYY-MM-DDTHH:mm
  lastSeenAliveDateTime: string; // ISO format
  sceneLocation: string;
  environmentType: EnvironmentType;
  ambientTempC: number;
  relativeHumidityPercent: number;
  bodyFoundPosition: BodyPosition;
  bodyWeightKg: number;
  notes: string;
  examinersNotes?: string;
  recordedAt?: string;
  lastModifiedAt?: string;
}

export interface AlgorMortisData {
  enabled: boolean;
  rectalTempC: number;
  ambientTempC: number;
  bodyWeightKg: number;
  clothingCoveringFactor: number; // 0.5 (flowing water) to 1.8 (heavy blanket)
  clothingDescription: string;
  isBodyWet: boolean;
  airCurrentVelocity: "still" | "moderate_breeze" | "strong_wind";
  recordedAt?: string; // Timing of examiner indicator observation/entry
}

export interface LivorMortisData {
  enabled: boolean;
  blanchability: BlanchabilityStage;
  colorHue: LivorColorHue;
  distributionPattern: "dependent_pressure_spared" | "generalized" | "anterior" | "posterior" | "lateral_sided" | "dual_discordant";
  lividityPositionFound: BodyPosition;
  suspectedBodyMovement: boolean;
  notes: string;
  recordedAt?: string; // Timing of examiner indicator observation/entry
}

export interface RigorMortisData {
  enabled: boolean;
  progressionStage: RigorProgressionStage;
  muscleGroups: {
    jawTemporomandibular: boolean;
    neckCervical: boolean;
    upperLimbsElbowsWrists: boolean;
    trunkAbdomen: boolean;
    lowerLimbsKneesAnkles: boolean;
  };
  preDeathPhysicalExertion: "none_at_rest" | "moderate" | "violent_convulsions_strenuous";
  coldStiffeningSuspected: boolean;
  recordedAt?: string; // Timing of examiner indicator observation/entry
}

export interface DecompositionData {
  enabled: boolean;
  headNeckScore: number; // 1 to 13 (Megyesi scale)
  trunkScore: number;    // 1 to 12 (Megyesi scale)
  limbsScore: number;    // 1 to 10 (Megyesi scale)
  totalBodyScore: number;// 3 to 35
  marblingPresent: boolean;
  rightIliacDiscoloration: boolean;
  bloatingAndPurge: boolean;
  skinSlippageBullae: boolean;
  mummificationOrAdipocere: boolean;
  skeletonizationBoneExposed: boolean;
  effectiveMeanTempC: number;
  recordedAt?: string; // Timing of examiner indicator observation/entry
}

export interface EntomologyData {
  enabled: boolean;
  primaryInsectGroup: "Calliphoridae_blowfly" | "Sarcophagidae_fleshfly" | "Muscidae_housefly" | "Coleoptera_beetles" | "none";
  developmentalStage: EntomologyInsectStage;
  larvalLengthMm: number;
  maggotMassTempC: number;
  indoorAccessDelayHours: number; // e.g. closed windows delay fly arrival
  speciesName?: string;
  calculatedAdh?: number;
  recordedAt?: string; // Timing of examiner indicator observation/entry
}

export interface ActiveMetaboliteItem {
  id: string;
  metaboliteKey: string;
  name: string;
  measuredValue: number;
  unit: string;
  referenceRange: string;
  pmiContributionHours: number;
  confidence: number;
  notes: string;
}

export interface MetabolomicsData {
  enabled: boolean;
  vitreousPotassiumMmolL?: number; // 3.5 - 20 mmol/L
  vitreousHypoxanthineUmolL?: number;
  vitreousLactateMmolL?: number;
  ureaNitrogenMgDl?: number;
  vitreousSodiumMmolL?: number;
  selectedMetabolites?: ActiveMetaboliteItem[];
  sampleCollectionDateTime?: string;
  suspectedRenalFailureOrTrauma?: boolean;
  recordedAt?: string; // Timing of examiner indicator observation/entry
}

export type RelevanceCategoryType =
  | "writing_or_document"
  | "live_human"
  | "unrelated_object"
  | "deceased_human_forensic";

export type ImageAnatomicalTag =
  | "anterior_body"
  | "posterior_livor"
  | "face_cornea"
  | "abdomen_tbs"
  | "entomology_larvae"
  | "scene_context"
  | "limbs_periphery"
  | "other";

export interface VisionImageItem {
  id: string;
  dataUrl: string;
  previewUrl?: string;
  name: string;
  tag?: ImageAnatomicalTag;
  uploadedAt?: string;
  detectedFindings?: string;
  isUnrelated?: boolean;
  unrelatedIssueType?: "handwritten_document" | "live_person" | "unrelated_object_scene" | "other_non_forensic";
  unrelatedIssueDescription?: string;
  relevanceCategory?: RelevanceCategoryType;
  relevanceStatus?: "Forensic Biological Evidence" | "Unrelated / Non-Forensic" | "Scene Context";
  warningMessage?: string;
  categoryLabel?: string;
  qualityRating?: "Optimal" | "Suboptimal / Glare / Low Contrast" | "Blurry / Degraded";
  qualityNote?: string;
  qualityWarning?: string | null;
  // Deep Clarity & Reliability Metrics
  clarityScore?: number; // 0 - 100
  clarityRating?: "Optimal (Sharp & Well-Lit)" | "Moderate (Mild Blur/Soft Focus)" | "Suboptimal (Low Light / Blur)" | "Poor (Degraded / Motion Blur)";
  clarityIssues?: string[];
  clarityDetails?: string;
  reliabilityScore?: number; // 0 - 100
  reliabilityRating?: "Forensic-Grade (High Confidence)" | "Moderate Confidence" | "Low / Questionable";
  reliabilityFactors?: string[];
  reliabilityDetails?: string;
  forensicRecommendations?: string;
  pmiImplication?: string;
  detectedMovementIndicators?: {
    movementSuspected: boolean;
    pattern?: string;
    details?: string;
    confidenceScore?: number;
  };
}

export interface DetectedBodyMovement {
  suspectedMovement: boolean;
  confidenceScore: number; // 0 - 100% confidence for XGBoost cv_movement_confidence
  movementPattern:
    | "none_consistent"
    | "dual_discordant_lividity"
    | "shifted_pressure_blanching"
    | "gravitational_discordance"
    | "drag_marks_abrasions"
    | "clothing_posture_discordance";
  patternLabel: string;
  description: string;
  forensicIndicators: string[];
  pmiImpactAssessment: string;
  incongruentSurfaces?: string;
  estimatedMovementWindowHours?: {
    min: number;
    max: number;
  };
}

export interface UnrelatedImageIssue {
  imageId: string;
  imageName: string;
  issueType: "handwritten_document" | "live_person" | "unrelated_object_scene" | "other_non_forensic";
  issueTitle: string;
  issueMessage: string;
  recommendation: string;
}

export interface VisionDetectionData {
  images?: VisionImageItem[];
  imagePreviewUrl?: string; // primary or active selected image
  activeImageId?: string;
  analyzing?: boolean;
  detectedDecompositionStage?: string;
  estimatedTbs?: {
    headNeckScore: number;
    trunkScore: number;
    limbsScore: number;
    totalScore: number;
  };
  detectedLivor?: {
    colorClassification: string;
    distribution: string;
    estimatedFixation: string;
  };
  detectedEntomology?: {
    insectsPresent: boolean;
    primaryInsectStage: string;
    maggotMassPresent: boolean;
    description: string;
  };
  detectedOcularChanges?: {
    cornealClouding: string;
    tacheNoirePresent: boolean;
    description: string;
  };
  detectedMovement?: DetectedBodyMovement;
  unrelatedImagesDetected?: boolean;
  unrelatedImageCount?: number;
  unrelatedIssuesList?: UnrelatedImageIssue[];
  averageClarityScore?: number;
  averageReliabilityScore?: number;
  overallQualityAssessment?: string;
  clarityReliabilitySummary?: {
    optimalCount: number;
    suboptimalCount: number;
    overallReliabilityTier: "Forensic-Grade Evidence" | "Moderate Reliability" | "Caution: Low Quality / Blur";
    detailedRecommendations: string[];
  };
  detectedCategoryBreakdown?: {
    documentsAndWritings: number;
    livingPeople: number;
    unrelatedObjects: number;
    forensicEvidence: number;
  };
  sceneObservations?: string[];
  visualPmiWindowHours?: {
    min: number;
    max: number;
    confidence: number;
  };
  forensicObservations?: string;
  examinerNotes?: string;
  investigatorNotes?: string;
  qualityWarning?: string | null;
  analyzedAt?: string;
  recordedAt?: string;
  perImageFindings?: Array<{
    imageId: string;
    tag: string;
    isUnrelated?: boolean;
    unrelatedIssueType?: string;
    unrelatedIssueDescription?: string;
    relevanceCategory?: "writing_or_document" | "live_human" | "unrelated_object" | "deceased_human_forensic";
    relevanceStatus?: string;
    categoryLabel?: string;
    warningMessage?: string;
    qualityRating?: string;
    qualityNote?: string;
    clarityScore?: number;
    clarityRating?: string;
    clarityIssues?: string[];
    clarityDetails?: string;
    reliabilityScore?: number;
    reliabilityRating?: string;
    reliabilityFactors?: string[];
    reliabilityDetails?: string;
    forensicRecommendations?: string;
    findings: string;
    pmiImplication?: string;
    movementSuspected?: boolean;
    movementDetails?: string;
  }>;
}

export interface InconsistencyAlert {
  id: string;
  severity: "critical" | "warning" | "advisory";
  title: string;
  description: string;
  indicatorA: string;
  indicatorB: string;
  forensicImplication: string;
}

export interface IndicatorEvaluation {
  name: string;
  category: "Algor" | "Livor" | "Rigor" | "Decomposition" | "Entomology" | "Metabolomics" | "Vision";
  enabled: boolean;
  estimatedPmiMinHours: number;
  estimatedPmiMaxHours: number;
  estimatedPmiOptimalHours: number;
  confidencePercent: number;
  physiologicReliabilityWindow: string;
  status: "optimal_window" | "moderate_utility" | "outside_reliable_window" | "conflict_flagged";
  diagnosticNotes: string;
  weightInFinalCalculation: number;
}

export interface FactorAttribution {
  factorName: string;
  impactDirection: "increases_pmi" | "decreases_pmi" | "anchors_estimate" | "moderates_conflict";
  pullMagnitudeHours: number;
  relativeImportancePercent: number;
  explanation: string;
}

export interface PmiCalculationResult {
  estimatedPmiMinHours: number;
  estimatedPmiMaxHours: number;
  estimatedPmiOptimalHours: number;
  estimatedTimeOfDeathMin: string;
  estimatedTimeOfDeathMax: string;
  estimatedTimeOfDeathOptimal: string;
  confidenceScore: number;
  confidenceTier: "High Confidence" | "Moderate Confidence" | "Low / Discrepant" | "Critical Inconsistency";
  inconsistenciesDetected: boolean;
  inconsistencyAlerts: InconsistencyAlert[];
  dominantIndicatorSummary: string[];
  indicatorEvaluations: IndicatorEvaluation[];
  factorAttributions: FactorAttribution[];
  coolingCurveData: Array<{
    hour: number;
    temperature: number;
    upperConfidence: number;
    lowerConfidence: number;
  }>;
  probabilityDistribution: Array<{
    pmiHours: number;
    probability: number;
  }>;
  aiSynthesis?: {
    expertSummary: string;
    dominantIndicators: string[];
    diagnosticBreakdown: Record<string, string>;
    recommendedConfirmatoryTests: string[];
  };
  calculatedAt: string;
}

export interface ForensicPresetCase {
  id: string;
  title: string;
  category: "Early (0-24h)" | "Intermediate (1-3 days)" | "Advanced (4-14 days)" | "Environmental Anomaly" | "Conflicting Evidence";
  description: string;
  sceneSummary: string;
  isHarmonic?: boolean;
  metadata: CaseMetadata;
  algor: AlgorMortisData;
  livor: LivorMortisData;
  rigor: RigorMortisData;
  decomposition: DecompositionData;
  entomology: EntomologyData;
  metabolomics: MetabolomicsData;
}

export interface ForensicCaseInput {
  caseId: string;
  subjectNameOrIdentifier: string;
  presetId?: string;
  presetName?: string;
  presetCategory?: string;
  presetDescription?: string;
  isPresetCase?: boolean;
  isHarmonicPreset?: boolean;
  isPresetModified?: boolean;
  presetModifiedAt?: string;
  sceneBaseline?: ForensicCaseInput;
  isSceneBaselineLocked?: boolean;
  sceneBaselineLockedAt?: string;
  ageYears?: number;
  sex: "male" | "female" | "unknown";
  discoveryTimestamp: string;
  locationDescription: string;
  investigatorName: string;
  examinerName?: string;
  jurisdiction?: string;
  ambientTempC: number;
  relativeHumidityPercent?: number;
  bodyWeightKg: number;
  bodyFoundPosition: BodyPosition;
  algorMortis: AlgorMortisData;
  livorMortis: LivorMortisData;
  rigorMortis: RigorMortisData;
  decomposition: DecompositionData;
  entomology: EntomologyData;
  metabolomics: MetabolomicsData;
  examinersNotes?: string;
  indicatorTimings?: {
    sceneBaseline?: string;
    algor?: string;
    livor?: string;
    rigor?: string;
    decomposition?: string;
    entomology?: string;
    metabolomics?: string;
    vision?: string;
    [key: string]: string | undefined;
  };
  examinationStartedAt?: string;
  lastModifiedAt?: string;
}

