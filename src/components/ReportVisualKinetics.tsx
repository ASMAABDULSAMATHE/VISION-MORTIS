import React, { useState, useMemo } from "react";
import { ForensicCaseInput, PmiCalculationResult } from "../types";
import {
  LineChart,
  TrendingUp,
  Download,
  Maximize2,
  Minimize2,
  Check,
  BarChart3,
  Layers,
} from "lucide-react";
import {
  generateHenssgeCoolingSvg,
  generatePmiDistributionSvg,
  downloadSvgAsPng,
} from "../utils/chartExport";

interface ReportVisualKineticsProps {
  caseData: ForensicCaseInput;
  result: PmiCalculationResult;
  className?: string;
}

export const ReportVisualKinetics: React.FC<ReportVisualKineticsProps> = ({
  caseData,
  result,
  className = "",
}) => {
  const [activeTab, setActiveTab] = useState<"both" | "henssge" | "distribution">("both");
  const [downloadedChart, setDownloadedChart] = useState<string | null>(null);

  // Generate SVG markup safely
  const henssgeSvg = useMemo(
    () => generateHenssgeCoolingSvg(result, caseData),
    [result, caseData]
  );
  const pmiDistSvg = useMemo(
    () => generatePmiDistributionSvg(result, caseData),
    [result, caseData]
  );

  const handleDownload = async (type: "henssge" | "distribution", e: React.MouseEvent) => {
    e.stopPropagation();
    if (type === "henssge") {
      setDownloadedChart("henssge");
      await downloadSvgAsPng(henssgeSvg, `Henssge-CoolingCurve-${caseData.caseId || "CASE"}.png`);
    } else {
      setDownloadedChart("distribution");
      await downloadSvgAsPng(pmiDistSvg, `PMI-ProbabilityDensity-${caseData.caseId || "CASE"}.png`);
    }
    setTimeout(() => setDownloadedChart(null), 2500);
  };

  return (
    <div
      id="report-visual-kinetics-card"
      className={`rounded-2xl bg-slate-950/80 border border-slate-800 p-4 sm:p-5 space-y-3.5 ${className}`}
    >
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
            <LineChart className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Analytical Curves & Kinetics
              </h3>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-teal-950/70 text-teal-300 border border-teal-800/60">
                Vector Precision
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Empirical cooling kinetics and Bayesian probability distribution
            </p>
          </div>
        </div>

        {/* View Segmented Toggle */}
        <div className="flex items-center gap-1 p-0.5 rounded-xl bg-slate-900 border border-slate-800 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab("both")}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-colors cursor-pointer ${
              activeTab === "both"
                ? "bg-teal-500 text-slate-950 font-bold shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Dual View
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("henssge")}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-colors cursor-pointer ${
              activeTab === "henssge"
                ? "bg-teal-500 text-slate-950 font-bold shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Cooling Curve
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("distribution")}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-colors cursor-pointer ${
              activeTab === "distribution"
                ? "bg-teal-500 text-slate-950 font-bold shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Probability Density
          </button>
        </div>
      </div>

      {/* Graphical Container Grid */}
      <div
        className={`grid gap-3 ${
          activeTab === "both" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
        }`}
      >
        {/* 1. Henssge Cooling Trajectory Chart */}
        {(activeTab === "both" || activeTab === "henssge") && (
          <div className="rounded-xl bg-slate-900/90 border border-slate-800/80 p-3 flex flex-col justify-between group hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-400 shrink-0"></span>
                <span className="text-[11px] font-bold text-slate-200">
                  Henssge Nomogram Cooling Kinetic Model
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => handleDownload("henssge", e)}
                title="Download Henssge Cooling Curve (PNG)"
                className="p-1 rounded-md text-slate-400 hover:text-teal-300 hover:bg-slate-800 transition-colors text-[10px] flex items-center gap-1 cursor-pointer"
              >
                {downloadedChart === "henssge" ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Download className="w-3 h-3" />
                )}
                <span>PNG</span>
              </button>
            </div>

            {/* SVG Renderer */}
            <div
              className="w-full overflow-hidden rounded-lg border border-slate-800/50 bg-[#090d16] flex items-center justify-center p-1"
              style={{ maxHeight: activeTab === "both" ? "210px" : "320px" }}
              dangerouslySetInnerHTML={{ __html: henssgeSvg }}
            />

            <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between flex-wrap gap-1">
              <span>
                Rectal:{" "}
                <strong className="text-teal-300 font-mono">
                  {caseData.algorMortis?.rectalTempC ?? 37}°C
                </strong>{" "}
                • Ambient:{" "}
                <strong className="text-slate-300 font-mono">
                  {caseData.ambientTempC ?? 20}°C
                </strong>
              </span>
              <span className="text-slate-500 font-mono text-[9.5px]">
                95% Empiric Bounds Shaded
              </span>
            </div>
          </div>
        )}

        {/* 2. Bayesian PMI Probability Density Chart */}
        {(activeTab === "both" || activeTab === "distribution") && (
          <div className="rounded-xl bg-slate-900/90 border border-slate-800/80 p-3 flex flex-col justify-between group hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
                <span className="text-[11px] font-bold text-slate-200">
                  Bayesian Consensus Probability Density
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => handleDownload("distribution", e)}
                title="Download Probability Distribution Curve (PNG)"
                className="p-1 rounded-md text-slate-400 hover:text-emerald-300 hover:bg-slate-800 transition-colors text-[10px] flex items-center gap-1 cursor-pointer"
              >
                {downloadedChart === "distribution" ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Download className="w-3 h-3" />
                )}
                <span>PNG</span>
              </button>
            </div>

            {/* SVG Renderer */}
            <div
              className="w-full overflow-hidden rounded-lg border border-slate-800/50 bg-[#090d16] flex items-center justify-center p-1"
              style={{ maxHeight: activeTab === "both" ? "210px" : "320px" }}
              dangerouslySetInnerHTML={{ __html: pmiDistSvg }}
            />

            <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between flex-wrap gap-1">
              <span>
                Peak Mode:{" "}
                <strong className="text-emerald-300 font-mono">
                  {result.estimatedPmiOptimalHours}h
                </strong>{" "}
                (Bracket: {result.estimatedPmiMinHours}–{result.estimatedPmiMaxHours}h)
              </span>
              <span className="text-slate-500 font-mono text-[9.5px]">
                Credible Interval Highlighted
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
