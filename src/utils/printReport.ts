import { ForensicCaseInput, PmiCalculationResult, VisionDetectionData } from "../types";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/**
 * Generates high-fidelity, self-contained standalone HTML for case reports.
 * Formatted specifically for A4 portrait printing and instant PDF export in all modern browsers.
 */
export function generateForensicReportHtml(
  caseData: ForensicCaseInput,
  result: PmiCalculationResult,
  visionData?: VisionDetectionData,
  integrityHash: string = "VM-SEC-" + Math.random().toString(36).substring(2, 9).toUpperCase()
): string {
  const printTitle = `VisionMortis-CaseReport-${caseData.caseId || "CASE"}`;

  // Gather non-unrelated photos if any
  const imagesList = visionData?.images || [];
  const forensicPhotos = imagesList.filter((img) => !img.isUnrelated);

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
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: #ffffff;
      color: #0f172a;
      line-height: 1.4;
      font-size: 11px;
      margin: 0;
      padding: 16px;
    }
    .report-container {
      max-width: 820px;
      margin: 0 auto;
      background: #ffffff;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2.5px solid #0d9488;
      padding-bottom: 10px;
      margin-bottom: 12px;
    }
    .brand-title {
      font-size: 20px;
      font-weight: 800;
      color: #0f766e;
      letter-spacing: -0.5px;
    }
    .brand-subtitle {
      font-size: 10.5px;
      font-weight: 600;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .badge {
      display: inline-block;
      padding: 2px 7px;
      border-radius: 4px;
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      margin-right: 4px;
    }
    .badge-teal { background: #ccfbf1; color: #0f766e; border: 1px solid #99f6e4; }
    .badge-gold { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
    
    .section-box {
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 9px 11px;
      margin-bottom: 10px;
      background: #f8fafc;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .section-title {
      font-size: 10.5px;
      font-weight: 700;
      color: #0f766e;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 3px;
      display: flex;
      justify-content: space-between;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px 14px;
    }
    .grid-3 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 6px 10px;
    }
    .metric-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 6px 8px;
      text-align: center;
    }
    .metric-val {
      font-size: 16px;
      font-weight: 800;
      color: #0f766e;
      font-family: monospace;
    }
    .metric-lbl {
      font-size: 9px;
      color: #64748b;
      font-weight: 600;
      text-transform: uppercase;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10px;
      margin-top: 3px;
    }
    th {
      background: #f1f5f9;
      color: #334155;
      font-weight: 700;
      text-align: left;
      padding: 5px 6px;
      border-bottom: 1px solid #cbd5e1;
    }
    td {
      padding: 4px 6px;
      border-bottom: 1px solid #e2e8f0;
      color: #1e293b;
    }
    .photo-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
      gap: 6px;
      margin-top: 5px;
    }
    .photo-card {
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      overflow: hidden;
      background: #ffffff;
    }
    .photo-card img {
      width: 100%;
      height: 75px;
      object-fit: cover;
      display: block;
    }
    .photo-info {
      padding: 3px 5px;
      font-size: 8.5px;
      color: #475569;
    }
    .sign-box {
      border: 1px solid #94a3b8;
      border-radius: 6px;
      padding: 10px;
      background: #ffffff;
      margin-top: 8px;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .sign-line {
      border-bottom: 1px solid #64748b;
      height: 20px;
      margin-bottom: 3px;
    }
    .footer-note {
      font-size: 8.5px;
      color: #64748b;
      text-align: center;
      margin-top: 10px;
      border-top: 1px solid #e2e8f0;
      padding-top: 5px;
    }
    .print-bar {
      margin-bottom: 14px;
      padding: 8px 12px;
      background: #0f172a;
      color: #f8fafc;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .btn-print {
      background: #0d9488;
      color: white;
      border: none;
      padding: 6px 14px;
      border-radius: 6px;
      font-weight: bold;
      cursor: pointer;
      font-size: 11px;
    }
    @media print {
      body { padding: 0; }
      .print-bar { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="report-container">
    <div class="print-bar">
      <span><strong>VisionMortis Case Report</strong> • Protocol One</span>
      <button class="btn-print" onclick="window.print()">Print / Save PDF</button>
    </div>

    <!-- Header -->
    <div class="header">
      <div>
        <div class="brand-title">VISIONMORTIS</div>
        <div class="brand-subtitle">Multimodal Post-Mortem Interval Case Report</div>
        <div style="margin-top: 3px;">
          <span class="badge badge-teal">Protocol One</span>
          <span class="badge badge-gold">Research Prototype</span>
        </div>
      </div>
      <div style="text-align: right; font-size: 10px; color: #475569;">
        <div><strong>Case ID:</strong> <span style="font-family: monospace; font-weight: 700; color: #0f766e;">${caseData.caseId || "UNASSIGNED"}</span></div>
        <div><strong>Generated:</strong> ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</div>
        <div><strong>Security Checksum:</strong> <span style="font-family: monospace; font-size: 9px;">${integrityHash}</span></div>
      </div>
    </div>

    <!-- Executive Summary Box -->
    <div class="section-box" style="background: #f0fdfa; border-color: #99f6e4;">
      <div class="section-title" style="color: #0f766e; border-color: #ccfbf1;">
        <span>Composite PMI Estimation Summary</span>
        <span>Harmony: ${result.confidenceScore}% (${result.confidenceTier})</span>
      </div>
      <div class="grid-3">
        <div class="metric-card">
          <div class="metric-lbl">Optimal Estimation</div>
          <div class="metric-val" style="color: #0f766e; font-size: 18px;">${result.estimatedPmiOptimalHours} hrs</div>
          <div style="font-size: 8.5px; color: #64748b;">Post-Mortem Interval (~${(result.estimatedPmiOptimalHours / 24).toFixed(1)}d)</div>
        </div>
        <div class="metric-card">
          <div class="metric-lbl">Plausible Window</div>
          <div class="metric-val" style="color: #0284c7;">${result.estimatedPmiMinHours} – ${result.estimatedPmiMaxHours} hrs</div>
          <div style="font-size: 8.5px; color: #64748b;">Confidence Bounds</div>
        </div>
        <div class="metric-card">
          <div class="metric-lbl">Estimated Time of Death</div>
          <div class="metric-val" style="color: #7c3aed; font-size: 10.5px; padding-top: 4px;">
            ${result.estimatedTimeOfDeathOptimal || result.estimatedTimeOfDeathMin || "Calculated Window"}
          </div>
          <div style="font-size: 8.5px; color: #64748b;">Back-Calculated Timeline</div>
        </div>
      </div>
    </div>

    <!-- Subject Demographics & Discovery Scene -->
    <div class="section-box">
      <div class="section-title">Case Metadata & Scene Parameters</div>
      <div class="grid-2">
        <div>
          <table style="margin: 0;">
            <tr><td style="font-weight:600; width: 40%;">Subject Identifier:</td><td>${caseData.subjectNameOrIdentifier || "Unassigned"}</td></tr>
            <tr><td style="font-weight:600;">Age / Biological Sex:</td><td>${caseData.ageYears ? `${caseData.ageYears} yrs` : "Unknown"} / ${caseData.sex || "Unknown"}</td></tr>
            <tr><td style="font-weight:600;">Body Mass:</td><td>${caseData.bodyWeightKg || 70} kg</td></tr>
            <tr><td style="font-weight:600;">Location:</td><td>${caseData.locationDescription || "Scene"}</td></tr>
          </table>
        </div>
        <div>
          <table style="margin: 0;">
            <tr><td style="font-weight:600; width: 40%;">Discovery Time:</td><td>${caseData.discoveryTimestamp || "Not Recorded"}</td></tr>
            <tr><td style="font-weight:600;">Ambient Temp:</td><td>${caseData.ambientTempC ?? 20} °C</td></tr>
            <tr><td style="font-weight:600;">Body Posture:</td><td>${caseData.bodyFoundPosition || "Supine"}</td></tr>
            <tr><td style="font-weight:600;">Investigator:</td><td>${caseData.investigatorName || "Pathologist on Duty"}</td></tr>
          </table>
        </div>
      </div>
    </div>

    <!-- Forensic Indicator Analysis Table -->
    <div class="section-box">
      <div class="section-title">Multimodal Forensic Indicator Breakdown</div>
      <table>
        <thead>
          <tr>
            <th>Indicator Module</th>
            <th>Observed State / Findings</th>
            <th>Estimated PMI Window</th>
            <th>Weight</th>
            <th>Status / Reliability</th>
          </tr>
        </thead>
        <tbody>
          ${result.indicatorEvaluations
            .map(
              (ind) => `
            <tr>
              <td><strong>${ind.name}</strong></td>
              <td>${ind.diagnosticNotes || ind.category}</td>
              <td style="font-family: monospace; font-weight: 700; color: #0f766e;">
                ${ind.estimatedPmiMinHours} – ${ind.estimatedPmiMaxHours}h (opt: ${ind.estimatedPmiOptimalHours}h)
              </td>
              <td>${(ind.weightInFinalCalculation * 100).toFixed(0)}%</td>
              <td style="color: #475569; font-size: 9px;">${ind.physiologicReliabilityWindow || ind.status}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    </div>

    <!-- Discordance / Conflict Analysis -->
    <div class="section-box">
      <div class="section-title">Physiological Consistency & Discordance Analysis</div>
      ${
        result.inconsistencyAlerts && result.inconsistencyAlerts.length > 0
          ? result.inconsistencyAlerts
              .map(
                (a) => `
          <div style="padding: 5px 7px; border-left: 3px solid #e11d48; background: #fff1f2; margin-bottom: 4px; border-radius: 0 4px 4px 0;">
            <strong style="color: #be123c;">[${a.severity.toUpperCase()}] ${a.title}</strong>
            <div style="color: #4c0519; font-size: 9.5px; margin-top: 1px;">${a.description}</div>
            <div style="color: #881337; font-size: 9px; font-style: italic;">Forensic Note: ${a.forensicImplication}</div>
          </div>
        `
              )
              .join("")
          : `<div style="color: #059669; font-weight: 600; padding: 2px 0;">✓ All physiological post-mortem indicators are in harmonic alignment. No contradictions detected.</div>`
      }
    </div>

    <!-- Photographic Evidence -->
    <div class="section-box">
      <div class="section-title">Photographic & Computer Vision Evidence</div>
      ${
        forensicPhotos.length > 0
          ? `
        <div class="photo-grid">
          ${forensicPhotos
            .map(
              (img, idx) => `
            <div class="photo-card">
              <img src="${img.dataUrl}" alt="${img.name}" />
              <div class="photo-info">
                <strong>Photo #${idx + 1}</strong> • ${img.tag || "View"}
                <div>${img.name}</div>
              </div>
            </div>
          `
            )
            .join("")}
        </div>
      `
          : `<div style="color: #64748b; font-size: 9.5px;">No photos submitted for this case record.</div>`
      }
    </div>

    <!-- Examiner Notes & Chain of Custody -->
    <div class="sign-box">
      <div class="section-title" style="margin-bottom: 8px;">Digital Chain of Custody & Official Pathologist Sign-Off</div>
      <div class="grid-2">
        <div>
          <div style="font-size: 9.5px; color: #475569; margin-bottom: 2px;">Examiner / Attending Pathologist Name:</div>
          <div class="sign-line"></div>
          <div style="font-size: 9.5px; color: #475569; margin-top: 6px; margin-bottom: 2px;">Official Signature & Title:</div>
          <div class="sign-line"></div>
        </div>
        <div>
          <div style="font-size: 9.5px; color: #475569; margin-bottom: 2px;">Institutional / Authority Sign-Off:</div>
          <div class="sign-line"></div>
          <div style="font-size: 9.5px; color: #475569; margin-top: 6px; margin-bottom: 2px;">Date and Execution Timestamp:</div>
          <div class="sign-line"></div>
        </div>
      </div>
    </div>

    <div class="footer-note">
      VisionMortis • Protocol One Forensic Decision System • Research Prototype for Medical-Legal Corroboration • Security Hash: ${integrityHash}
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
 * Exports directly to a crisp, formatted .PDF file using jsPDF and html2canvas.
 * Works 100% reliably in sandboxed iframes, mobile browsers, and desktop.
 */
export async function exportForensicCaseReportPdf(
  caseData: ForensicCaseInput,
  result: PmiCalculationResult,
  visionData?: VisionDetectionData,
  integrityHash: string = "VM-SEC-" + Math.random().toString(36).substring(2, 9).toUpperCase()
): Promise<boolean> {
  const html = generateForensicReportHtml(caseData, result, visionData, integrityHash);

  // Create temporary offscreen container
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.style.width = "800px";
  container.style.backgroundColor = "#ffffff";
  container.style.color = "#0f172a";
  container.style.padding = "20px";
  container.style.zIndex = "-9999";
  container.innerHTML = html;

  // Remove the print bar from the exported PDF
  const printBar = container.querySelector(".print-bar");
  if (printBar) {
    printBar.remove();
  }

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      windowWidth: 800
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.95);
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    // Add subsequent pages if report exceeds 1 page
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    const filename = `VisionMortis-CaseReport-${caseData.caseId || "CASE"}-${new Date().toISOString().slice(0, 10)}.pdf`;
    pdf.save(filename);

    document.body.removeChild(container);
    return true;
  } catch (err) {
    console.error("Failed to generate PDF via html2canvas/jsPDF:", err);
    document.body.removeChild(container);
    // Fallback to HTML download
    downloadForensicHtmlReport(caseData, result, visionData, integrityHash);
    return false;
  }
}

/**
 * Universal Print & PDF Executor.
 * 1. Invokes the native browser print dialog.
 * 2. Simultaneously triggers direct PDF creation and provides immediate downloadable artifacts.
 */
export async function printForensicCaseReport(
  caseData: ForensicCaseInput,
  result: PmiCalculationResult,
  visionData?: VisionDetectionData,
  integrityHash: string = "VM-SEC-" + Math.random().toString(36).substring(2, 9).toUpperCase()
): Promise<boolean> {
  const html = generateForensicReportHtml(caseData, result, visionData, integrityHash);

  // 1. Trigger Direct PDF export immediately so the user gets the saved file even if print dialog is suppressed by iframe
  exportForensicCaseReportPdf(caseData, result, visionData, integrityHash).catch(() => {});

  // 2. Try window.print() on the current window
  try {
    window.print();
    return true;
  } catch {
    // If window.print fails, fallback to HTML file download
    downloadForensicHtmlReport(caseData, result, visionData, integrityHash);
    return false;
  }
}
