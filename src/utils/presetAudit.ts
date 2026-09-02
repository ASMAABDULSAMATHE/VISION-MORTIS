import { ForensicCaseInput } from "../types";
import { FORENSIC_PRESETS } from "../data/forensicPresets";

export interface PresetAuditResult {
  isPreset: boolean;
  isSceneBaseline?: boolean;
  presetId?: string;
  presetName?: string;
  presetCategory?: string;
  baseline?: ForensicCaseInput | null;
  isModified: boolean;
  modifiedCount: number;
  modifiedFieldLabels: string[];
  auditSummaryText: string;
  shortStatusBadge: string;
  statusColor: "emerald" | "amber" | "slate";
}

/**
 * Audits a ForensicCaseInput against benchmark preset definitions or initial scene intake baseline
 * to detect whether the examiner has made any modifications to the recorded findings.
 */
export function auditPresetModifications(caseData: ForensicCaseInput): PresetAuditResult {
  if (!caseData) {
    return {
      isPreset: false,
      isSceneBaseline: false,
      isModified: false,
      modifiedCount: 0,
      modifiedFieldLabels: [],
      auditSummaryText: "Standard User Case",
      shortStatusBadge: "Custom Case",
      statusColor: "slate",
    };
  }

  // Check if case is identified as a preset
  const isMarkedPreset = !!(caseData.isPresetCase || caseData.presetId || caseData.presetName);
  const matchedBaseline = FORENSIC_PRESETS.find(
    (p) => (caseData.presetId && p.presetId === caseData.presetId) || (caseData.caseId && p.caseId === caseData.caseId) || (caseData.presetName && p.presetName === caseData.presetName)
  );

  const baseline = matchedBaseline || caseData.sceneBaseline;

  if (!isMarkedPreset && !matchedBaseline && !caseData.sceneBaseline) {
    return {
      isPreset: false,
      isSceneBaseline: false,
      isModified: false,
      modifiedCount: 0,
      modifiedFieldLabels: [],
      auditSummaryText: "Standard Investigator Case (Non-Preset)",
      shortStatusBadge: "User Case",
      statusColor: "slate",
    };
  }

  const isPresetCase = isMarkedPreset || !!matchedBaseline;

  if (!baseline) {
    return {
      isPreset: isPresetCase,
      isSceneBaseline: !isPresetCase && !!caseData.sceneBaseline,
      presetId: caseData.presetId,
      presetName: caseData.presetName || (isPresetCase ? "Benchmark Preset" : "Scene Intake Baseline"),
      presetCategory: caseData.presetCategory || (isPresetCase ? "Preset Case" : "Scene Baseline"),
      isModified: true,
      modifiedCount: 1,
      modifiedFieldLabels: ["Custom Modifications Applied"],
      auditSummaryText: isPresetCase ? "Preset Benchmark with examiner adjustments." : "Scene intake with examiner adjustments.",
      shortStatusBadge: isPresetCase ? "Preset (Modified by Examiner)" : "Scene Baseline (Modified)",
      statusColor: "amber",
    };
  }

  const diffs: string[] = [];

  // Demographics & Scene Baseline
  if (caseData.ambientTempC !== baseline.ambientTempC) {
    diffs.push(`Ambient Temp (${baseline.ambientTempC}°C → ${caseData.ambientTempC}°C)`);
  }
  const baseHumidity = baseline.relativeHumidityPercent ?? 50;
  const currentHumidity = caseData.relativeHumidityPercent ?? 50;
  if (currentHumidity !== baseHumidity) {
    diffs.push(`Relative Humidity (${baseHumidity}% → ${currentHumidity}%)`);
  }
  if (caseData.bodyWeightKg !== baseline.bodyWeightKg) {
    diffs.push(`Body Weight (${baseline.bodyWeightKg}kg → ${caseData.bodyWeightKg}kg)`);
  }
  if (caseData.bodyFoundPosition !== baseline.bodyFoundPosition) {
    diffs.push(`Body Posture (${baseline.bodyFoundPosition} → ${caseData.bodyFoundPosition})`);
  }
  if (caseData.sex !== baseline.sex) {
    diffs.push(`Sex (${baseline.sex} → ${caseData.sex})`);
  }
  if (caseData.ageYears !== baseline.ageYears && (caseData.ageYears || baseline.ageYears)) {
    diffs.push(`Age (${baseline.ageYears ?? "N/A"} → ${caseData.ageYears ?? "N/A"})`);
  }
  if (caseData.locationDescription && baseline.locationDescription && caseData.locationDescription !== baseline.locationDescription) {
    diffs.push("Scene Location");
  }
  if (caseData.examinersNotes && baseline.examinersNotes && caseData.examinersNotes.trim() !== baseline.examinersNotes.trim()) {
    diffs.push("Examiner Notes");
  }

  // Algor Mortis
  if (caseData.algorMortis.enabled !== baseline.algorMortis.enabled) {
    diffs.push(`Algor Mortis (${baseline.algorMortis.enabled ? "Active" : "Bypassed"} → ${caseData.algorMortis.enabled ? "Active" : "Bypassed"})`);
  } else if (caseData.algorMortis.enabled) {
    if (caseData.algorMortis.rectalTempC !== baseline.algorMortis.rectalTempC) {
      diffs.push(`Rectal Core Temp (${baseline.algorMortis.rectalTempC}°C → ${caseData.algorMortis.rectalTempC}°C)`);
    }
    if (caseData.algorMortis.clothingCoveringFactor !== baseline.algorMortis.clothingCoveringFactor) {
      diffs.push(`Clothing Factor (${baseline.algorMortis.clothingCoveringFactor} → ${caseData.algorMortis.clothingCoveringFactor})`);
    }
    if (caseData.algorMortis.clothingDescription && baseline.algorMortis.clothingDescription && caseData.algorMortis.clothingDescription !== baseline.algorMortis.clothingDescription) {
      diffs.push(`Clothing (${baseline.algorMortis.clothingDescription} → ${caseData.algorMortis.clothingDescription})`);
    }
    if (caseData.algorMortis.isBodyWet !== baseline.algorMortis.isBodyWet) {
      diffs.push(`Body Wet (${baseline.algorMortis.isBodyWet ? "Yes" : "No"} → ${caseData.algorMortis.isBodyWet ? "Yes" : "No"})`);
    }
    if (caseData.algorMortis.airCurrentVelocity !== baseline.algorMortis.airCurrentVelocity) {
      diffs.push(`Air Velocity (${baseline.algorMortis.airCurrentVelocity} → ${caseData.algorMortis.airCurrentVelocity})`);
    }
  }

  // Livor Mortis
  if (caseData.livorMortis.enabled !== baseline.livorMortis.enabled) {
    diffs.push(`Livor Mortis (${baseline.livorMortis.enabled ? "Active" : "Bypassed"} → ${caseData.livorMortis.enabled ? "Active" : "Bypassed"})`);
  } else if (caseData.livorMortis.enabled) {
    if (caseData.livorMortis.blanchability !== baseline.livorMortis.blanchability) {
      diffs.push(`Livor Blanchability (${baseline.livorMortis.blanchability.replace(/_/g, " ")} → ${caseData.livorMortis.blanchability.replace(/_/g, " ")})`);
    }
    if (caseData.livorMortis.colorHue !== baseline.livorMortis.colorHue) {
      diffs.push(`Livor Color (${baseline.livorMortis.colorHue.replace(/_/g, " ")} → ${caseData.livorMortis.colorHue.replace(/_/g, " ")})`);
    }
    if (caseData.livorMortis.distributionPattern !== baseline.livorMortis.distributionPattern) {
      diffs.push(`Livor Distribution (${baseline.livorMortis.distributionPattern.replace(/_/g, " ")} → ${caseData.livorMortis.distributionPattern.replace(/_/g, " ")})`);
    }
    if (caseData.livorMortis.lividityPositionFound !== baseline.livorMortis.lividityPositionFound) {
      diffs.push(`Lividity Posture (${baseline.livorMortis.lividityPositionFound} → ${caseData.livorMortis.lividityPositionFound})`);
    }
    if (caseData.livorMortis.suspectedBodyMovement !== baseline.livorMortis.suspectedBodyMovement) {
      diffs.push(`Livor Movement Flag (${baseline.livorMortis.suspectedBodyMovement ? "Yes" : "No"} → ${caseData.livorMortis.suspectedBodyMovement ? "Yes" : "No"})`);
    }
  }

  // Rigor Mortis
  if (caseData.rigorMortis.enabled !== baseline.rigorMortis.enabled) {
    diffs.push(`Rigor Mortis (${baseline.rigorMortis.enabled ? "Active" : "Bypassed"} → ${caseData.rigorMortis.enabled ? "Active" : "Bypassed"})`);
  } else if (caseData.rigorMortis.enabled) {
    if (caseData.rigorMortis.progressionStage !== baseline.rigorMortis.progressionStage) {
      diffs.push(`Rigor Progression (${baseline.rigorMortis.progressionStage.replace(/_/g, " ")} → ${caseData.rigorMortis.progressionStage.replace(/_/g, " ")})`);
    }
    if (caseData.rigorMortis.preDeathPhysicalExertion !== baseline.rigorMortis.preDeathPhysicalExertion) {
      diffs.push(`Pre-Death Exertion (${baseline.rigorMortis.preDeathPhysicalExertion.replace(/_/g, " ")} → ${caseData.rigorMortis.preDeathPhysicalExertion.replace(/_/g, " ")})`);
    }
    if (caseData.rigorMortis.coldStiffeningSuspected !== baseline.rigorMortis.coldStiffeningSuspected) {
      diffs.push(`Cold Stiffening (${baseline.rigorMortis.coldStiffeningSuspected ? "Yes" : "No"} → ${caseData.rigorMortis.coldStiffeningSuspected ? "Yes" : "No"})`);
    }
  }

  // Decomposition
  if (caseData.decomposition.enabled !== baseline.decomposition.enabled) {
    diffs.push(`Decomposition (${baseline.decomposition.enabled ? "Active" : "Bypassed"} → ${caseData.decomposition.enabled ? "Active" : "Bypassed"})`);
  } else if (caseData.decomposition.enabled) {
    if (caseData.decomposition.totalBodyScore !== baseline.decomposition.totalBodyScore) {
      diffs.push(`Total Body Score (${baseline.decomposition.totalBodyScore} → ${caseData.decomposition.totalBodyScore})`);
    }
    if (caseData.decomposition.headNeckScore !== undefined && baseline.decomposition.headNeckScore !== undefined && caseData.decomposition.headNeckScore !== baseline.decomposition.headNeckScore) {
      diffs.push(`Head/Neck Score (${baseline.decomposition.headNeckScore} → ${caseData.decomposition.headNeckScore})`);
    }
    if (caseData.decomposition.trunkScore !== undefined && baseline.decomposition.trunkScore !== undefined && caseData.decomposition.trunkScore !== baseline.decomposition.trunkScore) {
      diffs.push(`Trunk Score (${baseline.decomposition.trunkScore} → ${caseData.decomposition.trunkScore})`);
    }
    if (caseData.decomposition.limbsScore !== undefined && baseline.decomposition.limbsScore !== undefined && caseData.decomposition.limbsScore !== baseline.decomposition.limbsScore) {
      diffs.push(`Limbs Score (${baseline.decomposition.limbsScore} → ${caseData.decomposition.limbsScore})`);
    }
    if (caseData.decomposition.marblingPresent !== baseline.decomposition.marblingPresent) {
      diffs.push(`Marbling (${baseline.decomposition.marblingPresent ? "Yes" : "No"} → ${caseData.decomposition.marblingPresent ? "Yes" : "No"})`);
    }
    if (caseData.decomposition.bloatingAndPurge !== baseline.decomposition.bloatingAndPurge) {
      diffs.push(`Bloating/Purge (${baseline.decomposition.bloatingAndPurge ? "Yes" : "No"} → ${caseData.decomposition.bloatingAndPurge ? "Yes" : "No"})`);
    }
    if (caseData.decomposition.skinSlippageBullae !== undefined && baseline.decomposition.skinSlippageBullae !== undefined && caseData.decomposition.skinSlippageBullae !== baseline.decomposition.skinSlippageBullae) {
      diffs.push(`Skin Slippage (${baseline.decomposition.skinSlippageBullae ? "Yes" : "No"} → ${caseData.decomposition.skinSlippageBullae ? "Yes" : "No"})`);
    }
    if (caseData.decomposition.mummificationOrAdipocere !== undefined && baseline.decomposition.mummificationOrAdipocere !== undefined && caseData.decomposition.mummificationOrAdipocere !== baseline.decomposition.mummificationOrAdipocere) {
      diffs.push(`Mummification/Adipocere (${baseline.decomposition.mummificationOrAdipocere ? "Yes" : "No"} → ${caseData.decomposition.mummificationOrAdipocere ? "Yes" : "No"})`);
    }
    if (caseData.decomposition.skeletonizationBoneExposed !== undefined && baseline.decomposition.skeletonizationBoneExposed !== undefined && caseData.decomposition.skeletonizationBoneExposed !== baseline.decomposition.skeletonizationBoneExposed) {
      diffs.push(`Skeletonization (${baseline.decomposition.skeletonizationBoneExposed ? "Yes" : "No"} → ${caseData.decomposition.skeletonizationBoneExposed ? "Yes" : "No"})`);
    }
    if (caseData.decomposition.effectiveMeanTempC !== undefined && baseline.decomposition.effectiveMeanTempC !== undefined && caseData.decomposition.effectiveMeanTempC !== baseline.decomposition.effectiveMeanTempC) {
      diffs.push(`Decomp Effective Temp (${baseline.decomposition.effectiveMeanTempC}°C → ${caseData.decomposition.effectiveMeanTempC}°C)`);
    }
  }

  // Entomology
  if (caseData.entomology.enabled !== baseline.entomology.enabled) {
    diffs.push(`Entomology (${baseline.entomology.enabled ? "Active" : "Bypassed"} → ${caseData.entomology.enabled ? "Active" : "Bypassed"})`);
  } else if (caseData.entomology.enabled) {
    if (caseData.entomology.developmentalStage !== baseline.entomology.developmentalStage) {
      diffs.push(`Insect Stage (${baseline.entomology.developmentalStage.replace(/_/g, " ")} → ${caseData.entomology.developmentalStage.replace(/_/g, " ")})`);
    }
    if (caseData.entomology.primaryInsectGroup !== baseline.entomology.primaryInsectGroup) {
      diffs.push(`Insect Taxon (${baseline.entomology.primaryInsectGroup.replace(/_/g, " ")} → ${caseData.entomology.primaryInsectGroup.replace(/_/g, " ")})`);
    }
    if (caseData.entomology.larvalLengthMm !== baseline.entomology.larvalLengthMm) {
      diffs.push(`Larval Length (${baseline.entomology.larvalLengthMm}mm → ${caseData.entomology.larvalLengthMm}mm)`);
    }
    if (caseData.entomology.maggotMassTempC !== baseline.entomology.maggotMassTempC) {
      diffs.push(`Maggot Mass Temp (${baseline.entomology.maggotMassTempC}°C → ${caseData.entomology.maggotMassTempC}°C)`);
    }
    if (caseData.entomology.indoorAccessDelayHours !== baseline.entomology.indoorAccessDelayHours) {
      diffs.push(`Access Delay (${baseline.entomology.indoorAccessDelayHours}h → ${caseData.entomology.indoorAccessDelayHours}h)`);
    }
  }

  // Metabolomics (11-Marker Panel)
  if (caseData.metabolomics.enabled !== baseline.metabolomics.enabled) {
    diffs.push(`Metabolomics (${baseline.metabolomics.enabled ? "Active" : "Bypassed"} → ${caseData.metabolomics.enabled ? "Active" : "Bypassed"})`);
  } else if (caseData.metabolomics.enabled) {
    // Check individual selected metabolites
    const baseMetabs = baseline.metabolomics.selectedMetabolites || [];
    const currMetabs = caseData.metabolomics.selectedMetabolites || [];

    // Check added or updated metabolites
    for (const curr of currMetabs) {
      const match = baseMetabs.find((b) => b.metaboliteKey === curr.metaboliteKey || b.id === curr.id);
      if (!match) {
        diffs.push(`Added ${curr.name} (${curr.measuredValue} ${curr.unit})`);
      } else if (match.measuredValue !== curr.measuredValue) {
        diffs.push(`${curr.name} (${match.measuredValue} → ${curr.measuredValue} ${curr.unit})`);
      }
    }

    // Check removed metabolites
    for (const baseItem of baseMetabs) {
      const existsInCurr = currMetabs.some((c) => c.metaboliteKey === baseItem.metaboliteKey || c.id === baseItem.id);
      if (!existsInCurr) {
        diffs.push(`Removed ${baseItem.name}`);
      }
    }
  }

  const isModified = diffs.length > 0;

  return {
    isPreset: isPresetCase,
    isSceneBaseline: !isPresetCase && !!caseData.sceneBaseline,
    presetId: baseline.presetId || caseData.presetId,
    presetName: isPresetCase ? (baseline.presetName || caseData.presetName) : "Initial Scene Intake",
    presetCategory: isPresetCase ? (baseline.presetCategory || caseData.presetCategory) : "Scene Observation Baseline",
    baseline,
    isModified,
    modifiedCount: diffs.length,
    modifiedFieldLabels: diffs,
    auditSummaryText: isModified
      ? (isPresetCase
          ? `Modified by Examiner: ${diffs.length} parameter(s) adjusted from benchmark baseline (${diffs.join("; ")}).`
          : `Modified from Scene Intake: ${diffs.length} parameter(s) adjusted since initial scene intake (${diffs.join("; ")}).`)
      : (isPresetCase
          ? "Unaltered Benchmark Baseline: All forensic parameters match the original standardized case preset."
          : "Unaltered Scene Baseline: All parameters match the initial scene observation record."),
    shortStatusBadge: isModified
      ? (isPresetCase ? `Preset (Modified - ${diffs.length} Δ)` : `Modified from Scene (${diffs.length} Δ)`)
      : (isPresetCase ? "Preset (Original Baseline)" : "Initial Scene Baseline"),
    statusColor: isModified ? "amber" : "emerald",
  };
}

export function getBaselineCase(caseData: ForensicCaseInput): ForensicCaseInput | null {
  if (!caseData) return null;
  const matched = FORENSIC_PRESETS.find(
    (p) => (caseData.presetId && p.presetId === caseData.presetId) ||
           (caseData.caseId && p.caseId === caseData.caseId) ||
           (caseData.presetName && p.presetName === caseData.presetName)
  );
  return matched || caseData.sceneBaseline || null;
}
