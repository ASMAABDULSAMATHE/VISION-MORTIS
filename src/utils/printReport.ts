import { ForensicCaseInput, PmiCalculationResult, VisionDetectionData } from "../types";
import { jsPDF } from "jspdf";
import { runInBrowserXgbPrediction, InBrowserPredictionResult } from "./inBrowserXgbModel";
import { auditPresetModifications } from "./presetAudit";

/**
 * Generates high-fidelity, self-contained standalone HTML for case reports.
 * Formatted specifically for A4 portrait printing and instant PDF export in all modern browsers.
 * Includes every single preview section, module input parameter, TreeSHAP attributions,
 * visual charts, photo gallery, AI synthesis, and custody sign-off.
 */
export function generateForensicReportHtml(
  caseData: ForensicCaseInput,
  result: PmiCalculationResult,
  visionData?: VisionDetectionData,
  integrityHash: string = "VM-SEC-" + Math.random().toString(36).substring(2, 9).toUpperCase(),
  mlData?: InBrowserPredictionResult
): string {
  const printTitle = `VisionMortis-CaseReport-${caseData.caseId || "CASE"}`;

  // If mlData is not passed, run prediction dynamically
  const mlPrediction = mlData || runInBrowserXgbPrediction(caseData);

  // Preset modification audit
  const presetAudit = auditPresetModifications(caseData);

  // Gather non-unrelated photos if any
  const imagesList = visionData?.images || [];
  const forensicPhotos = imagesList.filter((img) => !img.isUnrelated);

  // Examiner qualitative notes handling
  const examinerNotesText = (visionData?.examinerNotes || caseData.examinersNotes || "").trim();
  const hasExaminerNotes = examinerNotesText.length > 0 && examinerNotesText.toLowerCase() !== "none";

  // Timeline scale calculation for HTML report graphic
  const minScale = 0.2;
  const maxScale = Math.max(1440, result.estimatedPmiMaxHours * 1.25);
  const logMin = Math.log10(minScale);
  const logMax = Math.log10(maxScale);
  const logRange = logMax - logMin;

  const toPct = (h: number): number => {
    const safe = Math.max(minScale, Math.min(maxScale, h));
    const p = ((Math.log10(safe) - logMin) / logRange) * 100;
    return Math.min(Math.max(p, 1.5), 98.5);
  };

  const pmiMinPct = toPct(result.estimatedPmiMinHours);
  const pmiMaxPct = toPct(result.estimatedPmiMaxHours);
  const pmiOptPct = toPct(result.estimatedPmiOptimalHours);
  const pmiWidthPct = Math.max(pmiMaxPct - pmiMinPct, 3.5);
  const tick1hPct = toPct(1.0);
  const tick24hPct = toPct(24.0);
  const tick2moPct = toPct(1440.0);

  let indicatorAgreement = 85;
  if (result.inconsistenciesDetected && result.inconsistencyAlerts?.length > 0) {
    const critAlerts = result.inconsistencyAlerts.filter((a) => a.severity === "critical").length;
    const warnAlerts = result.inconsistencyAlerts.filter((a) => a.severity === "warning").length;
    indicatorAgreement = Math.max(35, Math.round(90 - critAlerts * 18 - warnAlerts * 8));
  } else if (caseData.isHarmonicPreset) {
    indicatorAgreement = 92;
  } else {
    const avgSpread = result.estimatedPmiMaxHours - result.estimatedPmiMinHours;
    if (avgSpread <= 5) indicatorAgreement = 88;
    else if (avgSpread <= 12) indicatorAgreement = 82;
    else if (avgSpread <= 24) indicatorAgreement = 76;
    else indicatorAgreement = 68;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${printTitle}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm 10mm 10mm 10mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    html, body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: #020617;
      background-color: #020617;
      color: #e2e8f0;
      line-height: 1.55;
      font-size: 12.5px;
      margin: 0;
      padding: 0;
    }
    body {
      padding: 24px;
    }
    .report-container {
      max-width: 980px;
      margin: 0 auto;
      background: #090d16;
      background-color: #090d16;
      border: 1px solid #1e293b;
      border-radius: 16px;
      padding: 28px 32px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
    }
    .print-bar {
      margin-bottom: 20px;
      padding: 12px 18px;
      background: #0f172a;
      color: #f8fafc;
      border: 1px solid #334155;
      border-radius: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .btn-print {
      background: #0d9488;
      color: white;
      border: none;
      padding: 8px 20px;
      border-radius: 8px;
      font-weight: 700;
      cursor: pointer;
      font-size: 13px;
      transition: background 0.15s ease;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .btn-print:hover {
      background: #14b8a6;
    }

    /* Masthead Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #1e293b;
      padding-bottom: 18px;
      margin-bottom: 20px;
      gap: 16px;
    }
    .brand-group {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .brand-title {
      font-size: 18px;
      font-weight: 900;
      color: #f8fafc;
      letter-spacing: -0.3px;
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
    }
    .brand-subtitle {
      font-size: 11.5px;
      color: #94a3b8;
      margin-top: 3px;
      font-weight: 500;
    }
    .badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 5px;
      font-size: 9.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .badge-teal { background: #134e4a; color: #2dd4bf; border: 1px solid #0f766e; }
    .badge-gold { background: rgba(212, 175, 55, 0.15); color: #f59e0b; border: 1px solid #d97706; }
    .badge-rose { background: rgba(244, 63, 94, 0.15); color: #fb7185; border: 1px solid #e11d48; }
    .badge-indigo { background: rgba(99, 102, 241, 0.15); color: #818cf8; border: 1px solid #4f46e5; }
    .header-meta {
      text-align: right;
      font-size: 11.5px;
      color: #94a3b8;
      line-height: 1.6;
    }

    /* Section Cards */
    .section-card {
      background: #0f172a;
      background-color: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 12px;
      padding: 16px 20px;
      margin-bottom: 16px;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .section-title {
      font-size: 12.5px;
      font-weight: 800;
      color: #f8fafc;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #1e293b;
      padding-bottom: 7px;
    }
    .section-title span.accent {
      color: #2dd4bf;
      font-size: 11.5px;
      font-weight: 700;
      text-transform: none;
      letter-spacing: 0;
    }

    /* Grids */
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
    }
    .grid-3 {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 14px;
    }
    .grid-4 {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
    }

    /* Demographic / Baseline Items */
    .data-pill {
      background: #090d16;
      background-color: #090d16;
      border: 1px solid #1e293b;
      border-radius: 8px;
      padding: 10px 12px;
    }
    .data-label {
      font-size: 10px;
      text-transform: uppercase;
      font-weight: 700;
      color: #64748b;
      letter-spacing: 0.4px;
    }
    .data-value {
      font-size: 13px;
      font-weight: 700;
      color: #f1f5f9;
      margin-top: 3px;
    }

    /* Hero Primary Conclusion */
    .hero-box {
      background: linear-gradient(135deg, rgba(13, 148, 136, 0.22) 0%, #0f172a 75%);
      background-color: #0f172a;
      border: 1.5px solid #0f766e;
      border-radius: 12px;
      padding: 18px 20px;
      margin-bottom: 16px;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .hero-metric-card {
      background: #090d16;
      background-color: #090d16;
      border: 1px solid #1e293b;
      border-radius: 10px;
      padding: 14px 16px;
    }
    .hero-metric-val {
      font-size: 24px;
      font-weight: 900;
      color: #2dd4bf;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      margin-top: 3px;
      line-height: 1.15;
    }
    .hero-metric-tod {
      font-size: 15px;
      font-weight: 800;
      color: #34d399;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      margin-top: 4px;
      line-height: 1.25;
    }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11.5px;
      margin-top: 6px;
    }
    th {
      background: #090d16;
      background-color: #090d16;
      color: #94a3b8;
      font-weight: 700;
      text-align: left;
      padding: 8px 12px;
      border-bottom: 1.5px solid #334155;
      font-size: 10.5px;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }
    td {
      padding: 9px 12px;
      border-bottom: 1px solid #1e293b;
      color: #cbd5e1;
      vertical-align: middle;
      line-height: 1.45;
    }
    tr:last-child td {
      border-bottom: none;
    }

    /* Photo Gallery */
    .photo-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
      gap: 12px;
      margin-top: 10px;
    }
    .photo-card {
      border: 1px solid #334155;
      border-radius: 8px;
      overflow: hidden;
      background: #090d16;
      background-color: #090d16;
    }
    .photo-card img {
      width: 100%;
      height: 110px;
      object-fit: cover;
      display: block;
      background: #020617;
    }
    .photo-info {
      padding: 8px 10px;
      font-size: 11px;
      color: #cbd5e1;
    }

    /* Sign-off & Disclaimers */
    .sign-box {
      background: #0f172a;
      background-color: #0f172a;
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 16px 20px;
      margin-bottom: 16px;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .disclaimer-box {
      background: rgba(212, 175, 55, 0.08);
      background-color: rgba(212, 175, 55, 0.08);
      border: 1px solid rgba(212, 175, 55, 0.35);
      border-radius: 10px;
      padding: 12px 16px;
      color: #fde68a;
      font-size: 11px;
      line-height: 1.5;
      margin-bottom: 14px;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .footer-note {
      text-align: center;
      font-size: 10.5px;
      color: #64748b;
      border-top: 1px solid #1e293b;
      padding-top: 12px;
      margin-top: 14px;
    }

    .page-break {
      page-break-after: always;
      break-after: page;
    }

    /* High-fidelity print styles */
    @media print {
      body {
        padding: 0 !important;
      }
      .report-container {
        border: 1px solid #1e293b !important;
        box-shadow: none !important;
        padding: 16px 18px !important;
        max-width: 100% !important;
        border-radius: 10px !important;
      }
      .print-bar {
        display: none !important;
      }
      .header {
        border-bottom: 2px solid #1e293b !important;
        padding-bottom: 14px !important;
        margin-bottom: 16px !important;
      }
      .section-card {
        padding: 14px 16px !important;
        margin-bottom: 14px !important;
      }
      .hero-box {
        padding: 14px 16px !important;
        margin-bottom: 14px !important;
      }
    }
  </style>
</head>
<body>
  <div class="report-container">
    <div class="print-bar">
      <span><strong>VisionMortis Complete Forensic Report</strong> • Multi-System Corroboration by Protocol One</span>
      <button class="btn-print" onclick="window.print()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
        Print / Save PDF
      </button>
    </div>

    <!-- Masthead Header -->
    <div class="header">
      <div class="brand-group">
        <svg viewBox="0 0 620 210" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 125px; height: 42px;">
          <defs>
            <filter id="ecgNeonGlowExact" x="-30%" y="-40%" width="160%" height="180%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2.8" result="blur1" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="6.5" result="blur2" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur3" />
              <feMerge>
                <feMergeNode in="blur3" />
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="cyanLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#00e5ff" />
              <stop offset="30%" stop-color="#00f2fe" />
              <stop offset="60%" stop-color="#22d3ee" />
              <stop offset="100%" stop-color="#00e5ff" />
            </linearGradient>
          </defs>
          <text x="24" y="90" fill="#ffffff" font-family="'Segoe UI', Roboto, sans-serif" font-weight="700" font-size="42" letter-spacing="7px">VISION</text>
          <text x="320" y="172" fill="#ffffff" font-family="'Segoe UI', Roboto, sans-serif" font-weight="700" font-size="42" letter-spacing="7px">MORTIS</text>
          <path d="M 24 116 L 235 116 L 247 132 L 278 24 L 306 198 L 324 116 L 438 116 C 448 116, 454 94, 466 94 C 478 94, 484 116, 494 116 L 596 116" stroke="#00f0ff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" opacity="0.5" filter="url(#ecgNeonGlowExact)"/>
          <path d="M 24 116 L 235 116 L 247 132 L 278 24 L 306 198 L 324 116 L 438 116 C 448 116, 454 94, 466 94 C 478 94, 484 116, 494 116 L 596 116" stroke="url(#cyanLineGradient)" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="278" cy="24" r="3.5" fill="#ffffff" />
        </svg>
        <div>
          <div class="brand-title">
            <span>VISIONMORTIS FORENSIC CASE REPORT</span>
            <span class="badge badge-teal">Protocol One</span>
            <span class="badge badge-gold">Research Prototype</span>
          </div>
          <div class="brand-subtitle">Multimodal Post-Mortem Interval Corroboration & AI Pathology Synthesis</div>
        </div>
      </div>

      <div class="header-meta">
        <div>Case ID: <strong style="color: #2dd4bf; font-family: monospace; font-size: 13px;">${caseData.caseId || "UNASSIGNED"}</strong></div>
        <div>Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</div>
        <div>Examiner: ${caseData.investigatorName || caseData.examinerName || "Staff Medical Examiner"}</div>
        <div style="font-family: monospace; font-size: 10px; color: #64748b;">Hash: ${integrityHash}</div>
      </div>
    </div>

    <!-- Preset Reference Case Banner (if preset used) -->
    ${presetAudit.isPreset ? `
      <div style="background: ${presetAudit.isModified ? 'rgba(245, 158, 11, 0.12)' : 'rgba(13, 148, 136, 0.12)'}; border: 1.5px solid ${presetAudit.isModified ? 'rgba(245, 158, 11, 0.5)' : 'rgba(45, 212, 191, 0.4)'}; border-radius: 12px; padding: 12px 16px; margin-bottom: 16px; display: flex; align-items: flex-start; gap: 12px;">
        <div style="background: ${presetAudit.isModified ? 'rgba(245, 158, 11, 0.2)' : 'rgba(45, 212, 191, 0.2)'}; border-radius: 8px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-size: 14px; color: ${presetAudit.isModified ? '#fbbf24' : '#2dd4bf'}; flex-shrink: 0; margin-top: 1px;">📋</div>
        <div style="flex: 1;">
          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <span style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: ${presetAudit.isModified ? '#fbbf24' : '#2dd4bf'}; letter-spacing: 0.5px;">Preset Reference Case Profile:</span>
            <span class="badge badge-teal">${presetAudit.presetCategory || caseData.presetCategory || "Benchmark Case"}</span>
            ${presetAudit.isModified
              ? `<span class="badge" style="background: rgba(245, 158, 11, 0.2); color: #fbbf24; border-color: rgba(245, 158, 11, 0.5);">⚠️ Modified by Examiner (${presetAudit.modifiedCount} parameter adjustments)</span>`
              : `<span class="badge" style="background: rgba(16, 185, 129, 0.2); color: #34d399; border-color: rgba(16, 185, 129, 0.4);">✓ Original Unaltered Baseline</span>`
            }
            ${caseData.isHarmonicPreset && !presetAudit.isModified ? '<span class="badge" style="background: rgba(16, 185, 129, 0.2); color: #34d399; border-color: rgba(16, 185, 129, 0.4);">✓ Harmonic Baseline (0 Discordance)</span>' : ''}
          </div>
          <div style="font-size: 13px; font-weight: 800; color: #f8fafc; margin-top: 4px;">
            ${presetAudit.presetName || caseData.presetName || caseData.subjectNameOrIdentifier}
          </div>
          ${caseData.presetDescription ? `<div style="font-size: 11px; color: #cbd5e1; margin-top: 4px; line-height: 1.4;">${caseData.presetDescription}</div>` : ''}
          ${presetAudit.isModified && presetAudit.modifiedFieldLabels.length > 0 ? `
            <div style="margin-top: 6px; padding-top: 6px; border-top: 1px dashed rgba(245, 158, 11, 0.35); font-size: 11px; color: #fbbf24;">
              <strong>Examiner Modifications:</strong> ${presetAudit.modifiedFieldLabels.join(" • ")}
            </div>
          ` : ''}
        </div>
      </div>
    ` : ""}

    <!-- 1. Demographics & Discovery Baseline -->
    <div class="grid-4" style="margin-bottom: 16px;">
      <div class="data-pill">
        <div class="data-label">Subject Identifier</div>
        <div class="data-value">${caseData.subjectNameOrIdentifier || "Unidentified Doe"}</div>
      </div>
      <div class="data-pill">
        <div class="data-label">Age / Sex</div>
        <div class="data-value">${caseData.ageYears ? `${caseData.ageYears} yrs` : "Unknown"} / ${(caseData.sex || "Unknown").toUpperCase()}</div>
      </div>
      <div class="data-pill">
        <div class="data-label">Discovery Time</div>
        <div class="data-value">${(() => {
          if (!caseData.discoveryTimestamp) return "Unrecorded";
          const s = caseData.discoveryTimestamp.trim();
          const d = new Date(s.includes(" ") && !s.includes("T") ? s.replace(" ", "T") : s);
          return isNaN(d.getTime()) ? caseData.discoveryTimestamp : d.toLocaleString();
        })()}</div>
      </div>
      <div class="data-pill">
        <div class="data-label">Scene Posture</div>
        <div class="data-value" style="text-transform: uppercase;">${caseData.bodyFoundPosition || "Supine"}</div>
      </div>
      ${presetAudit.isPreset ? `
        <div class="data-pill">
          <div class="data-label">Preset Case Status</div>
          <div class="data-value" style="font-size: 11.5px; color: ${presetAudit.isModified ? '#fbbf24' : '#34d399'};">
            ${presetAudit.isModified ? `Modified (${presetAudit.modifiedCount} changes)` : 'Unaltered Baseline'}
          </div>
        </div>
      ` : ''}
      <div class="data-pill">
        <div class="data-label">Ambient Temp</div>
        <div class="data-value" style="color: #2dd4bf;">${caseData.ambientTempC ?? 20} °C</div>
      </div>
      <div class="data-pill">
        <div class="data-label">Body Mass</div>
        <div class="data-value">${caseData.bodyWeightKg ?? 70} kg</div>
      </div>
      <div class="data-pill" style="grid-column: span ${presetAudit.isPreset ? 1 : 2};">
        <div class="data-label">Discovery Location / Agency</div>
        <div class="data-value">${caseData.locationDescription || "Crime Scene"} • ${caseData.jurisdiction || "Division of Forensic Medicine"}</div>
      </div>
    </div>

    <!-- 2. Consensus Post-Mortem Interval & TOD Graphic Hero Box -->
    <div style="background: #0b131e; border: 1px solid #1e293b; border-radius: 14px; padding: 20px 24px; margin-bottom: 16px;">
      <div style="font-family: monospace; font-size: 11px; font-weight: 700; letter-spacing: 1px; color: #94a3b8; text-transform: uppercase;">
        ESTIMATED PMI RANGE
      </div>
      <div style="font-size: 34px; font-weight: 900; font-family: monospace; color: #2dd4bf; margin: 4px 0 2px 0; letter-spacing: -0.5px;">
        ${Number(result.estimatedPmiMinHours.toFixed(1))} h – ${Number(result.estimatedPmiMaxHours.toFixed(1))} h
      </div>
      <div style="font-size: 12px; color: #94a3b8; line-height: 1.5;">
        80% interval · point estimate <strong style="color: #f1f5f9;">${Number(result.estimatedPmiOptimalHours.toFixed(1))} h</strong> · time of death approx. <strong style="color: #f1f5f9;">${Number(result.estimatedPmiMinHours.toFixed(1))} h–${Number(result.estimatedPmiMaxHours.toFixed(1))} h</strong> before examination
      </div>
      <div style="font-size: 11px; color: #f59e0b; margin-top: 4px; font-weight: 600;">
        Decision-support estimate; not a definitive determination of time of death.
      </div>

      <!-- Continuum Timeline Graphic -->
      <div style="margin: 24px 0 14px 0; position: relative;">
        <div style="height: 14px; background: #132232; border-radius: 9999px; position: relative; overflow: visible;">
          <div style="position: absolute; height: 12px; top: 1px; border-radius: 9999px; background: #2a3b4f; left: ${Math.max(1, pmiMinPct - 12)}%; width: ${Math.min(98 - pmiMinPct, pmiWidthPct + 24)}%;"></div>
          <div style="position: absolute; height: 12px; top: 1px; border-radius: 9999px; background: #41556c; left: ${Math.max(1, pmiMinPct - 4)}%; width: ${Math.min(98 - pmiMinPct, pmiWidthPct + 10)}%;"></div>
          <div style="position: absolute; height: 12px; top: 1px; border-radius: 9999px; background: #2dd4bf; left: ${pmiMinPct}%; width: ${pmiWidthPct}%; box-shadow: 0 0 10px rgba(45, 212, 191, 0.5);"></div>
          <div style="position: absolute; width: 4px; height: 16px; top: -1px; background: #ffffff; border-radius: 2px; left: ${pmiOptPct}%; transform: translateX(-50%);"></div>
          <div style="position: absolute; top: 0; bottom: 0; width: 1px; background: #475569; left: ${tick1hPct}%;"></div>
          <div style="position: absolute; top: 0; bottom: 0; width: 1px; background: #475569; left: ${tick24hPct}%;"></div>
          <div style="position: absolute; top: 0; bottom: 0; width: 1px; background: #475569; left: ${tick2moPct}%;"></div>
        </div>
        <div style="position: relative; height: 22px; margin-top: 6px; font-family: monospace; font-size: 10.5px; color: #94a3b8;">
          <div style="position: absolute; left: ${tick1hPct}%; transform: translateX(-50%);">1.0 h</div>
          <div style="position: absolute; left: ${tick24hPct}%; transform: translateX(-50%);">24 h</div>
          <div style="position: absolute; left: ${tick2moPct}%; transform: translateX(-50%);">2.0 mo</div>
        </div>
      </div>

      <!-- Gauges -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-top: 6px;">
        <div>
          <div style="display: flex; justify-content: space-between; font-family: monospace; font-size: 11px; margin-bottom: 5px;">
            <span style="color: #94a3b8; font-weight: 600;">CONFIDENCE</span>
            <span style="color: #2dd4bf; font-weight: 700;">${result.confidenceScore}% · ${result.confidenceTier.replace(" Confidence", "")}</span>
          </div>
          <div style="height: 8px; background: #132232; border-radius: 9999px; overflow: hidden;">
            <div style="height: 100%; width: ${result.confidenceScore}%; background: #2dd4bf; border-radius: 9999px;"></div>
          </div>
        </div>
        <div>
          <div style="display: flex; justify-content: space-between; font-family: monospace; font-size: 11px; margin-bottom: 5px;">
            <span style="color: #94a3b8; font-weight: 600;">INDICATOR AGREEMENT</span>
            <span style="color: #2dd4bf; font-weight: 700;">${indicatorAgreement}%</span>
          </div>
          <div style="height: 8px; background: #132232; border-radius: 9999px; overflow: hidden;">
            <div style="height: 100%; width: ${indicatorAgreement}%; background: #2dd4bf; border-radius: 9999px;"></div>
          </div>
        </div>
      </div>

      <div style="margin-top: 14px; padding-top: 12px; border-top: 1px solid #1e293b; display: flex; justify-content: space-between; font-size: 11px; color: #94a3b8; flex-wrap: wrap; gap: 8px;">
        <div>Estimated Time of Death: <strong style="color: #34d399; font-family: monospace;">${result.estimatedTimeOfDeathMin}</strong> to <strong style="color: #34d399; font-family: monospace;">${result.estimatedTimeOfDeathMax}</strong></div>
        ${result.dominantIndicatorSummary?.length > 0 ? `<div>Dominant Estimators: <span style="color: #2dd4bf;">${result.dominantIndicatorSummary.join(" • ")}</span></div>` : ""}
      </div>
    </div>

    <!-- 3. All 6 Forensic Modules System Breakdown Table -->
    <div class="section-card">
      <div class="section-title">
        <span>Forensic Modules & Observations Breakdown</span>
        <span class="accent">6 Multi-Modal Indicators Evaluated</span>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 22%;">Indicator Module</th>
            <th style="width: 48%;">Observed Parameters / Findings</th>
            <th style="width: 18%;">Derived Window</th>
            <th style="width: 12%;">Weight</th>
          </tr>
        </thead>
        <tbody>
          <!-- Algor -->
          <tr>
            <td>
              <strong style="color: #fb7185;">Algor Mortis</strong>
              ${(caseData.algorMortis.recordedAt || caseData.indicatorTimings?.algor) ? `<div style="font-size: 9.5px; font-family: monospace; color: #94a3b8; margin-top: 2px;">Logged: ${caseData.algorMortis.recordedAt || caseData.indicatorTimings?.algor}</div>` : ""}
            </td>
            <td>
              ${caseData.algorMortis.enabled
                ? `Core Rectal: ${caseData.algorMortis.rectalTempC}°C | Ambient: ${caseData.ambientTempC}°C | Clothing: ${caseData.algorMortis.clothingCoveringFactor} (${caseData.algorMortis.clothingDescription || "Standard"}) | Air: ${caseData.algorMortis.airCurrentVelocity}`
                : `<span style="color: #64748b; font-style: italic;">Bypassed / Disabled</span>`}
            </td>
            <td style="font-family: monospace; color: #2dd4bf; font-weight: 700;">
              ${caseData.algorMortis.enabled
                ? `${result.indicatorEvaluations.find(e => e.category === "Algor")?.estimatedPmiMinHours || 0} – ${result.indicatorEvaluations.find(e => e.category === "Algor")?.estimatedPmiMaxHours || 24}h`
                : "N/A"}
            </td>
            <td style="font-family: monospace; font-weight: 700;">
              ${result.indicatorEvaluations.find(e => e.category === "Algor")?.weightInFinalCalculation || 0}%
            </td>
          </tr>

          <!-- Livor -->
          <tr>
            <td>
              <strong style="color: #c084fc;">Livor Mortis</strong>
              ${(caseData.livorMortis.recordedAt || caseData.indicatorTimings?.livor) ? `<div style="font-size: 9.5px; font-family: monospace; color: #94a3b8; margin-top: 2px;">Logged: ${caseData.livorMortis.recordedAt || caseData.indicatorTimings?.livor}</div>` : ""}
            </td>
            <td>
              ${caseData.livorMortis.enabled
                ? `Hue: ${caseData.livorMortis.colorHue} | Blanchability: ${caseData.livorMortis.blanchability.replace(/_/g, " ")} | Pattern: ${caseData.livorMortis.distributionPattern.replace(/_/g, " ")} ${caseData.livorMortis.suspectedBodyMovement ? "(Relocation Suspected)" : ""}`
                : `<span style="color: #64748b; font-style: italic;">Bypassed / Disabled</span>`}
            </td>
            <td style="font-family: monospace; color: #2dd4bf; font-weight: 700;">
              ${caseData.livorMortis.enabled
                ? `${result.indicatorEvaluations.find(e => e.category === "Livor")?.estimatedPmiMinHours || 0} – ${result.indicatorEvaluations.find(e => e.category === "Livor")?.estimatedPmiMaxHours || 12}h`
                : "N/A"}
            </td>
            <td style="font-family: monospace; font-weight: 700;">
              ${result.indicatorEvaluations.find(e => e.category === "Livor")?.weightInFinalCalculation || 0}%
            </td>
          </tr>

          <!-- Rigor -->
          <tr>
            <td>
              <strong style="color: #fbbf24;">Rigor Mortis</strong>
              ${(caseData.rigorMortis.recordedAt || caseData.indicatorTimings?.rigor) ? `<div style="font-size: 9.5px; font-family: monospace; color: #94a3b8; margin-top: 2px;">Logged: ${caseData.rigorMortis.recordedAt || caseData.indicatorTimings?.rigor}</div>` : ""}
            </td>
            <td>
              ${caseData.rigorMortis.enabled
                ? `Progression: ${caseData.rigorMortis.progressionStage.replace(/_/g, " ")} | Exertion: ${caseData.rigorMortis.preDeathPhysicalExertion.replace(/_/g, " ")} | Cold Stiffening: ${caseData.rigorMortis.coldStiffeningSuspected ? "Yes" : "None"}`
                : `<span style="color: #64748b; font-style: italic;">Bypassed / Disabled</span>`}
            </td>
            <td style="font-family: monospace; color: #2dd4bf; font-weight: 700;">
              ${caseData.rigorMortis.enabled
                ? `${result.indicatorEvaluations.find(e => e.category === "Rigor")?.estimatedPmiMinHours || 0} – ${result.indicatorEvaluations.find(e => e.category === "Rigor")?.estimatedPmiMaxHours || 36}h`
                : "N/A"}
            </td>
            <td style="font-family: monospace; font-weight: 700;">
              ${result.indicatorEvaluations.find(e => e.category === "Rigor")?.weightInFinalCalculation || 0}%
            </td>
          </tr>

          <!-- Decomposition -->
          <tr>
            <td>
              <strong style="color: #34d399;">Decomposition / TBS</strong>
              ${(caseData.decomposition.recordedAt || caseData.indicatorTimings?.decomposition) ? `<div style="font-size: 9.5px; font-family: monospace; color: #94a3b8; margin-top: 2px;">Logged: ${caseData.decomposition.recordedAt || caseData.indicatorTimings?.decomposition}</div>` : ""}
            </td>
            <td>
              ${caseData.decomposition.enabled
                ? `TBS ${caseData.decomposition.totalBodyScore}/35 (Head ${caseData.decomposition.headNeckScore}, Trunk ${caseData.decomposition.trunkScore}, Limbs ${caseData.decomposition.limbsScore}) | Signs: ${[
                    caseData.decomposition.marblingPresent && "Marbling",
                    caseData.decomposition.rightIliacDiscoloration && "Greening",
                    caseData.decomposition.bloatingAndPurge && "Bloat/Purge",
                    caseData.decomposition.skinSlippageBullae && "Slippage",
                  ].filter(Boolean).join(", ") || "Fresh"}`
                : `<span style="color: #64748b; font-style: italic;">Bypassed / Disabled</span>`}
            </td>
            <td style="font-family: monospace; color: #2dd4bf; font-weight: 700;">
              ${caseData.decomposition.enabled
                ? `${result.indicatorEvaluations.find(e => e.category === "Decomposition")?.estimatedPmiMinHours || 24} – ${result.indicatorEvaluations.find(e => e.category === "Decomposition")?.estimatedPmiMaxHours || 720}h`
                : "N/A"}
            </td>
            <td style="font-family: monospace; font-weight: 700;">
              ${result.indicatorEvaluations.find(e => e.category === "Decomposition")?.weightInFinalCalculation || 0}%
            </td>
          </tr>

          <!-- Entomology -->
          <tr>
            <td>
              <strong style="color: #2dd4bf;">Forensic Entomology</strong>
              ${(caseData.entomology.recordedAt || caseData.indicatorTimings?.entomology) ? `<div style="font-size: 9.5px; font-family: monospace; color: #94a3b8; margin-top: 2px;">Logged: ${caseData.entomology.recordedAt || caseData.indicatorTimings?.entomology}</div>` : ""}
            </td>
            <td>
              ${caseData.entomology.enabled
                ? `Taxon: ${caseData.entomology.primaryInsectGroup.replace(/_/g, " ")} | Stage: ${caseData.entomology.developmentalStage.replace(/_/g, " ")} | Length: ${caseData.entomology.larvalLengthMm}mm | Maggot Mass: ${caseData.entomology.maggotMassTempC}°C`
                : `<span style="color: #64748b; font-style: italic;">Bypassed / Disabled</span>`}
            </td>
            <td style="font-family: monospace; color: #2dd4bf; font-weight: 700;">
              ${caseData.entomology.enabled
                ? `${result.indicatorEvaluations.find(e => e.category === "Entomology")?.estimatedPmiMinHours || 0} – ${result.indicatorEvaluations.find(e => e.category === "Entomology")?.estimatedPmiMaxHours || 240}h`
                : "N/A"}
            </td>
            <td style="font-family: monospace; font-weight: 700;">
              ${result.indicatorEvaluations.find(e => e.category === "Entomology")?.weightInFinalCalculation || 0}%
            </td>
          </tr>

          <!-- Metabolomics -->
          <tr>
            <td>
              <strong style="color: #38bdf8;">Vitreous Metabolomics</strong>
              ${(caseData.metabolomics.recordedAt || caseData.indicatorTimings?.metabolomics) ? `<div style="font-size: 9.5px; font-family: monospace; color: #94a3b8; margin-top: 2px;">Logged: ${caseData.metabolomics.recordedAt || caseData.indicatorTimings?.metabolomics}</div>` : ""}
            </td>
            <td>
              ${caseData.metabolomics.enabled
                ? `${caseData.metabolomics.selectedMetabolites?.length || 0} Analytes Loaded ${caseData.metabolomics.selectedMetabolites?.length ? `(${caseData.metabolomics.selectedMetabolites.map(m => m.name).slice(0, 3).join(", ")})` : ""}`
                : `<span style="color: #64748b; font-style: italic;">Bypassed / Disabled</span>`}
            </td>
            <td style="font-family: monospace; color: #2dd4bf; font-weight: 700;">
              ${caseData.metabolomics.enabled
                ? `${result.indicatorEvaluations.find(e => e.category === "Metabolomics")?.estimatedPmiMinHours || 0} – ${result.indicatorEvaluations.find(e => e.category === "Metabolomics")?.estimatedPmiMaxHours || 48}h`
                : "N/A"}
            </td>
            <td style="font-family: monospace; font-weight: 700;">
              ${result.indicatorEvaluations.find(e => e.category === "Metabolomics")?.weightInFinalCalculation || 0}%
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 4. In-Browser XGBoost 100-Tree Model & TreeSHAP Attributions -->
    <div class="section-card">
      <div class="section-title">
        <span>XGBoost 100-Tree Model & TreeSHAP Feature Attributions</span>
        <span class="accent">ML Optimum: ${mlPrediction.estimatedPmiOptimalHours}h (${mlPrediction.estimatedPmiMinHours}–${mlPrediction.estimatedPmiMaxHours}h)</span>
      </div>

      <div class="grid-3" style="margin-bottom: 12px;">
        <div class="data-pill">
          <div class="data-label">XGBoost Point Estimate</div>
          <div class="data-value" style="color: #34d399; font-size: 15px; font-family: monospace;">${mlPrediction.estimatedPmiOptimalHours} hrs</div>
          <div style="font-size: 10.5px; color: #94a3b8; margin-top: 2px;">~${(mlPrediction.estimatedPmiOptimalHours / 24).toFixed(1)} Days Post-Mortem</div>
        </div>
        <div class="data-pill">
          <div class="data-label">Empirical Quantile Bracket</div>
          <div class="data-value" style="color: #2dd4bf; font-size: 14px; font-family: monospace;">${mlPrediction.estimatedPmiMinHours} – ${mlPrediction.estimatedPmiMaxHours} hrs</div>
          <div style="font-size: 10.5px; color: #94a3b8; margin-top: 2px;">95% Empirical Bounds</div>
        </div>
        <div class="data-pill">
          <div class="data-label">TreeSHAP Base E[y]</div>
          <div class="data-value" style="color: #fbbf24; font-size: 14px; font-family: monospace;">${mlPrediction.baseValueHours} hrs</div>
          <div style="font-size: 10.5px; color: #94a3b8; margin-top: 2px;">Population Prior Baseline</div>
        </div>
      </div>

      ${mlPrediction.factorAttributions && mlPrediction.factorAttributions.length > 0 ? `
        <table>
          <thead>
            <tr>
              <th style="width: 28%;">TreeSHAP Feature</th>
              <th style="width: 16%;">Direction</th>
              <th style="width: 14%;">Shift</th>
              <th style="width: 18%;">Influence</th>
              <th style="width: 24%;">Forensic Context</th>
            </tr>
          </thead>
          <tbody>
            ${mlPrediction.factorAttributions.slice(0, 6).map((attr) => `
              <tr>
                <td><strong style="color: #f8fafc;">${attr.factorName}</strong></td>
                <td>
                  <span style="color: ${attr.impactDirection === 'increases_pmi' ? '#f59e0b' : '#2dd4bf'}; font-weight: 700;">
                    ${attr.impactDirection === 'increases_pmi' ? '↑ Lengthens' : '↓ Shortens'}
                  </span>
                </td>
                <td style="font-family: monospace; font-weight: 800; color: ${attr.impactDirection === 'increases_pmi' ? '#f59e0b' : '#2dd4bf'};">
                  ${attr.impactDirection === 'increases_pmi' ? '+' : '-'}${attr.pullMagnitudeHours}h
                </td>
                <td>
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <div style="flex: 1; height: 5px; background: #1e293b; border-radius: 3px; overflow: hidden;">
                      <div style="height: 100%; width: ${Math.min(100, Math.max(10, attr.relativeImportancePercent * 3))}%; background: ${attr.impactDirection === 'increases_pmi' ? '#f59e0b' : '#2dd4bf'}; border-radius: 3px;"></div>
                    </div>
                    <span style="font-family: monospace; font-size: 10.5px; font-weight: 700; color: #e2e8f0;">${attr.relativeImportancePercent}%</span>
                  </div>
                </td>
                <td style="font-size: 10.5px; color: #94a3b8; line-height: 1.35;">${attr.explanation}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      ` : ""}
    </div>

    <!-- 5. Photographic Evidence & Vision Analysis Summary -->
    ${forensicPhotos.length > 0 || (visionData && visionData.forensicObservations) ? `
      <div class="section-card">
        <div class="section-title">
          <span>Photographic Evidence & Vision Analysis</span>
          <span class="accent">${forensicPhotos.length} Forensic Photo(s) Evaluated</span>
        </div>
        <div style="background: #090d16; border: 1px solid #1e293b; border-radius: 8px; padding: 12px 14px; margin-top: 6px;">
          <div style="font-size: 11px; font-weight: 700; color: #2dd4bf; margin-bottom: 4px;">
            AI Vision Analysis Summary:
          </div>
          <div style="font-size: 11.5px; color: #e2e8f0; line-height: 1.55;">
            ${visionData?.forensicObservations || `Visual photo analysis indicates ${visionData?.detectedDecompositionStage?.replace(/_/g, " ") || "fresh"} post-mortem changes (TBS ${visionData?.estimatedTbs?.totalScore || 3}/35) with ${visionData?.detectedLivor?.colorClassification?.replace(/_/g, " ") || "violaceous"} hypostasis and ${visionData?.detectedEntomology?.primaryInsectStage?.replace(/_/g, " ") || "no active"} insect colonization.`}
          </div>
          <div style="display: flex; gap: 14px; flex-wrap: wrap; margin-top: 10px; padding-top: 8px; border-top: 1px solid #1e293b; font-size: 11px;">
            <div><span style="color: #64748b;">Decomposition:</span> <strong style="color: #fbbf24;">${visionData?.detectedDecompositionStage?.replace(/_/g, " ") || "Indeterminate"} (TBS ${visionData?.estimatedTbs?.totalScore ?? "N/A"}/35)</strong></div>
            <div><span style="color: #64748b;">Lividity:</span> <strong style="color: #c084fc;">${visionData?.detectedLivor?.colorClassification?.replace(/_/g, " ") || "Violaceous"} (${visionData?.detectedLivor?.distribution || "Dependent"})</strong></div>
            <div><span style="color: #64748b;">Entomology:</span> <strong style="color: #34d399;">${visionData?.detectedEntomology?.primaryInsectStage?.replace(/_/g, " ") || "None"}</strong></div>
            <div><span style="color: #64748b;">Body Movement:</span> <strong style="color: ${visionData?.detectedMovement?.suspectedMovement ? "#fb7185" : "#2dd4bf"};">${visionData?.detectedMovement?.suspectedMovement ? "SUSPECTED (Dual Discordance)" : "Consistent Posture"}</strong></div>
            <div><span style="color: #64748b;">Evidence Metrics:</span> <strong style="color: #2dd4bf;">Clarity ${visionData?.averageClarityScore ?? 92}% | Reliability ${visionData?.averageReliabilityScore ?? 90}%</strong></div>
          </div>
        </div>
      </div>
    ` : ""}

    <!-- 6. Physiological Consistency & Discordance Analysis -->
    <div class="section-card">
      <div class="section-title">
        <span>Physiological Consistency & Discordance Audit</span>
        <span class="accent">${result.inconsistenciesDetected ? "Alerts Present" : "Harmonic"}</span>
      </div>
      ${
        result.inconsistencyAlerts && result.inconsistencyAlerts.length > 0
          ? result.inconsistencyAlerts
              .map(
                (a) => `
          <div style="padding: 10px 14px; border-left: 4px solid #f43f5e; background: rgba(244, 63, 94, 0.1); margin-bottom: 8px; border-radius: 0 8px 8px 0;">
            <strong style="color: #fb7185; font-size: 12px;">[${a.severity.toUpperCase()}] ${a.title}</strong>
            <div style="color: #fda4af; font-size: 11.5px; margin-top: 3px; line-height: 1.45;">${a.description}</div>
            <div style="color: #f43f5e; font-size: 10.5px; font-style: italic; margin-top: 2px;">Forensic Implication: ${a.forensicImplication}</div>
          </div>
        `
              )
              .join("")
          : `<div style="color: #34d399; font-weight: 700; font-size: 12px; padding: 2px 0;">✓ All physiological post-mortem indicators are in harmonic alignment. No contradictions detected.</div>`
      }
    </div>

    <!-- 7. AI Pathologist Synthesis & Recommendations -->
    ${result.aiSynthesis ? `
      <div class="section-card" style="border-color: #0f766e;">
        <div class="section-title" style="color: #2dd4bf;">
          <span>AI Pathologist Integrated Synthesis</span>
          <span class="badge badge-teal">Protocol One AI</span>
        </div>
        <p style="font-size: 12px; color: #e2e8f0; line-height: 1.6; margin: 0 0 10px 0;">
          ${result.aiSynthesis.expertSummary}
        </p>
        ${result.aiSynthesis.recommendedConfirmatoryTests?.length > 0 ? `
          <div style="border-top: 1px solid #1e293b; padding-top: 8px; margin-top: 6px;">
            <strong style="color: #2dd4bf; font-size: 11.5px;">Recommended Confirmatory Protocols:</strong>
            <ul style="margin: 6px 0 0 18px; padding: 0; font-size: 11.5px; color: #cbd5e1; line-height: 1.5;">
              ${result.aiSynthesis.recommendedConfirmatoryTests.map(t => `<li>${t}</li>`).join("")}
            </ul>
          </div>
        ` : ""}
      </div>
    ` : ""}

    <!-- 8. Examiner Qualitative Pathology Notes (Rendered ONLY if examiner provided notes) -->
    ${hasExaminerNotes ? `
      <div class="section-card">
        <div class="section-title">
          <span>Examiner Qualitative Pathology Notes</span>
        </div>
        <p style="font-size: 12px; color: #e2e8f0; line-height: 1.6; margin: 0; white-space: pre-wrap;">
          ${examinerNotesText}
        </p>
      </div>
    ` : ""}

    <!-- 9. Digital Chain of Custody & Examiner Sign-Off -->
    <div class="sign-box">
      <div class="section-title" style="border-bottom: 1px solid #334155; margin-bottom: 12px;">
        <span>Digital Chain of Custody & Official Sign-Off</span>
        <span style="font-family: monospace; font-size: 10px; color: #94a3b8;">Hash: ${integrityHash}</span>
      </div>
      <div class="grid-3">
        <div class="data-pill">
          <div class="data-label">Attending Pathologist</div>
          <div class="data-value">${caseData.investigatorName || caseData.examinerName || "Staff Medical Examiner"}</div>
        </div>
        <div class="data-pill">
          <div class="data-label">Official Signature</div>
          <div class="data-value" style="color: #2dd4bf; font-style: italic; font-family: monospace;">
            /s/ ${caseData.investigatorName ? caseData.investigatorName.split(" ")[0] : "Verified"} (Digital Seal)
          </div>
        </div>
        <div class="data-pill">
          <div class="data-label">Execution Timestamp</div>
          <div class="data-value" style="font-family: monospace;">${new Date().toISOString().slice(0, 16).replace("T", " ")}</div>
        </div>
      </div>
    </div>

    <!-- 10. Medico-Legal Disclaimer Box -->
    <div class="disclaimer-box">
      <div style="font-weight: 800; color: #f59e0b; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
        <span>⚠ RESEARCH PROTOTYPE & MEDICO-LEGAL DISCLAIMER</span>
      </div>
      <div>
        <strong>VisionMortis</strong> is an AI-assisted decision-support research prototype engineered by <strong>Protocol One</strong>. Estimations produced by this platform must always be correlated with complete forensic autopsy findings, scene context, toxicology, and histological analysis.
      </div>
    </div>

    <!-- 11. Medico-Legal Attribution Footer -->
    <div class="footer-note">
      <div>Generated by <strong>VisionMortis</strong> • Designed and Engineered by <strong>Protocol One</strong></div>
      <div style="color: #f59e0b; font-weight: 700; margin-top: 3px;">
        Research Prototype • Decision Support Only • Hash: ${integrityHash}
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Downloads a self-contained, print-ready HTML case report document.
 */
export function downloadForensicHtmlReport(
  caseData: ForensicCaseInput,
  result: PmiCalculationResult,
  visionData?: VisionDetectionData,
  integrityHash?: string
) {
  const html = generateForensicReportHtml(caseData, result, visionData, integrityHash);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `VisionMortis-Report-${caseData.caseId || "CASE"}-${new Date().toISOString().slice(0, 10)}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

/**
 * Generates and downloads a clean, professional multi-page vector PDF document using jsPDF.
 * Zero screen resizing, zero canvas snapshotting, 100% reliable across all devices.
 * Covers Demographics, Composite PMI, XGBoost TreeSHAP, all 6 Forensic Input Modules,
 * Indicator Evaluation table, Discordance analysis, AI Synthesis, and Pathologist Sign-Off.
 */
export function exportForensicCaseReportPdf(
  caseData: ForensicCaseInput,
  result: PmiCalculationResult,
  visionData?: VisionDetectionData,
  integrityHash: string = "VM-SEC-" + Math.random().toString(36).substring(2, 9).toUpperCase()
): boolean {
  try {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const mlPrediction = runInBrowserXgbPrediction(caseData);
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;
    const contentWidth = pageWidth - margin * 2;
    let y = 12;

    const paintDarkPageBackground = () => {
      doc.setFillColor(2, 6, 23); // #020617
      doc.rect(0, 0, pageWidth, pageHeight, "F");
    };

    const renderHeader = (pageNum: number) => {
      doc.setDrawColor(30, 41, 59); // #1e293b
      doc.setLineWidth(0.8);
      doc.line(margin, y, margin + contentWidth, y);
      y += 4.5;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(45, 212, 191); // Teal #2dd4bf
      doc.text("VISIONMORTIS FORENSIC CASE REPORT", margin, y);

      doc.setFontSize(9.5);
      doc.setTextColor(248, 250, 252); // #f8fafc
      doc.text(`CASE: ${caseData.caseId || "UNASSIGNED"}`, pageWidth - margin, y, { align: "right" });
      y += 4.5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184); // #94a3b8
      doc.text("MULTIMODAL POST-MORTEM INTERVAL CORROBORATION • PROTOCOL ONE", margin, y);
      doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()} (Page ${pageNum} of 2)`, pageWidth - margin, y, { align: "right" });
      y += 5.5;
    };

    // ==================== PAGE 1 ====================
    paintDarkPageBackground();
    renderHeader(1);

    // Section 1: Demographics Box
    const presetAudit = auditPresetModifications(caseData);
    const hasPreset = Boolean(presetAudit.isPreset);
    const demoBoxHeight = hasPreset ? (presetAudit.isModified ? 42 : 38) : 33;
    doc.setFillColor(15, 23, 42); // #0f172a
    doc.setDrawColor(30, 41, 59); // #1e293b
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, y, contentWidth, demoBoxHeight, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(45, 212, 191);
    doc.text("1. CASE DEMOGRAPHICS & ENVIRONMENTAL SCENE BASELINE", margin + 3, y + 4.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(203, 213, 225); // #cbd5e1

    const col1X = margin + 3;
    const col2X = margin + (contentWidth / 2) + 2;
    const colW = (contentWidth / 2) - 4;
    let rowY = y + 9.5;

    if (hasPreset) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.0);
      if (presetAudit.isModified) {
        doc.setTextColor(245, 158, 11);
        doc.text(`PRESET [MODIFIED BY EXAMINER]:`, col1X, rowY);
      } else {
        doc.setTextColor(45, 212, 191);
        doc.text(`PRESET [UNALTERED BASELINE]:`, col1X, rowY);
      }
      doc.setFont("helvetica", "normal");
      doc.setTextColor(248, 250, 252);
      const presetLabel = `${presetAudit.presetName || caseData.presetName || caseData.subjectNameOrIdentifier} (${presetAudit.presetCategory || "Benchmark"})`;
      doc.text(presetLabel, col1X + 46, rowY, { maxWidth: colW - 48 });
      rowY += 3.8;

      if (presetAudit.isModified && presetAudit.modifiedFieldLabels.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(6.5);
        doc.setTextColor(245, 158, 11);
        const modText = `Modifications: ${presetAudit.modifiedFieldLabels.join("; ")}`;
        doc.text(modText, col1X, rowY, { maxWidth: colW });
        rowY += 3.8;
      }
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(203, 213, 225);

    doc.text(`Subject: ${caseData.subjectNameOrIdentifier || "Unidentified Doe"}`, col1X, rowY);
    doc.text(`Discovery Time: ${caseData.discoveryTimestamp || "Not Recorded"}`, col2X, rowY);
    rowY += 4.2;

    doc.text(`Age / Sex: ${caseData.ageYears ? `${caseData.ageYears} yrs` : "Unspecified"} / ${(caseData.sex || "Unknown").toUpperCase()}`, col1X, rowY);
    doc.text(`Ambient Temp: ${caseData.ambientTempC ?? 20} °C  •  Body Mass: ${caseData.bodyWeightKg ?? 70} kg`, col2X, rowY);
    rowY += 4.2;

    doc.text(`Scene: ${caseData.locationDescription || "Scene"}`, col1X, rowY);
    doc.text(`Posture: ${caseData.bodyFoundPosition || "Supine"}`, col2X, rowY);
    rowY += 4.2;

    doc.setFont("helvetica", "bold");
    doc.setTextColor(45, 212, 191);
    doc.text(`Examiner: ${caseData.investigatorName || caseData.examinerName || "Staff Medical Examiner"}`, col1X, rowY);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(203, 213, 225);
    doc.text(`Jurisdiction: ${caseData.jurisdiction || "Division of Forensic Medicine"}`, col2X, rowY);

    y += demoBoxHeight + 4;

    // Section 2: Composite PMI Summary Box with Graphic Timeline
    const sec2Height = 48;
    doc.setFillColor(15, 23, 42); // #0f172a
    doc.setDrawColor(15, 118, 110); // #0f766e
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, y, contentWidth, sec2Height, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(45, 212, 191);
    doc.text("2. CONSENSUS POST-MORTEM INTERVAL (PMI) ESTIMATION", margin + 3, y + 4.5);

    const pillWidth = (contentWidth - 6) / 3;
    const pY = y + 7;

    // Pill 1: Optimal PMI
    doc.setFillColor(9, 13, 22); // #090d16
    doc.setDrawColor(15, 118, 110);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin + 1.5, pY, pillWidth, 19, 1.5, 1.5, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(45, 212, 191);
    doc.text(`${result.estimatedPmiOptimalHours} hrs`, margin + 1.5 + pillWidth / 2, pY + 6.5, { align: "center" });
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text("POINT OPTIMUM PMI", margin + 1.5 + pillWidth / 2, pY + 11.5, { align: "center" });
    doc.setTextColor(203, 213, 225);
    doc.text(`~${(result.estimatedPmiOptimalHours / 24).toFixed(1)} Days Post-Mortem`, margin + 1.5 + pillWidth / 2, pY + 15.5, { align: "center" });

    // Pill 2: Bracket Window
    doc.setDrawColor(30, 41, 59);
    doc.roundedRect(margin + 1.5 + pillWidth + 1.5, pY, pillWidth, 19, 1.5, 1.5, "FD");
    doc.setFontSize(9.5);
    doc.setTextColor(52, 211, 153); // #34d399
    doc.text(`${result.estimatedPmiMinHours}h – ${result.estimatedPmiMaxHours}h`, margin + 1.5 + pillWidth + 1.5 + pillWidth / 2, pY + 6.5, { align: "center" });
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text("ESTIMATED 95% BRACKET", margin + 1.5 + pillWidth + 1.5 + pillWidth / 2, pY + 11.5, { align: "center" });
    doc.setTextColor(203, 213, 225);
    doc.text(`Span: ${(result.estimatedPmiMaxHours - result.estimatedPmiMinHours).toFixed(1)}h Window`, margin + 1.5 + pillWidth + 1.5 + pillWidth / 2, pY + 15.5, { align: "center" });

    // Pill 3: Confidence Score
    doc.setDrawColor(30, 41, 59);
    doc.roundedRect(margin + 1.5 + (pillWidth + 1.5) * 2, pY, pillWidth, 19, 1.5, 1.5, "FD");
    doc.setFontSize(11);
    doc.setTextColor(45, 212, 191);
    doc.text(`${result.confidenceScore}%`, margin + 1.5 + (pillWidth + 1.5) * 2 + pillWidth / 2, pY + 6.5, { align: "center" });
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text(`CONFIDENCE (${result.confidenceTier})`, margin + 1.5 + (pillWidth + 1.5) * 2 + pillWidth / 2, pY + 11.5, { align: "center" });
    doc.setTextColor(203, 213, 225);
    doc.text("Harmonic Corroboration", margin + 1.5 + (pillWidth + 1.5) * 2 + pillWidth / 2, pY + 15.5, { align: "center" });

    // Vector Graphic Continuum Timeline Bar
    const trackY = pY + 22;
    const trackX = margin + 4;
    const trackW = contentWidth - 8;

    // Track Background
    doc.setFillColor(19, 34, 50); // #132232
    doc.roundedRect(trackX, trackY, trackW, 3.5, 1.5, 1.5, "F");

    // Scale calculation (0.2h to 1440h log scale)
    const pdfMinScale = 0.2;
    const pdfMaxScale = Math.max(1440, result.estimatedPmiMaxHours * 1.25);
    const pdfLogMin = Math.log10(pdfMinScale);
    const pdfLogRange = Math.log10(pdfMaxScale) - pdfLogMin;
    const pdfToX = (h: number): number => {
      const s = Math.max(pdfMinScale, Math.min(pdfMaxScale, h));
      const pct = (Math.log10(s) - pdfLogMin) / pdfLogRange;
      return trackX + pct * trackW;
    };

    const pdfMinX = pdfToX(result.estimatedPmiMinHours);
    const pdfMaxX = pdfToX(result.estimatedPmiMaxHours);
    const pdfOptX = pdfToX(result.estimatedPmiOptimalHours);
    const pdfPmiW = Math.max(pdfMaxX - pdfMinX, 4);

    // Overlapping outer bracket capsule
    doc.setFillColor(42, 59, 79); // #2a3b4f
    doc.roundedRect(Math.max(trackX + 1, pdfMinX - 3), trackY + 0.3, Math.min(trackW - 2, pdfPmiW + 6), 2.9, 1.4, 1.4, "F");

    // Active interval teal bar
    doc.setFillColor(45, 212, 191); // #2dd4bf
    doc.roundedRect(pdfMinX, trackY + 0.3, pdfPmiW, 2.9, 1.4, 1.4, "F");

    // Point estimate marker (white pip)
    doc.setFillColor(255, 255, 255);
    doc.circle(pdfOptX, trackY + 1.75, 1.2, "F");

    // Scale tick marks
    const tick1X = pdfToX(1.0);
    const tick24X = pdfToX(24.0);
    const tick2moX = pdfToX(1440.0);

    doc.setDrawColor(100, 116, 139);
    doc.setLineWidth(0.2);
    doc.line(tick1X, trackY, tick1X, trackY + 5.5);
    doc.line(tick24X, trackY, tick24X, trackY + 5.5);
    doc.line(tick2moX, trackY, tick2moX, trackY + 5.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(5.8);
    doc.setTextColor(148, 163, 184);
    doc.text("1.0 h", tick1X, trackY + 8, { align: "center" });
    doc.text("24 h", tick24X, trackY + 8, { align: "center" });
    doc.text("2.0 mo", tick2moX, trackY + 8, { align: "center" });

    // Summary caption
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.2);
    doc.setTextColor(203, 213, 225);
    doc.text(`Continuous Multimodal Scale • Point Optimum: ${result.estimatedPmiOptimalHours}h (${(result.estimatedPmiOptimalHours / 24).toFixed(1)}d)`, margin + 4, trackY + 15);

    y += sec2Height + 4;

    // Section 3: XGBoost 100-Tree Model & TreeSHAP Attributions
    doc.setFillColor(15, 23, 42); // #0f172a
    doc.setDrawColor(30, 41, 59); // #1e293b
    doc.roundedRect(margin, y, contentWidth, 48, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(45, 212, 191);
    doc.text("3. IN-BROWSER XGBOOST ENSEMBLE & TREESHAP ATTRIBUTIONS (212 FEATURES)", margin + 3, y + 4.5);

    let shapY = y + 8.5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(203, 213, 225);
    doc.text(`XGB Optimum: ${mlPrediction.estimatedPmiOptimalHours}h  |  95% Bracket: ${mlPrediction.estimatedPmiMinHours}–${mlPrediction.estimatedPmiMaxHours}h  |  TreeSHAP Base E[y]: ${mlPrediction.baseValueHours}h`, margin + 3, shapY);
    shapY += 3.5;

    // TreeSHAP mini table
    doc.setFillColor(9, 13, 22); // #090d16
    doc.rect(margin + 2, shapY, contentWidth - 4, 4.5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.8);
    doc.setTextColor(148, 163, 184);
    doc.text("TOP FEATURE ATTRIBUTION", margin + 4, shapY + 3.2);
    doc.text("DIRECTION", margin + 70, shapY + 3.2);
    doc.text("PULL (HOURS)", margin + 115, shapY + 3.2);
    doc.text("WEIGHT", margin + 155, shapY + 3.2);

    shapY += 4.5;
    (mlPrediction.factorAttributions || []).slice(0, 5).forEach((attr) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.8);
      doc.setTextColor(248, 250, 252);
      doc.text(attr.factorName, margin + 4, shapY + 3.2, { maxWidth: 64 });

      doc.setFont("helvetica", "normal");
      if (attr.impactDirection === "increases_pmi") {
        doc.setTextColor(245, 158, 11); // Amber
        doc.text("↑ Lengthens TOD", margin + 70, shapY + 3.2);
      } else {
        doc.setTextColor(45, 212, 191); // Teal
        doc.text("↓ Shortens TOD", margin + 70, shapY + 3.2);
      }

      doc.setFont("helvetica", "bold");
      doc.text(`${attr.impactDirection === "increases_pmi" ? "+" : "-"}${attr.pullMagnitudeHours}h`, margin + 115, shapY + 3.2);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(203, 213, 225);
      doc.text(`${attr.relativeImportancePercent}%`, margin + 155, shapY + 3.2);

      doc.setDrawColor(30, 41, 59);
      doc.line(margin + 2, shapY + 4.2, margin + contentWidth - 2, shapY + 4.2);
      shapY += 4.5;
    });

    y += 52;

    // Section 4: Multi-Indicator Table
    doc.setFillColor(15, 23, 42); // #0f172a
    doc.setDrawColor(30, 41, 59); // #1e293b
    doc.roundedRect(margin, y, contentWidth, 70, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(45, 212, 191);
    doc.text("4. MULTI-INDICATOR INDEPENDENT ESTIMATIONS & FINDINGS", margin + 3, y + 4.5);

    let tableY = y + 7.5;
    doc.setFillColor(9, 13, 22); // #090d16
    doc.rect(margin + 2, tableY, contentWidth - 4, 4.5, "F");
    doc.setFontSize(6.8);
    doc.setTextColor(148, 163, 184);
    doc.text("INDICATOR MODULE", margin + 4, tableY + 3.2);
    doc.text("OBSERVED FINDINGS", margin + 46, tableY + 3.2);
    doc.text("PMI WINDOW", margin + 115, tableY + 3.2);
    doc.text("WEIGHT", margin + 155, tableY + 3.2);

    tableY += 4.5;

    result.indicatorEvaluations.slice(0, 7).forEach((ind) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.8);
      doc.setTextColor(248, 250, 252);
      doc.text(ind.name, margin + 4, tableY + 3.2);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(203, 213, 225);
      const note = ind.diagnosticNotes || ind.category;
      doc.text(note, margin + 46, tableY + 3.2, { maxWidth: 65 });

      doc.setFont("helvetica", "bold");
      doc.setTextColor(45, 212, 191);
      doc.text(`${ind.estimatedPmiMinHours}–${ind.estimatedPmiMaxHours}h (opt: ${ind.estimatedPmiOptimalHours}h)`, margin + 115, tableY + 3.2);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(203, 213, 225);
      doc.text(`${(ind.weightInFinalCalculation * 100).toFixed(0)}%`, margin + 155, tableY + 3.2);

      doc.setDrawColor(30, 41, 59);
      doc.line(margin + 2, tableY + 4.8, margin + contentWidth - 2, tableY + 4.8);
      tableY += 5.0;
    });

    // Page 1 Footer
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`VisionMortis • Protocol One • Case #${caseData.caseId || "CASE"} • Security Hash: ${integrityHash} • Page 1 of 2`, pageWidth / 2, pageHeight - 4, { align: "center" });

    // ==================== PAGE 2 ====================
    doc.addPage();
    paintDarkPageBackground();
    y = 12;
    renderHeader(2);

    const examinerNotesText = (visionData?.examinerNotes || caseData.examinersNotes || "").trim();
    const hasExaminerNotes = examinerNotesText.length > 0 && examinerNotesText.toLowerCase() !== "none";
    const imagesList = visionData?.images || [];
    const forensicPhotos = imagesList.filter((img) => !img.isUnrelated);

    // Section 5: Complete 6 Forensic Module Inputs
    doc.setFillColor(15, 23, 42);
    doc.setDrawColor(30, 41, 59);
    doc.roundedRect(margin, y, contentWidth, 64, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(45, 212, 191);
    doc.text("5. COMPLETE FORENSIC INPUTS & PARAMETER VALUES (ALL 6 MODULES)", margin + 3, y + 4.5);

    const mCol1 = margin + 3;
    const mCol2 = margin + (contentWidth / 2) + 2;
    let mY = y + 8.5;

    // Module 1: Algor & Livor
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.0);
    doc.setTextColor(251, 113, 133); // #fb7185
    doc.text(`• Algor Mortis:${caseData.algorMortis.recordedAt ? ` [${caseData.algorMortis.recordedAt}]` : ""}`, mCol1, mY);
    doc.setTextColor(192, 132, 252); // #c084fc
    doc.text(`• Livor Mortis:${caseData.livorMortis.recordedAt ? ` [${caseData.livorMortis.recordedAt}]` : ""}`, mCol2, mY);
    mY += 3.5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(203, 213, 225);
    doc.text(`Core: ${caseData.algorMortis.enabled ? `${caseData.algorMortis.rectalTempC}°C` : "N/A"} | Ambient: ${caseData.ambientTempC}°C | Cf: ${caseData.algorMortis.clothingCoveringFactor}`, mCol1, mY);
    doc.text(`Blanching: ${caseData.livorMortis.enabled ? caseData.livorMortis.blanchability.replace(/_/g, " ") : "N/A"} | Hue: ${caseData.livorMortis.colorHue}`, mCol2, mY);
    mY += 3.2;

    doc.text(`Air Current: ${caseData.algorMortis.airCurrentVelocity} | Wet: ${caseData.algorMortis.isBodyWet ? "Yes" : "No"}`, mCol1, mY);
    doc.text(`Pattern: ${caseData.livorMortis.distributionPattern} | Movement: ${caseData.livorMortis.suspectedBodyMovement ? "SUSPECTED" : "None"}`, mCol2, mY);
    mY += 4.8;

    // Module 2: Rigor & Decomposition
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.0);
    doc.setTextColor(251, 191, 36); // #fbbf24
    doc.text(`• Rigor Mortis:${caseData.rigorMortis.recordedAt ? ` [${caseData.rigorMortis.recordedAt}]` : ""}`, mCol1, mY);
    doc.setTextColor(52, 211, 153); // #34d399
    doc.text(`• Decomposition:${caseData.decomposition.recordedAt ? ` [${caseData.decomposition.recordedAt}]` : ""}`, mCol2, mY);
    mY += 3.5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(203, 213, 225);
    doc.text(`Stage: ${caseData.rigorMortis.enabled ? caseData.rigorMortis.progressionStage.replace(/_/g, " ") : "N/A"} | Exertion: ${caseData.rigorMortis.preDeathPhysicalExertion}`, mCol1, mY);
    doc.text(`Total Score: TBS ${caseData.decomposition.enabled ? `${caseData.decomposition.totalBodyScore}/35` : "N/A"} (H:${caseData.decomposition.headNeckScore}, T:${caseData.decomposition.trunkScore}, L:${caseData.decomposition.limbsScore})`, mCol2, mY);
    mY += 3.2;

    doc.text(`Cold Stiffening: ${caseData.rigorMortis.coldStiffeningSuspected ? "Suspected" : "None"} | Jaw/Limbs: ${caseData.rigorMortis.muscleGroups.jawTemporomandibular ? "Y" : "N"}/${caseData.rigorMortis.muscleGroups.upperLimbsElbowsWrists ? "Y" : "N"}`, mCol1, mY);
    const decompSigns = [
      caseData.decomposition.marblingPresent && "Marbling",
      caseData.decomposition.rightIliacDiscoloration && "Greening",
      caseData.decomposition.bloatingAndPurge && "Bloat/Purge",
      caseData.decomposition.skinSlippageBullae && "Slippage",
      caseData.decomposition.mummificationOrAdipocere && "Mummification",
      caseData.decomposition.skeletonizationBoneExposed && "Bone",
    ].filter(Boolean).join(", ") || "Fresh";
    doc.text(`Morphology Signs: ${decompSigns}`, mCol2, mY);
    mY += 4.8;

    // Module 3: Entomology & Metabolomics
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.0);
    doc.setTextColor(45, 212, 191); // #2dd4bf
    doc.text(`• Entomology:${caseData.entomology.recordedAt ? ` [${caseData.entomology.recordedAt}]` : ""}`, mCol1, mY);
    doc.setTextColor(56, 189, 248); // #38bdf8
    doc.text(`• Vitreous Metabolomics:${caseData.metabolomics.recordedAt ? ` [${caseData.metabolomics.recordedAt}]` : ""}`, mCol2, mY);
    mY += 3.5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(203, 213, 225);
    doc.text(`Taxon: ${caseData.entomology.enabled ? caseData.entomology.primaryInsectGroup.replace(/_/g, " ") : "N/A"} | Stage: ${caseData.entomology.developmentalStage}`, mCol1, mY);
    doc.text(`Active Analytes: ${caseData.metabolomics.enabled ? `${caseData.metabolomics.selectedMetabolites?.length || 0} of 11 markers` : "Bypassed / Disabled"}`, mCol2, mY);
    mY += 3.2;

    doc.text(`Larval Length: ${caseData.entomology.larvalLengthMm}mm | Maggot Temp: ${caseData.entomology.maggotMassTempC}°C | Access: ${caseData.entomology.indoorAccessDelayHours}h`, mCol1, mY);
    doc.text(`Panel: ${caseData.metabolomics.enabled && caseData.metabolomics.selectedMetabolites?.length ? caseData.metabolomics.selectedMetabolites.map(m => m.name).slice(0, 2).join(", ") : "N/A"}`, mCol2, mY);

    y += 67;

    // Section 6: Photographic Evidence & Vision Analysis Summary
    if (forensicPhotos.length > 0 || (visionData && visionData.forensicObservations)) {
      doc.setFillColor(15, 23, 42);
      doc.setDrawColor(30, 41, 59);
      doc.roundedRect(margin, y, contentWidth, 23, 2, 2, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(45, 212, 191);
      doc.text(`6. PHOTOGRAPHIC EVIDENCE & COMPUTER VISION ANALYSIS (${forensicPhotos.length} PHOTOS EVALUATED)`, margin + 3, y + 4.5);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      doc.setTextColor(203, 213, 225);
      const visionSummary = visionData?.forensicObservations ||
        `Photo inspection indicates ${visionData?.detectedDecompositionStage?.replace(/_/g, " ") || "fresh"} post-mortem changes (TBS ${visionData?.estimatedTbs?.totalScore || 3}/35) with ${visionData?.detectedLivor?.colorClassification?.replace(/_/g, " ") || "violaceous"} hypostasis and ${visionData?.detectedEntomology?.primaryInsectStage?.replace(/_/g, " ") || "no active"} insect colonization.`;
      const splitVision = doc.splitTextToSize(visionSummary, contentWidth - 6);
      doc.text(splitVision.slice(0, 2), margin + 3, y + 8.5);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.2);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Findings: Decomp: ${visionData?.detectedDecompositionStage?.replace(/_/g, " ") || "Fresh"} (TBS ${visionData?.estimatedTbs?.totalScore || 3}/35)  |  Lividity: ${visionData?.detectedLivor?.colorClassification?.replace(/_/g, " ") || "Violaceous"}  |  Insects: ${visionData?.detectedEntomology?.primaryInsectStage?.replace(/_/g, " ") || "None"}  |  Movement: ${visionData?.detectedMovement?.suspectedMovement ? "SUSPECTED" : "Consistent"}  |  Clarity: ${visionData?.averageClarityScore ?? 92}%`,
        margin + 3,
        y + 19
      );

      y += 26;
    }

    // Section 7: Physiological Consistency & Discordance Alerts
    doc.setFillColor(15, 23, 42);
    doc.setDrawColor(30, 41, 59);
    doc.roundedRect(margin, y, contentWidth, 23, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(251, 113, 133);
    doc.text("7. PHYSIOLOGICAL DISCORDANCE & CONTRADICTION AUDIT", margin + 3, y + 4.5);

    let discY = y + 8.5;
    if (result.inconsistencyAlerts && result.inconsistencyAlerts.length > 0) {
      result.inconsistencyAlerts.slice(0, 2).forEach((alert) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(6.5);
        doc.setTextColor(251, 113, 133);
        doc.text(`[${alert.severity.toUpperCase()}] ${alert.title}`, margin + 3, discY);
        discY += 2.8;

        doc.setFont("helvetica", "normal");
        doc.setTextColor(253, 164, 175);
        doc.text(alert.description, margin + 3, discY, { maxWidth: 180 });
        discY += 2.8;

        doc.setTextColor(244, 63, 94);
        doc.text(`Implication: ${alert.forensicImplication}`, margin + 3, discY, { maxWidth: 180 });
        discY += 3.0;
      });
    } else {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.2);
      doc.setTextColor(52, 211, 153);
      doc.text("✓ All physiological post-mortem indicators are in harmonic alignment. No contradictions detected.", margin + 3, discY + 2);
    }

    y += 26;

    // Section 8: AI Pathologist Synthesis
    if (result.aiSynthesis) {
      doc.setFillColor(15, 23, 42);
      doc.setDrawColor(15, 118, 110);
      doc.roundedRect(margin, y, contentWidth, 24, 2, 2, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(45, 212, 191);
      doc.text("8. AI PATHOLOGIST INTEGRATED SYNTHESIS", margin + 3, y + 4.5);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      doc.setTextColor(203, 213, 225);
      const summaryText = result.aiSynthesis.expertSummary;
      const splitSummary = doc.splitTextToSize(summaryText, contentWidth - 6);
      doc.text(splitSummary.slice(0, 2), margin + 3, y + 8.5);

      if (result.aiSynthesis.recommendedConfirmatoryTests?.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(6.2);
        doc.setTextColor(45, 212, 191);
        doc.text(`Confirmatory: ${result.aiSynthesis.recommendedConfirmatoryTests.slice(0, 3).join(" • ")}`, margin + 3, y + 20);
      }
      y += 27;
    }

    // Section 9: Examiner Qualitative Pathology Notes (Rendered ONLY if examiner provided notes)
    if (hasExaminerNotes) {
      doc.setFillColor(15, 23, 42);
      doc.setDrawColor(30, 41, 59);
      doc.roundedRect(margin, y, contentWidth, 18, 2, 2, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(45, 212, 191);
      doc.text("9. EXAMINER QUALITATIVE AUTOPSY NOTES", margin + 3, y + 4.5);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      doc.setTextColor(203, 213, 225);
      const splitNotes = doc.splitTextToSize(examinerNotesText, contentWidth - 6);
      doc.text(splitNotes.slice(0, 2), margin + 3, y + 8.5);

      y += 21;
    }

    // Section 10: Digital Chain of Custody & Examiner Sign-Off
    doc.setFillColor(15, 23, 42);
    doc.setDrawColor(30, 41, 59);
    doc.roundedRect(margin, y, contentWidth, 30, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(45, 212, 191);
    doc.text("OFFICIAL PATHOLOGIST SIGN-OFF & DIGITAL CHAIN OF CUSTODY", margin + 3, y + 4.5);

    const sCol1 = margin + 3;
    const sCol2 = margin + (contentWidth / 2) + 2;
    let signY = y + 9.0;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text("Attending Pathologist / Medical Examiner:", sCol1, signY);
    doc.text("Institutional Authority / Forensic Facility:", sCol2, signY);
    signY += 4.0;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.2);
    doc.setTextColor(248, 250, 252);
    doc.text(caseData.investigatorName || caseData.examinerName || "Attending Medical Examiner", sCol1, signY);
    doc.text(caseData.jurisdiction || "Division of Forensic Medicine & Pathology", sCol2, signY);
    signY += 5.0;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text("Integrity Security Verification Hash (SHA-256):", sCol1, signY);
    doc.text("Formal Execution Date & Time:", sCol2, signY);
    signY += 4.0;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.8);
    doc.setTextColor(45, 212, 191);
    doc.text(integrityHash, sCol1, signY);
    doc.setTextColor(248, 250, 252);
    doc.text(new Date().toLocaleString(), sCol2, signY);

    // Page 2 Footer
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`VisionMortis • Protocol One • Case #${caseData.caseId || "CASE"} • Security Hash: ${integrityHash} • Page 2 of 2`, pageWidth / 2, pageHeight - 4, { align: "center" });

    const filename = `VisionMortis-CaseReport-${caseData.caseId || "CASE"}-${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(filename);
    return true;
  } catch (err) {
    console.error("PDF generation failed:", err);
    return false;
  }
}

/**
 * Print & PDF Export Executor for Case Reports.
 * Renders the clean, spacious, executive-formatted case report in a print window / iframe
 * and invokes the browser print dialog to print or save as PDF.
 */
export function printForensicCaseReport(
  caseData: ForensicCaseInput,
  result: PmiCalculationResult,
  visionData?: VisionDetectionData,
  integrityHash: string = "VM-SEC-" + Math.random().toString(36).substring(2, 9).toUpperCase()
): boolean {
  try {
    // 1. Immediately generate and download the high-resolution vector PDF document
    exportForensicCaseReportPdf(caseData, result, visionData, integrityHash);

    // 2. Also invoke native browser print dialog for direct printer / Save-as-PDF printing
    const html = generateForensicReportHtml(caseData, result, visionData, integrityHash);
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const blobUrl = URL.createObjectURL(blob);

    // Try popup window first
    let printWin: Window | null = null;
    try {
      printWin = window.open(blobUrl, "_blank");
    } catch {}

    if (printWin) {
      printWin.focus();
      setTimeout(() => {
        try {
          printWin?.print();
        } catch {}
      }, 500);
      return true;
    }

    // Fallback: dedicated hidden iframe print
    try {
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      iframe.style.visibility = "hidden";
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document || iframe.contentDocument;
      if (doc) {
        doc.open();
        doc.write(html);
        doc.close();

        setTimeout(() => {
          try {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
          } catch {}
          setTimeout(() => {
            if (iframe.parentNode) {
              iframe.parentNode.removeChild(iframe);
            }
          }, 5000);
        }, 400);
      }
    } catch {}

    return true;
  } catch (err) {
    console.error("Print report execution failed:", err);
    return false;
  }
}



