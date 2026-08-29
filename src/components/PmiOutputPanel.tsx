import React, { useState, useEffect } from "react";
import { PmiCalculationResult } from "../types";
import { runInBrowserXgbPrediction, InBrowserPredictionResult } from "../utils/inBrowserXgbModel";
import {
  AlertTriangle,
  Clock,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  FileText,
  BarChart3,
  ThermometerSnowflake,
  ChevronDown,
  ChevronUp,
  Loader2,
  Cpu,
  RefreshCw,
  Zap,
  Layers,
  ShieldAlert,
  Download,
  FileSpreadsheet,
} from "lucide-react";
import {
  downloadSvgAsPng,
  generateHenssgeCoolingSvg,
  generatePmiDistributionSvg,
  generateFactorAttributionSvg,
  downloadChartDataAsCsv,
} from "../utils/chartExport";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Line,
  ReferenceLine,
} from "recharts";

interface Props {
  result: PmiCalculationResult;
  onRunAiSynthesis: () => void;
  isAiLoading: boolean;
  onOpenReportModal: () => void;
  caseData?: any;
}

export const PmiOutputPanel: React.FC<Props> = ({
  result,
  onRunAiSynthesis,
  isAiLoading,
  onOpenReportModal,
  caseData,
}) => {
  const [activeTab, setActiveTab] = useState<"attribution" | "cooling" | "distribution" | "ai" | "ml_shap">("attribution");
  const [showAllAlerts, setShowAllAlerts] = useState(true);

  // In-Browser XGBoost & TreeSHAP State (Exclusive Model)
  const [isMlLoading, setIsMlLoading] = useState(false);
  const [mlPredictionData, setMlPredictionData] = useState<InBrowserPredictionResult | null>(null);
  const [mlError, setMlError] = useState<string | null>(null);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string | null>(null);
  const [inBrowserExecTimeMs, setInBrowserExecTimeMs] = useState<number>(0.8);

  // Execute XGBoost & TreeSHAP Prediction
  const executeXgbPrediction = () => {
    try {
      setIsMlLoading(true);
      setMlError(null);
      const res = runInBrowserXgbPrediction(caseData || {});
      setMlPredictionData(res);
      setInBrowserExecTimeMs(res.executionTimeMs);
      const now = new Date();
      setLastUpdatedTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err: any) {
      console.error("XGBoost prediction error:", err);
      setMlError(err.message || "Failed to calculate XGBoost prediction");
    } finally {
      setIsMlLoading(false);
    }
  };

  // Automatic real-time prediction whenever caseData changes
  useEffect(() => {
    executeXgbPrediction();
  }, [caseData]);

  const handleRefreshPrediction = () => {
    executeXgbPrediction();
    setActiveTab("ml_shap");
  };

  // Confidence color & badge in Teal / Emerald / Amber / Rose
  const getConfidenceStyle = (score: number, tier: string) => {
    if (tier === "Critical Inconsistency") {
      return {
        bg: "bg-rose-950/80 border-rose-600 text-rose-300",
        barBg: "bg-rose-500",
        ring: "ring-rose-500/40",
      };
    }
    if (score >= 80) {
      return {
        bg: "bg-teal-950/90 border-teal-500 text-teal-300",
        barBg: "bg-teal-500",
        ring: "ring-teal-500/40",
      };
    }
    if (score >= 60) {
      return {
        bg: "bg-amber-950/80 border-amber-600 text-amber-300",
        barBg: "bg-amber-500",
        ring: "ring-amber-500/40",
      };
    }
    return {
      bg: "bg-rose-950/80 border-rose-600 text-rose-300",
      barBg: "bg-rose-500",
      ring: "ring-rose-500/40",
    };
  };

  const confStyle = getConfidenceStyle(result.confidenceScore, result.confidenceTier);

  // Format hours/days display
  const formatHoursOrDays = (hours: number) => {
    if (hours < 36) {
      return `${hours} hrs`;
    }
    const days = (hours / 24).toFixed(1);
    return `${hours} hrs (~${days} days)`;
  };

  return (
    <div id="pmi-output-panel" className="space-y-5">
      {/* Primary Hero Result Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950/50 border border-teal-800/60 p-6 shadow-xl shadow-teal-950/20 space-y-6">
        {/* Glow ambient background effect in Teal */}
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-400">
              <Clock className="w-4 h-4" /> Multimodal Composite Post-Mortem Interval
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight mt-1">
              Estimated PMI:{" "}
              <span className="text-teal-400 font-mono">
                {result.estimatedPmiMinHours} – {result.estimatedPmiMaxHours} Hours
              </span>
            </h2>
            <div className="text-xs text-slate-400 mt-1.5 space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <span>
                  Point Optimum: <strong className="text-slate-200 font-mono font-semibold">{formatHoursOrDays(result.estimatedPmiOptimalHours)}</strong>
                </span>
                <span className="text-slate-600">•</span>
                <span>
                  Estimated Time of Death (TOD): <strong className="text-slate-200 font-medium">{result.estimatedTimeOfDeathMin} – {result.estimatedTimeOfDeathMax}</strong>
                </span>
              </div>

              {mlPredictionData && (
                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/90 border border-emerald-700/80 text-emerald-300 font-medium text-[11px]">
                    <Cpu className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>
                      XGBoost ML Model Prediction: <strong className="font-mono text-emerald-200 font-bold">{mlPredictionData.estimatedPmiOptimalHours} hrs</strong>
                      <span className="text-emerald-400/80 ml-1">({mlPredictionData.estimatedPmiMinHours}–{mlPredictionData.estimatedPmiMaxHours}h 95% CI)</span>
                    </span>
                  </span>
                  <span className="text-[11px] text-slate-400">
                    (100-tree ensemble evaluated across 212 multi-domain features)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Confidence Score Badge */}
          <div className="flex flex-col items-end shrink-0">
            <div className={`px-4 py-2 rounded-xl border ${confStyle.bg} flex items-center gap-2.5 shadow-sm`}>
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <div className="text-right">
                <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">Confidence</div>
                <div className="text-lg font-bold font-mono leading-none">{result.confidenceScore}%</div>
              </div>
            </div>
            <span className="text-[11px] text-slate-400 font-medium mt-1">{result.confidenceTier}</span>
          </div>
        </div>

        {/* Inconsistency Alert Box */}
        {result.inconsistenciesDetected && (
          <div className="rounded-xl bg-rose-950/40 border border-rose-800/70 p-4 space-y-3 shadow-inner">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-300 font-semibold text-xs">
                <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />
                <span>Physiological Inconsistency & Conflict Detected ({result.inconsistencyAlerts.length})</span>
              </div>

              <button
                type="button"
                onClick={() => setShowAllAlerts(!showAllAlerts)}
                className="text-[11px] text-rose-300 hover:text-rose-100 flex items-center gap-1 cursor-pointer"
              >
                {showAllAlerts ? "Collapse" : "Expand"}
                {showAllAlerts ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {showAllAlerts && (
              <div className="space-y-2.5 pt-1">
                {result.inconsistencyAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-3 rounded-lg bg-slate-950/80 border border-rose-900/60 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-300 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                        {alert.title}
                      </span>
                      <span
                        className={`text-[10px] uppercase px-1.5 py-0.2 rounded font-mono font-bold ${
                          alert.severity === "critical"
                            ? "bg-rose-950 text-rose-300 border border-rose-700"
                            : "bg-amber-950 text-amber-300 border border-amber-700"
                        }`}
                      >
                        {alert.severity}
                      </span>
                    </div>

                    <p className="text-slate-300 text-xs leading-relaxed">{alert.description}</p>

                    <div className="p-2.5 rounded bg-slate-900/90 text-xs text-amber-200/90 border border-slate-800">
                      <strong className="text-amber-300">Forensic Implication: </strong>
                      {alert.forensicImplication}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Dominant Anchors Summary */}
        {result.dominantIndicatorSummary?.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-800/80 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-300">Dominant Anchors:</span>
              {result.dominantIndicatorSummary.map((item, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded-md bg-slate-800 text-teal-300 border border-slate-700 text-xs font-medium">
                  {item}
                </span>
              ))}
            </div>
            <div className="text-[11px] text-slate-500 font-mono">
              Evaluated across 6 forensic modules + XGBoost TreeSHAP
            </div>
          </div>
        )}
      </div>

      {/* Analytical Tabbed Panel */}
      <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-5 space-y-4">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "attribution", label: "Factor Attribution", icon: BarChart3 },
              { id: "ml_shap", label: "XGBoost ML + TreeSHAP (212 Features)", icon: Cpu },
              { id: "cooling", label: "Henssge Cooling Curve", icon: ThermometerSnowflake },
              { id: "distribution", label: "PMI Probability Density", icon: TrendingUp },
              { id: "ai", label: "AI Pathologist Rationale", icon: Sparkles },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                    isActive
                      ? tab.id === "ml_shap"
                        ? "bg-emerald-950 border border-emerald-500/80 text-emerald-300 shadow-sm"
                        : "bg-teal-950 border border-teal-500/80 text-teal-300 shadow-sm"
                      : "bg-slate-950/60 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${tab.id === "ml_shap" ? "text-emerald-400" : "text-teal-400"}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content: XGBoost + TreeSHAP Live Results (Exclusive In-Browser Engine) */}
        {activeTab === "ml_shap" && (
          <div className="space-y-4">
            {/* Status & Feature Vector Header */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-emerald-900/60 space-y-2 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="p-1.5 rounded-lg bg-emerald-950/90 border border-emerald-700">
                    <Zap className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-emerald-200 text-xs flex items-center gap-2">
                      <span>Trained XGBoost Regressor & Exact TreeSHAP Explainability</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-900/90 text-emerald-300 border border-emerald-600/80 text-[10px] flex items-center gap-1 font-medium font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        {inBrowserExecTimeMs}ms Active
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      212 input features continuously vectorized across taphonomic, entomological, metabolomic, and thermal domains.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-400 text-[11px] shrink-0">
                  {lastUpdatedTime && (
                    <span className="text-slate-400 text-[10px] font-mono bg-slate-900 px-2 py-1 rounded border border-slate-800">
                      Calculated: <span className="text-emerald-400">{lastUpdatedTime}</span>
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handleRefreshPrediction}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                    title="Recalculate Model"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                  </button>
                </div>
              </div>

              {mlError && (
                <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-800 text-xs text-rose-200 flex items-start gap-2 mt-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-rose-300 font-semibold">Notice: </strong>
                    {mlError}
                  </div>
                </div>
              )}
            </div>

            {/* If Prediction Data Exists */}
            {mlPredictionData && (
              <div className="space-y-4">
                {/* Result Summary Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-emerald-900/50 text-center">
                    <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">XGBoost Estimated PMI</div>
                    <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                      {mlPredictionData.estimatedPmiOptimalHours} <span className="text-xs text-slate-400">hours</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      ({(mlPredictionData.estimatedPmiOptimalHours / 24).toFixed(1)} days)
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-teal-900/50 text-center">
                    <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Prediction Interval</div>
                    <div className="text-lg font-bold font-mono text-teal-300 mt-1">
                      {mlPredictionData.estimatedPmiMinHours} – {mlPredictionData.estimatedPmiMaxHours} <span className="text-xs text-slate-400">hours</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">95% empirical confidence interval</div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-amber-900/50 text-center">
                    <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">TreeSHAP Base Value (E[y])</div>
                    <div className="text-lg font-bold font-mono text-amber-300 mt-1">
                      {mlPredictionData.baseValueHours || "—"} <span className="text-xs text-slate-400">hours</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Prior population baseline</div>
                  </div>
                </div>

                {/* TreeSHAP Feature Attributions Waterfall / List */}
                <div className="space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div>
                      <h4 className="font-semibold text-slate-200">Top TreeSHAP Feature Contributions</h4>
                      <span className="text-slate-400 text-[11px]">Ranked by absolute |SHAP| hours impact</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={async () => {
                          const svg = generateFactorAttributionSvg(result, mlPredictionData, caseData);
                          await downloadSvgAsPng(svg, `TreeSHAP-Attribution-${caseData?.caseId || "CASE"}.png`);
                        }}
                        title="Download TreeSHAP Waterfall Chart (PNG)"
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 text-[11px] font-medium flex items-center gap-1 cursor-pointer border border-slate-700 transition-colors"
                      >
                        <Download className="w-3 h-3" />
                        <span>PNG</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          downloadChartDataAsCsv(
                            mlPredictionData.factorAttributions?.map((attr: any) => ({
                              Feature: attr.factorName,
                              ImpactDirection: attr.impactDirection,
                              ImpactHours: attr.pullMagnitudeHours,
                              RelativeImportancePercent: attr.relativeImportancePercent,
                              Explanation: attr.explanation,
                            })) || [],
                            `TreeSHAP-Attribution-${caseData?.caseId || "CASE"}.csv`
                          );
                        }}
                        title="Export TreeSHAP data table as CSV"
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium flex items-center gap-1 cursor-pointer border border-slate-700 transition-colors"
                      >
                        <FileSpreadsheet className="w-3 h-3 text-emerald-400" />
                        <span>CSV</span>
                      </button>
                    </div>
                  </div>

                  {mlPredictionData.factorAttributions?.map((attr: any, idx: number) => {
                    const isIncrease = attr.impactDirection === "increases_pmi";
                    return (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:border-slate-700 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-200">{attr.factorName}</span>
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                                isIncrease
                                  ? "bg-amber-950/80 text-amber-300 border border-amber-800"
                                  : "bg-teal-950/80 text-teal-300 border border-teal-800"
                              }`}
                            >
                              {isIncrease ? "↑ Lengthens TOD (+)" : "↓ Shortens TOD (-)"}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">{attr.explanation}</p>
                        </div>

                        <div className="flex items-center gap-4 shrink-0">
                          <div className="text-right">
                            <div className="text-[10px] text-slate-500 uppercase font-mono">Impact</div>
                            <div className="font-mono text-emerald-400 font-bold text-sm">
                              {attr.pullMagnitudeHours}h
                            </div>
                          </div>

                          <div className="w-20 bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${isIncrease ? "bg-amber-500" : "bg-teal-400"}`}
                              style={{ width: `${Math.min(100, attr.relativeImportancePercent * 2)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab Content 1: Factor Attribution */}
        {activeTab === "attribution" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div>
                <h4 className="font-semibold text-slate-200">Indicator Weight & Directional Attribution</h4>
                <p className="text-slate-400 text-xs mt-0.5">
                  Multimodal feature contribution: shows which physiological indicators pull the post-mortem interval earlier or later
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={async () => {
                    const svg = generateFactorAttributionSvg(result, mlPredictionData, caseData);
                    await downloadSvgAsPng(svg, `FactorAttribution-${caseData?.caseId || "CASE"}.png`);
                  }}
                  title="Download Factor Attribution chart as high-res PNG"
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 text-[11px] font-medium flex items-center gap-1 cursor-pointer border border-slate-700 transition-colors"
                >
                  <Download className="w-3 h-3" />
                  <span>PNG</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    downloadChartDataAsCsv(
                      result.factorAttributions.map(f => ({
                        Factor: f.factorName,
                        Direction: f.impactDirection,
                        WeightPercent: f.relativeImportancePercent,
                        Explanation: f.explanation,
                      })),
                      `FactorAttribution-${caseData?.caseId || "CASE"}.csv`
                    );
                  }}
                  title="Export Factor Attribution table as CSV"
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium flex items-center gap-1 cursor-pointer border border-slate-700 transition-colors"
                >
                  <FileSpreadsheet className="w-3 h-3 text-emerald-400" />
                  <span>CSV</span>
                </button>
              </div>
            </div>

            <div className="space-y-2.5">
              {result.factorAttributions.map((attr, idx) => {
                const isIncrease = attr.impactDirection === "increases_pmi";
                const isDecrease = attr.impactDirection === "decreases_pmi";
                const isAnchor = attr.impactDirection === "anchors_estimate";

                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1 max-w-lg">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-200">{attr.factorName}</span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                            isIncrease
                              ? "bg-amber-950/80 text-amber-300 border border-amber-800"
                              : isDecrease
                              ? "bg-teal-950/80 text-teal-300 border border-teal-800"
                              : "bg-slate-800 text-slate-300 border border-slate-700"
                          }`}
                        >
                          {isIncrease ? "↑ Lengthens PMI" : isDecrease ? "↓ Constrains Earliest" : "● Center Anchor"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{attr.explanation}</p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase">Weight</div>
                        <div className="font-mono text-teal-400 font-bold text-sm">
                          {attr.relativeImportancePercent}%
                        </div>
                      </div>

                      <div className="w-24 bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            isIncrease ? "bg-amber-500" : isDecrease ? "bg-teal-400" : "bg-emerald-400"
                          }`}
                          style={{ width: `${attr.relativeImportancePercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Individual Indicator Detailed Diagnostics Table */}
            <div className="mt-4 border-t border-slate-800/80 pt-4">
              <h4 className="text-xs font-semibold text-slate-300 mb-2.5">Indicator Reliability Windows</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-xs">
                      <th className="pb-2 font-medium">Indicator</th>
                      <th className="pb-2 font-medium">Valid Reliability Window</th>
                      <th className="pb-2 font-medium">Derived Estimate</th>
                      <th className="pb-2 font-medium">Weight</th>
                      <th className="pb-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50 text-slate-300 text-xs">
                    {result.indicatorEvaluations.map((ind, i) => (
                      <tr key={i}>
                        <td className="py-2.5 font-medium text-slate-200">{ind.name}</td>
                        <td className="py-2.5 text-slate-400 font-mono">{ind.physiologicReliabilityWindow}</td>
                        <td className="py-2.5 font-mono text-teal-300 font-semibold">
                          {ind.estimatedPmiMinHours} – {ind.estimatedPmiMaxHours}h (opt {ind.estimatedPmiOptimalHours}h)
                        </td>
                        <td className="py-2.5 font-mono text-slate-300">{ind.weightInFinalCalculation}%</td>
                        <td className="py-2.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                              ind.status === "optimal_window"
                                ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800/50"
                                : "bg-amber-950/80 text-amber-300 border border-amber-800/50"
                            }`}
                          >
                            {ind.status === "optimal_window" ? "Optimal Window" : "Moderate Range"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content 2: Henssge Cooling Trajectory */}
        {activeTab === "cooling" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div>
                <h4 className="font-semibold text-slate-200">Algor Mortis Henssge Double-Exponential Cooling Curve</h4>
                <p className="text-slate-400 text-xs mt-0.5">
                  Core body temperature cooling trajectory vs post-mortem hours with 95% confidence bounds
                </p>
              </div>

              {result.coolingCurveData.length > 0 && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={async () => {
                      const svg = generateHenssgeCoolingSvg(result, caseData);
                      await downloadSvgAsPng(svg, `Henssge-CoolingCurve-${caseData?.caseId || "CASE"}.png`);
                    }}
                    title="Download Henssge Cooling Curve as high-res PNG"
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 text-[11px] font-medium flex items-center gap-1 cursor-pointer border border-slate-700 transition-colors"
                  >
                    <Download className="w-3 h-3" />
                    <span>PNG</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      downloadChartDataAsCsv(
                        result.coolingCurveData.map(c => ({
                          PostMortemHour: c.hour,
                          CoreTemperatureC: c.temperature,
                          Lower95ConfidenceC: c.lowerConfidence,
                          Upper95ConfidenceC: c.upperConfidence,
                        })),
                        `Henssge-CoolingCurve-${caseData?.caseId || "CASE"}.csv`
                      );
                    }}
                    title="Export Cooling Curve data points as CSV"
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium flex items-center gap-1 cursor-pointer border border-slate-700 transition-colors"
                  >
                    <FileSpreadsheet className="w-3 h-3 text-emerald-400" />
                    <span>CSV</span>
                  </button>
                </div>
              )}
            </div>

            {result.coolingCurveData.length > 0 ? (
              <div className="h-64 w-full bg-slate-950/60 rounded-xl p-3 border border-slate-800/80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={result.coolingCurveData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="hour"
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      unit="h"
                    />
                    <YAxis
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      domain={["auto", 38]}
                      unit="°C"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#090d16",
                        borderColor: "#334155",
                        borderRadius: "8px",
                        fontSize: "11px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="temperature"
                      name="Core Temp (°C)"
                      stroke="#2dd4bf"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#tempGrad)"
                    />
                    <Line
                      type="monotone"
                      dataKey="upperConfidence"
                      name="Upper 95% Bound"
                      stroke="#99f6e4"
                      strokeDasharray="3 3"
                      strokeWidth={1}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="lowerConfidence"
                      name="Lower 95% Bound"
                      stroke="#0d9488"
                      strokeDasharray="3 3"
                      strokeWidth={1}
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500">
                Algor mortis cooling curve is currently inactive (enable Algor Mortis in the input panel).
              </div>
            )}
          </div>
        )}

        {/* Tab Content 3: PMI Probability Density */}
        {activeTab === "distribution" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div>
                <h4 className="font-semibold text-slate-200">Composite Post-Mortem Interval Probability Distribution</h4>
                <p className="text-slate-400 text-xs mt-0.5">
                  Gaussian density synthesis combining all active physiological indicators
                </p>
              </div>

              {result.probabilityDistribution.length > 0 && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={async () => {
                      const svg = generatePmiDistributionSvg(result, caseData);
                      await downloadSvgAsPng(svg, `PMI-ProbabilityDensity-${caseData?.caseId || "CASE"}.png`);
                    }}
                    title="Download Probability Distribution as high-res PNG"
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 text-[11px] font-medium flex items-center gap-1 cursor-pointer border border-slate-700 transition-colors"
                  >
                    <Download className="w-3 h-3" />
                    <span>PNG</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      downloadChartDataAsCsv(
                        result.probabilityDistribution.map(p => ({
                          PostMortemHour: p.pmiHours,
                          ProbabilityDensityPercent: p.probability,
                        })),
                        `PMI-ProbabilityDensity-${caseData?.caseId || "CASE"}.csv`
                      );
                    }}
                    title="Export Probability Density distribution as CSV"
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium flex items-center gap-1 cursor-pointer border border-slate-700 transition-colors"
                  >
                    <FileSpreadsheet className="w-3 h-3 text-emerald-400" />
                    <span>CSV</span>
                  </button>
                </div>
              )}
            </div>

            {result.probabilityDistribution.length > 0 ? (
              <div className="h-64 w-full bg-slate-950/60 rounded-xl p-3 border border-slate-800/80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={result.probabilityDistribution} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="probGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.6} />
                        <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="pmiHours"
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      unit="h"
                    />
                    <YAxis
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      unit="%"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#090d16",
                        borderColor: "#334155",
                        borderRadius: "8px",
                        fontSize: "11px",
                      }}
                    />
                    <ReferenceLine
                      x={result.estimatedPmiOptimalHours}
                      stroke="#2dd4bf"
                      strokeWidth={2}
                      label={{ value: `Median: ${result.estimatedPmiOptimalHours}h`, fill: "#2dd4bf", fontSize: 11 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="probability"
                      name="Probability Density (%)"
                      stroke="#14b8a6"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#probGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500">
                No probability distribution available.
              </div>
            )}
          </div>
        )}

        {/* Tab Content 4: AI Pathologist Synthesis */}
        {activeTab === "ai" && (
          <div className="space-y-4">
            {result.aiSynthesis ? (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-950/80 border border-teal-900/50 space-y-2">
                  <div className="flex items-center gap-2 text-teal-400 font-semibold">
                    <Sparkles className="w-4 h-4" />
                    <span>Expert Pathologist Synthesis</span>
                  </div>
                  <p className="text-slate-200 text-xs leading-relaxed">
                    {result.aiSynthesis.expertSummary}
                  </p>
                </div>

                {result.aiSynthesis.diagnosticBreakdown && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(result.aiSynthesis.diagnosticBreakdown).map(([key, val]) => (
                      <div key={key} className="p-3 rounded-lg bg-slate-950/50 border border-slate-800 space-y-1">
                        <div className="font-semibold text-slate-300 capitalize text-xs">
                          {key.replace(/Assessment|ModifierImpact/g, "")} Breakdown
                        </div>
                        <p className="text-slate-400 text-xs leading-relaxed">{String(val)}</p>
                      </div>
                    ))}
                  </div>
                )}

                {result.aiSynthesis.recommendedConfirmatoryTests && (
                  <div className="p-3.5 rounded-lg bg-slate-950/40 border border-slate-800 space-y-1.5">
                    <span className="font-semibold text-slate-300 text-xs">Recommended Confirmatory Procedures:</span>
                    <ul className="list-disc pl-5 space-y-1 text-slate-400 text-xs">
                      {result.aiSynthesis.recommendedConfirmatoryTests.map((t, idx) => (
                        <li key={idx}>{t}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center space-y-3">
                <Sparkles className="w-8 h-8 text-teal-500 mx-auto opacity-70" />
                <div className="text-xs text-slate-300 font-medium">No Deep AI Synthesis Generated Yet</div>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Click below to submit all multimodal indicators to the Gemini AI Forensic Pathology engine for comprehensive diagnostic reasoning.
                </p>
                <button
                  type="button"
                  onClick={onRunAiSynthesis}
                  disabled={isAiLoading}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs inline-flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Deep AI Pathology Assessment</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
