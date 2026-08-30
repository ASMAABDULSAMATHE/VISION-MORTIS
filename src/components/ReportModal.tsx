import React, { useState } from "react";
import { ForensicCaseInput, PmiCalculationResult, VisionDetectionData } from "../types";
import {
  Printer,
  Copy,
  Check,
  X,
  FileText,
  ShieldAlert,
  Download,
  FileCode,
  AlertTriangle,
  Stethoscope,
  Building2,
  Calendar,
  Thermometer,
  Clock,
  Compass,
  Layers,
  Camera,
  Bug,
  Skull,
  Droplet,
  Activity,
  TestTube2,
  CheckCircle2,
  Lock,
  BarChart3,
  TrendingUp,
  LineChart,
  FileSpreadsheet,
} from "lucide-react";
import { RecreatedLogo } from "./RecreatedLogo";
import { validateCaseId, generateCaseIntegrityHash } from "../utils/validation";
import { printForensicCaseReport, downloadForensicHtmlReport } from "../utils/printReport";
import {
  downloadSvgAsPng,
  generateHenssgeCoolingSvg,
  generatePmiDistributionSvg,
  generateFactorAttributionSvg,
  downloadAllVisualizationsBundle,
} from "../utils/chartExport";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  caseData: ForensicCaseInput;
  result: PmiCalculationResult;
  visionData?: VisionDetectionData;
}

export const ReportModal: React.FC<Props> = ({
  isOpen,
  onClose,
  caseData,
  result,
  visionData,
}) => {
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const caseValidation = validateCaseId(caseData.caseId);
  const integrityHash = generateCaseIntegrityHash(
    caseData.caseId || "VM-CASE",
    caseData.discoveryTimestamp || new Date().toISOString(),
    result.estimatedPmiOptimalHours
  );

  const imagesList = visionData?.images || [];

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
${caseData.presetName || caseData.isPresetCase ? `• Preset Reference Case:  ${caseData.presetName || caseData.subjectNameOrIdentifier} [${caseData.presetCategory || "Standard Validation Profile"}]\n• Preset Description:     ${caseData.presetDescription || "Standard forensic benchmark profile"}\n` : ""}• Subject Identification: ${caseData.subjectNameOrIdentifier || "Unidentified Doe"}
• Estimated Age / Sex:    ${caseData.ageYears ? `${caseData.ageYears} years` : "Unspecified"} / ${caseData.sex.toUpperCase()}
• Primary Pathologist:    ${caseData.investigatorName || "Staff Medical Examiner"}
• Scene Location:         ${caseData.locationDescription || "Scene"}
• Discovery Timestamp:    ${caseData.discoveryTimestamp || "Unrecorded"}
• Integrity Security Hash: ${integrityHash}

--------------------------------------------------------------------------------
SCENE ENVIRONMENTAL BASELINE:
• Ambient Scene Temp:     ${caseData.ambientTempC} °C
• Body Mass / Weight:     ${caseData.bodyWeightKg} kg
• Body Discovery Posture: ${caseData.bodyFoundPosition.toUpperCase()}

--------------------------------------------------------------------------------
COMPOSITE POST-MORTEM INTERVAL (PMI) ESTIMATION:
• Estimated PMI Range:    ${result.estimatedPmiMinHours} – ${result.estimatedPmiMaxHours} Hours (~${(result.estimatedPmiMinHours / 24).toFixed(1)} to ${(result.estimatedPmiMaxHours / 24).toFixed(1)} days)
• Point Optimum PMI:      ${result.estimatedPmiOptimalHours} Hours (~${(result.estimatedPmiOptimalHours / 24).toFixed(1)} days)
• Estimated TOD Window:   ${result.estimatedTimeOfDeathMin} to ${result.estimatedTimeOfDeathMax}
• Model Harmony / Score:  ${result.confidenceScore}% (${result.confidenceTier})
• Dominant Anchors:       ${result.dominantIndicatorSummary.join(", ")}

--------------------------------------------------------------------------------
FORENSIC INDICATOR MODULE EVALUATION:
1. ALGOR MORTIS (HENSSGE NOMOGRAM):
   • Status:              ${caseData.algorMortis.enabled ? "ACTIVE" : "BYPASSED / OFF"}
   • Rectal / Core Temp:  ${caseData.algorMortis.enabled ? `${caseData.algorMortis.rectalTempC} °C` : "N/A"}
   • Clothing Factor (Cf): ${caseData.algorMortis.enabled ? `${caseData.algorMortis.clothingCoveringFactor} (${caseData.algorMortis.clothingDescription || "Standard"})` : "N/A"}
   • Air Current & Wet:   ${caseData.algorMortis.enabled ? `${caseData.algorMortis.airCurrentVelocity}, Wet: ${caseData.algorMortis.isBodyWet ? "Yes" : "No"}` : "N/A"}

2. LIVOR MORTIS (HYPOSTASIS):
   • Status:              ${caseData.livorMortis.enabled ? "ACTIVE" : "BYPASSED / OFF"}
   • Blanchability:       ${caseData.livorMortis.enabled ? caseData.livorMortis.blanchability.replace(/_/g, " ") : "N/A"}
   • Color Hue:           ${caseData.livorMortis.enabled ? caseData.livorMortis.colorHue : "N/A"}
   • Distribution Pattern:${caseData.livorMortis.enabled ? caseData.livorMortis.distributionPattern.replace(/_/g, " ") : "N/A"}
   • Relocation Suspected:${caseData.livorMortis.enabled ? (caseData.livorMortis.suspectedBodyMovement ? "YES (DISCORDANCE DETECTED)" : "No") : "N/A"}
   • Examiner Livor Note: ${caseData.livorMortis.enabled ? (caseData.livorMortis.notes || "None") : "N/A"}

3. RIGOR MORTIS (NYSTEN LAW):
   • Status:              ${caseData.rigorMortis.enabled ? "ACTIVE" : "BYPASSED / OFF"}
   • Progression Stage:   ${caseData.rigorMortis.enabled ? caseData.rigorMortis.progressionStage.replace(/_/g, " ") : "N/A"}
   • Muscle Involvement:  ${caseData.rigorMortis.enabled ? `Jaw: ${caseData.rigorMortis.muscleGroups.jawTemporomandibular ? "Yes" : "No"} | Neck: ${caseData.rigorMortis.muscleGroups.neckCervical ? "Yes" : "No"} | Upper Limbs: ${caseData.rigorMortis.muscleGroups.upperLimbsElbowsWrists ? "Yes" : "No"} | Trunk: ${caseData.rigorMortis.muscleGroups.trunkAbdomen ? "Yes" : "No"} | Lower Limbs: ${caseData.rigorMortis.muscleGroups.lowerLimbsKneesAnkles ? "Yes" : "No"}` : "N/A"}
   • Pre-Death Exertion:  ${caseData.rigorMortis.enabled ? caseData.rigorMortis.preDeathPhysicalExertion.replace(/_/g, " ") : "N/A"}
   • Cold Stiffening:     ${caseData.rigorMortis.enabled ? (caseData.rigorMortis.coldStiffeningSuspected ? "SUSPECTED" : "None") : "N/A"}

4. DECOMPOSITION & ME термо (MEGYESI TOTAL BODY SCORE / ADD):
   • Status:              ${caseData.decomposition.enabled ? "ACTIVE" : "BYPASSED / OFF"}
   • Head/Neck Score:     ${caseData.decomposition.enabled ? `${caseData.decomposition.headNeckScore}/13` : "N/A"}
   • Trunk Score:         ${caseData.decomposition.enabled ? `${caseData.decomposition.trunkScore}/12` : "N/A"}
   • Limbs Score:         ${caseData.decomposition.enabled ? `${caseData.decomposition.limbsScore}/10` : "N/A"}
   • Total Body Score:    ${caseData.decomposition.enabled ? `TBS ${caseData.decomposition.totalBodyScore}/35` : "N/A"}
   • Key Morphologies:    ${caseData.decomposition.enabled ? `Marbling: ${caseData.decomposition.marblingPresent ? "Yes" : "No"} | Greening: ${caseData.decomposition.rightIliacDiscoloration ? "Yes" : "No"} | Bloat/Purge: ${caseData.decomposition.bloatingAndPurge ? "Yes" : "No"} | Bullae/Slippage: ${caseData.decomposition.skinSlippageBullae ? "Yes" : "No"} | Mummification: ${caseData.decomposition.mummificationOrAdipocere ? "Yes" : "No"} | Bone Exposed: ${caseData.decomposition.skeletonizationBoneExposed ? "Yes" : "No"}` : "N/A"}

5. FORENSIC ENTOMOLOGY (INSECT SUCCESSION & ADH):
   • Status:              ${caseData.entomology.enabled ? "ACTIVE" : "BYPASSED / OFF"}
   • Primary Insect Taxon:${caseData.entomology.enabled ? caseData.entomology.primaryInsectGroup.replace(/_/g, " ") : "N/A"}
   • Colonization Stage:  ${caseData.entomology.enabled ? caseData.entomology.developmentalStage.replace(/_/g, " ") : "N/A"}
   • Mean Larval Length:  ${caseData.entomology.enabled ? `${caseData.entomology.larvalLengthMm} mm` : "N/A"}
   • Maggot Mass Temp:    ${caseData.entomology.enabled ? `${caseData.entomology.maggotMassTempC} °C` : "N/A"}
   • Indoor Access Delay: ${caseData.entomology.enabled ? `${caseData.entomology.indoorAccessDelayHours} hours` : "N/A"}

6. VITREOUS METABOLOMICS & BIOCHEMISTRY:
   • Status:              ${caseData.metabolomics.enabled ? "ACTIVE" : "BYPASSED / OFF"}
   • Vitreous [K+]:       ${caseData.metabolomics.enabled ? `${caseData.metabolomics.vitreousPotassiumMmolL} mmol/L` : "N/A"}
   • Vitreous Hypoxanthine:${caseData.metabolomics.enabled && caseData.metabolomics.vitreousHypoxanthineUmolL ? `${caseData.metabolomics.vitreousHypoxanthineUmolL} µmol/L` : "N/A"}
   • Renal Disease/Trauma:${caseData.metabolomics.enabled ? (caseData.metabolomics.suspectedRenalFailureOrTrauma ? "SUSPECTED (K+ ELEVATION CAVEAT)" : "None") : "N/A"}

--------------------------------------------------------------------------------
PHOTOGRAPHIC EVIDENCE & COMPUTER VISION OBSERVATIONS:
${
  imagesList.length > 0
    ? `• Total Photos Uploaded: ${imagesList.length}\n` +
      (visionData?.forensicObservations ? `• Photo Analysis Summary: ${visionData.forensicObservations}\n` : "") +
      imagesList
        .map(
          (img, idx) =>
            `  [Photo ${idx + 1}] Tag: ${(img.tag || "Scene").toUpperCase()} | Name: ${img.name}${
              img.detectedFindings ? ` | AI Findings: ${img.detectedFindings}` : ""
            }`
        )
        .join("\n") +
      `\n• Vision Estimated TBS: ${visionData?.estimatedTbs ? `TBS ${visionData.estimatedTbs.totalScore}/35` : "N/A"}` +
      `\n• Vision Detected Livor: ${visionData?.detectedLivor ? `${visionData.detectedLivor.colorClassification} (${visionData.detectedLivor.distribution})` : "N/A"}` +
      `\n• Vision Detected Insects: ${visionData?.detectedEntomology ? `${visionData.detectedEntomology.primaryInsectStage || "Present"}` : "N/A"}`
    : "No photographic evidence or computer vision detections attached."
}
${
  caseData.examinersNotes && caseData.examinersNotes.trim().length > 0
    ? `\n--------------------------------------------------------------------------------\nEXAMINER'S QUALITATIVE PATHOLOGY NOTES & NARRATIVE:\n${caseData.examinersNotes}\n`
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

  const handleDownloadText = () => {
    const text = generateReportPlainText();
    const filename = `VisionMortis-Report-${caseData.caseId || "Case"}.txt`;
    triggerFileDownload(text, filename, "text/plain;charset=utf-8");
    setDownloadSuccess("Text Report Downloaded");
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const handleDownloadJson = () => {
    const payload = {
      reportType: "VisionMortis Forensic Case Report",
      system: "VisionMortis by Protocol One",
      researchNotice: "Research Prototype - Forensic Decision Support",
      generatedAt: new Date().toISOString(),
      fileNumberValidation: caseValidation,
      integritySecurityHash: integrityHash,
      caseData,
      visionEvidence: visionData || { imagesCount: 0 },
      compositeResult: result,
    };
    const jsonStr = JSON.stringify(payload, null, 2);
    const filename = `VisionMortis-Archive-${caseData.caseId || "Case"}.json`;
    triggerFileDownload(jsonStr, filename, "application/json;charset=utf-8");
    setDownloadSuccess("JSON Archive Downloaded");
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const handleDownloadHtml = () => {
    downloadForensicHtmlReport(caseData, result, visionData, integrityHash);
    setDownloadSuccess("HTML Report Downloaded");
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const handlePrint = () => {
    setDownloadSuccess("PDF & Print Dossier Downloaded!");
    setTimeout(() => setDownloadSuccess(null), 3500);
    printForensicCaseReport(caseData, result, visionData, integrityHash);
  };

  const handleCopy = () => {
    const text = generateReportPlainText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8 max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-150">
        {/* Header with Direct Download & Action Controls */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100">Standardized Case Report</h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800">
                  by Protocol One
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-slate-400">Case #{caseData.caseId || "Unassigned"}</span>
                <span className="text-[10px] font-bold text-[#D4AF37] tracking-wider uppercase">
                  • Research Prototype
                </span>
              </div>
            </div>
          </div>

          {/* Download & Export Toolbar */}
          <div className="flex items-center flex-wrap gap-2">
            {downloadSuccess && (
              <span className="text-xs text-emerald-400 font-semibold px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-800 animate-in fade-in">
                {downloadSuccess}
              </span>
            )}

            {/* Download Charts Dropdown / Quick Group */}
            <div className="flex items-center gap-1 p-1 bg-slate-950/80 border border-slate-800 rounded-xl">
              <button
                type="button"
                onClick={async () => {
                  setDownloadSuccess("Downloading Henssge Curve PNG...");
                  const svg = generateHenssgeCoolingSvg(result, caseData);
                  await downloadSvgAsPng(svg, `Henssge-CoolingCurve-${caseData.caseId || "CASE"}.png`);
                  setTimeout(() => setDownloadSuccess(null), 3000);
                }}
                title="Download Henssge Cooling Trajectory Chart (PNG)"
                className="px-2 py-1 rounded-lg hover:bg-slate-800 text-teal-400 text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors"
              >
                <LineChart className="w-3 h-3" />
                <span>Cooling Curve</span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  setDownloadSuccess("Downloading PMI Distribution PNG...");
                  const svg = generatePmiDistributionSvg(result, caseData);
                  await downloadSvgAsPng(svg, `PMI-ProbabilityDensity-${caseData.caseId || "CASE"}.png`);
                  setTimeout(() => setDownloadSuccess(null), 3000);
                }}
                title="Download PMI Probability Density Curve (PNG)"
                className="px-2 py-1 rounded-lg hover:bg-slate-800 text-sky-400 text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors"
              >
                <TrendingUp className="w-3 h-3" />
                <span>PMI Density</span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  setDownloadSuccess("Downloading Factor Attribution PNG...");
                  const svg = generateFactorAttributionSvg(result, null, caseData);
                  await downloadSvgAsPng(svg, `FactorAttribution-SHAP-${caseData.caseId || "CASE"}.png`);
                  setTimeout(() => setDownloadSuccess(null), 3000);
                }}
                title="Download Factor Attribution & SHAP Chart (PNG)"
                className="px-2 py-1 rounded-lg hover:bg-slate-800 text-amber-400 text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors"
              >
                <BarChart3 className="w-3 h-3" />
                <span>Attribution</span>
              </button>
            </div>

            {/* Download HTML Button */}
            <button
              type="button"
              onClick={handleDownloadHtml}
              title="Download standalone HTML Case Report with embedded charts"
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-teal-900/60"
            >
              <Download className="w-3.5 h-3.5" />
              <span>.HTML</span>
            </button>

            {/* Download Text Button */}
            <button
              type="button"
              onClick={handleDownloadText}
              title="Download plain text report"
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
            >
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>.TXT</span>
            </button>

            {/* Download JSON Button */}
            <button
              type="button"
              onClick={handleDownloadJson}
              title="Download raw JSON Case archive"
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
            >
              <FileCode className="w-3.5 h-3.5 text-slate-400" />
              <span>.JSON</span>
            </button>

            {/* Copy Button */}
            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied!" : "Copy"}</span>
            </button>

            {/* Print Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-teal-950/40 cursor-pointer"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Report</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors ml-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div id="printable-modal-report" className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-slate-300 text-xs bg-slate-900 leading-relaxed">
          {/* Report Masthead */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/90 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 overflow-hidden">
            <div className="flex items-start sm:items-center gap-3 sm:gap-3.5 w-full md:w-auto min-w-0">
              <RecreatedLogo className="w-10 h-10 shrink-0" showSubtitle={false} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <h1 className="text-sm sm:text-base font-bold text-slate-100 tracking-tight">
                    VISIONMORTIS FORENSIC DOSSIER
                  </h1>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-teal-950/90 text-teal-400 border border-teal-800 whitespace-nowrap shrink-0">
                    by Protocol One
                  </span>
                </div>
                <div className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">
                  Post Mortem Interval Estimation Report
                </div>
                <div className="text-[10px] sm:text-[11px] font-bold text-[#D4AF37] tracking-wider uppercase mt-0.5">
                  Research Prototype
                </div>
              </div>
            </div>

            <div className="w-full md:w-auto text-left md:text-right text-[11px] space-y-0.5 text-slate-400 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800/60 shrink-0">
              <div>
                Case ID: <span className="text-teal-400 font-mono font-bold text-xs">{caseData.caseId || "Unassigned"}</span>
              </div>
              <div>Generated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</div>
              <div>Examiner: {caseData.investigatorName || caseData.examinerName || "Staff Medical Examiner"}</div>
              <div className="text-[10px] font-mono text-slate-500 break-all">Hash: {integrityHash}</div>
            </div>
          </div>

          {/* Preset Benchmark Case Banner (if preset used) */}
          {(caseData.presetName || caseData.isPresetCase) && (
            <div className="p-3.5 rounded-xl bg-teal-950/40 border border-teal-500/40 flex items-start gap-3 text-xs animate-in fade-in duration-150">
              <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300 shrink-0 mt-0.5">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-bold text-teal-300 uppercase tracking-wider">
                    Preset Reference Case Profile:
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-teal-900/80 text-teal-200 border border-teal-700/80">
                    {caseData.presetCategory || "Benchmark Case"}
                  </span>
                  {caseData.isHarmonicPreset ? (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                      ✓ Harmonic Baseline (0 Discordance)
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                      Specialized Profile
                    </span>
                  )}
                </div>
                <div className="font-bold text-slate-100 text-xs sm:text-sm mt-0.5">
                  {caseData.presetName || caseData.subjectNameOrIdentifier}
                </div>
                {caseData.presetDescription && (
                  <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                    {caseData.presetDescription}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Demographics & Discovery Baseline */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-xs">
            <div>
              <div className="text-slate-500 text-[10px] uppercase font-bold">Subject ID</div>
              <div className="font-semibold text-slate-200 mt-0.5">{caseData.subjectNameOrIdentifier || "Unidentified"}</div>
            </div>
            <div>
              <div className="text-slate-500 text-[10px] uppercase font-bold">Age / Sex</div>
              <div className="font-semibold text-slate-200 mt-0.5">
                {caseData.ageYears ? `${caseData.ageYears} yrs` : "Unknown"} / {caseData.sex}
              </div>
            </div>
            <div>
              <div className="text-slate-500 text-[10px] uppercase font-bold">Discovery Time</div>
              <div className="font-semibold text-slate-200 mt-0.5">{caseData.discoveryTimestamp || "Unrecorded"}</div>
            </div>
            <div>
              <div className="text-slate-500 text-[10px] uppercase font-bold">Scene Position</div>
              <div className="font-semibold text-slate-200 uppercase mt-0.5">{caseData.bodyFoundPosition}</div>
            </div>
          </div>

          {/* Primary Conclusion Box */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-teal-950/60 via-slate-950 to-slate-950 border border-teal-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-teal-300 uppercase tracking-wider">
                Consensus Post-Mortem Interval & Time of Death
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-700 text-xs font-mono font-bold">
                {result.confidenceScore}% Confidence ({result.confidenceTier})
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-xs text-slate-400 font-medium">Estimated PMI Window:</div>
                <div className="text-2xl font-bold font-mono text-teal-300 mt-1">
                  {result.estimatedPmiMinHours} – {result.estimatedPmiMaxHours} Hours
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Point Optimum: <strong className="text-slate-200">{result.estimatedPmiOptimalHours} hrs</strong> (~{(result.estimatedPmiOptimalHours / 24).toFixed(1)} days)
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-xs text-slate-400 font-medium">Estimated Time of Death (TOD):</div>
                <div className="text-base font-bold font-mono text-emerald-300 mt-1">
                  {result.estimatedTimeOfDeathMin}
                </div>
                <div className="text-xs text-slate-400">to {result.estimatedTimeOfDeathMax}</div>
              </div>
            </div>
          </div>

          {/* All 6 Forensic Modules System Breakdown Table */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-400" />
              <span>Forensic Modules & Observations Breakdown</span>
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-800 rounded-xl overflow-hidden">
                <thead className="bg-slate-950 text-slate-400 text-xs">
                  <tr>
                    <th className="p-3 font-medium">Indicator Module</th>
                    <th className="p-3 font-medium">Observed Parameters</th>
                    <th className="p-3 font-medium">Derived Window</th>
                    <th className="p-3 font-medium">Weight</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300 bg-slate-950/40">
                  {/* Algor */}
                  <tr>
                    <td className="p-3 font-semibold text-slate-200 flex items-center gap-1.5">
                      <Thermometer className="w-3.5 h-3.5 text-rose-400" /> Algor Mortis
                    </td>
                    <td className="p-3 text-slate-300">
                      {caseData.algorMortis.enabled
                        ? `Rectal: ${caseData.algorMortis.rectalTempC}°C | Ambient: ${caseData.ambientTempC}°C | Cf: ${caseData.algorMortis.clothingCoveringFactor}`
                        : "Bypassed / Disabled"}
                    </td>
                    <td className="p-3 font-mono text-teal-300">
                      {caseData.algorMortis.enabled
                        ? `${result.indicatorEvaluations.find(e => e.category === "Algor")?.estimatedPmiMinHours || 0} – ${result.indicatorEvaluations.find(e => e.category === "Algor")?.estimatedPmiMaxHours || 24}h`
                        : "N/A"}
                    </td>
                    <td className="p-3 font-mono">
                      {result.indicatorEvaluations.find(e => e.category === "Algor")?.weightInFinalCalculation || 0}%
                    </td>
                  </tr>

                  {/* Livor */}
                  <tr>
                    <td className="p-3 font-semibold text-slate-200 flex items-center gap-1.5">
                      <Droplet className="w-3.5 h-3.5 text-purple-400" /> Livor Mortis
                    </td>
                    <td className="p-3 text-slate-300">
                      {caseData.livorMortis.enabled
                        ? `${caseData.livorMortis.colorHue} hue | ${caseData.livorMortis.blanchability.replace(/_/g, " ")} | Pattern: ${caseData.livorMortis.distributionPattern.replace(/_/g, " ")}`
                        : "Bypassed / Disabled"}
                    </td>
                    <td className="p-3 font-mono text-teal-300">
                      {caseData.livorMortis.enabled
                        ? `${result.indicatorEvaluations.find(e => e.category === "Livor")?.estimatedPmiMinHours || 0} – ${result.indicatorEvaluations.find(e => e.category === "Livor")?.estimatedPmiMaxHours || 12}h`
                        : "N/A"}
                    </td>
                    <td className="p-3 font-mono">
                      {result.indicatorEvaluations.find(e => e.category === "Livor")?.weightInFinalCalculation || 0}%
                    </td>
                  </tr>

                  {/* Rigor */}
                  <tr>
                    <td className="p-3 font-semibold text-slate-200 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-amber-400" /> Rigor Mortis
                    </td>
                    <td className="p-3 text-slate-300">
                      {caseData.rigorMortis.enabled
                        ? `${caseData.rigorMortis.progressionStage.replace(/_/g, " ")} | Exertion: ${caseData.rigorMortis.preDeathPhysicalExertion.replace(/_/g, " ")}`
                        : "Bypassed / Disabled"}
                    </td>
                    <td className="p-3 font-mono text-teal-300">
                      {caseData.rigorMortis.enabled
                        ? `${result.indicatorEvaluations.find(e => e.category === "Rigor")?.estimatedPmiMinHours || 0} – ${result.indicatorEvaluations.find(e => e.category === "Rigor")?.estimatedPmiMaxHours || 36}h`
                        : "N/A"}
                    </td>
                    <td className="p-3 font-mono">
                      {result.indicatorEvaluations.find(e => e.category === "Rigor")?.weightInFinalCalculation || 0}%
                    </td>
                  </tr>

                  {/* Decomposition */}
                  <tr>
                    <td className="p-3 font-semibold text-slate-200 flex items-center gap-1.5">
                      <Skull className="w-3.5 h-3.5 text-emerald-400" /> Decomposition / TBS
                    </td>
                    <td className="p-3 text-slate-300">
                      {caseData.decomposition.enabled
                        ? `TBS ${caseData.decomposition.totalBodyScore}/35 (Head ${caseData.decomposition.headNeckScore}, Trunk ${caseData.decomposition.trunkScore}, Limbs ${caseData.decomposition.limbsScore})`
                        : "Bypassed / Disabled"}
                    </td>
                    <td className="p-3 font-mono text-teal-300">
                      {caseData.decomposition.enabled
                        ? `${result.indicatorEvaluations.find(e => e.category === "Decomposition")?.estimatedPmiMinHours || 24} – ${result.indicatorEvaluations.find(e => e.category === "Decomposition")?.estimatedPmiMaxHours || 720}h`
                        : "N/A"}
                    </td>
                    <td className="p-3 font-mono">
                      {result.indicatorEvaluations.find(e => e.category === "Decomposition")?.weightInFinalCalculation || 0}%
                    </td>
                  </tr>

                  {/* Entomology */}
                  <tr>
                    <td className="p-3 font-semibold text-slate-200 flex items-center gap-1.5">
                      <Bug className="w-3.5 h-3.5 text-teal-400" /> Entomology
                    </td>
                    <td className="p-3 text-slate-300">
                      {caseData.entomology.enabled
                        ? `${caseData.entomology.primaryInsectGroup.replace(/_/g, " ")} | ${caseData.entomology.developmentalStage.replace(/_/g, " ")} | ${caseData.entomology.larvalLengthMm}mm`
                        : "Bypassed / Disabled"}
                    </td>
                    <td className="p-3 font-mono text-teal-300">
                      {caseData.entomology.enabled
                        ? `${result.indicatorEvaluations.find(e => e.category === "Entomology")?.estimatedPmiMinHours || 0} – ${result.indicatorEvaluations.find(e => e.category === "Entomology")?.estimatedPmiMaxHours || 240}h`
                        : "N/A"}
                    </td>
                    <td className="p-3 font-mono">
                      {result.indicatorEvaluations.find(e => e.category === "Entomology")?.weightInFinalCalculation || 0}%
                    </td>
                  </tr>

                  {/* Metabolomics */}
                  <tr>
                    <td className="p-3 font-semibold text-slate-200 flex items-center gap-1.5">
                      <TestTube2 className="w-3.5 h-3.5 text-sky-400" /> Vitreous [K+]
                    </td>
                    <td className="p-3 text-slate-300">
                      {caseData.metabolomics.enabled
                        ? `[K+] ${caseData.metabolomics.vitreousPotassiumMmolL} mmol/L (Madea/Sturner)`
                        : "Bypassed / Disabled"}
                    </td>
                    <td className="p-3 font-mono text-teal-300">
                      {caseData.metabolomics.enabled
                        ? `${result.indicatorEvaluations.find(e => e.category === "Metabolomics")?.estimatedPmiMinHours || 0} – ${result.indicatorEvaluations.find(e => e.category === "Metabolomics")?.estimatedPmiMaxHours || 48}h`
                        : "N/A"}
                    </td>
                    <td className="p-3 font-mono">
                      {result.indicatorEvaluations.find(e => e.category === "Metabolomics")?.weightInFinalCalculation || 0}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Photographic & Multimodal Computer Vision Evidence Section */}
          {imagesList.length > 0 ? (
            <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Camera className="w-4 h-4 text-teal-400" />
                  <span>Photographic Evidence Log ({imagesList.length} Uploaded)</span>
                </h3>
                <span className="text-[10px] text-teal-400 font-mono">Computer Vision Monitored</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {imagesList.map((img, i) => (
                  <div key={img.id || i} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
                    <img
                      src={img.dataUrl}
                      alt={img.name}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-lg object-cover bg-slate-950 border border-slate-700 shrink-0"
                    />
                    <div className="space-y-1 min-w-0 text-xs">
                      <div className="font-semibold text-slate-200 truncate">{img.name}</div>
                      <span className="inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-teal-300">
                        {img.tag ? img.tag.replace(/_/g, " ") : "Scene"}
                      </span>
                      {img.detectedFindings && (
                        <div className="text-[11px] text-slate-400 truncate">{img.detectedFindings}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <Camera className="w-4 h-4 text-slate-500 shrink-0" />
              <span><strong>Photographic Evidence:</strong> No photos submitted for this case record.</span>
            </div>
          )}

          {/* Examiner's Notes Section in Report */}
          <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-teal-400" />
                <span>Examiner&apos;s Qualitative Autopsy Notes</span>
              </h3>
              <span className="text-[10px] text-slate-500 font-medium">Official Pathology Record</span>
            </div>
            <div className="text-xs text-slate-300 bg-slate-900/80 p-4 rounded-xl border border-slate-800/80 whitespace-pre-wrap leading-relaxed">
              {caseData.examinersNotes || "No specific qualitative notes provided by the medical examiner for this case."}
            </div>
          </div>

          {/* Inconsistency Alerts Section */}
          {result.inconsistenciesDetected && (
            <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-800/60 space-y-3">
              <h3 className="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Detected Physiological Discrepancies & Conflicts</span>
              </h3>
              <div className="space-y-2">
                {result.inconsistencyAlerts.map((alt) => (
                  <div key={alt.id} className="p-3.5 rounded-xl bg-slate-950/70 border border-rose-900/60 space-y-1">
                    <div className="font-bold text-rose-300">{alt.title}</div>
                    <p className="text-slate-300 text-xs leading-relaxed">{alt.description}</p>
                    <div className="text-xs text-amber-300 mt-1">
                      <strong>Investigative Implication: </strong>
                      {alt.forensicImplication}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Pathologist Synthesis */}
          {result.aiSynthesis && (
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-teal-900/40 space-y-3">
              <h3 className="text-xs font-bold text-teal-300 uppercase tracking-wider">
                AI Pathologist Synthesis & Recommendations
              </h3>
              <p className="text-slate-300 leading-relaxed text-xs">
                {result.aiSynthesis.expertSummary}
              </p>
              {result.aiSynthesis.recommendedConfirmatoryTests && (
                <div className="pt-3 border-t border-slate-800/80">
                  <span className="font-semibold text-slate-300 block mb-1 text-xs">Recommended Confirmatory Protocols:</span>
                  <ul className="list-disc pl-5 space-y-1 text-slate-400 text-xs">
                    {result.aiSynthesis.recommendedConfirmatoryTests.map((test, i) => (
                      <li key={i}>{test}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Digital Chain of Custody & Examiner Sign-Off Block */}
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-teal-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Digital Chain of Custody & Examiner Sign-Off
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Record Hash: {integrityHash}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
              <div className="space-y-2">
                <span className="text-slate-500 font-medium">Attending Pathologist:</span>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 font-semibold truncate">
                  {caseData.investigatorName || "Staff Medical Examiner"}
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-slate-500 font-medium">Official Signature:</span>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 font-mono text-teal-300 text-center italic">
                  /s/ {caseData.investigatorName ? caseData.investigatorName.split(" ")[0] : "Verified"} (Digital Seal)
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-slate-500 font-medium">Execution Timestamp:</span>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-mono text-center">
                  {new Date().toISOString().slice(0, 16).replace("T", " ")}
                </div>
              </div>
            </div>
          </div>

          {/* UAE Gold Medico-Legal Disclaimer Box */}
          <div className="p-4 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/40 text-[#E5C158] space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-[#D4AF37] text-xs">
              <AlertTriangle className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span>RESEARCH PROTOTYPE & MEDICO-LEGAL DISCLAIMER</span>
            </div>
            <p className="text-xs leading-relaxed text-[#E5C158]/90">
              <strong>VisionMortis</strong> is an AI-assisted decision-support research prototype engineered by <strong>Protocol One</strong>. Estimations produced by this platform must always be correlated with complete forensic autopsy findings, scene context, toxicology, and histological analysis.
            </p>
          </div>

          {/* Medico-Legal Attribution Footer */}
          <div className="pt-4 border-t border-slate-800 text-center text-[11px] text-slate-500 space-y-1">
            <div>
              Generated by <strong>VisionMortis</strong> • Designed and Engineered by <strong>Protocol One</strong>
            </div>
            <div className="text-[10px] text-[#D4AF37] font-semibold">
              Research Prototype • Decision Support Only • Hash: {integrityHash}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ReportModal;
