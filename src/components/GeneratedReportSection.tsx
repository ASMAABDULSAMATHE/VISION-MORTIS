import React, { useState } from "react";
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
} from "lucide-react";
import { RecreatedLogo } from "./RecreatedLogo";
import { validateCaseId, generateCaseIntegrityHash } from "../utils/validation";
import { printForensicCaseReport, downloadForensicHtmlReport, exportForensicCaseReportPdf } from "../utils/printReport";

interface Props {
  caseData: ForensicCaseInput;
  result: PmiCalculationResult;
  visionData?: VisionDetectionData;
  onScrollToSection?: (sectionId: string) => void;
  onBackToWorkspace?: (targetModule?: string) => void;
}

export const GeneratedReportSection: React.FC<Props> = ({
  caseData,
  result,
  visionData,
  onScrollToSection,
  onBackToWorkspace,
}) => {
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

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
• Case / File Number:     ${caseData.caseId || "Not Assigned"} ${caseValidation.isValid ? "[VALIDATED]" : "[FORMAT WARNING]"}
• Subject Identification: ${caseData.subjectNameOrIdentifier || "Unidentified Doe"}
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
FORENSIC INDICATOR MODULE EVALUATION & INPUTS:
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

3. RIGOR MORTIS (NYSTEN LAW):
   • Status:              ${caseData.rigorMortis.enabled ? "ACTIVE" : "BYPASSED / OFF"}
   • Progression Stage:   ${caseData.rigorMortis.enabled ? caseData.rigorMortis.progressionStage.replace(/_/g, " ") : "N/A"}
   • Muscle Involvement:  ${caseData.rigorMortis.enabled ? `Jaw: ${caseData.rigorMortis.muscleGroups.jawTemporomandibular ? "Yes" : "No"} | Neck: ${caseData.rigorMortis.muscleGroups.neckCervical ? "Yes" : "No"} | Upper Limbs: ${caseData.rigorMortis.muscleGroups.upperLimbsElbowsWrists ? "Yes" : "No"} | Trunk: ${caseData.rigorMortis.muscleGroups.trunkAbdomen ? "Yes" : "No"} | Lower Limbs: ${caseData.rigorMortis.muscleGroups.lowerLimbsKneesAnkles ? "Yes" : "No"}` : "N/A"}
   • Pre-Death Exertion:  ${caseData.rigorMortis.enabled ? caseData.rigorMortis.preDeathPhysicalExertion.replace(/_/g, " ") : "N/A"}
   • Cold Stiffening:     ${caseData.rigorMortis.enabled ? (caseData.rigorMortis.coldStiffeningSuspected ? "SUSPECTED" : "None") : "N/A"}

4. DECOMPOSITION (MEGYESI TOTAL BODY SCORE / ADD):
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
   • Active Metabolites:  ${caseData.metabolomics.enabled && caseData.metabolomics.activeMetabolites?.length ? caseData.metabolomics.activeMetabolites.map(m => `${m.name}: ${m.value} ${m.unit}`).join("; ") : "Standard vitreous panel"}
   • Renal Disease/Trauma:${caseData.metabolomics.enabled ? (caseData.metabolomics.suspectedRenalFailureOrTrauma ? "SUSPECTED (K+ ELEVATION CAVEAT)" : "None") : "N/A"}

--------------------------------------------------------------------------------
PHOTOGRAPHIC EVIDENCE & COMPUTER VISION OBSERVATIONS:
${
  imagesList.length > 0
    ? `• Total Photos Uploaded: ${imagesList.length}\n` +
      imagesList
        .map(
          (img, idx) =>
            `  [Photo ${idx + 1}] Tag: ${(img.tag || "Scene").toUpperCase()} | Name: ${img.name}${
              img.isUnrelated ? " [FLAGGED UNRELATED]" : ""
            }${img.qualityRating ? ` [Quality: ${img.qualityRating}]` : ""}${
              img.detectedFindings ? ` | AI Findings: ${img.detectedFindings}` : ""
            }`
        )
        .join("\n") +
      `\n• Vision Estimated TBS: ${visionData?.estimatedTbs ? `TBS ${visionData.estimatedTbs.totalScore}/35` : "N/A"}` +
      `\n• Vision Detected Livor: ${visionData?.detectedLivor ? `${visionData.detectedLivor.colorClassification} (${visionData.detectedLivor.distribution})` : "N/A"}` +
      `\n• Vision Detected Insects: ${visionData?.detectedEntomology ? `${visionData.detectedEntomology.primaryInsectStage || "Present"}` : "N/A"}`
    : "No photographic evidence or computer vision detections attached."
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

  const handleDownloadPdf = async () => {
    setDownloadSuccess("Generating PDF Document...");
    const success = await exportForensicCaseReportPdf(caseData, result, visionData, integrityHash);
    if (success) {
      setDownloadSuccess("PDF Report Downloaded");
    } else {
      setDownloadSuccess("HTML Fallback Report Downloaded");
    }
    setTimeout(() => setDownloadSuccess(null), 3500);
  };

  const handlePrint = () => {
    setDownloadSuccess("Invoking Print & Generating PDF...");
    setTimeout(() => setDownloadSuccess(null), 3000);
    try {
      printForensicCaseReport(caseData, result, visionData, integrityHash);
    } catch {
      window.print();
    }
  };

  return (
    <section
      id="generated-report-section"
      className="rounded-2xl bg-slate-900/95 border-2 border-teal-500/40 p-5 sm:p-8 space-y-6 shadow-2xl transition-all"
    >
      {/* Top Header Bar with Actions */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-800 pb-5 no-print">
        <div className="flex items-center gap-3">
          {onBackToWorkspace && (
            <button
              type="button"
              onClick={() => onBackToWorkspace()}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 hover:border-teal-500/50 flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition-colors shrink-0"
              title="Return to Case Workspace & Edit Data"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Workspace</span>
            </button>
          )}
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-bold text-slate-100 tracking-tight">
                Forensic Case Report
              </h2>
              <span className="text-[10px] sm:text-xs font-semibold px-2 sm:px-2.5 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-800">
                Official Report Document
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Comprehensive multimodal estimation report including all case inputs, scene parameters, and photographic evidence.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto no-print">
          <button
            type="button"
            onClick={handleCopyText}
            className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
            <span>{copied ? "Copied Plaintext" : "Copy Text"}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadTxt}
            className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
          >
            <Download className="w-4 h-4 text-teal-400" />
            <span>.TXT</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadJson}
            className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
          >
            <FileCode className="w-4 h-4 text-sky-400" />
            <span>.JSON</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadHtml}
            className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-teal-900/60"
            title="Download standalone print-ready HTML case report"
          >
            <Download className="w-4 h-4" />
            <span>.HTML</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-rose-900/60"
            title="Download direct PDF file"
          >
            <Download className="w-4 h-4" />
            <span>.PDF</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-teal-900/30 cursor-pointer"
            title="Invoke browser Print & save as PDF dialog"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {downloadSuccess && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-800 rounded-xl text-emerald-300 text-xs font-semibold flex items-center gap-2 no-print">
          <CheckCircle2 className="w-4 h-4" />
          <span>{downloadSuccess} successfully to your local machine.</span>
        </div>
      )}

      {/* Official Report Document Body */}
      <div id="official-case-report-content" className="bg-slate-950 rounded-2xl border border-slate-800 p-6 sm:p-8 space-y-8 text-slate-200">
        {/* Report Header / Brand */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-4">
            <RecreatedLogo className="w-14 h-14 shrink-0" showSubtitle={false} />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-slate-100 tracking-tight">VISIONMORTIS</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800">
                  PROTOCOL ONE
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
                Post-Mortem Interval Multimodal Forensic Case Report
              </p>
              <div className="text-[11px] text-[#D4AF37] font-medium mt-0.5">
                Research Prototype System
              </div>
            </div>
          </div>

          <div className="text-right space-y-1 text-xs">
            <div className="font-mono text-slate-400">
              Generated: <span className="text-slate-200">{new Date().toLocaleString()}</span>
            </div>
            <div className="font-mono text-[11px] text-slate-500 flex items-center justify-end gap-1">
              <Lock className="w-3 h-3 text-teal-400" />
              <span>SHA-256: {integrityHash}</span>
            </div>
          </div>
        </div>

        {/* 1. Case Identification & Demographics Summary */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>1. Case Demographics & Scene Baseline</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="text-[11px] text-slate-500">Case / File Number</div>
              <div className="font-mono font-bold text-sm text-slate-100 mt-0.5">
                {caseData.caseId || "Not Assigned"}
              </div>
              {caseValidation.isValid ? (
                <div className="text-[10px] text-teal-400 font-mono mt-1">✓ Validated Format</div>
              ) : (
                <div className="text-[10px] text-amber-400 font-mono mt-1">⚠ {caseValidation.error || "Format Warning"}</div>
              )}
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
                <span className={caseData.algorMortis.enabled ? "text-emerald-400" : "text-slate-500"}>
                  {caseData.algorMortis.enabled ? "Active" : "Bypassed"}
                </span>
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
                  <Droplet className="w-4 h-4" /> Livor Mortis (Hypostasis)
                </span>
                <span className={caseData.livorMortis.enabled ? "text-emerald-400" : "text-slate-500"}>
                  {caseData.livorMortis.enabled ? "Active" : "Bypassed"}
                </span>
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
                <span className={caseData.rigorMortis.enabled ? "text-emerald-400" : "text-slate-500"}>
                  {caseData.rigorMortis.enabled ? "Active" : "Bypassed"}
                </span>
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
                <span className={caseData.decomposition.enabled ? "text-emerald-400" : "text-slate-500"}>
                  {caseData.decomposition.enabled ? "Active" : "Bypassed"}
                </span>
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
                <span className={caseData.entomology.enabled ? "text-emerald-400" : "text-slate-500"}>
                  {caseData.entomology.enabled ? "Active" : "Bypassed"}
                </span>
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
                <span className={caseData.metabolomics.enabled ? "text-emerald-400" : "text-slate-500"}>
                  {caseData.metabolomics.enabled ? "Active" : "Bypassed"}
                </span>
              </div>
              {caseData.metabolomics.enabled ? (
                <div className="space-y-1 text-slate-400 font-mono text-[11px]">
                  <div>Vitreous [K⁺]: <span className="text-slate-200 font-bold">{caseData.metabolomics.vitreousPotassiumMmolL} mmol/L</span></div>
                  {caseData.metabolomics.vitreousHypoxanthineUmolL && (
                    <div>Vitreous Hypoxanthine: <span className="text-slate-200">{caseData.metabolomics.vitreousHypoxanthineUmolL} µmol/L</span></div>
                  )}
                  {caseData.metabolomics.activeMetabolites && caseData.metabolomics.activeMetabolites.length > 0 && (
                    <div>Active Analytes: <span className="text-slate-200">{caseData.metabolomics.activeMetabolites.map(m => `${m.name} (${m.value} ${m.unit})`).join(", ")}</span></div>
                  )}
                  <div>Renal Disease Caveat: <span className="text-slate-200">{caseData.metabolomics.suspectedRenalFailureOrTrauma ? "Present" : "None"}</span></div>
                </div>
              ) : (
                <div className="text-slate-500 italic">Not utilized in final composite.</div>
              )}
            </div>
          </div>
        </div>

        {/* 4. Photographic Evidence & Computer Vision Inspection (Includes Pictures) */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4" />
              <span>4. Photographic Evidence & Vision Inspection ({imagesList.length} Uploaded)</span>
            </div>
            {imagesList.length > 0 && (
              <span className="text-[11px] text-slate-400 font-mono">
                {imagesList.filter(img => !img.isUnrelated).length} Relevant Forensics
              </span>
            )}
          </div>

          {imagesList.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {imagesList.map((img, idx) => (
                <div
                  key={img.id || idx}
                  className={`rounded-xl border p-3 space-y-2.5 ${
                    img.isUnrelated
                      ? "bg-rose-950/30 border-rose-800/80"
                      : "bg-slate-900/80 border-slate-800"
                  }`}
                >
                  <div className="relative rounded-lg overflow-hidden bg-slate-950 aspect-video flex items-center justify-center border border-slate-800">
                    <img
                      src={img.previewUrl}
                      alt={img.name || `Forensic Evidence ${idx + 1}`}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2 left-2 flex items-center gap-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-950/90 text-slate-200 border border-slate-700">
                        Photo {idx + 1}
                      </span>
                      {img.isUnrelated ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Unrelated
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800">
                          {(img.tag || "Scene").replace(/_/g, " ")}
                        </span>
                      )}
                    </div>

                    {img.qualityRating && (
                      <div className="absolute bottom-2 right-2 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-950/90 text-slate-300 border border-slate-800">
                        Quality: {img.qualityRating}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="font-semibold text-slate-200 truncate">{img.name}</div>
                    {img.qualityWarning && (
                      <div className="text-[11px] text-amber-400 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 shrink-0" />
                        <span>{img.qualityWarning}</span>
                      </div>
                    )}
                    {img.detectedFindings ? (
                      <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                        <strong className="text-teal-400">AI Observation:</strong> {img.detectedFindings}
                      </p>
                    ) : (
                      <div className="text-[11px] text-slate-500 italic">No AI observations logged.</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-400 flex items-center gap-2">
              <Camera className="w-4 h-4 text-slate-500 shrink-0" />
              <span><strong>Photographic Evidence:</strong> No photos submitted for this case record.</span>
            </div>
          )}
        </div>

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
