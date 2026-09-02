import React, { useState, useEffect, useMemo } from "react";
import { ForensicCaseInput, PmiCalculationResult, VisionDetectionData } from "../types";
import {
  Printer,
  Copy,
  Check,
  FileText,
  ShieldAlert,
  Download,
  FileCode,
  AlertTriangle,
  Calendar,
  Thermometer,
  Clock,
  Layers,
  Camera,
  Bug,
  Skull,
  Droplet,
  Activity,
  TestTube2,
  CheckCircle2,
  Lock,
  Sparkles,
  Eye,
  ArrowUp,
  Image as ImageIcon,
  ArrowLeft,
  Cpu,
  Zap,
  RefreshCw,
  Loader2,
  TrendingUp,
  BarChart3,
  LineChart,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  Stethoscope,
} from "lucide-react";
import { RecreatedLogo } from "./RecreatedLogo";
import { validateCaseId, generateCaseIntegrityHash, formatIndicatorTimestamp } from "../utils/validation";
import { auditPresetModifications } from "../utils/presetAudit";
import { printForensicCaseReport, downloadForensicHtmlReport } from "../utils/printReport";
import { runInBrowserXgbPrediction } from "../utils/inBrowserXgbModel";
import { PmiOutputPanel } from "./PmiOutputPanel";
import {
  downloadSvgAsPng,
  generateHenssgeCoolingSvg,
  generatePmiDistributionSvg,
  generateFactorAttributionSvg,
  downloadChartDataAsCsv,
  downloadAllVisualizationsBundle,
} from "../utils/chartExport";

interface Props {
  caseData: ForensicCaseInput;
  result: PmiCalculationResult;
  visionData?: VisionDetectionData;
  onScrollToSection?: (sectionId: string) => void;
  onBackToWorkspace?: (targetModule?: string) => void;
  onRunAiSynthesis?: () => void;
  isAiLoading?: boolean;
}

export const GeneratedReportSection: React.FC<Props> = ({
  caseData,
  result,
  visionData,
  onScrollToSection,
  onBackToWorkspace,
  onRunAiSynthesis,
  isAiLoading = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [showFullSynthesisPanel, setShowFullSynthesisPanel] = useState(true);

  // Automatically execute in-browser XGBoost 100-Tree regressor and TreeSHAP explainability (212 features)
  const { mlPredictionData, inBrowserExecTimeMs } = useMemo(() => {
    const startTime = performance.now();
    const pred = runInBrowserXgbPrediction(caseData);
    const endTime = performance.now();
    return {
      mlPredictionData: pred,
      inBrowserExecTimeMs: (endTime - startTime).toFixed(1),
    };
  }, [caseData]);

  // Automatically execute AI Pathologist Synthesis when navigating to the Reports page if not yet synthesized
  useEffect(() => {
    if (!result.aiSynthesis && onRunAiSynthesis && !isAiLoading) {
      onRunAiSynthesis();
    }
  }, []);

  const caseValidation = validateCaseId(caseData.caseId);
  const integrityHash = generateCaseIntegrityHash(
    caseData.caseId || "VM-CASE",
    caseData.discoveryTimestamp || new Date().toISOString(),
    result.estimatedPmiOptimalHours
  );

  const presetAudit = useMemo(() => auditPresetModifications(caseData), [caseData]);

  const imagesList = visionData?.images || [];
  const forensicPhotosList = imagesList.filter((img) => !img.isUnrelated);
  const examinerNotesText = (visionData?.examinerNotes || caseData.examinersNotes || caseData.notes || "").trim();
  const hasExaminerNotes = examinerNotesText.length > 0 && examinerNotesText.toLowerCase() !== "none";

  // Plain text generator for .TXT download and copy
  const generateReportPlainText = () => {
    return `
================================================================================
                    VISIONMORTIS FORENSIC CASE REPORT
             Standardized Multimodal Post-Mortem Interval Report
                        Developed by Protocol One
================================================================================
CASE RECORD & DEMOGRAPHICS:
• Case / File Number:     ${caseData.caseId || "Not Assigned"}
${presetAudit.isPreset ? `• Preset Reference Case:  ${presetAudit.presetName || caseData.presetName} [${presetAudit.presetCategory || "Benchmark Case"}]
• Preset Modification:    ${presetAudit.isModified ? `MODIFIED BY EXAMINER (${presetAudit.modifiedCount} parameter(s) adjusted)` : "UNALTERED BENCHMARK BASELINE"}
${presetAudit.isModified && presetAudit.modifiedFieldLabels.length > 0 ? `• Altered Parameters:     ${presetAudit.modifiedFieldLabels.join("; ")}\n` : ""}• Preset Description:     ${caseData.presetDescription || "Standard forensic benchmark profile"}\n` : ""}• Subject Identification: ${caseData.subjectNameOrIdentifier || "Unidentified Doe"}
• Estimated Age / Sex:    ${caseData.ageYears ? `${caseData.ageYears} years` : "Unspecified"} / ${(caseData.sex || "Unknown").toUpperCase()}
• Attending Examiner:     ${caseData.investigatorName || caseData.examinerName || "Staff Medical Examiner"}
• Jurisdiction / Agency:  ${caseData.jurisdiction || "Forensic Pathology Division"}
• Scene Location:         ${caseData.locationDescription || "Scene"}
• Discovery Timestamp:    ${caseData.discoveryTimestamp || "Unrecorded"}
• Integrity Security Hash: ${integrityHash}

--------------------------------------------------------------------------------
SCENE ENVIRONMENTAL BASELINE:
• Ambient Scene Temp:     ${caseData.ambientTempC} °C
• Body Mass / Weight:     ${caseData.bodyWeightKg} kg
• Body Discovery Posture: ${(caseData.bodyFoundPosition || "Supine").toUpperCase()}

--------------------------------------------------------------------------------
COMPOSITE POST-MORTEM INTERVAL (PMI) ESTIMATION:
• Estimated PMI Range:    ${result.estimatedPmiMinHours} – ${result.estimatedPmiMaxHours} Hours (~${(result.estimatedPmiMinHours / 24).toFixed(1)} to ${(result.estimatedPmiMaxHours / 24).toFixed(1)} days)
• Point Optimum PMI:      ${result.estimatedPmiOptimalHours} Hours (~${(result.estimatedPmiOptimalHours / 24).toFixed(1)} days)
• Estimated TOD Window:   ${result.estimatedTimeOfDeathOptimal || result.estimatedTimeOfDeathMin || "Calculated Window"}
• Model Harmony / Score:  ${result.confidenceScore}% (${result.confidenceTier})
• Dominant Anchors:       ${result.dominantIndicatorSummary.join(", ")}

XGBOOST 100-TREE REGRESSION & TREESHAP EXPLAINABILITY:
• XGBoost ML Prediction:  ${mlPredictionData.estimatedPmiOptimalHours} Hours (~${(mlPredictionData.estimatedPmiOptimalHours / 24).toFixed(1)} days)
• Prediction Interval:    ${mlPredictionData.estimatedPmiMinHours} – ${mlPredictionData.estimatedPmiMaxHours} Hours (95% Empirical CI)
• TreeSHAP Base E[y]:     ${mlPredictionData.baseValueHours} Hours (Calculated in ${inBrowserExecTimeMs}ms)
• Top Feature Attributions:
${mlPredictionData.factorAttributions?.slice(0, 4).map(attr => `  - ${attr.factorName}: ${attr.impactDirection === 'increases_pmi' ? '+' : '-'}${attr.pullMagnitudeHours}h (${attr.explanation})`).join('\n') || "  - Standard vector baseline"}

--------------------------------------------------------------------------------
FORENSIC INDICATOR MODULE EVALUATION & INPUTS:
1. ALGOR MORTIS (HENSSGE NOMOGRAM):
   • Status:              ${caseData.algorMortis.enabled ? "ACTIVE" : "BYPASSED / OFF"}
   • Logged Timestamp:    ${caseData.algorMortis.recordedAt || caseData.indicatorTimings?.algor || "N/A"}
   • Rectal / Core Temp:  ${caseData.algorMortis.enabled ? `${caseData.algorMortis.rectalTempC} °C` : "N/A"}
   • Clothing Factor (Cf): ${caseData.algorMortis.enabled ? `${caseData.algorMortis.clothingCoveringFactor} (${caseData.algorMortis.clothingDescription || "Standard"})` : "N/A"}
   • Air Current & Wet:   ${caseData.algorMortis.enabled ? `${caseData.algorMortis.airCurrentVelocity}, Wet: ${caseData.algorMortis.isBodyWet ? "Yes" : "No"}` : "N/A"}

2. LIVOR MORTIS (HYPOSTASIS):
   • Status:              ${caseData.livorMortis.enabled ? "ACTIVE" : "BYPASSED / OFF"}
   • Logged Timestamp:    ${caseData.livorMortis.recordedAt || caseData.indicatorTimings?.livor || "N/A"}
   • Blanchability:       ${caseData.livorMortis.enabled ? caseData.livorMortis.blanchability.replace(/_/g, " ") : "N/A"}
   • Color Hue:           ${caseData.livorMortis.enabled ? caseData.livorMortis.colorHue : "N/A"}
   • Distribution Pattern:${caseData.livorMortis.enabled ? caseData.livorMortis.distributionPattern.replace(/_/g, " ") : "N/A"}
   • Relocation Suspected:${caseData.livorMortis.enabled ? (caseData.livorMortis.suspectedBodyMovement ? "YES (DISCORDANCE DETECTED)" : "No") : "N/A"}

3. RIGOR MORTIS (NYSTEN LAW):
   • Status:              ${caseData.rigorMortis.enabled ? "ACTIVE" : "BYPASSED / OFF"}
   • Logged Timestamp:    ${caseData.rigorMortis.recordedAt || caseData.indicatorTimings?.rigor || "N/A"}
   • Progression Stage:   ${caseData.rigorMortis.enabled ? caseData.rigorMortis.progressionStage.replace(/_/g, " ") : "N/A"}
   • Muscle Involvement:  ${caseData.rigorMortis.enabled ? `Jaw: ${caseData.rigorMortis.muscleGroups.jawTemporomandibular ? "Yes" : "No"} | Neck: ${caseData.rigorMortis.muscleGroups.neckCervical ? "Yes" : "No"} | Upper Limbs: ${caseData.rigorMortis.muscleGroups.upperLimbsElbowsWrists ? "Yes" : "No"} | Trunk: ${caseData.rigorMortis.muscleGroups.trunkAbdomen ? "Yes" : "No"} | Lower Limbs: ${caseData.rigorMortis.muscleGroups.lowerLimbsKneesAnkles ? "Yes" : "No"}` : "N/A"}
   • Pre-Death Exertion:  ${caseData.rigorMortis.enabled ? caseData.rigorMortis.preDeathPhysicalExertion.replace(/_/g, " ") : "N/A"}
   • Cold Stiffening:     ${caseData.rigorMortis.enabled ? (caseData.rigorMortis.coldStiffeningSuspected ? "SUSPECTED" : "None") : "N/A"}

4. DECOMPOSITION (MEGYESI TOTAL BODY SCORE / ADD):
   • Status:              ${caseData.decomposition.enabled ? "ACTIVE" : "BYPASSED / OFF"}
   • Logged Timestamp:    ${caseData.decomposition.recordedAt || caseData.indicatorTimings?.decomposition || "N/A"}
   • Head/Neck Score:     ${caseData.decomposition.enabled ? `${caseData.decomposition.headNeckScore}/13` : "N/A"}
   • Trunk Score:         ${caseData.decomposition.enabled ? `${caseData.decomposition.trunkScore}/12` : "N/A"}
   • Limbs Score:         ${caseData.decomposition.enabled ? `${caseData.decomposition.limbsScore}/10` : "N/A"}
   • Total Body Score:    ${caseData.decomposition.enabled ? `TBS ${caseData.decomposition.totalBodyScore}/35` : "N/A"}
   • Key Morphologies:    ${caseData.decomposition.enabled ? `Marbling: ${caseData.decomposition.marblingPresent ? "Yes" : "No"} | Greening: ${caseData.decomposition.rightIliacDiscoloration ? "Yes" : "No"} | Bloat/Purge: ${caseData.decomposition.bloatingAndPurge ? "Yes" : "No"} | Bullae/Slippage: ${caseData.decomposition.skinSlippageBullae ? "Yes" : "No"} | Mummification: ${caseData.decomposition.mummificationOrAdipocere ? "Yes" : "No"} | Bone Exposed: ${caseData.decomposition.skeletonizationBoneExposed ? "Yes" : "No"}` : "N/A"}

5. FORENSIC ENTOMOLOGY (INSECT SUCCESSION & ADH):
   • Status:              ${caseData.entomology.enabled ? "ACTIVE" : "BYPASSED / OFF"}
   • Logged Timestamp:    ${caseData.entomology.recordedAt || caseData.indicatorTimings?.entomology || "N/A"}
   • Primary Insect Taxon:${caseData.entomology.enabled ? caseData.entomology.primaryInsectGroup.replace(/_/g, " ") : "N/A"}
   • Colonization Stage:  ${caseData.entomology.enabled ? caseData.entomology.developmentalStage.replace(/_/g, " ") : "N/A"}
   • Mean Larval Length:  ${caseData.entomology.enabled ? `${caseData.entomology.larvalLengthMm} mm` : "N/A"}
   • Maggot Mass Temp:    ${caseData.entomology.enabled ? `${caseData.entomology.maggotMassTempC} °C` : "N/A"}
   • Indoor Access Delay: ${caseData.entomology.enabled ? `${caseData.entomology.indoorAccessDelayHours} hours` : "N/A"}

6. METABOLOMICS MULTI-ANALYTE PANEL:
   • Status:              ${caseData.metabolomics.enabled ? "ACTIVE" : "BYPASSED / OFF"}
   • Logged Timestamp:    ${caseData.metabolomics.recordedAt || caseData.indicatorTimings?.metabolomics || "N/A"}
   • Active Analytes:     ${caseData.metabolomics.enabled ? (caseData.metabolomics.selectedMetabolites?.length ? `${caseData.metabolomics.selectedMetabolites.length} of 11 markers (${caseData.metabolomics.selectedMetabolites.map(m => `${m.name}: ${m.measuredValue} ${m.unit}`).join("; ")})` : "None loaded") : "N/A"}

--------------------------------------------------------------------------------
PHOTOGRAPHIC EVIDENCE & VISION ANALYSIS:
${
  imagesList.length > 0
    ? `• Photos Analyzed:      ${forensicPhotosList.length} forensic photo(s)${imagesList.some(img => img.isUnrelated) ? ` (${imagesList.filter(img => img.isUnrelated).length} non-forensic excluded)` : ""}\n` +
      `• Vision Analyzed Time:  ${visionData?.analyzedAt || visionData?.recordedAt || caseData.indicatorTimings?.vision || "N/A"}\n` +
      `• Vision Analysis Summary: ${visionData?.forensicObservations || `Photo analysis indicates ${visionData?.detectedDecompositionStage?.replace(/_/g, " ") || "fresh"} changes (TBS ${visionData?.estimatedTbs?.totalScore || 3}/35) with ${visionData?.detectedLivor?.colorClassification?.replace(/_/g, " ") || "violaceous"} hypostatic settling, pointing to an estimated post-mortem interval window.`}\n` +
      `• Key Visual Findings:   Decomposition: ${visionData?.detectedDecompositionStage?.replace(/_/g, " ") || "Indeterminate"} (TBS ${visionData?.estimatedTbs?.totalScore ?? "N/A"}/35) | Lividity: ${visionData?.detectedLivor?.colorClassification?.replace(/_/g, " ") || "Violaceous"} (${visionData?.detectedLivor?.distribution || "Dependent"}) | Entomology: ${visionData?.detectedEntomology?.primaryInsectStage?.replace(/_/g, " ") || "None"} | Body Movement: ${visionData?.detectedMovement?.suspectedMovement ? "SUSPECTED (Dual Discordant Lividity)" : "Consistent Posture"}\n` +
      `• Image Evidence Metric: Clarity: ${visionData?.averageClarityScore ?? 92}% | Diagnostic Reliability: ${visionData?.averageReliabilityScore ?? 90}% (${visionData?.overallQualityAssessment || "Forensic-Grade Evidence"})`
    : "No photographic evidence or computer vision detections attached."
}
${
  hasExaminerNotes
    ? `\n--------------------------------------------------------------------------------\nEXAMINER'S QUALITATIVE PATHOLOGY NOTES & NARRATIVE:\n${examinerNotesText}\n`
    : ""
}
--------------------------------------------------------------------------------
PHYSIOLOGICAL INDICATOR SUMMARY TABLE:
${result.indicatorEvaluations
  .map(
    (i) =>
      `• ${i.name.padEnd(30, " ")}: Window ${String(i.estimatedPmiMinHours).padStart(3, " ")} – ${String(i.estimatedPmiMaxHours).padStart(3, " ")} h (opt: ${String(i.estimatedPmiOptimalHours).padStart(3, " ")}h) | Weight: ${i.weightInFinalCalculation}% | ${i.physiologicReliabilityWindow}`
  )
  .join("\n")}

--------------------------------------------------------------------------------
DETECTED CONTRADICTIONS & DISCREPANCY ALERTS:
${
  result.inconsistenciesDetected
    ? result.inconsistencyAlerts
        .map(
          (a) =>
            `[${a.severity.toUpperCase()}] ${a.title}\n  Details: ${a.description}\n  Forensic Implication: ${a.forensicImplication}`
        )
        .join("\n\n")
    : "No physiological discordance or conflicting indicators detected."
}

${
  result.aiSynthesis
    ? `--------------------------------------------------------------------------------
AI PATHOLOGIST SYNTHESIS:
${result.aiSynthesis.expertSummary}

Recommended Confirmatory Protocols:
${result.aiSynthesis.recommendedConfirmatoryTests.map((t) => `• ${t}`).join("\n")}
`
    : ""
}
--------------------------------------------------------------------------------
DIGITAL CHAIN OF CUSTODY & EXAMINER SIGN-OFF:
• Case File Number:      ${caseData.caseId}
• Verification Checksum: ${integrityHash}
• Attending Pathologist: _____________________________________________
• Signature / Title:     _____________________________________________
• Date & Time:           _____________________________________________

--------------------------------------------------------------------------------
RESEARCH PROTOTYPE & MEDICO-LEGAL DISCLAIMER:
VisionMortis is an advanced AI-assisted decision-support research prototype
engineered by Protocol One. Estimations produced by this platform must always
be correlated with complete post-mortem autopsy findings, scene context,
toxicology, and histological analysis.
================================================================================
Generated: ${new Date().toISOString()} • VisionMortis by Protocol One
================================================================================
`.trim();
  };

  const triggerFileDownload = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(generateReportPlainText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleDownloadTxt = () => {
    const text = generateReportPlainText();
    const filename = `VisionMortis_Report_${caseData.caseId || "CASE"}_${new Date().toISOString().slice(0, 10)}.txt`;
    triggerFileDownload(text, filename, "text/plain;charset=utf-8");
    setDownloadSuccess("TXT Downloaded");
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const handleDownloadJson = () => {
    const exportObject = {
      meta: {
        platform: "VisionMortis Multimodal PMI Suite",
        developer: "Protocol One",
        exportTimestamp: new Date().toISOString(),
        caseIntegrityHash: integrityHash,
        version: "2.4.0",
      },
      caseData,
      compositePmiResult: result,
      visionDetections: visionData || null,
    };
    const jsonString = JSON.stringify(exportObject, null, 2);
    const filename = `VisionMortis_Data_${caseData.caseId || "CASE"}_${new Date().toISOString().slice(0, 10)}.json`;
    triggerFileDownload(jsonString, filename, "application/json");
    setDownloadSuccess("JSON Exported");
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const handleDownloadHtml = () => {
    downloadForensicHtmlReport(caseData, result, visionData, integrityHash);
    setDownloadSuccess("Print-Ready HTML Report Downloaded");
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const handlePrint = () => {
    setDownloadSuccess("PDF & Print Report Downloaded!");
    setTimeout(() => setDownloadSuccess(null), 3500);
    printForensicCaseReport(caseData, result, visionData, integrityHash);
  };

  return (
    <section
      id="generated-report-section"
      className="rounded-2xl bg-slate-900/95 border-2 border-teal-500/40 p-3.5 sm:p-6 md:p-8 space-y-4 sm:space-y-6 shadow-2xl transition-all"
    >
      {/* Top Header Bar with Actions */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 sm:gap-4 border-b border-slate-800 pb-4 sm:pb-5 no-print">
        <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 w-full lg:w-auto min-w-0">
          {onBackToWorkspace && (
            <button
              type="button"
              onClick={() => onBackToWorkspace()}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 hover:border-teal-500/50 flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition-colors shrink-0"
              title="Return to Case Workspace & Edit Data"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </button>
          )}
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-xl font-bold text-slate-100 tracking-tight truncate">
                Forensic Case Report
              </h2>
              <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-800 shrink-0">
                Official Report
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 line-clamp-2 sm:line-clamp-none">
              Comprehensive multimodal estimation report including all case inputs, scene parameters, and photographic evidence.
            </p>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-2 w-full lg:w-auto no-print">
          {/* Download Visual Analytics Quick Menu Tray */}
          <div className="no-scrollbar overflow-x-auto flex items-center gap-1 p-1 bg-slate-950/90 border border-slate-800 rounded-xl w-full sm:w-auto">
            <button
              type="button"
              onClick={async () => {
                setDownloadSuccess("Downloading Henssge Cooling Curve PNG...");
                const svg = generateHenssgeCoolingSvg(result, caseData);
                await downloadSvgAsPng(svg, `Henssge-CoolingCurve-${caseData.caseId || "CASE"}.png`);
                setTimeout(() => setDownloadSuccess(null), 3000);
              }}
              title="Download Henssge Cooling Trajectory Chart (PNG)"
              className="px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-teal-400 text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors whitespace-nowrap"
            >
              <LineChart className="w-3.5 h-3.5" />
              <span>Cooling Curve</span>
            </button>

            <button
              type="button"
              onClick={async () => {
                setDownloadSuccess("Downloading PMI Probability Density PNG...");
                const svg = generatePmiDistributionSvg(result, caseData);
                await downloadSvgAsPng(svg, `PMI-ProbabilityDensity-${caseData.caseId || "CASE"}.png`);
                setTimeout(() => setDownloadSuccess(null), 3000);
              }}
              title="Download PMI Probability Density Distribution (PNG)"
              className="px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-sky-400 text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors whitespace-nowrap"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>PMI Density</span>
            </button>

            <button
              type="button"
              onClick={async () => {
                setDownloadSuccess("Downloading Factor Attribution & SHAP PNG...");
                const svg = generateFactorAttributionSvg(result, mlPredictionData, caseData);
                await downloadSvgAsPng(svg, `FactorAttribution-TreeSHAP-${caseData.caseId || "CASE"}.png`);
                setTimeout(() => setDownloadSuccess(null), 3000);
              }}
              title="Download Factor Attribution & TreeSHAP Waterfall (PNG)"
              className="px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-amber-400 text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors whitespace-nowrap"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Attribution</span>
            </button>

            <button
              type="button"
              onClick={async () => {
                setDownloadSuccess("Generating Complete Visual & Data Bundle...");
                await downloadAllVisualizationsBundle(result, mlPredictionData, caseData);
                setTimeout(() => setDownloadSuccess(null), 3500);
              }}
              title="Download Complete Analytical Bundle (All 3 Charts + JSON report)"
              className="px-2 py-1.5 rounded-lg bg-teal-950/80 hover:bg-teal-900/80 text-teal-300 border border-teal-800/80 text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>All Exhibits</span>
            </button>
          </div>

          {/* Quick Export & Print Actions */}
          <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleCopyText}
              className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadTxt}
              className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
            >
              <Download className="w-3.5 h-3.5 text-teal-400" />
              <span>.TXT</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadJson}
              className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
            >
              <FileCode className="w-3.5 h-3.5 text-sky-400" />
              <span>.JSON</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadHtml}
              className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-teal-900/60"
              title="Download standalone print-ready HTML case report with embedded charts"
            >
              <Download className="w-3.5 h-3.5" />
              <span>.HTML</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-teal-900/40 cursor-pointer"
              title="Print or Save as PDF via native print dialog"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Report</span>
            </button>
          </div>
        </div>
      </div>

      {downloadSuccess && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-800 rounded-xl text-emerald-300 text-xs font-semibold flex items-center gap-2 no-print">
          <CheckCircle2 className="w-4 h-4" />
          <span>{downloadSuccess} successfully to your local machine.</span>
        </div>
      )}

      {/* Real-Time Automated Execution & Engine Telemetry Status Bar */}
      <div className="rounded-2xl bg-gradient-to-r from-teal-950/90 via-slate-900 to-slate-900 border border-teal-500/40 p-4 space-y-3 no-print shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300 shrink-0">
              <Zap className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-100 uppercase tracking-wide">
                  Automated Synthesis Engine
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/80 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Real-Time Active ({inBrowserExecTimeMs}ms)
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Automatically executes the multimodal fusion engine, 100-tree in-browser XGBoost regressor, 212-feature TreeSHAP explainability, and AI pathologist synthesis.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onRunAiSynthesis && (
              <button
                type="button"
                onClick={onRunAiSynthesis}
                disabled={isAiLoading}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                title="Run or Refresh Deep AI Pathologist Synthesis"
              >
                {isAiLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Synthesizing AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{result.aiSynthesis ? "Re-Run AI Synthesis" : "Run AI Synthesis"}</span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowFullSynthesisPanel(!showFullSynthesisPanel)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>{showFullSynthesisPanel ? "Hide Synthesis Hub" : "Show Synthesis Hub"}</span>
              {showFullSynthesisPanel ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Telemetry Micro-Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-800/80 text-[11px]">
          <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Fusion Engine:</span>
            <span className="font-mono text-teal-300 font-semibold">{result.confidenceScore}% Harmony</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">XGBoost ML:</span>
            <span className="font-mono text-emerald-400 font-semibold">{mlPredictionData.estimatedPmiOptimalHours}h</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">TreeSHAP:</span>
            <span className="font-mono text-amber-300 font-semibold">212 Features</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">AI Pathologist:</span>
            <span className="font-mono text-teal-300 font-semibold">{isAiLoading ? "Synthesizing..." : result.aiSynthesis ? "Synchronized" : "Ready"}</span>
          </div>
        </div>
      </div>

      {/* Embedded Comprehensive Final Synthesis & Explainability Hub */}
      {showFullSynthesisPanel && (
        <div className="space-y-3 no-print">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-teal-400">
                Final Synthesis & Explainability Hub
              </h3>
            </div>
            <a
              href="#official-case-report-content"
              className="text-xs text-slate-400 hover:text-teal-300 font-medium flex items-center gap-1 cursor-pointer"
            >
              <span>Scroll to Official Report Body ↓</span>
            </a>
          </div>

          <PmiOutputPanel
            result={result}
            caseData={caseData}
            onRunAiSynthesis={onRunAiSynthesis || (() => {})}
            isAiLoading={isAiLoading}
            onOpenReportModal={() => {
              const el = document.getElementById("official-case-report-content");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
          />
        </div>
      )}

      {/* Official Report Document Body */}
      <div id="official-case-report-content" className="bg-slate-950 rounded-2xl border border-slate-800 p-4 sm:p-8 space-y-8 text-slate-200 overflow-hidden">
        {/* Report Header / Brand */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 border-b border-slate-800 pb-6">
          <div className="flex items-start sm:items-center gap-3 sm:gap-4 w-full md:w-auto min-w-0">
            <RecreatedLogo className="w-11 h-11 sm:w-14 sm:h-14 shrink-0" showSubtitle={false} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                <span className="text-lg sm:text-xl font-black text-slate-100 tracking-tight">VISIONMORTIS</span>
                <span className="inline-flex items-center text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-teal-950/90 text-teal-300 border border-teal-800/80 whitespace-nowrap shrink-0">
                  PROTOCOL ONE
                </span>
              </div>
              <p className="text-[11px] sm:text-xs font-semibold text-slate-400 tracking-wide uppercase mt-1 break-words">
                Post-Mortem Interval Multimodal Forensic Case Report
              </p>
              <div className="text-[10px] sm:text-[11px] text-[#D4AF37] font-medium mt-0.5">
                Research Prototype System
              </div>
            </div>
          </div>

          <div className="w-full md:w-auto text-left md:text-right space-y-1 text-xs pt-3 md:pt-0 border-t md:border-t-0 border-slate-800/60 shrink-0">
            <div className="font-mono text-slate-400">
              Generated: <span className="text-slate-200">{new Date().toLocaleString()}</span>
            </div>
            <div className="font-mono text-[11px] text-slate-500 flex items-center md:justify-end gap-1 flex-wrap break-all">
              <Lock className="w-3 h-3 text-teal-400 shrink-0" />
              <span>SHA-256: {integrityHash}</span>
            </div>
          </div>
        </div>

        {/* Preset Benchmark Case Banner (if preset used) */}
        {(caseData.presetName || caseData.isPresetCase || presetAudit.isPreset) && (
          <div className={`p-4 rounded-xl border flex items-start gap-3.5 text-xs animate-in fade-in duration-150 ${
            presetAudit.isModified
              ? "bg-amber-950/30 border-amber-500/50 shadow-md shadow-amber-950/20"
              : "bg-teal-950/40 border-teal-500/40"
          }`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border ${
              presetAudit.isModified
                ? "bg-amber-500/20 border-amber-500/30 text-amber-300"
                : "bg-teal-500/20 border-teal-500/30 text-teal-300"
            }`}>
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[11px] font-bold uppercase tracking-wider ${
                  presetAudit.isModified ? "text-amber-300" : "text-teal-300"
                }`}>
                  Preset Reference Profile:
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-900 text-slate-200 border border-slate-700">
                  {presetAudit.presetCategory || caseData.presetCategory || "Benchmark Case"}
                </span>

                {presetAudit.isModified ? (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    Modified by Examiner ({presetAudit.modifiedCount} parameter adjustments)
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    Original Unaltered Baseline
                  </span>
                )}

                {caseData.isHarmonicPreset && !presetAudit.isModified && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/80">
                    ✓ Harmonic Baseline (0 Discordance)
                  </span>
                )}
              </div>
              <div className="font-bold text-slate-100 text-sm mt-0.5">
                {presetAudit.presetName || caseData.presetName || caseData.subjectNameOrIdentifier}
              </div>
              {caseData.presetDescription && (
                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                  {caseData.presetDescription}
                </p>
              )}

              {/* Examiner Alterations Breakdown */}
              {presetAudit.isModified && presetAudit.modifiedFieldLabels.length > 0 && (
                <div className="mt-2.5 pt-2.5 border-t border-amber-900/40 space-y-1.5">
                  <div className="text-[11px] font-semibold text-amber-200 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Examiner Modifications from Baseline:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {presetAudit.modifiedFieldLabels.map((diff, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-amber-950/90 border border-amber-800/90 font-mono text-[10px] text-amber-300 shadow-sm"
                      >
                        {diff}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 1. Case Identification & Demographics Summary */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>1. Case Demographics & Scene Baseline</span>
          </div>

          <div className={`grid grid-cols-1 sm:grid-cols-2 ${presetAudit.isPreset ? 'lg:grid-cols-6' : 'lg:grid-cols-5'} gap-3`}>
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="text-[11px] text-slate-500">Case / File Number</div>
              <div className="font-mono font-bold text-sm text-slate-100 mt-0.5 truncate">
                {caseData.caseId || "Not Assigned"}
              </div>
            </div>

            {presetAudit.isPreset && (
              <div className={`p-3.5 rounded-xl border ${
                presetAudit.isModified
                  ? "bg-amber-950/20 border-amber-800/60"
                  : "bg-slate-900/90 border-slate-800"
              }`}>
                <div className="text-[11px] text-slate-500">Preset Case Status</div>
                <div className="font-bold text-xs mt-0.5 truncate text-slate-200" title={presetAudit.presetName}>
                  {presetAudit.presetName || "Benchmark Case"}
                </div>
                <div className={`text-[10px] font-semibold mt-1 truncate ${
                  presetAudit.isModified ? "text-amber-400 font-medium" : "text-emerald-400"
                }`}>
                  {presetAudit.isModified ? `⚠️ Modified (${presetAudit.modifiedCount} Δ)` : "✓ Unaltered Baseline"}
                </div>
              </div>
            )}

            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-teal-900/40 bg-gradient-to-b from-slate-900 to-teal-950/20">
              <div className="text-[11px] text-teal-400 font-medium">Attending Pathologist / Examiner</div>
              <div className="font-bold text-sm text-teal-200 mt-0.5 truncate" title={caseData.investigatorName || caseData.examinerName || "Staff Medical Examiner"}>
                {caseData.investigatorName || caseData.examinerName || "Staff Medical Examiner"}
              </div>
              <div className="text-[10px] text-slate-400 mt-1 truncate">
                {caseData.jurisdiction || "Division of Forensic Medicine"}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="text-[11px] text-slate-500">Subject Identification</div>
              <div className="font-bold text-sm text-slate-100 mt-0.5 truncate">
                {caseData.subjectNameOrIdentifier || "Unidentified Doe"}
              </div>
              <div className="text-[10px] text-slate-400 mt-1 capitalize">
                {caseData.ageYears ? `${caseData.ageYears} yrs` : "Age Unspecified"} • {caseData.sex}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="text-[11px] text-slate-500">Discovery Timestamp</div>
              <div className="font-mono text-xs font-semibold text-slate-200 mt-0.5">
                {caseData.discoveryTimestamp ? new Date(caseData.discoveryTimestamp).toLocaleString() : "Not Recorded"}
              </div>
              <div className="text-[10px] text-slate-400 mt-1 truncate">
                Location: {caseData.locationDescription || "Scene"}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="text-[11px] text-slate-500">Scene Environmental Parameters</div>
              <div className="font-mono text-xs font-bold text-teal-400 mt-0.5">
                Ambient: {caseData.ambientTempC}°C • Mass: {caseData.bodyWeightKg}kg
              </div>
              <div className="text-[10px] text-slate-400 mt-1 capitalize">
                Posture: {caseData.bodyFoundPosition}
              </div>
            </div>
          </div>
        </div>

        {/* 2. Post-Mortem Interval (PMI) Composite Results */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-teal-950/40 via-slate-900 to-slate-900 border border-teal-500/30 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-teal-300 uppercase tracking-wider">
              <Clock className="w-4 h-4 text-teal-400" />
              <span>2. Post-Mortem Interval (PMI) Composite Results</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Model Harmony:</span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800">
                {result.confidenceScore}% ({result.confidenceTier})
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="text-xs text-slate-400 font-medium">Estimated PMI Window</div>
              <div className="text-2xl font-black text-slate-100 font-mono mt-1">
                {result.estimatedPmiMinHours} – {result.estimatedPmiMaxHours}{" "}
                <span className="text-sm font-normal text-slate-400">Hours</span>
              </div>
              <div className="text-xs text-slate-400 mt-1">
                ~{(result.estimatedPmiMinHours / 24).toFixed(1)} to {(result.estimatedPmiMaxHours / 24).toFixed(1)} post-mortem days
              </div>
            </div>

            <div className="p-4 rounded-xl bg-teal-950/50 border border-teal-500/40">
              <div className="text-xs text-teal-300 font-medium">Point Optimum PMI</div>
              <div className="text-2xl font-black text-teal-300 font-mono mt-1">
                {result.estimatedPmiOptimalHours}{" "}
                <span className="text-sm font-normal text-teal-400/80">Hours</span>
              </div>
              <div className="text-xs text-teal-400/80 mt-1">
                ~{(result.estimatedPmiOptimalHours / 24).toFixed(1)} days post-mortem
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="text-xs text-slate-400 font-medium">Estimated Time of Death</div>
              <div className="text-sm font-bold text-slate-100 font-mono mt-1">
                {result.estimatedTimeOfDeathMin}
              </div>
              <div className="text-xs text-slate-400">to {result.estimatedTimeOfDeathMax}</div>
            </div>
          </div>

          {result.dominantIndicatorSummary?.length > 0 && (
            <div className="text-xs text-slate-400 pt-1 flex items-center gap-2">
              <span className="font-semibold text-slate-300">Dominant Estimators:</span>
              <span className="text-teal-400">{result.dominantIndicatorSummary.join(" • ")}</span>
            </div>
          )}

          {/* XGBoost 100-Tree Model & TreeSHAP Section Callout */}
          <div className="mt-3 p-4 rounded-xl bg-slate-950/90 border border-emerald-800/60 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-emerald-300 uppercase tracking-wide">
                  XGBoost Ensemble & TreeSHAP Attribution (212 Features)
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                Evaluation Latency: <strong className="text-emerald-400">{inBrowserExecTimeMs}ms</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <div className="text-[10px] text-slate-400">XGBoost Optimum</div>
                <div className="text-base font-bold font-mono text-emerald-300 mt-0.5">
                  {mlPredictionData.estimatedPmiOptimalHours} <span className="text-xs font-normal text-slate-400">hours</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  ~{(mlPredictionData.estimatedPmiOptimalHours / 24).toFixed(1)} days
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <div className="text-[10px] text-slate-400">95% Empirical Bracket</div>
                <div className="text-sm font-bold font-mono text-slate-200 mt-0.5">
                  {mlPredictionData.estimatedPmiMinHours} – {mlPredictionData.estimatedPmiMaxHours} <span className="text-xs font-normal text-slate-400">hours</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Empirical quantile bounds
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <div className="text-[10px] text-slate-400">TreeSHAP Base E[y]</div>
                <div className="text-sm font-bold font-mono text-amber-300 mt-0.5">
                  {mlPredictionData.baseValueHours} <span className="text-xs font-normal text-slate-400">hours</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Prior population center
                </div>
              </div>
            </div>

            {mlPredictionData.factorAttributions && mlPredictionData.factorAttributions.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
                  <span>Top TreeSHAP Feature Attributions:</span>
                  <span className="text-[10px] text-slate-500 font-normal">Ranked by absolute pull</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {mlPredictionData.factorAttributions.slice(0, 4).map((attr, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-center justify-between gap-2 text-[11px]"
                    >
                      <div className="truncate">
                        <span className="font-medium text-slate-200 truncate">{attr.factorName}</span>
                        <div className="text-[10px] text-slate-400 truncate">{attr.explanation}</div>
                      </div>
                      <span
                        className={`px-1.5 py-0.5 rounded font-mono font-bold text-[10px] shrink-0 ${
                          attr.impactDirection === "increases_pmi"
                            ? "bg-amber-950 text-amber-300 border border-amber-800"
                            : "bg-teal-950 text-teal-300 border border-teal-800"
                        }`}
                      >
                        {attr.impactDirection === "increases_pmi" ? "+" : "-"}{attr.pullMagnitudeHours}h
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3. Detailed Forensic Module Inputs & Calculated Values */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4" />
            <span>3. Complete Forensic Inputs & Indicator Parameter Values</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            {/* Algor */}
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between font-semibold text-slate-200">
                <span className="flex items-center gap-1.5 text-teal-400">
                  <Thermometer className="w-4 h-4" /> Algor Mortis (Henssge)
                </span>
                <div className="flex items-center gap-2">
                  {(caseData.algorMortis.recordedAt || caseData.indicatorTimings?.algor) && (
                    <span className="text-[9px] font-mono text-teal-300 px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5 text-teal-400" />
                      <span>{formatIndicatorTimestamp(caseData.algorMortis.recordedAt || caseData.indicatorTimings?.algor || "")}</span>
                    </span>
                  )}
                  <span className={caseData.algorMortis.enabled ? "text-emerald-400" : "text-slate-500"}>
                    {caseData.algorMortis.enabled ? "Active" : "Bypassed"}
                  </span>
                </div>
              </div>
              {caseData.algorMortis.enabled ? (
                <div className="space-y-1 text-slate-400 font-mono text-[11px]">
                  <div>Core Temp: <span className="text-slate-200">{caseData.algorMortis.rectalTempC}°C</span></div>
                  <div>Ambient Temp: <span className="text-slate-200">{caseData.algorMortis.ambientTempC}°C</span></div>
                  <div>Clothing Factor C: <span className="text-slate-200">{caseData.algorMortis.clothingCoveringFactor}</span> ({caseData.algorMortis.clothingDescription || "Standard"})</div>
                  <div>Air Current: <span className="text-slate-200 capitalize">{caseData.algorMortis.airCurrentVelocity}</span></div>
                  <div>Wet Body Surface: <span className="text-slate-200">{caseData.algorMortis.isBodyWet ? "Yes" : "No"}</span></div>
                </div>
              ) : (
                <div className="text-slate-500 italic">Not utilized in final composite.</div>
              )}
            </div>

            {/* Livor */}
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between font-semibold text-slate-200">
                <span className="flex items-center gap-1.5 text-purple-400">
                  <Droplet className="w-4 h-4" /> Livor Mortis
                </span>
                <div className="flex items-center gap-2">
                  {(caseData.livorMortis.recordedAt || caseData.indicatorTimings?.livor) && (
                    <span className="text-[9px] font-mono text-teal-300 px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5 text-teal-400" />
                      <span>{formatIndicatorTimestamp(caseData.livorMortis.recordedAt || caseData.indicatorTimings?.livor || "")}</span>
                    </span>
                  )}
                  <span className={caseData.livorMortis.enabled ? "text-emerald-400" : "text-slate-500"}>
                    {caseData.livorMortis.enabled ? "Active" : "Bypassed"}
                  </span>
                </div>
              </div>
              {caseData.livorMortis.enabled ? (
                <div className="space-y-1 text-slate-400 font-mono text-[11px]">
                  <div>Blanchability: <span className="text-slate-200 capitalize">{caseData.livorMortis.blanchability.replace(/_/g, " ")}</span></div>
                  <div>Color Hue: <span className="text-slate-200 capitalize">{caseData.livorMortis.colorHue}</span></div>
                  <div>Distribution: <span className="text-slate-200 capitalize">{caseData.livorMortis.distributionPattern.replace(/_/g, " ")}</span></div>
                  <div>Position Conflict: <span className={caseData.livorMortis.suspectedBodyMovement ? "text-rose-400 font-bold" : "text-slate-200"}>{caseData.livorMortis.suspectedBodyMovement ? "Suspected / Discordant" : "None"}</span></div>
                </div>
              ) : (
                <div className="text-slate-500 italic">Not utilized in final composite.</div>
              )}
            </div>

            {/* Rigor */}
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between font-semibold text-slate-200">
                <span className="flex items-center gap-1.5 text-amber-400">
                  <Activity className="w-4 h-4" /> Rigor Mortis (Nysten)
                </span>
                <div className="flex items-center gap-2">
                  {(caseData.rigorMortis.recordedAt || caseData.indicatorTimings?.rigor) && (
                    <span className="text-[9px] font-mono text-teal-300 px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5 text-teal-400" />
                      <span>{formatIndicatorTimestamp(caseData.rigorMortis.recordedAt || caseData.indicatorTimings?.rigor || "")}</span>
                    </span>
                  )}
                  <span className={caseData.rigorMortis.enabled ? "text-emerald-400" : "text-slate-500"}>
                    {caseData.rigorMortis.enabled ? "Active" : "Bypassed"}
                  </span>
                </div>
              </div>
              {caseData.rigorMortis.enabled ? (
                <div className="space-y-1 text-slate-400 font-mono text-[11px]">
                  <div>Progression Stage: <span className="text-slate-200 capitalize">{caseData.rigorMortis.progressionStage.replace(/_/g, " ")}</span></div>
                  <div>Pre-Death Exertion: <span className="text-slate-200 capitalize">{caseData.rigorMortis.preDeathPhysicalExertion.replace(/_/g, " ")}</span></div>
                  <div>Cold Stiffening: <span className="text-slate-200">{caseData.rigorMortis.coldStiffeningSuspected ? "Suspected" : "None"}</span></div>
                </div>
              ) : (
                <div className="text-slate-500 italic">Not utilized in final composite.</div>
              )}
            </div>

            {/* Decomposition */}
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between font-semibold text-slate-200">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <Skull className="w-4 h-4" /> Decomposition (TBS)
                </span>
                <div className="flex items-center gap-2">
                  {(caseData.decomposition.recordedAt || caseData.indicatorTimings?.decomposition) && (
                    <span className="text-[9px] font-mono text-teal-300 px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5 text-teal-400" />
                      <span>{formatIndicatorTimestamp(caseData.decomposition.recordedAt || caseData.indicatorTimings?.decomposition || "")}</span>
                    </span>
                  )}
                  <span className={caseData.decomposition.enabled ? "text-emerald-400" : "text-slate-500"}>
                    {caseData.decomposition.enabled ? "Active" : "Bypassed"}
                  </span>
                </div>
              </div>
              {caseData.decomposition.enabled ? (
                <div className="space-y-1 text-slate-400 font-mono text-[11px]">
                  <div>Total Body Score: <span className="text-slate-200 font-bold">TBS {caseData.decomposition.totalBodyScore}/35</span></div>
                  <div>Head/Neck: <span className="text-slate-200">{caseData.decomposition.headNeckScore}/13</span> | Trunk: <span className="text-slate-200">{caseData.decomposition.trunkScore}/12</span> | Limbs: <span className="text-slate-200">{caseData.decomposition.limbsScore}/10</span></div>
                  <div>Key Signs: <span className="text-slate-200">{[
                    caseData.decomposition.marblingPresent && "Marbling",
                    caseData.decomposition.rightIliacDiscoloration && "Greening",
                    caseData.decomposition.bloatingAndPurge && "Bloat/Purge",
                    caseData.decomposition.skinSlippageBullae && "Slippage",
                    caseData.decomposition.mummificationOrAdipocere && "Mummification",
                    caseData.decomposition.skeletonizationBoneExposed && "Skeletonization",
                  ].filter(Boolean).join(", ") || "Fresh"}</span></div>
                </div>
              ) : (
                <div className="text-slate-500 italic">Not utilized in final composite.</div>
              )}
            </div>

            {/* Entomology */}
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between font-semibold text-slate-200">
                <span className="flex items-center gap-1.5 text-orange-400">
                  <Bug className="w-4 h-4" /> Forensic Entomology
                </span>
                <div className="flex items-center gap-2">
                  {(caseData.entomology.recordedAt || caseData.indicatorTimings?.entomology) && (
                    <span className="text-[9px] font-mono text-teal-300 px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5 text-teal-400" />
                      <span>{formatIndicatorTimestamp(caseData.entomology.recordedAt || caseData.indicatorTimings?.entomology || "")}</span>
                    </span>
                  )}
                  <span className={caseData.entomology.enabled ? "text-emerald-400" : "text-slate-500"}>
                    {caseData.entomology.enabled ? "Active" : "Bypassed"}
                  </span>
                </div>
              </div>
              {caseData.entomology.enabled ? (
                <div className="space-y-1 text-slate-400 font-mono text-[11px]">
                  <div>Taxon: <span className="text-slate-200 capitalize">{caseData.entomology.primaryInsectGroup.replace(/_/g, " ")}</span></div>
                  <div>Developmental Stage: <span className="text-slate-200 capitalize">{caseData.entomology.developmentalStage.replace(/_/g, " ")}</span></div>
                  <div>Mean Larval Length: <span className="text-slate-200">{caseData.entomology.larvalLengthMm} mm</span></div>
                  <div>Maggot Mass Temp: <span className="text-slate-200">{caseData.entomology.maggotMassTempC}°C</span></div>
                </div>
              ) : (
                <div className="text-slate-500 italic">Not utilized in final composite.</div>
              )}
            </div>

            {/* Metabolomics */}
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between font-semibold text-slate-200">
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <TestTube2 className="w-4 h-4" /> Vitreous Metabolomics
                </span>
                <div className="flex items-center gap-2">
                  {(caseData.metabolomics.recordedAt || caseData.indicatorTimings?.metabolomics) && (
                    <span className="text-[9px] font-mono text-teal-300 px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5 text-teal-400" />
                      <span>{formatIndicatorTimestamp(caseData.metabolomics.recordedAt || caseData.indicatorTimings?.metabolomics || "")}</span>
                    </span>
                  )}
                  <span className={caseData.metabolomics.enabled ? "text-emerald-400" : "text-slate-500"}>
                    {caseData.metabolomics.enabled ? "Active" : "Bypassed"}
                  </span>
                </div>
              </div>
              {caseData.metabolomics.enabled ? (
                <div className="space-y-1 text-slate-400 font-mono text-[11px]">
                  <div>Active Analytes: <span className="text-slate-200 font-bold">{caseData.metabolomics.selectedMetabolites?.length || 0} of 11 Panel Markers</span></div>
                  {caseData.metabolomics.selectedMetabolites && caseData.metabolomics.selectedMetabolites.length > 0 && (
                    <div className="line-clamp-2">Markers: <span className="text-slate-300">{caseData.metabolomics.selectedMetabolites.map(m => `${m.name} (${m.measuredValue} ${m.unit})`).join(", ")}</span></div>
                  )}
                </div>
              ) : (
                <div className="text-slate-500 italic">Not utilized in final composite.</div>
              )}
            </div>
          </div>
        </div>

        {/* 4. Photographic Evidence & Computer Vision Analysis Summary */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4" />
              <span>4. Photographic Evidence & Vision Analysis</span>
            </div>
            {imagesList.length > 0 && (
              <span className="text-[11px] text-slate-400 font-mono">
                {forensicPhotosList.length} Forensic Photo(s) Evaluated
              </span>
            )}
          </div>

          {imagesList.length > 0 ? (
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              {/* Short Vision Analysis Description */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-teal-300">
                  <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                  <span>Photo Analysis Summary:</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  {visionData?.forensicObservations ||
                    `Visual inspection of submitted photos indicates ${visionData?.detectedDecompositionStage?.replace(/_/g, " ") || "fresh"} post-mortem stage (TBS ${visionData?.estimatedTbs?.totalScore || 3}/35) with ${visionData?.detectedLivor?.colorClassification?.replace(/_/g, " ") || "violaceous"} hypostatic settling and ${visionData?.detectedEntomology?.primaryInsectStage?.replace(/_/g, " ") || "no active"} insect colonization.`}
                </p>
              </div>

              {/* Key Visual Findings Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/90 space-y-0.5">
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Decomposition / Decay</div>
                  <div className="font-semibold text-amber-300 capitalize">
                    {visionData?.detectedDecompositionStage?.replace(/_/g, " ") || "Indeterminate"}
                    {visionData?.estimatedTbs && (
                      <span className="text-slate-400 font-mono font-normal ml-1">
                        (TBS {visionData.estimatedTbs.totalScore}/35)
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/90 space-y-0.5">
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Skin Color & Hypostasis</div>
                  <div className="font-semibold text-purple-300 capitalize">
                    {visionData?.detectedLivor?.colorClassification?.replace(/_/g, " ") || "Violaceous"}
                    <span className="text-slate-400 font-mono font-normal ml-1">
                      ({visionData?.detectedLivor?.estimatedFixation?.replace(/_/g, " ") || "Partially Fixed"})
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/90 space-y-0.5">
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Entomology / Insects</div>
                  <div className="font-semibold text-emerald-300 capitalize">
                    {visionData?.detectedEntomology?.primaryInsectStage?.replace(/_/g, " ") || "None Visible"}
                  </div>
                </div>
              </div>

              {/* Post-Mortem Body Movement Note if flagged */}
              {visionData?.detectedMovement?.suspectedMovement && (
                <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/80 text-xs text-purple-200 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-purple-300">
                    <AlertTriangle className="w-3.5 h-3.5 text-purple-400" />
                    <span>Post-Mortem Body Movement Detected ({visionData.detectedMovement.confidenceScore}% Confidence)</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-purple-200/90">
                    {visionData.detectedMovement.description}
                  </p>
                </div>
              )}

              {/* Photo Overview Strip & Quality Ratings */}
              <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-mono">Evidence Fidelity:</span>
                  <span className="font-mono text-teal-300 font-semibold">
                    Clarity: {visionData?.averageClarityScore ?? 92}%
                  </span>
                  <span>•</span>
                  <span className="font-mono text-teal-300 font-semibold">
                    Reliability: {visionData?.averageReliabilityScore ?? 90}%
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {imagesList.slice(0, 4).map((img, idx) => (
                    <span
                      key={img.id || idx}
                      className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800 text-[10px] font-mono"
                    >
                      Photo #{idx + 1}: {(img.tag || "Scene").replace(/_/g, " ")}
                    </span>
                  ))}
                  {imagesList.length > 4 && (
                    <span className="text-[10px] text-slate-500 font-mono">
                      +{imagesList.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-400 flex items-center gap-2">
              <Camera className="w-4 h-4 text-slate-500 shrink-0" />
              <span><strong>Photographic Evidence:</strong> No photos submitted for this case record.</span>
            </div>
          )}
        </div>

        {/* Examiner's Qualitative Notes (Rendered ONLY if examiner provided notes) */}
        {hasExaminerNotes && (
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-teal-400" />
                <span>Examiner&apos;s Qualitative Pathology & Scene Notes</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Official Observation</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              {examinerNotesText}
            </p>
          </div>
        )}

        {/* 5. Inconsistencies and Physiological Alerts */}
        {result.inconsistenciesDetected && (
          <div className="space-y-3">
            <div className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              <span>5. Physiological Discordance & Contradiction Alerts</span>
            </div>

            <div className="space-y-2">
              {result.inconsistencyAlerts.map((alert, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/80 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between font-bold text-rose-300">
                    <span className="flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      {alert.title}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-900 text-rose-200 uppercase">
                      {alert.severity} Alert
                    </span>
                  </div>
                  <p className="text-rose-200/90 leading-relaxed">{alert.description}</p>
                  <div className="text-rose-300/80 pt-1 font-semibold">
                    Forensic Implication: <span className="font-normal">{alert.forensicImplication}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. AI Pathologist Synthesis (if generated) */}
        {result.aiSynthesis && (
          <div className="space-y-3 p-5 rounded-2xl bg-teal-950/30 border border-teal-500/30">
            <div className="text-xs font-bold text-teal-300 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span>6. AI Pathologist Integrated Synthesis</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {result.aiSynthesis.expertSummary}
            </p>
            {result.aiSynthesis.recommendedConfirmatoryTests?.length > 0 && (
              <div className="pt-2 border-t border-teal-900/50 space-y-1">
                <div className="text-[11px] font-bold text-teal-400">Recommended Confirmatory Protocols:</div>
                <ul className="list-disc list-inside text-xs text-slate-400 space-y-0.5">
                  {result.aiSynthesis.recommendedConfirmatoryTests.map((test, idx) => (
                    <li key={idx}>{test}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* 7. Sign-off & Verification */}
        <div className="pt-6 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-slate-400">
          <div>
            <div className="text-[11px] text-slate-500 mb-6">Attending Pathologist / Examiner</div>
            <div className="border-b border-slate-700 pb-1 font-semibold text-slate-200">
              {caseData.investigatorName || "_________________________________"}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-500 mb-6">Signature & Verification</div>
            <div className="border-b border-slate-700 pb-1 font-mono text-[11px] text-slate-300">
              Checksum: {integrityHash.slice(0, 16)}...
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-500 mb-6">Date of Formal Review</div>
            <div className="border-b border-slate-700 pb-1 text-slate-200">
              {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Disclaimer in Report */}
        <div className="p-4 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#E5C158] text-[11px] space-y-1">
          <div className="font-bold uppercase tracking-wider text-[#D4AF37] flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Research Prototype & Medico-Legal Notice</span>
          </div>
          <p className="leading-relaxed text-[#E5C158]/90">
            VisionMortis is an AI-assisted decision-support research prototype engineered by Protocol One. All post-mortem interval estimations must be corroborated with complete autopsy, scene findings, and toxicology.
          </p>
        </div>
      </div>
    </section>
  );
};
