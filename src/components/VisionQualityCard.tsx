import React from "react";
import { Sparkles, CheckCircle2, AlertTriangle, ShieldCheck, HelpCircle, Eye, Activity } from "lucide-react";
import { VisionImageItem, VisionDetectionData } from "../types";

interface QualityBadgeProps {
  score?: number;
  rating?: string;
  type: "clarity" | "reliability";
}

export const QualityBadge: React.FC<QualityBadgeProps> = ({ score = 90, rating, type }) => {
  const isClarity = type === "clarity";
  const isHigh = score >= 80;
  const isModerate = score >= 60 && score < 80;

  const colorClass = isHigh
    ? "bg-emerald-950/90 text-emerald-300 border-emerald-800/80"
    : isModerate
    ? "bg-amber-950/90 text-amber-300 border-amber-800/80"
    : "bg-rose-950/90 text-rose-300 border-rose-800/80";

  return (
    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] font-medium font-mono ${colorClass}`}>
      {isClarity ? <Eye className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
      <span>
        {isClarity ? "Clarity" : "Reliability"}: <strong className="font-bold">{score}%</strong>
      </span>
    </div>
  );
};

interface QualityMeterProps {
  score: number;
  label: string;
  sublabel?: string;
  type: "clarity" | "reliability";
}

export const QualityMeter: React.FC<QualityMeterProps> = ({ score, label, sublabel, type }) => {
  const isClarity = type === "clarity";
  const color = score >= 80 ? "bg-teal-400" : score >= 60 ? "bg-amber-400" : "bg-rose-400";
  const textColor = score >= 80 ? "text-teal-300" : score >= 60 ? "text-amber-300" : "text-rose-300";

  return (
    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-300 flex items-center gap-1.5">
          {isClarity ? <Eye className="w-3.5 h-3.5 text-teal-400" /> : <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
          {label}
        </span>
        <span className={`font-bold font-mono text-sm ${textColor}`}>
          {score}%
        </span>
      </div>

      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-500 rounded-full`}
          style={{ width: `${Math.min(100, Math.max(5, score))}%` }}
        />
      </div>

      {sublabel && (
        <div className="text-[10px] text-slate-400 truncate">
          {sublabel}
        </div>
      )}
    </div>
  );
};

interface SingleImageQualityDetailsProps {
  item: VisionImageItem;
}

function simplifyDetail(text?: string, fallback: string = ""): string {
  if (!text) return fallback;
  const t = text.trim();
  if (t.includes("high edge sharpness") || t.includes("sharp focus") || t.includes("even exposure")) {
    return "Sharp focus & even illumination";
  }
  if (t.includes("Anatomical structures") || t.includes("unobstructed and suitable")) {
    return "Unobstructed anatomical landmarks";
  }
  if (t.includes("Non-biological") || t.includes("excluded from")) {
    return "Non-biological item (Excluded)";
  }
  if (t.length > 60) {
    const firstPeriod = t.indexOf(".");
    if (firstPeriod > 10 && firstPeriod < 60) {
      return t.slice(0, firstPeriod);
    }
  }
  return t;
}

export const SingleImageQualityDetails: React.FC<SingleImageQualityDetailsProps> = ({ item }) => {
  if (item.isUnrelated) return null;

  const clarityScore = item.clarityScore ?? 92;
  const reliabilityScore = item.reliabilityScore ?? 90;
  const clarityRating = item.clarityRating ?? "Optimal (Sharp & Well-Lit)";
  const reliabilityRating = item.reliabilityRating ?? "Forensic-Grade (High Confidence)";

  const clarityText = simplifyDetail(item.clarityDetails, "Sharp focus & clear lighting");
  const reliabilityText = simplifyDetail(item.reliabilityDetails, "Unobstructed anatomical markers");

  return (
    <div className="space-y-1 text-[11px] bg-slate-950/70 p-2 rounded-lg border border-slate-800">
      <div className="flex items-center justify-between gap-1 flex-wrap">
        <QualityBadge score={clarityScore} rating={clarityRating} type="clarity" />
        <QualityBadge score={reliabilityScore} rating={reliabilityRating} type="reliability" />
      </div>

      {clarityText && (
        <div className="text-slate-400 text-[10.5px] leading-snug">
          <span className="text-teal-400 font-semibold">Clarity: </span>
          {clarityText}
        </div>
      )}

      {reliabilityText && (
        <div className="text-slate-400 text-[10.5px] leading-snug">
          <span className="text-emerald-400 font-semibold">Reliability: </span>
          {reliabilityText}
        </div>
      )}
    </div>
  );
};
