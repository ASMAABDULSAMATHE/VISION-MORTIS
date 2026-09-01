import {
  AlgorMortisData,
  CaseMetadata,
  DecompositionData,
  EntomologyData,
  FactorAttribution,
  ForensicCaseInput,
  InconsistencyAlert,
  IndicatorEvaluation,
  LivorMortisData,
  MetabolomicsData,
  PmiCalculationResult,
  RigorMortisData,
} from "../types";

/**
 * Solves the Henssge Nomogram double exponential cooling equation:
 * Theta = (T_rectal - T_ambient) / (37.2 - T_ambient) = 1.25 * e^(-k*t) - 0.25 * e^(-5*k*t)
 * where k = (1.2815 / (M^0.625 * C)) - 0.0284
 */
export function calculateHenssgeAlgorMortis(
  rectalTempC: number,
  ambientTempC: number,
  bodyWeightKg: number,
  correctiveFactorC: number
): {
  pmiHours: number;
  minHours: number;
  maxHours: number;
  confidence: number;
  coolingCurve: Array<{ hour: number; temperature: number; upperConfidence: number; lowerConfidence: number }>;
  status: "valid" | "out_of_range" | "plateau" | "ambient_equilibrated";
  notes: string;
} {
  const M = Math.max(20, Math.min(200, bodyWeightKg));
  const C = Math.max(0.4, Math.min(2.2, correctiveFactorC));
  const Ta = ambientTempC;
  const Tr = rectalTempC;

  // Temperature cooling curve array
  const coolingCurve: Array<{ hour: number; temperature: number; upperConfidence: number; lowerConfidence: number }> = [];

  const k = 1.2815 / (Math.pow(M, 0.625) * C) - 0.0284;
  const safeK = Math.max(0.01, k);

  const calcTempAtT = (t: number): number => {
    const theta = 1.25 * Math.exp(-safeK * t) - 0.25 * Math.exp(-5 * safeK * t);
    return Ta + (37.2 - Ta) * Math.max(0, theta);
  };

  // Generate 36-hour cooling trajectory
  for (let t = 0; t <= 36; t += 1) {
    const temp = calcTempAtT(t);
    const uncertaintySpan = Math.min(4.5, 2.8 + (t / 36) * 1.7);
    coolingCurve.push({
      hour: t,
      temperature: Number(temp.toFixed(1)),
      upperConfidence: Number(Math.min(37.2, calcTempAtT(Math.max(0, t - uncertaintySpan))).toFixed(1)),
      lowerConfidence: Number(Math.max(Ta, calcTempAtT(t + uncertaintySpan)).toFixed(1)),
    });
  }

  // Edge checks
  if (Tr >= 37.0) {
    return {
      pmiHours: 0.5,
      minHours: 0,
      maxHours: 2.5,
      confidence: 85,
      coolingCurve,
      status: "plateau",
      notes: "Post-mortem temperature plateau period (temperature still near normal ~37.2°C). Indicates death within 0 - 2.5 hours.",
    };
  }

  if (Math.abs(Tr - Ta) < 0.8) {
    return {
      pmiHours: 24,
      minHours: 18,
      maxHours: 36,
      confidence: 45,
      coolingCurve,
      status: "ambient_equilibrated",
      notes: "Body temperature has nearly equilibrated with ambient temperature. Algor mortis has reached its limit of diagnostic precision (>20-24h).",
    };
  }

  const targetTheta = (Tr - Ta) / (37.2 - Ta);
  if (targetTheta <= 0 || targetTheta > 1) {
    return {
      pmiHours: 24,
      minHours: 16,
      maxHours: 36,
      confidence: 40,
      coolingCurve,
      status: "out_of_range",
      notes: "Temperature values indicate complete cooling or atypical temperature inversion.",
    };
  }

  // Binary search / Newton iteration to find t
  let low = 0;
  let high = 48;
  let estimatedT = 6;

  for (let i = 0; i < 40; i++) {
    const mid = (low + high) / 2;
    const currentTheta = 1.25 * Math.exp(-safeK * mid) - 0.25 * Math.exp(-5 * safeK * mid);
    if (currentTheta > targetTheta) {
      low = mid;
    } else {
      high = mid;
    }
  }
  estimatedT = (low + high) / 2;

  // Henssge 95% confidence interval
  const standardErrorHours = Math.max(2.8, Math.min(4.5, 2.8 + (estimatedT / 20) * 1.5));
  const minH = Math.max(0, Number((estimatedT - standardErrorHours).toFixed(1)));
  const maxH = Number((estimatedT + standardErrorHours).toFixed(1));

  return {
    pmiHours: Number(estimatedT.toFixed(1)),
    minHours: minH,
    maxHours: maxH,
    confidence: estimatedT <= 16 ? 90 : estimatedT <= 24 ? 75 : 55,
    coolingCurve,
    status: "valid",
    notes: `Henssge double-exponential nomogram solved with corrective factor C=${C.toFixed(2)} for ${M}kg body mass.`,
  };
}

/**
 * Livor mortis evaluation
 */
export function evaluateLivorMortis(livor: LivorMortisData): {
  minHours: number;
  maxHours: number;
  optimalHours: number;
  confidence: number;
  status: "optimal_window" | "moderate_utility" | "outside_reliable_window" | "conflict_flagged";
  notes: string;
} {
  switch (livor.blanchability) {
    case "absent":
      return {
        minHours: 0,
        maxHours: 2,
        optimalHours: 0.75,
        confidence: 75,
        status: "optimal_window",
        notes: "Livor mortis absent or faint initial pooling (indicates early post-mortem period < 2 hours).",
      };
    case "fully_blanchable":
      return {
        minHours: 1,
        maxHours: 6,
        optimalHours: 3.5,
        confidence: 88,
        status: "optimal_window",
        notes: "Completely blanching on digital pressure; blood remains within capillary beds, indicating 1 to 6 hours.",
      };
    case "partially_blanchable":
      return {
        minHours: 6,
        maxHours: 12,
        optimalHours: 9,
        confidence: 85,
        status: "optimal_window",
        notes: "Incomplete/sluggish blanching on firm thumb pressure; hemolyzed red cells beginning perivascular extravasation (6 to 12 hours).",
      };
    case "fixed_unblanchable":
      return {
        minHours: 10,
        maxHours: 36,
        optimalHours: 16,
        confidence: 80,
        status: "moderate_utility",
        notes: "Completely fixed lividity; profound extravasation and dermal staining (indicates > 10-12 hours).",
      };
    default:
      return { minHours: 2, maxHours: 14, optimalHours: 8, confidence: 50, status: "moderate_utility", notes: "Indeterminate livor mortis state." };
  }
}

/**
 * Rigor mortis evaluation through Nysten's law & biomechanics
 */
export function evaluateRigorMortis(rigor: RigorMortisData): {
  minHours: number;
  maxHours: number;
  optimalHours: number;
  confidence: number;
  status: "optimal_window" | "moderate_utility" | "outside_reliable_window" | "conflict_flagged";
  notes: string;
} {
  const { progressionStage, preDeathPhysicalExertion, coldStiffeningSuspected } = rigor;

  // Acceleration factor for pre-death convulsions or violent physical struggle (rapid ATP depletion)
  const exertionFactor = preDeathPhysicalExertion === "violent_convulsions_strenuous" ? 0.5 : preDeathPhysicalExertion === "moderate" ? 0.8 : 1.0;

  let baseResult: {
    minHours: number;
    maxHours: number;
    optimalHours: number;
    confidence: number;
    status: "optimal_window" | "moderate_utility" | "outside_reliable_window" | "conflict_flagged";
    notes: string;
  };

  switch (progressionStage) {
    case "absent_early":
      baseResult = {
        minHours: 0,
        maxHours: 3 * exertionFactor,
        optimalHours: 1.5 * exertionFactor,
        confidence: 80,
        status: "optimal_window",
        notes: "Early flaccidity prior to onset of rigor mortis (ATP levels in skeletal muscle still sufficient, < 2-3h).",
      };
      break;
    case "developing_jaw_neck":
      baseResult = {
        minHours: 2 * exertionFactor,
        maxHours: 7 * exertionFactor,
        optimalHours: 4.5 * exertionFactor,
        confidence: 85,
        status: "optimal_window",
        notes: "Rigor developing according to Nysten's law: detected in temporomandibular joint, facial and cervical muscles (2 to 6h).",
      };
      break;
    case "moderate_upper_trunk":
      baseResult = {
        minHours: 6 * exertionFactor,
        maxHours: 12 * exertionFactor,
        optimalHours: 9 * exertionFactor,
        confidence: 85,
        status: "optimal_window",
        notes: "Rigor progressing to upper extremities, thorax, and elbows (6 to 12h).",
      };
      break;
    case "complete_generalized":
      baseResult = {
        minHours: 12 * exertionFactor,
        maxHours: 24,
        optimalHours: 18,
        confidence: 88,
        status: "optimal_window",
        notes: "Full peak generalized rigidity in all muscle groups (12 to 24h).",
      };
      break;
    case "resolving_flaccid":
      baseResult = {
        minHours: 24,
        maxHours: 48,
        optimalHours: 34,
        confidence: 80,
        status: "optimal_window",
        notes: "Rigor secondary resolution (flaccidity progressing via myofilament autolysis, 24 to 48h).",
      };
      break;
    case "absent_late":
      baseResult = {
        minHours: 40,
        maxHours: 120,
        optimalHours: 60,
        confidence: 70,
        status: "moderate_utility",
        notes: "Rigor mortis completely passed (secondary flaccidity complete, > 36-48h).",
      };
      break;
    default:
      baseResult = { minHours: 4, maxHours: 24, optimalHours: 14, confidence: 50, status: "moderate_utility", notes: "Indeterminate rigor stage." };
      break;
  }

  // Adjust for cold stiffening / muscle water crystallization (<4°C)
  if (coldStiffeningSuspected) {
    baseResult.confidence = Math.min(baseResult.confidence, 40);
    baseResult.status = "conflict_flagged";
    baseResult.notes += " Warning: Cold stiffening / freezing suspected (<4°C). Freezing of muscle water physically mimics biochemical rigor mortis; true rigor cannot be evaluated reliably until thawed.";
  }

  return baseResult;
}

/**
 * Megyesi et al. Total Body Score (TBS) to Accumulated Degree Days (ADD) and PMI
 * log10(ADD) = 0.002 * TBS^2 + 1.81 (+/- 0.388 standard error)
 */
export function evaluateDecomposition(decomp: DecompositionData): {
  minHours: number;
  maxHours: number;
  optimalHours: number;
  confidence: number;
  addCalculated: number;
  status: "optimal_window" | "moderate_utility" | "outside_reliable_window" | "conflict_flagged";
  notes: string;
} {
  const tbs = Math.max(3, Math.min(35, decomp.headNeckScore + decomp.trunkScore + decomp.limbsScore));
  const meanTemp = Math.max(2, decomp.effectiveMeanTempC || 20);

  // Megyesi formula
  const logAdd = 0.002 * Math.pow(tbs, 2) + 1.81;
  const addMedian = Math.pow(10, logAdd);
  const addMin = Math.pow(10, Math.max(0.5, logAdd - 0.388));
  const addMax = Math.pow(10, logAdd + 0.388);

  const daysMedian = addMedian / meanTemp;
  const daysMin = addMin / meanTemp;
  const daysMax = addMax / meanTemp;

  const hoursOptimal = Number((daysMedian * 24).toFixed(1));
  const hoursMin = Number((daysMin * 24).toFixed(1));
  const hoursMax = Number((daysMax * 24).toFixed(1));

  // For fresh remains (TBS 3-4, completely fresh anatomical regions), autolysis has not initiated.
  // Megyesi's regression model begins at active decay stages; fresh state is constrained to 0-24h window.
  if (tbs <= 4) {
    return {
      minHours: 0,
      maxHours: 24,
      optimalHours: 8,
      confidence: 70,
      addCalculated: Number(addMedian.toFixed(1)),
      status: "moderate_utility",
      notes: `Fresh morphological post-mortem state (TBS=${tbs}/35). Macroscopic autolytic decomposition has not initiated; post-mortem interval is within the initial 24 hours.`,
    };
  }

  let confidence = 85;
  if (tbs > 30) {
    confidence = 75;
  }

  return {
    minHours: hoursMin,
    maxHours: hoursMax,
    optimalHours: hoursOptimal,
    confidence,
    addCalculated: Number(addMedian.toFixed(1)),
    status: tbs >= 6 ? "optimal_window" : "moderate_utility",
    notes: `Megyesi TBS=${tbs} yielded ${addMedian.toFixed(1)} Accumulated Degree Days (ADD) at mean ambient temp ${meanTemp}°C.`,
  };
}

/**
 * Forensic Entomology evaluation based on Diptera/Coleoptera developmental milestones & ADH
 */
export function evaluateEntomology(entomology: EntomologyData, ambientTempC: number): {
  minHours: number;
  maxHours: number;
  optimalHours: number;
  confidence: number;
  status: "optimal_window" | "moderate_utility" | "outside_reliable_window" | "conflict_flagged";
  notes: string;
} {
  const temp = Math.max(10, ambientTempC || 20);
  // Thermal rate adjustment multiplier (standard laboratory baseline at 22-24°C)
  const thermalSpeed = Math.max(0.4, Math.min(2.5, (temp - 8) / 14));
  const delayHours = entomology.indoorAccessDelayHours || 0;

  switch (entomology.developmentalStage) {
    case "none":
      return {
        minHours: 0,
        maxHours: 24,
        optimalHours: 6,
        confidence: 60,
        status: "moderate_utility",
        notes: "No insect colonization detected. Suggests early post-mortem (<24h) or barrier preventing oviposition.",
      };
    case "eggs":
      return {
        minHours: Math.round((6 / thermalSpeed + delayHours) * 10) / 10,
        maxHours: Math.round((24 / thermalSpeed + delayHours) * 10) / 10,
        optimalHours: Math.round((14 / thermalSpeed + delayHours) * 10) / 10,
        confidence: 88,
        status: "optimal_window",
        notes: `Calliphoridae / Sarcophagidae oviposition (blowfly egg clusters). Minimal PMI ~8-24 hours with access delay ${delayHours}h.`,
      };
    case "larva_instar_1":
      return {
        minHours: Math.round((20 / thermalSpeed + delayHours) * 10) / 10,
        maxHours: Math.round((48 / thermalSpeed + delayHours) * 10) / 10,
        optimalHours: Math.round((32 / thermalSpeed + delayHours) * 10) / 10,
        confidence: 90,
        status: "optimal_window",
        notes: "1st instar larvae present (1-3mm length, single spiracular slit). Est. 24 - 48 hours post-colonization.",
      };
    case "larva_instar_2":
      return {
        minHours: Math.round((48 / thermalSpeed + delayHours) * 10) / 10,
        maxHours: Math.round((96 / thermalSpeed + delayHours) * 10) / 10,
        optimalHours: Math.round((72 / thermalSpeed + delayHours) * 10) / 10,
        confidence: 92,
        status: "optimal_window",
        notes: "2nd instar larvae present (4-9mm, two spiracular slits). Est. 2 to 4 days post-colonization.",
      };
    case "larva_instar_3_feeding":
      return {
        minHours: Math.round((96 / thermalSpeed + delayHours) * 10) / 10,
        maxHours: Math.round((144 / thermalSpeed + delayHours) * 10) / 10,
        optimalHours: Math.round((120 / thermalSpeed + delayHours) * 10) / 10,
        confidence: 92,
        status: "optimal_window",
        notes: "3rd instar feeding larvae actively in crop/feeding masses (10-16mm, three spiracular slits). Est. 4 to 6 days.",
      };
    case "larva_instar_3_wandering":
      return {
        minHours: Math.round((144 / thermalSpeed + delayHours) * 10) / 10,
        maxHours: Math.round((216 / thermalSpeed + delayHours) * 10) / 10,
        optimalHours: Math.round((180 / thermalSpeed + delayHours) * 10) / 10,
        confidence: 90,
        status: "optimal_window",
        notes: "3rd instar post-feeding / wandering stage (larvae leaving remains into surrounding substrate/clothing to pupate). Est. 6 to 9 days.",
      };
    case "pupae":
      return {
        minHours: Math.round((200 / thermalSpeed + delayHours) * 10) / 10,
        maxHours: Math.round((360 / thermalSpeed + delayHours) * 10) / 10,
        optimalHours: Math.round((280 / thermalSpeed + delayHours) * 10) / 10,
        confidence: 88,
        status: "optimal_window",
        notes: "Intact puparia formed (tanning from light yellow to dark brown). Est. 8 to 15 days.",
      };
    case "empty_puparia":
    case "adult_emerged":
      return {
        minHours: Math.round((336 / thermalSpeed + delayHours) * 10) / 10,
        maxHours: Math.round((600 / thermalSpeed + delayHours) * 10) / 10,
        optimalHours: Math.round((430 / thermalSpeed + delayHours) * 10) / 10,
        confidence: 85,
        status: "optimal_window",
        notes: "Open/eclosed puparia indicating first generation of adult blowflies has fully emerged (> 14 - 21 days).",
      };
    case "dermestid_beetles":
      return {
        minHours: Math.round((480 / thermalSpeed + delayHours) * 10) / 10,
        maxHours: Math.round((1200 / thermalSpeed + delayHours) * 10) / 10,
        optimalHours: Math.round((720 / thermalSpeed + delayHours) * 10) / 10,
        confidence: 80,
        status: "optimal_window",
        notes: "Dermestidae skin beetle colonization in dry/cartilaginous remains (3 to 6+ weeks).",
      };
    default:
      return { minHours: 24, maxHours: 120, optimalHours: 60, confidence: 50, status: "moderate_utility", notes: "Indeterminate entomology findings." };
  }
}

/**
 * Vitreous humor potassium [K+] & metabolomics equations
 * Madea equation: PMI = 5.26 * ([K+] - 4.0)
 * Sturner equation: PMI = 7.14 * [K+] - 39.1
 * Also supports multi-analyte integration (Hypoxanthine, Lactate, Urea Nitrogen, Sodium, Glucose, Inosine)
 */
export function evaluateMetabolomics(metab: MetabolomicsData): {
  minHours: number;
  maxHours: number;
  optimalHours: number;
  confidence: number;
  status: "optimal_window" | "moderate_utility" | "outside_reliable_window" | "conflict_flagged";
  notes: string;
  effectivePotassiumMmolL: number;
  rawPotassiumMmolL: number;
  kExcessSubtracted: number;
  dehydrationRatio: number;
  naPmiEstimate?: number;
  pmiMadea: number;
  pmiSturner: number;
} {
  // Check for Vitreous Urea Nitrogen (VUN) and Vitreous Sodium ([Na+]) from custom items or direct fields
  const vunItem = metab.selectedMetabolites?.find((m) => m.metaboliteKey === "urea_nitrogen");
  const vun = vunItem ? vunItem.measuredValue : metab.ureaNitrogenMgDl;

  const naItem = metab.selectedMetabolites?.find((m) => m.metaboliteKey === "vitreous_sodium");
  const na = naItem ? naItem.measuredValue : metab.vitreousSodiumMmolL;

  let k = metab.vitreousPotassiumMmolL;
  let uremicCorrectionApplied = false;
  let dehydrationConcentrationApplied = false;

  // 1. Antemortem Uremia / Renal Failure Correction via VUN
  // Antemortem baseline potassium is normally 3.8-4.0 mmol/L. In renal failure / azotemia (VUN > 30 mg/dL),
  // baseline K+ is elevated (antemortem hyperkalemia).
  let kExcess = 0;
  if (vun !== undefined && vun > 30) {
    kExcess = Math.min(3.8, Number(((vun - 25) * 0.035).toFixed(2)));
    k = Math.max(4.0, Number((k - kExcess).toFixed(2)));
    uremicCorrectionApplied = true;
  }

  // 2. Severe Hypernatremic Dehydration Correction via Na+
  // If [Na+] > 152 mmol/L, dehydration hemoconcentrates vitreous solutes
  let hypernatremicRatio = 1.0;
  if (na !== undefined && na > 152) {
    hypernatremicRatio = Number((na / 142).toFixed(2));
    k = Math.max(4.0, Number((k / hypernatremicRatio).toFixed(2)));
    dehydrationConcentrationApplied = true;
  }

  const pmiMadea = Math.max(0.5, 5.26 * (k - 4.0));
  const pmiSturner = 7.14 * k - 39.1;
  // Sturner equation has an x-intercept at 5.47 mmol/L; for lower values, use Madea's established early slope
  let primaryKPmi: number;
  if (k <= 4.0) {
    primaryKPmi = 1.0;
  } else if (pmiSturner <= 0) {
    primaryKPmi = pmiMadea;
  } else {
    primaryKPmi = (pmiMadea + pmiSturner) / 2;
  }

  // Check additional metabolites & direct Vitreous Sodium decline
  const additionalPmis: Array<{ pmi: number; weight: number }> = [{ pmi: primaryKPmi, weight: 1.0 }];

  // Direct Vitreous Sodium post-mortem decline regression (Coe / Madea model: ~0.5 mmol/L per hour from 142 baseline)
  let naPmiEstimate: number | undefined = undefined;
  const hasNaInSelected = metab.selectedMetabolites?.some((m) => m.metaboliteKey === "vitreous_sodium");
  if (!hasNaInSelected && na !== undefined && na <= 142 && na >= 100) {
    naPmiEstimate = Math.max(1, Math.min(72, Number(((142 - na) / 0.5).toFixed(1))));
    additionalPmis.push({ pmi: naPmiEstimate, weight: 0.65 });
  }

  if (metab.selectedMetabolites && metab.selectedMetabolites.length > 0) {
    for (const item of metab.selectedMetabolites) {
      if (item.metaboliteKey !== "vitreous_potassium" && item.pmiContributionHours > 0) {
        additionalPmis.push({ pmi: item.pmiContributionHours, weight: item.confidence / 100 });
      }
    }
  }

  const totalWeight = additionalPmis.reduce((acc, curr) => acc + curr.weight, 0);
  const weightedPmi = additionalPmis.reduce((acc, curr) => acc + curr.pmi * curr.weight, 0) / (totalWeight || 1);

  const standardErrorHours = Math.max(3.0, weightedPmi * 0.20);
  const minH = Math.max(0, Number((weightedPmi - standardErrorHours).toFixed(1)));
  const maxH = Number((weightedPmi + standardErrorHours).toFixed(1));

  let confidence = 85;
  if (metab.vitreousPotassiumMmolL > 16.0) confidence = 55;
  if (metab.selectedMetabolites && metab.selectedMetabolites.length > 1) {
    confidence = Math.min(95, confidence + 5);
  }

  let status: "optimal_window" | "moderate_utility" | "outside_reliable_window" | "conflict_flagged" =
    metab.vitreousPotassiumMmolL <= 15 ? "optimal_window" : "moderate_utility";
  let notes = `Metabolomics multi-analyte consensus across ${additionalPmis.length} marker(s) yielding est. ${weightedPmi.toFixed(1)}h window.`;

  if (uremicCorrectionApplied && vun !== undefined) {
    notes += ` [VUN Uremic Correction]: VUN=${vun} mg/dL indicates antemortem azotemia; baseline [K⁺] corrected to prevent false overestimation.`;
    status = "conflict_flagged";
    confidence = Math.min(confidence, 55);
  }

  if (dehydrationConcentrationApplied && na !== undefined) {
    notes += ` [Na⁺ Correction]: [Na⁺]=${na} mmol/L indicates hypertonic dehydration; [K⁺] adjusted for solute concentration.`;
  }

  // Antemortem renal disease or ocular hemorrhage caveat
  if (metab.suspectedRenalFailureOrTrauma) {
    confidence = Math.min(confidence, 40);
    status = "conflict_flagged";
    notes += " Warning: Antemortem renal failure or ocular trauma suspected. Intracellular potassium release may reflect pre-existing uremia rather than post-mortem autolysis.";
  }

  return {
    minHours: minH,
    maxHours: maxH,
    optimalHours: Number(weightedPmi.toFixed(1)),
    confidence,
    status,
    notes,
    effectivePotassiumMmolL: Number(k.toFixed(2)),
    rawPotassiumMmolL: metab.vitreousPotassiumMmolL,
    kExcessSubtracted: kExcess,
    dehydrationRatio: hypernatremicRatio,
    naPmiEstimate,
    pmiMadea: Number(pmiMadea.toFixed(1)),
    pmiSturner: Number(pmiSturner.toFixed(1)),
  };
}

/**
 * Cross-indicator inconsistency & conflict detection engine
 */
export function detectInconsistencies(
  meta: CaseMetadata,
  algor: AlgorMortisData,
  livor: LivorMortisData,
  rigor: RigorMortisData,
  decomp: DecompositionData,
  entomology: EntomologyData,
  metabolomics: MetabolomicsData,
  evals: Record<string, { minHours: number; maxHours: number; optimalHours: number }>
): InconsistencyAlert[] {
  const alerts: InconsistencyAlert[] = [];

  // 1. Post-mortem body movement / repositioning conflict (Livor distribution vs Found position)
  if (livor.enabled) {
    const isSupine = meta.bodyFoundPosition === "supine";
    const isProne = meta.bodyFoundPosition === "prone";
    const isLivorAnterior = livor.distributionPattern === "anterior";
    const isLivorPosterior = livor.distributionPattern === "posterior";

    if ((isSupine && isLivorAnterior) || (isProne && isLivorPosterior) || livor.distributionPattern === "dual_discordant" || livor.suspectedBodyMovement) {
      alerts.push({
        id: "alert-relocation-1",
        severity: "critical",
        title: "Discrepant Livor Mortis Distribution (Post-Mortem Body Relocation)",
        description: `Body was discovered in '${meta.bodyFoundPosition.toUpperCase()}' position, but hypostasis lividity is fixed in '${livor.distributionPattern.toUpperCase()}' regions.`,
        indicatorA: "Body Found Position",
        indicatorB: "Livor Mortis Distribution",
        forensicImplication: "The body was positioned face-down/elsewhere for at least 6-12 hours allowing lividity to fix before being moved into the position found.",
      });
    }

    if (livor.colorHue === "cherry_red") {
      alerts.push({
        id: "alert-color-co-hypothermia",
        severity: "warning",
        title: "Cherry-Red Lividity Atypical Tint",
        description: "Lividity exhibits distinct bright pink/cherry-red hue rather than standard violaceous-purple.",
        indicatorA: "Livor Color Hue",
        indicatorB: "Toxicology / Ambient Temp",
        forensicImplication: "Strongly indicates Carbon Monoxide (COHb) poisoning, Cyanide toxicity, or prolonged exposure to extreme hypothermic cold.",
      });
    }
  }

  // 2. Early Algor vs Advanced Entomology/Decomposition conflict
  if (algor.enabled && (entomology.enabled || decomp.enabled)) {
    const algorOpt = evals.algor?.optimalHours || 0;
    const entOpt = evals.entomology?.optimalHours || 0;
    const decompOpt = evals.decomp?.optimalHours || 0;

    if (algorOpt < 10 && entOpt > 48) {
      alerts.push({
        id: "alert-algor-entomology-conflict",
        severity: "critical",
        title: "Severe Algor Mortis vs. Insect Stage Discrepancy",
        description: `Core body temperature indicates early death (${algorOpt}h), but established larval colonization indicates ${entOpt}h (${evals.entomology?.optimalHours}h).`,
        indicatorA: "Body Temperature (Algor)",
        indicatorB: "Entomological Instar",
        forensicImplication: "Potential artificial scene heating, delayed cooling in high thermal mass, or pre-mortem larval infestation (myiasis).",
      });
    }

    if (algorOpt < 12 && decompOpt > 72) {
      alerts.push({
        id: "alert-algor-decomp-conflict",
        severity: "critical",
        title: "Algor Mortis vs. Decomposition Score Discrepancy",
        description: `Rectal temperature suggests PMI under 12h, but morphological Total Body Score (${decomp.headNeckScore + decomp.trunkScore + decomp.limbsScore}) indicates advanced decomposition (>3 days).`,
        indicatorA: "Body Temperature (Algor)",
        indicatorB: "Decomposition Total Body Score",
        forensicImplication: "Strong anomaly: investigate recent post-mortem temperature inversion, artificial warming, or inaccurate thermometer reading.",
      });
    }
  }

  // 3. Rigor resolution vs Early Livor / Temperature
  if (rigor.enabled && algor.enabled) {
    const algorOpt = evals.algor?.optimalHours || 0;
    if (rigor.progressionStage === "absent_late" && algorOpt < 12 && !rigor.coldStiffeningSuspected) {
      alerts.push({
        id: "alert-rigor-algor-conflict",
        severity: "warning",
        title: "Passed Rigor with Warm Core Temperature",
        description: "Rigor mortis is reported as passed/absent late, yet body temperature remains well above ambient.",
        indicatorA: "Rigor Progression",
        indicatorB: "Algor Mortis",
        forensicImplication: "Verify whether flaccidity is primary (early) rather than secondary (passed), or check for rigor disruption by physical manipulation.",
      });
    }
  }

  // 4. Vitreous Potassium outlier check
  if (metabolomics.enabled && algor.enabled) {
    const k = metabolomics.vitreousPotassiumMmolL;
    const algorOpt = evals.algor?.optimalHours || 0;
    if (k > 16.0 && algorOpt < 6) {
      alerts.push({
        id: "alert-metabolomics-outlier",
        severity: "warning",
        title: "Elevated Vitreous Potassium vs. Fresh Algor Plateau",
        description: `Vitreous [K+] is ${k} mmol/L (suggests >40h), but body temperature indicates recent death (<6h).`,
        indicatorA: "Vitreous Potassium",
        indicatorB: "Algor Mortis",
        forensicImplication: "May indicate pre-mortem hyperkalemia, acute renal failure, traumatic ocular hemorrhage, or retinal tissue contamination during aspirate.",
      });
    }
  }

  // 5. Suspected antemortem renal failure or ocular trauma alert
  if (metabolomics.enabled && metabolomics.suspectedRenalFailureOrTrauma) {
    alerts.push({
      id: "alert-metabolomics-renal-trauma",
      severity: "warning",
      title: "Vitreous Potassium Affected by Antemortem Renal Failure or Trauma",
      description: "Antemortem renal failure or ocular trauma is suspected. Potassium levels may be elevated due to systemic uremia or local hemorrhage rather than normal post-mortem retinal autolysis.",
      indicatorA: "Metabolomics ([K+])",
      indicatorB: "Clinical Pathological History",
      forensicImplication: "Vitreous potassium should be interpreted with caution and down-weighted in the final composite PMI calculation.",
    });
  }

  // 5b. Vitreous Urea Nitrogen (VUN) elevation alert
  const vunItem = metabolomics.selectedMetabolites?.find((m) => m.metaboliteKey === "urea_nitrogen");
  const vun = vunItem ? vunItem.measuredValue : metabolomics.ureaNitrogenMgDl;
  if (metabolomics.enabled && vun !== undefined && vun > 40) {
    alerts.push({
      id: "alert-metabolomics-vun-elevation",
      severity: "warning",
      title: "Elevated Vitreous Urea Nitrogen (VUN) — Antemortem Azotemia / Uremia",
      description: `Vitreous Urea Nitrogen is elevated at ${vun} mg/dL (normal: 10–25 mg/dL), indicating antemortem renal failure or acute uremic state.`,
      indicatorA: "Vitreous Urea Nitrogen (VUN)",
      indicatorB: "Vitreous Potassium ([K⁺])",
      forensicImplication: "Antemortem hyperkalemia is present. Uncorrected [K⁺] formulas will grossly overestimate PMI (by 10–25+ hours). Baseline potassium offset correction applied.",
    });
  }

  // 5c. Vitreous Sodium ([Na⁺]) electrolyte derangement alert
  const naItem = metabolomics.selectedMetabolites?.find((m) => m.metaboliteKey === "vitreous_sodium");
  const na = naItem ? naItem.measuredValue : metabolomics.vitreousSodiumMmolL;
  if (metabolomics.enabled && na !== undefined) {
    if (na > 152) {
      alerts.push({
        id: "alert-metabolomics-hypernatremia",
        severity: "warning",
        title: "Vitreous Hypernatremia — Severe Dehydration / Hemoconcentration",
        description: `Vitreous sodium is elevated at ${na} mmol/L (normal: 135–150 mmol/L), indicating profound antemortem hypertonic dehydration.`,
        indicatorA: "Vitreous Sodium ([Na⁺])",
        indicatorB: "Vitreous Potassium ([K⁺])",
        forensicImplication: "Osmotic fluid contraction concentrates all vitreous electrolytes. Unadjusted [K⁺] overestimates time of death; normalization applied.",
      });
    } else if (na < 125) {
      alerts.push({
        id: "alert-metabolomics-hyponatremia",
        severity: "warning",
        title: "Vitreous Hyponatremia — Hemodilution / Water Intoxication",
        description: `Vitreous sodium is markedly depleted at ${na} mmol/L (normal: 135–150 mmol/L).`,
        indicatorA: "Vitreous Sodium ([Na⁺])",
        indicatorB: "Scene Environment / Immersion",
        forensicImplication: "May indicate antemortem hypotonic dilution, freshwater immersion, or SIADH, which dilutes vitreous [K⁺].",
      });
    }
  }

  // 6. Cold stiffening / freezing advisory
  if (rigor.enabled && rigor.coldStiffeningSuspected) {
    alerts.push({
      id: "alert-cold-stiffening",
      severity: "warning",
      title: "Cold Stiffening / Freezing Suspected (<4°C)",
      description: "Freezing of intra- and extracellular water in muscle tissue physically mimics rigor mortis.",
      indicatorA: "Rigor Mortis",
      indicatorB: "Environmental Exposure",
      forensicImplication: "Rigor mortis staging cannot be reliably determined until the remains have thawed under controlled conditions.",
    });
  }

  return alerts;
}

/**
 * Multi-indicator weighted synthesis and factor importance calculation
 */
export function calculateCompositePmi(
  caseInputOrMeta: ForensicCaseInput | CaseMetadata,
  argAlgor?: AlgorMortisData,
  argLivor?: LivorMortisData,
  argRigor?: RigorMortisData,
  argDecomp?: DecompositionData,
  argEntomology?: EntomologyData,
  argMetabolomics?: MetabolomicsData
): PmiCalculationResult {
  let metadata: CaseMetadata;
  let algor: AlgorMortisData;
  let livor: LivorMortisData;
  let rigor: RigorMortisData;
  let decomp: DecompositionData;
  let entomology: EntomologyData;
  let metabolomics: MetabolomicsData;

  if ("caseId" in caseInputOrMeta) {
    const c = caseInputOrMeta as ForensicCaseInput;
    metadata = {
      caseNumber: c.caseId,
      examinerName: c.investigatorName,
      jurisdiction: "Metropolitan Jurisdiction",
      discoveryDateTime: c.discoveryTimestamp,
      lastSeenAliveDateTime: c.discoveryTimestamp,
      sceneLocation: c.locationDescription,
      environmentType: "indoor_residential",
      ambientTempC: c.ambientTempC,
      relativeHumidityPercent: c.relativeHumidityPercent ?? 50,
      bodyFoundPosition: c.bodyFoundPosition,
      bodyWeightKg: c.bodyWeightKg,
      notes: "",
    };
    algor = c.algorMortis;
    livor = c.livorMortis;
    rigor = c.rigorMortis;
    decomp = c.decomposition;
    entomology = c.entomology;
    metabolomics = c.metabolomics;
  } else {
    metadata = caseInputOrMeta as CaseMetadata;
    algor = argAlgor!;
    livor = argLivor!;
    rigor = argRigor!;
    decomp = argDecomp!;
    entomology = argEntomology!;
    metabolomics = argMetabolomics!;
  }

  // Individual evaluations
  const algorEval = algor.enabled ? calculateHenssgeAlgorMortis(algor.rectalTempC, algor.ambientTempC, algor.bodyWeightKg, algor.clothingCoveringFactor) : null;
  const livorEval = livor.enabled ? evaluateLivorMortis(livor) : null;
  const rigorEval = rigor.enabled ? evaluateRigorMortis(rigor) : null;
  const decompEval = decomp.enabled ? evaluateDecomposition(decomp) : null;
  const entomologyEval = entomology.enabled ? evaluateEntomology(entomology, metadata.ambientTempC) : null;
  const metabolomicsEval = metabolomics.enabled ? evaluateMetabolomics(metabolomics) : null;

  const evalsMap: Record<string, { minHours: number; maxHours: number; optimalHours: number }> = {};
  if (algorEval) {
    evalsMap.algor = {
      minHours: algorEval.minHours,
      maxHours: algorEval.maxHours,
      optimalHours: algorEval.pmiHours,
    };
  }
  if (livorEval) evalsMap.livor = livorEval;
  if (rigorEval) evalsMap.rigor = rigorEval;
  if (decompEval) evalsMap.decomp = decompEval;
  if (entomologyEval) evalsMap.entomology = entomologyEval;
  if (metabolomicsEval) evalsMap.metabolomics = metabolomicsEval;


  const inconsistencyAlerts = detectInconsistencies(
    metadata,
    algor,
    livor,
    rigor,
    decomp,
    entomology,
    metabolomics,
    evalsMap
  );

  // Dynamic indicator weighting based on physiological reliable window
  interface WeightedIndicator {
    name: string;
    category: "Algor" | "Livor" | "Rigor" | "Decomposition" | "Entomology" | "Metabolomics" | "Vision";
    min: number;
    max: number;
    optimal: number;
    weight: number;
    confidence: number;
    windowStr: string;
    status: "optimal_window" | "moderate_utility" | "outside_reliable_window" | "conflict_flagged";
    notes: string;
  }

  const indicators: WeightedIndicator[] = [];

  // Algor mortis weighting (highest in 0-20h)
  if (algorEval && algor.enabled) {
    let w = 1.0;
    if (algorEval.pmiHours <= 14) w = 3.5;
    else if (algorEval.pmiHours <= 22) w = 2.2;
    else w = 0.8;

    indicators.push({
      name: "Algor Mortis (Henssge Nomogram)",
      category: "Algor",
      min: algorEval.minHours,
      max: algorEval.maxHours,
      optimal: algorEval.pmiHours,
      weight: w,
      confidence: algorEval.confidence,
      windowStr: "0 - 24 hours",
      status: algorEval.status === "valid" ? "optimal_window" : "moderate_utility",
      notes: algorEval.notes,
    });
  }

  // Livor mortis weighting (high in 1-14h)
  if (livorEval && livor.enabled) {
    let w = 1.2;
    if (livor.blanchability === "fully_blanchable" || livor.blanchability === "partially_blanchable") {
      w = 2.5;
    }
    indicators.push({
      name: "Livor Mortis (Fixation & Blanching)",
      category: "Livor",
      min: livorEval.minHours,
      max: livorEval.maxHours,
      optimal: livorEval.optimalHours,
      weight: w,
      confidence: livorEval.confidence,
      windowStr: "30 min - 14 hours",
      status: livorEval.status,
      notes: livorEval.notes,
    });
  }

  // Rigor mortis weighting (high in 2-36h)
  if (rigorEval && rigor.enabled) {
    let w = 2.0;
    if (rigor.progressionStage === "complete_generalized") w = 2.4;
    indicators.push({
      name: "Rigor Mortis (Nysten Progression)",
      category: "Rigor",
      min: rigorEval.minHours,
      max: rigorEval.maxHours,
      optimal: rigorEval.optimalHours,
      weight: w,
      confidence: rigorEval.confidence,
      windowStr: "1 - 36 hours",
      status: rigorEval.status,
      notes: rigorEval.notes,
    });
  }

  // Decomposition weighting (low <24h, high >36h)
  if (decompEval && decomp.enabled) {
    const tbs = decomp.headNeckScore + decomp.trunkScore + decomp.limbsScore;
    let w = 1.0;
    if (tbs <= 4) {
      // In fresh stage (TBS 3-4), early markers (Algor, Livor, Rigor) dominate
      w = 0.4;
    } else if (tbs > 18) {
      w = 4.0;
    } else if (tbs > 8) {
      w = 3.2;
    }
    indicators.push({
      name: "Decomposition (Megyesi TBS / ADD)",
      category: "Decomposition",
      min: decompEval.minHours,
      max: decompEval.maxHours,
      optimal: decompEval.optimalHours,
      weight: w,
      confidence: decompEval.confidence,
      windowStr: "24 hours - months",
      status: decompEval.status,
      notes: decompEval.notes,
    });
  }

  // Entomology weighting (highest >48h)
  if (entomologyEval && entomology.enabled) {
    let w = 1.2;
    if (entomology.developmentalStage !== "none") {
      w = 3.8;
    }
    indicators.push({
      name: "Forensic Entomology (Instar & ADH)",
      category: "Entomology",
      min: entomologyEval.minHours,
      max: entomologyEval.maxHours,
      optimal: entomologyEval.optimalHours,
      weight: w,
      confidence: entomologyEval.confidence,
      windowStr: "Days - months",
      status: entomologyEval.status,
      notes: entomologyEval.notes,
    });
  }

  // Metabolomics weighting
  if (metabolomicsEval && metabolomics.enabled) {
    indicators.push({
      name: "Vitreous Metabolomics ([K+] Madea/Sturner)",
      category: "Metabolomics",
      min: metabolomicsEval.minHours,
      max: metabolomicsEval.maxHours,
      optimal: metabolomicsEval.optimalHours,
      weight: 1.8,
      confidence: metabolomicsEval.confidence,
      windowStr: "2 - 48 hours",
      status: metabolomicsEval.status,
      notes: metabolomicsEval.notes,
    });
  }

  // Fallback if no indicators selected
  if (indicators.length === 0) {
    return {
      estimatedPmiMinHours: 0,
      estimatedPmiMaxHours: 0,
      estimatedPmiOptimalHours: 0,
      estimatedTimeOfDeathMin: "No indicators enabled",
      estimatedTimeOfDeathMax: "No indicators enabled",
      estimatedTimeOfDeathOptimal: "No indicators enabled",
      confidenceScore: 0,
      confidenceTier: "Low / Discrepant",
      inconsistenciesDetected: false,
      inconsistencyAlerts: [],
      dominantIndicatorSummary: ["No forensic indicators enabled (select modules above or load preset)"],
      indicatorEvaluations: [],
      factorAttributions: [],
      coolingCurveData: [],
      probabilityDistribution: [],
      calculatedAt: new Date().toISOString(),
    };
  }

  // Calculate weighted composite
  const totalWeight = indicators.reduce((sum, ind) => sum + ind.weight, 0);
  const weightedOptimal = indicators.reduce((sum, ind) => sum + ind.optimal * ind.weight, 0) / totalWeight;
  const weightedMin = indicators.reduce((sum, ind) => sum + ind.min * ind.weight, 0) / totalWeight;
  const weightedMax = indicators.reduce((sum, ind) => sum + ind.max * ind.weight, 0) / totalWeight;

  // Average confidence penalized by conflicts
  const baseConfidence = indicators.reduce((sum, ind) => sum + ind.confidence * ind.weight, 0) / totalWeight;
  const criticalConflictCount = inconsistencyAlerts.filter((a) => a.severity === "critical").length;
  const warningConflictCount = inconsistencyAlerts.filter((a) => a.severity === "warning").length;
  const penalty = criticalConflictCount * 30 + warningConflictCount * 12;
  const finalConfidence = Math.max(15, Math.min(96, Math.round(baseConfidence - penalty)));

  let confidenceTier: PmiCalculationResult["confidenceTier"] = "High Confidence";
  if (criticalConflictCount > 0) confidenceTier = "Critical Inconsistency";
  else if (finalConfidence < 50) confidenceTier = "Low / Discrepant";
  else if (finalConfidence < 75) confidenceTier = "Moderate Confidence";

  // Calculate Time of Death timestamps from discoveryDateTime
  const discoveryDate = metadata.discoveryDateTime ? new Date(metadata.discoveryDateTime) : new Date();
  const validDiscovery = !isNaN(discoveryDate.getTime()) ? discoveryDate : new Date();

  const todMinDate = new Date(validDiscovery.getTime() - weightedMax * 3600 * 1000);
  const todMaxDate = new Date(validDiscovery.getTime() - weightedMin * 3600 * 1000);
  const todOptimalDate = new Date(validDiscovery.getTime() - weightedOptimal * 3600 * 1000);

  const formatTod = (d: Date) => {
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Build IndicatorEvaluation list
  const indicatorEvaluations: IndicatorEvaluation[] = indicators.map((ind) => ({
    name: ind.name,
    category: ind.category,
    enabled: true,
    estimatedPmiMinHours: Number(ind.min.toFixed(1)),
    estimatedPmiMaxHours: Number(ind.max.toFixed(1)),
    estimatedPmiOptimalHours: Number(ind.optimal.toFixed(1)),
    confidencePercent: ind.confidence,
    physiologicReliabilityWindow: ind.windowStr,
    status: ind.status,
    diagnosticNotes: ind.notes,
    weightInFinalCalculation: Math.round((ind.weight / totalWeight) * 100),
  }));

  // Build multi-factor directional attributions
  const factorAttributions: FactorAttribution[] = indicators.map((ind) => {
    const diff = ind.optimal - weightedOptimal;
    const pullMagnitudeHours = Number(Math.abs(diff).toFixed(1));
    const relativeImportancePercent = Math.round((ind.weight / totalWeight) * 100);

    let impactDirection: FactorAttribution["impactDirection"] = "anchors_estimate";
    if (diff > 0.8) impactDirection = "increases_pmi";
    else if (diff < -0.8) impactDirection = "decreases_pmi";

    return {
      factorName: ind.name,
      impactDirection,
      pullMagnitudeHours,
      relativeImportancePercent,
      explanation: `${ind.name} (optimal ~${ind.optimal.toFixed(1)}h) ${
        impactDirection === "increases_pmi"
          ? "exerts upward pull on estimated interval."
          : impactDirection === "decreases_pmi"
          ? "constrains the interval towards earlier post-mortem window."
          : "closely aligns with composite median anchor."
      }`,
    };
  });

  // Dominant indicators (top weighted)
  const dominantIndicatorSummary = [...indicators]
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 3)
    .map((ind) => `${ind.name} (${Math.round((ind.weight / totalWeight) * 100)}% weight)`);

  // Generate Gaussian-like probability distribution points for visualization
  const probSpan = Math.max(6, weightedMax - weightedMin);
  const probStart = Math.max(0, weightedMin - probSpan * 0.3);
  const probEnd = weightedMax + probSpan * 0.3;
  const step = Math.max(0.5, (probEnd - probStart) / 25);
  const sigma = Math.max(1.2, (weightedMax - weightedMin) / 4);

  const probabilityDistribution: Array<{ pmiHours: number; probability: number }> = [];
  for (let h = probStart; h <= probEnd; h += step) {
    const exponent = -0.5 * Math.pow((h - weightedOptimal) / sigma, 2);
    const prob = Math.round(100 * Math.exp(exponent));
    probabilityDistribution.push({
      pmiHours: Number(h.toFixed(1)),
      probability: prob,
    });
  }

  return {
    estimatedPmiMinHours: Number(weightedMin.toFixed(1)),
    estimatedPmiMaxHours: Number(weightedMax.toFixed(1)),
    estimatedPmiOptimalHours: Number(weightedOptimal.toFixed(1)),
    estimatedTimeOfDeathMin: formatTod(todMinDate),
    estimatedTimeOfDeathMax: formatTod(todMaxDate),
    estimatedTimeOfDeathOptimal: formatTod(todOptimalDate),
    confidenceScore: finalConfidence,
    confidenceTier,
    inconsistenciesDetected: inconsistencyAlerts.length > 0,
    inconsistencyAlerts,
    dominantIndicatorSummary,
    indicatorEvaluations,
    factorAttributions,
    coolingCurveData: algorEval?.coolingCurve || [],
    probabilityDistribution,
    calculatedAt: new Date().toISOString(),
  };
}
