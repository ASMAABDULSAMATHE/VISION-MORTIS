import { PmiCalculationResult, ForensicCaseInput } from "../types";
import { InBrowserPredictionResult } from "./inBrowserXgbModel";

/**
 * Downloads a file to the user's browser
 */
export function triggerFileDownload(content: string | Blob, filename: string, mimeType: string = "text/plain") {
  const blob = typeof content === "string" ? new Blob([content], { type: mimeType }) : content;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

/**
 * Converts an SVG string into a high-resolution PNG Blob and downloads it
 */
export async function downloadSvgAsPng(svgString: string, filename: string, width = 1200, height = 700): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);
      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          URL.revokeObjectURL(url);
          triggerFileDownload(svgString, filename.replace(/\.png$/i, ".svg"), "image/svg+xml");
          resolve();
          return;
        }

        // Dark slate background
        ctx.fillStyle = "#090d16";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        URL.revokeObjectURL(url);
        canvas.toBlob((blob) => {
          if (blob) {
            triggerFileDownload(blob, filename, "image/png");
            resolve();
          } else {
            triggerFileDownload(svgString, filename.replace(/\.png$/i, ".svg"), "image/svg+xml");
            resolve();
          }
        }, "image/png");
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        triggerFileDownload(svgString, filename.replace(/\.png$/i, ".svg"), "image/svg+xml");
        resolve();
      };

      img.src = url;
    } catch (err) {
      console.error("SVG to PNG conversion error, falling back to SVG:", err);
      triggerFileDownload(svgString, filename.replace(/\.png$/i, ".svg"), "image/svg+xml");
      resolve();
    }
  });
}

/**
 * Generates an SVG string for the Henssge Double-Exponential Cooling Curve
 */
export function generateHenssgeCoolingSvg(result: PmiCalculationResult, caseData?: ForensicCaseInput): string {
  const width = 1000;
  const height = 480;
  const margin = { top: 32, right: 60, bottom: 65, left: 80 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;

  const data = result.coolingCurveData || [];
  const maxHour = Math.max(36, ...data.map((d) => d.hour));
  const minTemp = Math.min(caseData?.ambientTempC ?? 15, ...data.map((d) => d.lowerConfidence ?? 15), 10);
  const maxTemp = 40;

  const scaleX = (hour: number) => margin.left + (hour / maxHour) * plotWidth;
  const scaleY = (temp: number) => margin.top + plotHeight - ((temp - minTemp) / (maxTemp - minTemp)) * plotHeight;

  // Build polygon for 95% confidence interval
  let areaPath = "";
  if (data.length > 0) {
    const upperPoints = data.map((d) => `${scaleX(d.hour)},${scaleY(d.upperConfidence)}`);
    const lowerPoints = [...data].reverse().map((d) => `${scaleX(d.hour)},${scaleY(d.lowerConfidence)}`);
    areaPath = `M ${upperPoints.join(" L ")} L ${lowerPoints.join(" L ")} Z`;
  }

  // Build main cooling curve line
  const linePoints = data.map((d) => `${scaleX(d.hour)},${scaleY(d.temperature)}`).join(" L ");

  // Grid lines
  let gridLines = "";
  for (let t = Math.ceil(minTemp / 5) * 5; t <= maxTemp; t += 5) {
    const y = scaleY(t);
    gridLines += `<line x1="${margin.left}" y1="${y}" x2="${width - margin.right}" y2="${y}" stroke="#1e293b" stroke-dasharray="3,3" />`;
    gridLines += `<text x="${margin.left - 12}" y="${y + 4}" fill="#64748b" font-family="monospace" font-size="11" text-anchor="end">${t}°C</text>`;
  }

  for (let h = 0; h <= maxHour; h += 6) {
    const x = scaleX(h);
    gridLines += `<line x1="${x}" y1="${margin.top}" x2="${x}" y2="${height - margin.bottom}" stroke="#1e293b" stroke-dasharray="3,3" />`;
    gridLines += `<text x="${x}" y="${height - margin.bottom + 20}" fill="#64748b" font-family="monospace" font-size="11" text-anchor="middle">${h}h</text>`;
  }

  // Current Rectal & Optimum PMI Marker
  const optX = scaleX(result.estimatedPmiOptimalHours);
  const optRectal = caseData?.algorMortis?.rectalTempC ?? 30;
  const optY = scaleY(optRectal);

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" style="background-color: #090d16;">
  <!-- Background -->
  <rect width="${width}" height="${height}" fill="#090d16"/>
  <rect x="${margin.left}" y="${margin.top}" width="${plotWidth}" height="${plotHeight}" fill="#0f172a" rx="8" stroke="#1e293b"/>

  <!-- Grid & Axis Lines -->
  ${gridLines}

  <!-- 95% Confidence Shaded Area -->
  ${areaPath ? `<path d="${areaPath}" fill="#14b8a6" fill-opacity="0.15" stroke="none" />` : ""}

  <!-- Cooling Trajectory Line -->
  ${linePoints ? `<path d="M ${linePoints}" fill="none" stroke="#2dd4bf" stroke-width="3" stroke-linecap="round"/>` : ""}

  <!-- Optimum Intersect Point -->
  <line x1="${optX}" y1="${margin.top}" x2="${optX}" y2="${height - margin.bottom}" stroke="#14b8a6" stroke-width="1.5" stroke-dasharray="4,4"/>
  <circle cx="${optX}" cy="${optY}" r="6" fill="#2dd4bf" stroke="#090d16" stroke-width="2"/>

  <rect x="${optX + 10}" y="${optY - 26}" width="160" height="26" fill="#134e4a" rx="4" stroke="#2dd4bf"/>
  <text x="${optX + 18}" y="${optY - 9}" fill="#ccfbf1" font-family="monospace" font-size="11" font-weight="bold">Optimum: ${result.estimatedPmiOptimalHours}h @ ${optRectal}°C</text>

  <!-- Axis Labels -->
  <text x="${margin.left + plotWidth / 2}" y="${height - 20}" fill="#94a3b8" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">Post-Mortem Interval Elapsed (Hours)</text>
  <text x="24" y="${margin.top + plotHeight / 2}" fill="#94a3b8" font-family="sans-serif" font-size="12" font-weight="bold" transform="rotate(-90 24 ${margin.top + plotHeight / 2})" text-anchor="middle">Body Core / Rectal Temp (°C)</text>

  <!-- Footer Brand -->
  <text x="${width - margin.right}" y="${height - 20}" fill="#475569" font-family="sans-serif" font-size="10" text-anchor="end">VisionMortis • Protocol One Forensic Engineering</text>
</svg>`.trim();
}

/**
 * Generates an SVG string for the PMI Probability Density Curve
 */
export function generatePmiDistributionSvg(result: PmiCalculationResult, caseData?: ForensicCaseInput): string {
  const width = 1000;
  const height = 480;
  const margin = { top: 32, right: 60, bottom: 65, left: 80 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;

  const data = result.probabilityDistribution || [];
  const maxHour = Math.max(36, ...data.map((d) => d.pmiHours));
  const maxProb = Math.max(5, ...data.map((d) => d.probability));

  const scaleX = (hour: number) => margin.left + (hour / maxHour) * plotWidth;
  const scaleY = (prob: number) => margin.top + plotHeight - (prob / maxProb) * plotHeight;

  // Build polygon for density fill
  let areaPath = "";
  let linePoints = "";
  if (data.length > 0) {
    const points = data.map((d) => `${scaleX(d.pmiHours)},${scaleY(d.probability)}`);
    linePoints = points.join(" L ");
    areaPath = `M ${scaleX(data[0].pmiHours)},${scaleY(0)} L ${points.join(" L ")} L ${scaleX(data[data.length - 1].pmiHours)},${scaleY(0)} Z`;
  }

  // Grid lines
  let gridLines = "";
  for (let p = 0; p <= maxProb; p += Math.ceil(maxProb / 5)) {
    const y = scaleY(p);
    gridLines += `<line x1="${margin.left}" y1="${y}" x2="${width - margin.right}" y2="${y}" stroke="#1e293b" stroke-dasharray="3,3" />`;
    gridLines += `<text x="${margin.left - 12}" y="${y + 4}" fill="#64748b" font-family="monospace" font-size="11" text-anchor="end">${p.toFixed(1)}%</text>`;
  }

  for (let h = 0; h <= maxHour; h += 6) {
    const x = scaleX(h);
    gridLines += `<line x1="${x}" y1="${margin.top}" x2="${x}" y2="${height - margin.bottom}" stroke="#1e293b" stroke-dasharray="3,3" />`;
    gridLines += `<text x="${x}" y="${height - margin.bottom + 20}" fill="#64748b" font-family="monospace" font-size="11" text-anchor="middle">${h}h</text>`;
  }

  const optX = scaleX(result.estimatedPmiOptimalHours);
  const minX = scaleX(result.estimatedPmiMinHours);
  const maxX = scaleX(result.estimatedPmiMaxHours);

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" style="background-color: #090d16;">
  <rect width="${width}" height="${height}" fill="#090d16"/>
  <rect x="${margin.left}" y="${margin.top}" width="${plotWidth}" height="${plotHeight}" fill="#0f172a" rx="8" stroke="#1e293b"/>

  <!-- Grid lines -->
  ${gridLines}

  <!-- 95% Confidence Bracket Highlight Shading -->
  <rect x="${minX}" y="${margin.top}" width="${maxX - minX}" height="${plotHeight}" fill="#0d9488" fill-opacity="0.1" />

  <!-- Shaded Density Area -->
  ${areaPath ? `<path d="${areaPath}" fill="#14b8a6" fill-opacity="0.3" stroke="none" />` : ""}

  <!-- Density Outline Line -->
  ${linePoints ? `<path d="M ${linePoints}" fill="none" stroke="#2dd4bf" stroke-width="3" stroke-linecap="round"/>` : ""}

  <!-- Median Peak Line -->
  <line x1="${optX}" y1="${margin.top}" x2="${optX}" y2="${height - margin.bottom}" stroke="#5eead4" stroke-width="2.5" stroke-dasharray="4,4"/>
  <rect x="${optX - 55}" y="${margin.top + 10}" width="110" height="24" fill="#134e4a" rx="4" stroke="#2dd4bf"/>
  <text x="${optX}" y="${margin.top + 26}" fill="#ccfbf1" font-family="monospace" font-size="11" font-weight="bold" text-anchor="middle">Peak: ${result.estimatedPmiOptimalHours}h</text>

  <!-- 95% CI Limit Lines -->
  <line x1="${minX}" y1="${margin.top}" x2="${minX}" y2="${height - margin.bottom}" stroke="#0d9488" stroke-width="1.5" stroke-dasharray="2,2"/>
  <line x1="${maxX}" y1="${margin.top}" x2="${maxX}" y2="${height - margin.bottom}" stroke="#0d9488" stroke-width="1.5" stroke-dasharray="2,2"/>

  <!-- Axis Labels -->
  <text x="${margin.left + plotWidth / 2}" y="${height - 20}" fill="#94a3b8" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">Estimated Post-Mortem Interval (Hours)</text>
  <text x="24" y="${margin.top + plotHeight / 2}" fill="#94a3b8" font-family="sans-serif" font-size="12" font-weight="bold" transform="rotate(-90 24 ${margin.top + plotHeight / 2})" text-anchor="middle">Probability Density (%)</text>

  <!-- Footer Brand -->
  <text x="${width - margin.right}" y="${height - 20}" fill="#475569" font-family="sans-serif" font-size="10" text-anchor="end">VisionMortis • Protocol One Forensic Engineering</text>
</svg>`.trim();
}

/**
 * Generates an SVG string for the Factor Attribution & TreeSHAP Waterfall / Bar Chart
 */
export function generateFactorAttributionSvg(
  result: PmiCalculationResult,
  mlPredictionData?: InBrowserPredictionResult | null,
  caseData?: ForensicCaseInput
): string {
  const width = 1050;
  const margin = { top: 40, right: 60, bottom: 45, left: 240 };
  const plotWidth = width - margin.left - margin.right;

  // Use XGBoost TreeSHAP attributions if available, or composite factor attributions
  const items = (mlPredictionData?.factorAttributions && mlPredictionData.factorAttributions.length > 0)
    ? mlPredictionData.factorAttributions.slice(0, 8).map((a) => ({
        name: a.factorName,
        pull: a.impactDirection === "increases_pmi" ? a.pullMagnitudeHours : -a.pullMagnitudeHours,
        weight: a.relativeImportancePercent,
        explanation: a.explanation,
      }))
    : (result.factorAttributions || []).slice(0, 8).map((a) => ({
        name: a.factorName,
        pull: a.impactDirection === "increases_pmi" ? a.pullMagnitudeHours : -a.pullMagnitudeHours,
        weight: a.relativeImportancePercent,
        explanation: a.explanation,
      }));

  const rowHeight = 44;
  const contentHeight = Math.max(1, items.length) * rowHeight;
  const height = margin.top + contentHeight + margin.bottom;

  const maxAbsPull = Math.max(5, ...items.map((i) => Math.abs(i.pull)));
  const zeroX = margin.left + plotWidth / 2;
  const scaleX = (pull: number) => zeroX + (pull / maxAbsPull) * (plotWidth / 2 - 20);

  let rowsSvg = "";

  items.forEach((item, idx) => {
    const y = margin.top + idx * rowHeight + 10;
    const isPositive = item.pull >= 0;
    const barX = isPositive ? zeroX : scaleX(item.pull);
    const barWidth = Math.abs(scaleX(item.pull) - zeroX);
    const barColor = isPositive ? "#f59e0b" : "#14b8a6";
    const bgRowColor = idx % 2 === 0 ? "#0f172a" : "#0b1120";

    rowsSvg += `
      <rect x="20" y="${y - 4}" width="${width - 40}" height="${rowHeight - 6}" fill="${bgRowColor}" rx="6" />
      <text x="${margin.left - 16}" y="${y + 14}" fill="#f1f5f9" font-family="sans-serif" font-size="12" font-weight="600" text-anchor="end">${item.name}</text>
      <text x="${margin.left - 16}" y="${y + 28}" fill="#64748b" font-family="sans-serif" font-size="9.5" text-anchor="end">${item.explanation.slice(0, 36)}</text>
      
      <!-- Bar -->
      <rect x="${barX}" y="${y + 4}" width="${Math.max(4, barWidth)}" height="20" fill="${barColor}" rx="4" />
      
      <!-- Value Label -->
      <text x="${isPositive ? barX + barWidth + 8 : barX - 8}" y="${y + 18}" fill="${barColor}" font-family="monospace" font-size="11" font-weight="bold" text-anchor="${isPositive ? "start" : "end"}">
        ${isPositive ? "+" : ""}${item.pull.toFixed(1)}h
      </text>
    `;
  });

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" style="background-color: #090d16;">
  <rect width="${width}" height="${height}" fill="#090d16"/>
  <rect x="20" y="10" width="${width - 40}" height="${height - 20}" fill="#0b1120" rx="10" stroke="#1e293b"/>

  <!-- Center Zero Baseline -->
  <line x1="${zeroX}" y1="${margin.top - 5}" x2="${zeroX}" y2="${margin.top + items.length * rowHeight + 5}" stroke="#475569" stroke-width="2" stroke-dasharray="4,4"/>
  <text x="${zeroX}" y="${margin.top - 12}" fill="#94a3b8" font-family="monospace" font-size="10" text-anchor="middle">Baseline 0.0h Shift</text>

  <!-- Legend -->
  <text x="${zeroX - 80}" y="${margin.top - 12}" fill="#14b8a6" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="end">← Shortens / Constrains PMI</text>
  <text x="${zeroX + 80}" y="${margin.top - 12}" fill="#f59e0b" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="start">Lengthens / Advances PMI →</text>

  <!-- Rows -->
  ${rowsSvg}

  <!-- Footer -->
  <text x="40" y="${height - 14}" fill="#64748b" font-family="sans-serif" font-size="11">Calculated across multimodal biological markers & XGBoost 100-tree decision splits</text>
  <text x="${width - 40}" y="${height - 14}" fill="#475569" font-family="sans-serif" font-size="10" text-anchor="end">VisionMortis • Protocol One Forensic Engineering</text>
</svg>`.trim();
}

/**
 * Generates and downloads CSV data for any of the 3 components or a custom array
 */
export function downloadChartDataAsCsv(
  typeOrRows: "henssge" | "distribution" | "attribution" | Record<string, any>[],
  resultOrFilename?: PmiCalculationResult | string,
  mlPredictionData?: InBrowserPredictionResult | null,
  caseData?: ForensicCaseInput
) {
  let csvContent = "";
  let filename = "";

  if (Array.isArray(typeOrRows)) {
    filename = (typeof resultOrFilename === "string" ? resultOrFilename : "VisionMortis-Data.csv");
    if (typeOrRows.length > 0) {
      const headers = Object.keys(typeOrRows[0]);
      csvContent += headers.join(",") + "\n";
      typeOrRows.forEach((row) => {
        const line = headers
          .map((h) => {
            const val = row[h];
            if (typeof val === "string") return `"${val.replace(/"/g, '""')}"`;
            return val !== undefined && val !== null ? val : "";
          })
          .join(",");
        csvContent += line + "\n";
      });
    }
  } else {
    const type = typeOrRows;
    const result = resultOrFilename as PmiCalculationResult;

    if (type === "henssge") {
      filename = `VisionMortis-Henssge-CoolingCurve-${caseData?.caseId || "CASE"}.csv`;
      csvContent = "Elapsed_Hours,Core_Temperature_C,Upper_95_Confidence_C,Lower_95_Confidence_C\n";
      (result.coolingCurveData || []).forEach((row) => {
        csvContent += `${row.hour},${row.temperature},${row.upperConfidence},${row.lowerConfidence}\n`;
      });
    } else if (type === "distribution") {
      filename = `VisionMortis-PMI-ProbabilityDensity-${caseData?.caseId || "CASE"}.csv`;
      csvContent = "PMI_Hours,Probability_Density_Percent\n";
      (result.probabilityDistribution || []).forEach((row) => {
        csvContent += `${row.pmiHours},${row.probability}\n`;
      });
    } else if (type === "attribution") {
      filename = `VisionMortis-Factor-Attribution-SHAP-${caseData?.caseId || "CASE"}.csv`;
      csvContent = "Feature_Name,Impact_Direction,Pull_Magnitude_Hours,Relative_Weight_Percent,Explanation\n";
      if (mlPredictionData?.factorAttributions && mlPredictionData.factorAttributions.length > 0) {
        mlPredictionData.factorAttributions.forEach((a) => {
          csvContent += `"${a.factorName}","${a.impactDirection}",${a.pullMagnitudeHours},${a.relativeImportancePercent},"${a.explanation.replace(/"/g, '""')}"\n`;
        });
      } else {
        (result.factorAttributions || []).forEach((a) => {
          csvContent += `"${a.factorName}","${a.impactDirection}",${a.pullMagnitudeHours},${a.relativeImportancePercent},"${a.explanation.replace(/"/g, '""')}"\n`;
        });
      }
    }
  }

  triggerFileDownload(csvContent, filename, "text/csv;charset=utf-8");
}

/**
 * Downloads a complete bundle of all 3 analytical visualizations and data files
 */
export async function downloadAllVisualizationsBundle(
  result: PmiCalculationResult,
  mlPredictionData: InBrowserPredictionResult | null,
  caseData: ForensicCaseInput
) {
  const caseId = caseData.caseId || "CASE";

  // 1. Download Henssge Cooling Curve (PNG)
  const henssgeSvg = generateHenssgeCoolingSvg(result, caseData);
  await downloadSvgAsPng(henssgeSvg, `VisionMortis-Henssge-CoolingCurve-${caseId}.png`);

  // 2. Download PMI Probability Distribution (PNG)
  const distSvg = generatePmiDistributionSvg(result, caseData);
  await downloadSvgAsPng(distSvg, `VisionMortis-PMI-ProbabilityDistribution-${caseId}.png`);

  // 3. Download Factor Attribution (PNG)
  const attrSvg = generateFactorAttributionSvg(result, mlPredictionData, caseData);
  await downloadSvgAsPng(attrSvg, `VisionMortis-FactorAttribution-TreeSHAP-${caseId}.png`);

  // 4. Download Comprehensive Raw Analytics Dataset (JSON)
  const datasetJson = JSON.stringify(
    {
      caseId: caseData.caseId,
      discoveryTimestamp: caseData.discoveryTimestamp,
      estimatedPmiOptimalHours: result.estimatedPmiOptimalHours,
      estimatedPmiMinHours: result.estimatedPmiMinHours,
      estimatedPmiMaxHours: result.estimatedPmiMaxHours,
      confidenceScore: result.confidenceScore,
      coolingCurveData: result.coolingCurveData,
      probabilityDistribution: result.probabilityDistribution,
      factorAttributions: result.factorAttributions,
      treeShapAttributions: mlPredictionData?.factorAttributions,
      indicatorEvaluations: result.indicatorEvaluations,
      exportedAt: new Date().toISOString(),
    },
    null,
    2
  );
  triggerFileDownload(datasetJson, `VisionMortis-Analytical-Data-Package-${caseId}.json`, "application/json");
}
