import { ForensicCaseInput } from "../types";
import { FORENSIC_PRESETS } from "../data/forensicPresets";

export interface PresetAuditResult {
  isPreset: boolean;
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
 * Audits a ForensicCaseInput against benchmark preset definitions to detect
 * whether the examiner has made any modifications to the loaded preset.
 */
export function auditPresetModifications(caseData: ForensicCaseInput): PresetAuditResult {
  if (!caseData) {
    return {
      isPreset: false,
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

  if (!isMarkedPreset && !matchedBaseline) {
    return {
      isPreset: false,
      isModified: false,
      modifiedCount: 0,
      modifiedFieldLabels: [],
      auditSummaryText: "Standard Investigator Case (Non-Preset)",
      shortStatusBadge: "User Case",
      statusColor: "slate",
    };
  }

  const baseline = matchedBaseline;
  if (!baseline) {
    return {
      isPreset: true,
      presetId: caseData.presetId,
      presetName: caseData.presetName || "Benchmark Preset",
      presetCategory: caseData.presetCategory || "Preset Case",
      isModified: true,
      modifiedCount: 1,
      modifiedFieldLabels: ["Custom Modifications Applied"],
      auditSummaryText: "Preset Benchmark with examiner adjustments.",
      shortStatusBadge: "Preset (Modified by Examiner)",
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
      diffs.push(`Livor Color (${baseline.livorMortis.colorHue} → ${caseData.livorMortis.colorHue})`);
    }
    if (caseData.livorMortis.distributionPattern !== baseline.livorMortis.distributionPattern) {
      diffs.push(`Livor Distribution (${baseline.livorMortis.distributionPattern.replace(/_/g, " ")} → ${caseData.livorMortis.distributionPattern.replace(/_/g, " ")})`);
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
    if (caseData.decomposition.marblingPresent !== baseline.decomposition.marblingPresent) {
      diffs.push(`Marbling (${baseline.decomposition.marblingPresent ? "Yes" : "No"} → ${caseData.decomposition.marblingPresent ? "Yes" : "No"})`);
    }
    if (caseData.decomposition.bloatingAndPurge !== baseline.decomposition.bloatingAndPurge) {
      diffs.push(`Bloating/Purge (${baseline.decomposition.bloatingAndPurge ? "Yes" : "No"} → ${caseData.decomposition.bloatingAndPurge ? "Yes" : "No"})`);
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
  }

  // Metabolomics
  if (caseData.metabolomics.enabled !== baseline.metabolomics.enabled) {
    diffs.push(`Metabolomics (${baseline.metabolomics.enabled ? "Active" : "Bypassed"} → ${caseData.metabolomics.enabled ? "Active" : "Bypassed"})`);
  } else if (caseData.metabolomics.enabled) {
    if (caseData.metabolomics.vitreousPotassiumMmolL !== baseline.metabolomics.vitreousPotassiumMmolL) {
      diffs.push(`Vitreous [K+] (${baseline.metabolomics.vitreousPotassiumMmolL} → ${caseData.metabolomics.vitreousPotassiumMmolL} mmol/L)`);
    }
  }

  const isModified = diffs.length > 0;

  return {
    isPreset: true,
    presetId: baseline.presetId || caseData.presetId,
    presetName: baseline.presetName || caseData.presetName,
    presetCategory: baseline.presetCategory || caseData.presetCategory,
    baseline,
    isModified,
    modifiedCount: diffs.length,
    modifiedFieldLabels: diffs,
    auditSummaryText: isModified
      ? `Modified by Examiner: ${diffs.length} parameter(s) adjusted from benchmark baseline (${diffs.slice(0, 3).join("; ")}${diffs.length > 3 ? ` +${diffs.length - 3} more` : ""}).`
      : "Unaltered Benchmark Baseline: All forensic parameters match the original standardized case preset.",
    shortStatusBadge: isModified ? `Preset (Modified by Examiner - ${diffs.length} Δ)` : "Preset (Original Baseline)",
    statusColor: isModified ? "amber" : "emerald",
  };
}

export function getBaselineCase(caseData: ForensicCaseInput): ForensicCaseInput | null {
  if (!caseData) return null;
  return FORENSIC_PRESETS.find(
    (p) => (caseData.presetId && p.presetId === caseData.presetId) ||
           (caseData.caseId && p.caseId === caseData.caseId) ||
           (caseData.presetName && p.presetName === caseData.presetName)
  ) || null;
}
