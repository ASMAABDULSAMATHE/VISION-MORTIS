import React, { useState } from "react";
import { DecompositionData } from "../types";
import { evaluateDecomposition } from "../utils/forensicCalculations";
import {
  Skull,
  Info,
  CheckCircle2,
  Flame,
  ChevronDown,
  ChevronUp,
  HelpCircle,
} from "lucide-react";

interface Props {
  data: DecompositionData;
  onChange: (updated: DecompositionData) => void;
  isOpen?: boolean;
  onToggleOpen?: () => void;
}

const HEAD_NECK_DESCRIPTIONS: Record<number, string> = {
  1: "1: Fresh, no discoloration",
  2: "2: Pink-white / slight grayish discoloration",
  3: "3: Gray to green discoloration of face/neck",
  4: "4: Discoloration with marbling of venous network",
  5: "5: Purging of decomposition fluid from nose/mouth",
  6: "6: Bloating of neck and facial tissues, eyes bulged",
  7: "7: Post-bloat, blackened tissues, skin slippage",
  8: "8: Moist decomposition with soft tissue collapse",
  9: "9: Mummification with leathery parchment skin",
  10: "10: Bone exposure <50% of facial/cranial area",
  11: "11: Bone exposure >50% of facial/cranial area",
  12: "12: Complete cranial skeletonization, greasy bone",
  13: "13: Complete cranial skeletonization, bleached bone",
};

const TRUNK_DESCRIPTIONS: Record<number, string> = {
  1: "1: Fresh, no discoloration",
  2: "2: Pink-white / slight gray tint",
  3: "3: Green discoloration of right iliac fossa / lower abdomen",
  4: "4: Discoloration spreading to entire abdomen with marbling",
  5: "5: Bloating with gas distension of abdominal cavity",
  6: "6: Generalized bloat, purging, large bullae",
  7: "7: Post-bloat collapse, dark green/blackened tissues",
  8: "8: Moist decomposition, abdominal wall rupture",
  9: "9: Mummification / adipocere formation",
  10: "10: Bone exposure <50% of thorax/pelvis",
  11: "11: Bone exposure >50% of thoracic cage",
  12: "12: Complete axial skeletonization, dry ribs/vertebrae",
};

const LIMBS_DESCRIPTIONS: Record<number, string> = {
  1: "1: Fresh, no discoloration",
  2: "2: Pink-white / slight grayish tint",
  3: "3: Gray to green discoloration of arms/legs",
  4: "4: Venous marbling across extremities",
  5: "5: Skin slippage and glove-like epidermal detachment",
  6: "6: Post-bloat, dark brown/blackened tissues",
  7: "7: Moist decomposition of muscle masses",
  8: "8: Mummification with brown parchment skin",
  9: "9: Bone exposure <50% of limb bones",
  10: "10: Complete limb skeletonization with dry cortical bone",
};

export const DecompositionInput: React.FC<Props> = ({
  data,
  onChange,
  isOpen,
  onToggleOpen,
}) => {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [showExtraInfo, setShowExtraInfo] = useState(false);

  const isCollapsed = isOpen !== undefined ? !isOpen : internalCollapsed;
  const toggleCollapse = () => {
    if (onToggleOpen) onToggleOpen();
    else setInternalCollapsed(!internalCollapsed);
  };

  const tbs = data.headNeckScore + data.trunkScore + data.limbsScore;
  const result = evaluateDecomposition({ ...data, totalBodyScore: tbs });

  const getStageTitle = (score: number) => {
    if (score <= 4) return { title: "Fresh Stage", color: "text-emerald-400", bg: "bg-emerald-950/80 border-emerald-800/50" };
    if (score <= 10) return { title: "Early Decomposition (Marbling)", color: "text-teal-400", bg: "bg-teal-950/80 border-teal-800/50" };
    if (score <= 18) return { title: "Bloating & Active Decay", color: "text-amber-400", bg: "bg-amber-950/80 border-amber-800/50" };
    if (score <= 26) return { title: "Advanced Decay / Autolysis", color: "text-orange-400", bg: "bg-orange-950/80 border-orange-800/50" };
    return { title: "Skeletonization / Dry Remains", color: "text-rose-400", bg: "bg-rose-950/80 border-rose-800/50" };
  };

  const stage = getStageTitle(tbs);

  const handleMorphologyPreset = (type: "fresh" | "early" | "bloat" | "advanced" | "skeleton") => {
    if (type === "fresh") {
      onChange({
        ...data,
        headNeckScore: 1,
        trunkScore: 1,
        limbsScore: 1,
        marblingPresent: false,
        rightIliacDiscoloration: false,
        bloatingAndPurge: false,
        skinSlippageBullae: false,
        mummificationOrAdipocere: false,
        skeletonizationBoneExposed: false,
      });
    } else if (type === "early") {
      onChange({
        ...data,
        headNeckScore: 3,
        trunkScore: 3,
        limbsScore: 2,
        marblingPresent: true,
        rightIliacDiscoloration: true,
        bloatingAndPurge: false,
        skinSlippageBullae: false,
        mummificationOrAdipocere: false,
        skeletonizationBoneExposed: false,
      });
    } else if (type === "bloat") {
      onChange({
        ...data,
        headNeckScore: 6,
        trunkScore: 6,
        limbsScore: 4,
        marblingPresent: true,
        rightIliacDiscoloration: true,
        bloatingAndPurge: true,
        skinSlippageBullae: true,
        mummificationOrAdipocere: false,
        skeletonizationBoneExposed: false,
      });
    } else if (type === "advanced") {
      onChange({
        ...data,
        headNeckScore: 8,
        trunkScore: 8,
        limbsScore: 6,
        marblingPresent: true,
        rightIliacDiscoloration: true,
        bloatingAndPurge: true,
        skinSlippageBullae: true,
        mummificationOrAdipocere: true,
        skeletonizationBoneExposed: false,
      });
    } else if (type === "skeleton") {
      onChange({
        ...data,
        headNeckScore: 12,
        trunkScore: 11,
        limbsScore: 9,
        marblingPresent: false,
        rightIliacDiscoloration: false,
        bloatingAndPurge: false,
        skinSlippageBullae: false,
        mummificationOrAdipocere: false,
        skeletonizationBoneExposed: true,
      });
    }
  };

  return (
    <div id="decomposition-card" className="rounded-xl bg-slate-900/90 border border-slate-800 p-5 space-y-4 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <Skull className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              Decomposition & Total Body Score (TBS)
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-teal-950/80 text-teal-400 border border-teal-800/50">
                24 Hours – Months
              </span>
            </h3>
            <p className="text-xs text-slate-400">Megyesi et al. quantitative morphological scoring & Accumulated Degree Days (ADD)</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={data.enabled}
              onChange={(e) => onChange({ ...data, enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
            <span className="ml-2 text-xs font-medium text-slate-300 hidden sm:inline">{data.enabled ? "Active" : "Bypassed"}</span>
          </label>

          <button
            type="button"
            onClick={toggleCollapse}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
            title={isCollapsed ? "Expand module" : "Collapse module"}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <>
          {data.enabled ? (
            <div className="space-y-4">
          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-medium mr-1">Quick Stage:</span>
            {[
              { id: "fresh", label: "Fresh (TBS 3)" },
              { id: "early", label: "Early Marbling (TBS 8)" },
              { id: "bloat", label: "Bloat / Purge (TBS 16)" },
              { id: "advanced", label: "Advanced Decay (TBS 22)" },
              { id: "skeleton", label: "Skeletonized (TBS 32)" },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleMorphologyPreset(p.id as any)}
                className="px-3 py-1.5 text-xs rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* 3-Region Megyesi Sliders */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            {/* Head & Neck */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-200">Head & Neck (A)</span>
                <span className="text-teal-400 font-mono font-bold">{data.headNeckScore} / 13</span>
              </div>
              <input
                type="range"
                min="1"
                max="13"
                step="1"
                value={data.headNeckScore}
                onChange={(e) => onChange({ ...data, headNeckScore: parseInt(e.target.value, 10) })}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
              />
              <p className="text-xs text-slate-400 leading-snug min-h-[36px]">
                {HEAD_NECK_DESCRIPTIONS[data.headNeckScore]}
              </p>
            </div>

            {/* Trunk */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-200">Trunk / Thorax (B)</span>
                <span className="text-teal-400 font-mono font-bold">{data.trunkScore} / 12</span>
              </div>
              <input
                type="range"
                min="1"
                max="12"
                step="1"
                value={data.trunkScore}
                onChange={(e) => onChange({ ...data, trunkScore: parseInt(e.target.value, 10) })}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
              />
              <p className="text-xs text-slate-400 leading-snug min-h-[36px]">
                {TRUNK_DESCRIPTIONS[data.trunkScore]}
              </p>
            </div>

            {/* Limbs */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-200">Limbs / Extremities (C)</span>
                <span className="text-teal-400 font-mono font-bold">{data.limbsScore} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={data.limbsScore}
                onChange={(e) => onChange({ ...data, limbsScore: parseInt(e.target.value, 10) })}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
              />
              <p className="text-xs text-slate-400 leading-snug min-h-[36px]">
                {LIMBS_DESCRIPTIONS[data.limbsScore]}
              </p>
            </div>
          </div>

          {/* Morphological Sign Checkers & Mean Temperature */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Feature Checklist */}
            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/60 space-y-2 text-xs">
              <span className="font-semibold text-slate-300 block mb-1">Observed Morphological Artifacts</span>
              <div className="grid grid-cols-2 gap-2 text-slate-400">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.marblingPresent}
                    onChange={(e) => onChange({ ...data, marblingPresent: e.target.checked })}
                    className="rounded bg-slate-800 border-slate-700 text-teal-500"
                  />
                  <span>Venous Marbling</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.rightIliacDiscoloration}
                    onChange={(e) => onChange({ ...data, rightIliacDiscoloration: e.target.checked })}
                    className="rounded bg-slate-800 border-slate-700 text-teal-500"
                  />
                  <span>Rt. Iliac Green</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.bloatingAndPurge}
                    onChange={(e) => onChange({ ...data, bloatingAndPurge: e.target.checked })}
                    className="rounded bg-slate-800 border-slate-700 text-teal-500"
                  />
                  <span>Bloating & Purge</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.skinSlippageBullae}
                    onChange={(e) => onChange({ ...data, skinSlippageBullae: e.target.checked })}
                    className="rounded bg-slate-800 border-slate-700 text-teal-500"
                  />
                  <span>Skin Slippage / Bullae</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.mummificationOrAdipocere}
                    onChange={(e) => onChange({ ...data, mummificationOrAdipocere: e.target.checked })}
                    className="rounded bg-slate-800 border-slate-700 text-teal-500"
                  />
                  <span>Mummification / Adipocere</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.skeletonizationBoneExposed}
                    onChange={(e) => onChange({ ...data, skeletonizationBoneExposed: e.target.checked })}
                    className="rounded bg-slate-800 border-slate-700 text-teal-500"
                  />
                  <span>Bone Exposure</span>
                </label>
              </div>
            </div>

            {/* Mean Ambient Temperature Modifier */}
            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/60 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400" /> Mean Ambient Temp (Scene)
                </span>
                <span className="text-amber-400 font-mono font-bold">{data.effectiveMeanTempC} °C</span>
              </div>
              <input
                type="range"
                min="2"
                max="38"
                step="0.5"
                value={data.effectiveMeanTempC}
                onChange={(e) => onChange({ ...data, effectiveMeanTempC: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
              <p className="text-xs text-slate-500">
                ADD formula: <span className="font-mono text-slate-400">ADD = 10^(0.002×TBS² + 1.81)</span>. Decay rate scales directly with environmental temperature.
              </p>
            </div>
          </div>

          {/* Quick Outcome Bar */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-teal-950/40 p-3.5 rounded-xl border border-teal-900/40 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
              <div>
                <span className="text-slate-400">TBS Score:</span>{" "}
                <span className="font-mono text-teal-300 font-bold text-sm">
                  {tbs} / 35
                </span>{" "}
                <span className={`text-[10px] px-2 py-0.5 rounded-md border ${stage.bg} ${stage.color} font-medium ml-1.5`}>
                  {stage.title}
                </span>{" "}
                <span className="text-slate-400 text-xs ml-2">
                  (ADD: {result.addCalculated} → ~{(result.optimalHours / 24).toFixed(1)} days / {result.optimalHours}h)
                </span>
              </div>
            </div>
            <span className="text-emerald-400 font-semibold text-xs">{result.confidence}% Confidence</span>
          </div>

          {/* Collapsible Scientific Information */}
          <div className="border border-slate-800/70 rounded-xl overflow-hidden bg-slate-950/30 text-xs">
            <button
              type="button"
              onClick={() => setShowExtraInfo(!showExtraInfo)}
              className="w-full p-3 flex items-center justify-between text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 transition-colors cursor-pointer text-left"
            >
              <span className="flex items-center gap-2 font-medium">
                <HelpCircle className="w-3.5 h-3.5 text-teal-400" />
                <span>Scientific Context & Total Body Score (TBS) Methodology</span>
              </span>
              {showExtraInfo ? (
                <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              )}
            </button>
            {showExtraInfo && (
              <div className="p-4 border-t border-slate-800/60 space-y-2 text-slate-400 leading-relaxed bg-slate-950/50">
                <p>
                  <strong>Total Body Score (Megyesi et al., 2005):</strong> Quantifies visual decomposition into point-based anatomical stages (Head/Neck: 1–13, Trunk: 1–12, Limbs: 1–10).
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-400">
                  <li><strong>Accumulated Degree-Days (ADD):</strong> Represents the thermal energy accumulated over time required for biological decay reactions.</li>
                  <li><strong>Temperature Dependency:</strong> In high ambient warmth (e.g. 32°C+), microbial autolysis and putrefactive bloat accelerate exponentially compared to temperate conditions.</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-500 flex items-center gap-2">
          <Info className="w-4 h-4 text-slate-600" />
          Decomposition scoring is bypassed.
        </div>
      )}
    </>
  )}
</div>
  );
};
export default DecompositionInput;
