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
} from "lucide-react";
import { RecreatedLogo } from "./RecreatedLogo";
import { validateCaseId, generateCaseIntegrityHash } from "../utils/validation";
import { printForensicCaseReport, downloadForensicHtmlReport, exportForensicCaseReportPdf } from "../utils/printReport";

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

--------------------------------------------------------------------------------
EXAMINER'S QUALITATIVE PATHOLOGY NOTES & NARRATIVE:
${caseData.examinersNotes || "No specific qualitative notes provided by the medical examiner."}

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
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>VisionMortis Forensic Case Report - ${caseData.caseId || "Case"}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #0b1120;
      color: #e2e8f0;
      margin: 0;
      padding: 30px;
      line-height: 1.6;
    }
    .container {
      max-width: 920px;
      margin: 0 auto;
      background: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 16px;
      padding: 36px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #14b8a6;
      padding-bottom: 20px;
      margin-bottom: 24px;
    }
    .brand-title {
      font-size: 24px;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.5px;
    }
    .badge-p1 {
      display: inline-block;
      background: #134e4a;
      color: #2dd4bf;
      border: 1px solid #0d9488;
      font-size: 11px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 6px;
      margin-left: 8px;
    }
    .gold-badge {
      color: #D4AF37;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 11px;
      letter-spacing: 1px;
      margin-top: 4px;
    }
    .pmi-card {
      background: linear-gradient(135deg, #134e4a33, #0f172a);
      border: 1px solid #14b8a6;
      border-radius: 12px;
      padding: 24px;
      margin: 24px 0;
    }
    .pmi-highlight {
      font-size: 28px;
      font-weight: 800;
      color: #2dd4bf;
      font-family: monospace;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }
    .card {
      background: #1e293b;
      border: 1px solid #334155;
      padding: 16px;
      border-radius: 10px;
    }
    .card-title {
      font-size: 11px;
      text-transform: uppercase;
      color: #94a3b8;
      font-weight: 700;
      margin-bottom: 6px;
    }
    .table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
    }
    .table th, .table td {
      border: 1px solid #334155;
      padding: 10px 14px;
      font-size: 13px;
      text-align: left;
    }
    .table th {
      background: #1e293b;
      color: #94a3b8;
    }
    .disclaimer-box {
      background: rgba(212, 175, 55, 0.1);
      border: 1px solid #D4AF37;
      color: #e5c158;
      padding: 18px;
      border-radius: 10px;
      margin-top: 30px;
      font-size: 12px;
    }
    .notes-box {
      background: #162032;
      border: 1px solid #293548;
      border-left: 4px solid #14b8a6;
      padding: 18px;
      border-radius: 8px;
      margin: 20px 0;
      white-space: pre-wrap;
      font-size: 13px;
      color: #cbd5e1;
    }
    .signoff-box {
      margin-top: 30px;
      padding: 20px;
      border: 1px dashed #475569;
      border-radius: 10px;
      background: #0b1120;
    }
    @media print {
      body { background: #ffffff; color: #000000; padding: 0; }
      .container { border: none; box-shadow: none; padding: 0; background: #ffffff; }
      .brand-title { color: #000000; }
      .card { background: #f8fafc; border: 1px solid #cbd5e1; color: #000000; }
      .pmi-card { background: #f0fdfa; border: 1px solid #0d9488; color: #000000; }
      .pmi-highlight { color: #0f766e; }
      .table th { background: #e2e8f0; color: #000000; }
      .table th, .table td { border-color: #cbd5e1; color: #000000; }
      .disclaimer-box { background: #fefce8; border-color: #ca8a04; color: #854d0e; }
      .notes-box { background: #f8fafc; border-color: #94a3b8; color: #000000; border-left-color: #0f766e; }
      .signoff-box { border-color: #94a3b8; background: #ffffff; color: #000000; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div>
        <span class="brand-title">VISIONMORTIS</span>
        <span class="badge-p1">by Protocol One</span>
        <div style="color: #94a3b8; font-size: 13px; margin-top: 4px;">Post Mortem Interval Estimation Report</div>
        <div class="gold-badge">Research Prototype</div>
      </div>
      <div style="text-align: right; font-size: 12px; color: #94a3b8;">
        <div><strong>Case: ${caseData.caseId || "Unassigned"}</strong></div>
        <div>Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</div>
        <div>Examiner: ${caseData.investigatorName || "Staff Medical Examiner"}</div>
        <div style="font-family: monospace; font-size: 10px; color: #64748b;">Hash: ${integrityHash}</div>
      </div>
    </div>

    <div class="grid">
      <div class="card">
        <div class="card-title">Subject Demographics</div>
        <div><strong>Subject ID:</strong> ${caseData.subjectNameOrIdentifier || "Unidentified"}</div>
        <div><strong>Age / Sex:</strong> ${caseData.ageYears ? `${caseData.ageYears} yrs` : "Unknown"} / ${caseData.sex}</div>
        <div><strong>Body Mass:</strong> ${caseData.bodyWeightKg} kg</div>
      </div>
      <div class="card">
        <div class="card-title">Discovery Scene Baseline</div>
        <div><strong>Scene Location:</strong> ${caseData.locationDescription || "Scene"}</div>
        <div><strong>Ambient Temperature:</strong> ${caseData.ambientTempC} °C</div>
        <div><strong>Discovery Position:</strong> ${caseData.bodyFoundPosition.toUpperCase()}</div>
      </div>
    </div>

    <div class="pmi-card">
      <div style="font-size: 13px; font-weight: 700; color: #2dd4bf; text-transform: uppercase;">
        Multimodal Consensus Post-Mortem Interval (PMI)
      </div>
      <div class="pmi-highlight">${result.estimatedPmiMinHours} – ${result.estimatedPmiMaxHours} Hours</div>
      <div style="font-size: 14px; margin-top: 6px;">
        Point Optimum: <strong>${result.estimatedPmiOptimalHours} Hours (~${(result.estimatedPmiOptimalHours / 24).toFixed(1)} days)</strong>
      </div>
      <div style="font-size: 13px; color: #94a3b8; margin-top: 4px;">
        Estimated TOD: ${result.estimatedTimeOfDeathMin} to ${result.estimatedTimeOfDeathMax} | Model Harmony: ${result.confidenceScore}% (${result.confidenceTier})
      </div>
    </div>

    <h3 style="font-size: 14px; text-transform: uppercase; color: #2dd4bf; margin-top: 24px;">
      Forensic Indicator Modules Overview
    </h3>
    <table class="table">
      <thead>
        <tr>
          <th>Indicator Module</th>
          <th>Observed Stage / Value</th>
          <th>Derived Window</th>
          <th>Relative Weight</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Algor Mortis (Henssge)</strong></td>
          <td>${caseData.algorMortis.enabled ? `Rectal: ${caseData.algorMortis.rectalTempC}°C (Cf=${caseData.algorMortis.clothingCoveringFactor})` : "Disabled / Bypassed"}</td>
          <td>${caseData.algorMortis.enabled ? `0–24h` : "N/A"}</td>
          <td>${result.indicatorEvaluations.find(e => e.category === "Algor")?.weightInFinalCalculation || 0}%</td>
        </tr>
        <tr>
          <td><strong>Livor Mortis (Hypostasis)</strong></td>
          <td>${caseData.livorMortis.enabled ? `${caseData.livorMortis.colorHue} (${caseData.livorMortis.blanchability.replace(/_/g, " ")})` : "Disabled / Bypassed"}</td>
          <td>${caseData.livorMortis.enabled ? `30m–12h` : "N/A"}</td>
          <td>${result.indicatorEvaluations.find(e => e.category === "Livor")?.weightInFinalCalculation || 0}%</td>
        </tr>
        <tr>
          <td><strong>Rigor Mortis (Nysten)</strong></td>
          <td>${caseData.rigorMortis.enabled ? `${caseData.rigorMortis.progressionStage.replace(/_/g, " ")}` : "Disabled / Bypassed"}</td>
          <td>${caseData.rigorMortis.enabled ? `1–36h` : "N/A"}</td>
          <td>${result.indicatorEvaluations.find(e => e.category === "Rigor")?.weightInFinalCalculation || 0}%</td>
        </tr>
        <tr>
          <td><strong>Decomposition (Megyesi TBS)</strong></td>
          <td>${caseData.decomposition.enabled ? `TBS ${caseData.decomposition.totalBodyScore}/35` : "Disabled / Bypassed"}</td>
          <td>${caseData.decomposition.enabled ? `1–30+ days` : "N/A"}</td>
          <td>${result.indicatorEvaluations.find(e => e.category === "Decomposition")?.weightInFinalCalculation || 0}%</td>
        </tr>
        <tr>
          <td><strong>Forensic Entomology</strong></td>
          <td>${caseData.entomology.enabled ? `${caseData.entomology.primaryInsectGroup.replace(/_/g, " ")} (${caseData.entomology.developmentalStage.replace(/_/g, " ")})` : "Disabled / Bypassed"}</td>
          <td>${caseData.entomology.enabled ? `Days–Months` : "N/A"}</td>
          <td>${result.indicatorEvaluations.find(e => e.category === "Entomology")?.weightInFinalCalculation || 0}%</td>
        </tr>
        <tr>
          <td><strong>Metabolomics [K+]</strong></td>
          <td>${caseData.metabolomics.enabled ? `${caseData.metabolomics.vitreousPotassiumMmolL} mmol/L` : "Disabled / Bypassed"}</td>
          <td>${caseData.metabolomics.enabled ? `2–48h` : "N/A"}</td>
          <td>${result.indicatorEvaluations.find(e => e.category === "Metabolomics")?.weightInFinalCalculation || 0}%</td>
        </tr>
      </tbody>
    </table>

    ${
      imagesList.length > 0
        ? `<h3 style="font-size: 14px; text-transform: uppercase; color: #2dd4bf; margin-top: 24px;">Photographic Evidence Log (${imagesList.length} Photos)</h3>
           <div class="card" style="font-size: 12px;">
             ${imagesList.map((img, i) => `<div><strong>Photo ${i + 1} (${img.tag || "Scene"}):</strong> ${img.name} ${img.detectedFindings ? `— <em>${img.detectedFindings}</em>` : ""}</div>`).join("")}
           </div>`
        : ""
    }

    <h3 style="font-size: 14px; text-transform: uppercase; color: #2dd4bf; margin-top: 24px;">
      Examiner's Clinical Notes & Autopsy Observations
    </h3>
    <div class="notes-box">${caseData.examinersNotes || "No specific qualitative notes provided by the medical examiner."}</div>

    ${
      result.inconsistenciesDetected
        ? `<h3 style="font-size: 14px; text-transform: uppercase; color: #f43f5e; margin-top: 24px;">Detected Physiological Contradictions</h3>
           ${result.inconsistencyAlerts.map(a => `<div class="card" style="border-color: #e11d48; margin-bottom: 12px;">
             <strong style="color: #fda4af;">[${a.severity.toUpperCase()}] ${a.title}</strong>
             <div style="font-size: 12px; margin-top: 4px;">${a.description}</div>
             <div style="font-size: 11px; color: #fde047; margin-top: 4px;"><strong>Forensic Implication:</strong> ${a.forensicImplication}</div>
           </div>`).join("")}`
        : ""
    }

    ${
      result.aiSynthesis
        ? `<h3 style="font-size: 14px; text-transform: uppercase; color: #2dd4bf; margin-top: 24px;">AI Pathologist Synthesis</h3>
           <p style="font-size: 13px; color: #cbd5e1;">${result.aiSynthesis.expertSummary}</p>`
        : ""
    }

    <div class="signoff-box">
      <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #94a3b8; margin-bottom: 12px;">
        Digital Chain of Custody & Verification Sign-Off
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 12px; margin-top: 10px;">
        <div>Attending Pathologist: __________________________</div>
        <div>Signature: __________________________</div>
        <div>Date: ________________</div>
      </div>
    </div>

    <div class="disclaimer-box">
      <strong>RESEARCH PROTOTYPE & MEDICO-LEGAL DISCLAIMER:</strong><br>
      VisionMortis is an AI-assisted research prototype engineered by Protocol One for forensic pathology decision-support. Calculations must be correlated with autopsy, scene investigation, toxicology, and histological findings.
    </div>

    <div style="text-align: center; margin-top: 30px; font-size: 11px; color: #64748b;">
      VisionMortis • Protocol One Forensic Decision System • Case Report generated on ${new Date().toISOString()} • Security Hash: ${integrityHash}
    </div>
  </div>
</body>
</html>`;

    const filename = `VisionMortis-Report-${caseData.caseId || "Case"}.html`;
    triggerFileDownload(html, filename, "text/html;charset=utf-8");
    setDownloadSuccess("HTML Report Downloaded");
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
                {caseValidation.isValid ? (
                  <span className="text-[10px] text-teal-400 font-mono flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Validated File Number
                  </span>
                ) : (
                  <span className="text-[10px] text-amber-400 font-mono flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Format Check Needed
                  </span>
                )}
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

            {/* Download HTML Button */}
            <button
              type="button"
              onClick={handleDownloadHtml}
              title="Download standalone HTML Case Report"
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-teal-900/60"
            >
              <Download className="w-3.5 h-3.5" />
              <span>HTML</span>
            </button>

            {/* Download PDF Button */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              title="Download direct formatted PDF Case Report"
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-rose-900/60"
            >
              <Download className="w-3.5 h-3.5" />
              <span>.PDF</span>
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

            {/* Print / PDF Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-teal-950/40"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
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
          <div className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <RecreatedLogo className="w-10 h-10" showSubtitle={false} />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-bold text-slate-100 tracking-tight">
                    VISIONMORTIS FORENSIC DOSSIER
                  </h1>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-teal-950 text-teal-400 border border-teal-800">
                    by Protocol One
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Post Mortem Interval Estimation Report
                </div>
                <div className="text-[11px] font-bold text-[#D4AF37] tracking-wider uppercase mt-0.5">
                  Research Prototype
                </div>
              </div>
            </div>

            <div className="text-right text-[11px] space-y-0.5 text-slate-400">
              <div>
                Case ID: <span className="text-teal-400 font-mono font-bold text-xs">{caseData.caseId || "Unassigned"}</span>
              </div>
              <div>Generated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</div>
              <div>Investigator: {caseData.investigatorName || "Staff Medical Examiner"}</div>
              <div className="text-[10px] font-mono text-slate-500">Hash: {integrityHash}</div>
            </div>
          </div>

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
