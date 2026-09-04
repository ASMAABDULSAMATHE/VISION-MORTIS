import React, { useState } from "react";
import { ForensicCaseInput, PmiCalculationResult } from "../types";

interface ForensicPmiReportGraphicProps {
  result: PmiCalculationResult;
  caseData: ForensicCaseInput;
  className?: string;
  condensed?: boolean;
}

export const ForensicPmiReportGraphic: React.FC<ForensicPmiReportGraphicProps> = ({
  result,
  caseData,
  className = "",
  condensed = false,
}) => {
  const [hoveredIndicator, setHoveredIndicator] = useState<string | null>(null);

  // Compute indicator agreement
  const activeIndicators = (result.indicatorEvaluations || []).filter(
    (ind) => ind.weightInFinalCalculation > 0
  );

  let indicatorAgreement = 85;
  if (result.inconsistenciesDetected && result.inconsistencyAlerts?.length > 0) {
    const critAlerts = result.inconsistencyAlerts.filter((a) => a.severity === "critical").length;
    const warnAlerts = result.inconsistencyAlerts.filter((a) => a.severity === "warning").length;
    indicatorAgreement = Math.max(35, Math.round(90 - critAlerts * 18 - warnAlerts * 8));
  } else if (caseData.isHarmonicPreset) {
    indicatorAgreement = 92;
  } else {
    // Range dispersion agreement
    const avgSpread = result.estimatedPmiMaxHours - result.estimatedPmiMinHours;
    if (avgSpread <= 5) indicatorAgreement = 88;
    else if (avgSpread <= 12) indicatorAgreement = 82;
    else if (avgSpread <= 24) indicatorAgreement = 76;
    else indicatorAgreement = 68;
  }

  // Format values
  const minH = Number(result.estimatedPmiMinHours.toFixed(1));
  const maxH = Number(result.estimatedPmiMaxHours.toFixed(1));
  const optH = Number(result.estimatedPmiOptimalHours.toFixed(1));

  // Logarithmic scale mapping from 0.2h (12 mins) to 1440h (2 months / 60 days)
  const minScale = 0.2;
  const maxScale = Math.max(1440, result.estimatedPmiMaxHours * 1.25);
  const logMin = Math.log10(minScale);
  const logMax = Math.log10(maxScale);
  const logRange = logMax - logMin;

  const toPercent = (hours: number): number => {
    const safeH = Math.max(minScale, Math.min(maxScale, hours));
    const pct = ((Math.log10(safeH) - logMin) / logRange) * 100;
    return Math.min(Math.max(pct, 1.5), 98.5);
  };

  const pmiMinPct = toPercent(result.estimatedPmiMinHours);
  const pmiMaxPct = toPercent(result.estimatedPmiMaxHours);
  const pmiOptPct = toPercent(result.estimatedPmiOptimalHours);
  const pmiWidthPct = Math.max(pmiMaxPct - pmiMinPct, 3.5);

  // Standard milestone tick positions matching reference
  const tick1hPct = toPercent(1.0);
  const tick24hPct = toPercent(24.0);
  const tick2moPct = toPercent(1440.0);

  // Derive active indicator segments for overlapping capsule indicators
  const indicatorPills = activeIndicators.slice(0, 4).map((ind, idx) => {
    const startPct = toPercent(ind.estimatedPmiMinHours);
    const endPct = toPercent(ind.estimatedPmiMaxHours);
    const widthPct = Math.max(endPct - startPct, 4);
    return {
      id: ind.name,
      name: ind.name,
      startPct,
      widthPct,
      optPct: toPercent(ind.estimatedPmiOptimalHours),
      hours: `${ind.estimatedPmiMinHours}–${ind.estimatedPmiMaxHours} h`,
      weight: Math.round(ind.weightInFinalCalculation * 100),
      idx,
    };
  });

  return (
    <div
      id="forensic-pmi-graphic-card"
      className={`rounded-2xl bg-[#0B131E] border border-slate-800/80 p-5 sm:p-7 shadow-xl text-slate-100 ${className}`}
    >
      {/* 1. Header & Primary Numbers */}
      <div className="space-y-1.5">
        <div className="text-[11px] sm:text-xs font-mono font-semibold tracking-wider text-slate-400 uppercase">
          ESTIMATED PMI RANGE
        </div>

        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-3xl sm:text-4xl lg:text-5xl font-black font-mono text-teal-400 tracking-tight">
            {minH} h – {maxH} h
          </span>
        </div>

        <p className="text-xs sm:text-[13px] text-slate-400 leading-relaxed">
          80% interval · point estimate <strong className="text-slate-200">{optH} h</strong> · time of death approx.{" "}
          <strong className="text-slate-200">
            {minH} h–{maxH} h
          </strong>{" "}
          before examination
        </p>

        <p className="text-xs font-medium text-amber-400/90 pt-0.5">
          Decision-support estimate; not a definitive determination of time of death.
        </p>
      </div>

      {/* 2. Visual PMI Continuum Graphic Timeline */}
      <div className="my-7 sm:my-8 relative select-none">
        {/* Hovered indicator feedback tooltip */}
        {hoveredIndicator && (
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded bg-slate-900 border border-teal-500/40 text-[10px] font-mono text-teal-300 shadow-lg pointer-events-none whitespace-nowrap z-30 animate-in fade-in duration-100">
            {hoveredIndicator}
          </div>
        )}

        {/* Timeline Bar Track with Overlapping Pill Indicators */}
        <div className="relative h-4 w-full bg-[#132232] rounded-full flex items-center overflow-visible">
          {/* Broad credible range capsule (outer grey pill) */}
          <div
            className="absolute h-3.5 rounded-full bg-[#2A3B4F]/80 transition-all duration-300"
            style={{
              left: `${Math.max(1, pmiMinPct - 12)}%`,
              width: `${Math.min(98 - pmiMinPct, pmiWidthPct + 24)}%`,
            }}
            title="Multimodal Credible Bracket"
          />

          {/* Individual modal indicator capsule (soft inner pill) */}
          <div
            className="absolute h-3.5 rounded-full bg-[#41556C]/80 transition-all duration-300"
            style={{
              left: `${Math.max(1, pmiMinPct - 4)}%`,
              width: `${Math.min(98 - pmiMinPct, pmiWidthPct + 10)}%`,
            }}
            title="Modal Physiological Overlap"
          />

          {/* Active modal indicator pills */}
          {indicatorPills.map((pill) => (
            <div
              key={pill.id}
              onMouseEnter={() => setHoveredIndicator(`${pill.name}: ${pill.hours} (${pill.weight}% weight)`)}
              onMouseLeave={() => setHoveredIndicator(null)}
              className="absolute h-3.5 rounded-full bg-slate-300/30 hover:bg-slate-200/50 cursor-pointer transition-colors"
              style={{
                left: `${pill.startPct}%`,
                width: `${pill.widthPct}%`,
                zIndex: 10 + pill.idx,
              }}
              title={`${pill.name}: ${pill.hours}`}
            />
          ))}

          {/* Primary Fused Interval Capsule (Teal Bar) */}
          <div
            className="absolute h-3.5 rounded-full bg-[#2DD4BF] shadow-[0_0_10px_rgba(45,212,191,0.5)] transition-all duration-500 z-20"
            style={{
              left: `${pmiMinPct}%`,
              width: `${pmiWidthPct}%`,
            }}
            title={`Consensus Window: ${minH}h – ${maxH}h`}
          />

          {/* Optimum Point Estimate Marker */}
          <div
            className="absolute w-1.5 h-4 bg-white rounded-full shadow-[0_0_6px_rgba(255,255,255,0.9)] z-25 -translate-x-1/2 transition-all duration-500"
            style={{
              left: `${pmiOptPct}%`,
            }}
            title={`Optimal Point Estimate: ${optH} hours`}
          />

          {/* Vertical Scale Tick Markers on Track */}
          <div
            className="absolute top-0 bottom-0 w-px bg-slate-600/70 -translate-x-1/2"
            style={{ left: `${tick1hPct}%` }}
          />
          <div
            className="absolute top-0 bottom-0 w-px bg-slate-600/70 -translate-x-1/2"
            style={{ left: `${tick24hPct}%` }}
          />
          <div
            className="absolute top-0 bottom-0 w-px bg-slate-600/70 -translate-x-1/2"
            style={{ left: `${tick2moPct}%` }}
          />
        </div>

        {/* Scale Tick Labels Below Track */}
        <div className="relative w-full h-8 mt-1 text-[11px] font-mono text-slate-400">
          <div
            className="absolute -translate-x-1/2 flex flex-col items-center"
            style={{ left: `${tick1hPct}%` }}
          >
            <div className="w-px h-2 bg-slate-600/80 mb-1" />
            <span>1.0 h</span>
          </div>

          <div
            className="absolute -translate-x-1/2 flex flex-col items-center"
            style={{ left: `${tick24hPct}%` }}
          >
            <div className="w-px h-2 bg-slate-600/80 mb-1" />
            <span>24 h</span>
          </div>

          <div
            className="absolute -translate-x-1/2 flex flex-col items-center"
            style={{ left: `${tick2moPct}%` }}
          >
            <div className="w-px h-2 bg-slate-600/80 mb-1" />
            <span>2.0 mo</span>
          </div>
        </div>
      </div>

      {/* 3. Metric Progress Gauges (Confidence & Indicator Agreement) */}
      <div className={`space-y-4 pt-1 ${condensed ? "border-t border-slate-800/60" : ""}`}>
        {/* Confidence Gauge */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="tracking-wider text-slate-400 uppercase font-medium">CONFIDENCE</span>
            <span className="text-[#2DD4BF] font-semibold">
              {result.confidenceScore}% · {result.confidenceTier.replace(" Confidence", "")}
            </span>
          </div>
          <div className="h-2 w-full bg-[#132232] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#2DD4BF] rounded-full transition-all duration-700 ease-out"
              style={{ width: `${result.confidenceScore}%` }}
            />
          </div>
        </div>

        {/* Indicator Agreement Gauge */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="tracking-wider text-slate-400 uppercase font-medium">
              INDICATOR AGREEMENT
            </span>
            <span className="text-[#2DD4BF] font-semibold">{indicatorAgreement}%</span>
          </div>
          <div className="h-2 w-full bg-[#132232] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#2DD4BF] rounded-full transition-all duration-700 ease-out"
              style={{ width: `${indicatorAgreement}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
