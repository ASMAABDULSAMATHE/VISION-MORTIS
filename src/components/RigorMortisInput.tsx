import React, { useState } from "react";
import { RigorMortisData, RigorProgressionStage } from "../types";
import { evaluateRigorMortis } from "../utils/forensicCalculations";
import { formatIndicatorTimestamp } from "../utils/validation";
import {
  Activity,
  ShieldAlert,
  CheckCircle2,
  Info,
  Zap,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Clock,
} from "lucide-react";

interface Props {
  data: RigorMortisData;
  onChange: (updated: RigorMortisData) => void;
  isOpen?: boolean;
  onToggleOpen?: () => void;
}

const STAGES: Array<{ id: RigorProgressionStage; label: string; window: string; desc: string }> = [
  {
    id: "absent_early",
    label: "Primary Flaccidity (Absent Early)",
    window: "0 – 2 Hours",
    desc: "Muscles flaccid and compliant; cellular ATP levels remain sufficient to prevent cross-linking.",
  },
  {
    id: "developing_jaw_neck",
    label: "Developing (Nysten 1: Jaw & Neck)",
    window: "2 – 6 Hours",
    desc: "Rigidity detectable in temporomandibular joint, facial, and cervical muscles.",
  },
  {
    id: "moderate_upper_trunk",
    label: "Moderate (Nysten 2: Arms & Trunk)",
    window: "6 – 12 Hours",
    desc: "Extending to upper extremities, shoulders, elbows, and thoracic musculature.",
  },
  {
    id: "complete_generalized",
    label: "Complete Rigidity (Generalized Peak)",
    window: "12 – 24 Hours",
    desc: "Full stiffness across all skeletal muscle groups (jaw, arms, abdomen, lower limbs).",
  },
  {
    id: "resolving_flaccid",
    label: "Resolving (Secondary Flaccidity)",
    window: "24 – 48 Hours",
    desc: "Autolytic enzymatic breakdown of actin-myosin bridges; resolving in order of onset.",
  },
  {
    id: "absent_late",
    label: "Passed (Absent Late)",
    window: "> 36 – 48+ Hours",
    desc: "Rigor mortis completely resolved; muscles flaccid with early putrefactive softening.",
  },
];

const DEFAULT_MUSCLE_GROUPS = {
  jawTemporomandibular: false,
  neckCervical: false,
  upperLimbsElbowsWrists: false,
  trunkAbdomen: false,
  lowerLimbsKneesAnkles: false,
};

export const RigorMortisInput: React.FC<Props> = ({
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
  const safeMuscleGroups = data.muscleGroups || DEFAULT_MUSCLE_GROUPS;
  const result = evaluateRigorMortis(data);

  // Auto-sync muscle groups to stage if user clicks individual muscles
  const handleMuscleToggle = (group: keyof typeof safeMuscleGroups) => {
    const updatedGroups = {
      ...safeMuscleGroups,
      [group]: !safeMuscleGroups[group],
    };

    // Derive approximate stage from muscle count
    const activeCount = Object.values(updatedGroups).filter(Boolean).length;
    let newStage = data.progressionStage;

    if (activeCount === 0 && data.progressionStage !== "absent_late") {
      newStage = "absent_early";
    } else if (activeCount === 1 || activeCount === 2) {
      newStage = "developing_jaw_neck";
    } else if (activeCount === 3 || activeCount === 4) {
      newStage = "moderate_upper_trunk";
    } else if (activeCount === 5) {
      newStage = "complete_generalized";
    }

    onChange({
      ...data,
      muscleGroups: updatedGroups,
      progressionStage: newStage,
    });
  };

  const handleStageSelect = (stageId: RigorProgressionStage) => {
    let updatedGroups = { ...safeMuscleGroups };
    if (stageId === "absent_early" || stageId === "absent_late") {
      updatedGroups = {
        jawTemporomandibular: false,
        neckCervical: false,
        upperLimbsElbowsWrists: false,
        trunkAbdomen: false,
        lowerLimbsKneesAnkles: false,
      };
    } else if (stageId === "developing_jaw_neck") {
      updatedGroups = {
        jawTemporomandibular: true,
        neckCervical: true,
        upperLimbsElbowsWrists: false,
        trunkAbdomen: false,
        lowerLimbsKneesAnkles: false,
      };
    } else if (stageId === "moderate_upper_trunk") {
      updatedGroups = {
        jawTemporomandibular: true,
        neckCervical: true,
        upperLimbsElbowsWrists: true,
        trunkAbdomen: true,
        lowerLimbsKneesAnkles: false,
      };
    } else if (stageId === "complete_generalized") {
      updatedGroups = {
        jawTemporomandibular: true,
        neckCervical: true,
        upperLimbsElbowsWrists: true,
        trunkAbdomen: true,
        lowerLimbsKneesAnkles: true,
      };
    } else if (stageId === "resolving_flaccid") {
      updatedGroups = {
        jawTemporomandibular: false,
        neckCervical: false,
        upperLimbsElbowsWrists: true,
        trunkAbdomen: true,
        lowerLimbsKneesAnkles: true,
      };
    }

    onChange({
      ...data,
      progressionStage: stageId,
      muscleGroups: updatedGroups,
    });
  };

  return (
    <div id="rigor-mortis-card" className="rounded-xl bg-slate-900/90 border border-slate-800 p-5 space-y-4 transition-all">
      {/* Header with Toggle & Collapse */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2 flex-wrap">
              <span>Rigor Mortis</span>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-teal-950/80 text-teal-400 border border-teal-800/50">
                1 – 36 Hours
              </span>
              {data.recordedAt && (
                <span className="text-[10px] font-mono text-teal-300 px-2 py-0.5 rounded-md bg-slate-950/90 border border-slate-800 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-teal-400" />
                  <span>Logged: {formatIndicatorTimestamp(data.recordedAt)}</span>
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400">Nysten's law post-mortem muscle rigidity progression & ATP breakdown</p>
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
          {/* Nysten Muscle Group Anatomical Checkers */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200">
                Anatomical Muscle Group Rigidity (Nysten Law Progression)
              </span>
              <span className="text-xs text-slate-400">Click muscle regions found stiffened</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
              {[
                { key: "jawTemporomandibular", label: "Jaw / TMJ", note: "Onset 1-3h" },
                { key: "neckCervical", label: "Cervical Neck", note: "Onset 2-4h" },
                { key: "upperLimbsElbowsWrists", label: "Upper Limbs / Elbows", note: "Onset 4-8h" },
                { key: "trunkAbdomen", label: "Trunk / Abdomen", note: "Onset 6-10h" },
                { key: "lowerLimbsKneesAnkles", label: "Lower Limbs / Knees", note: "Onset 8-12h" },
              ].map((m) => {
                const isRigid = Boolean((safeMuscleGroups as any)[m.key]);
                return (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => handleMuscleToggle(m.key as any)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isRigid
                        ? "bg-teal-950/80 border-teal-500 text-teal-200 shadow-sm shadow-teal-900/30"
                        : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span>{m.label}</span>
                      <div
                        className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                          isRigid ? "bg-teal-500 border-teal-400" : "border-slate-700 bg-slate-950"
                        }`}
                      >
                        {isRigid && <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />}
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">{m.note}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Overall Rigor Stage Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-200">
              Overall Rigor Mortis Classification
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {STAGES.map((stg) => {
                const isSelected = data.progressionStage === stg.id;
                return (
                  <button
                    key={stg.id}
                    type="button"
                    onClick={() => handleStageSelect(stg.id)}
                    className={`p-3.5 text-left rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-teal-950/80 border-teal-500 text-teal-100 shadow-sm shadow-teal-950/40 ring-1 ring-teal-500/40"
                        : "bg-slate-950/60 border-slate-800/80 hover:border-slate-700 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span>{stg.label}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-teal-300 border border-teal-900/40">
                        {stg.window}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{stg.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Modifiers: Pre-death exertion & Cold Stiffening */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950/40 p-4 rounded-xl border border-slate-800/60 text-xs">
            {/* Pre-death exertion */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> Pre-Mortem Physical Exertion
              </label>
              <select
                value={data.preDeathPhysicalExertion}
                onChange={(e) => onChange({ ...data, preDeathPhysicalExertion: e.target.value as any })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
              >
                <option value="none_at_rest">None (Resting / Sedentary)</option>
                <option value="moderate">Moderate Physical Activity</option>
                <option value="violent_convulsions_strenuous">
                  Violent Struggle / Seizures / Convulsions (Rapid ATP Depletion)
                </option>
              </select>
              <p className="text-xs text-slate-500">
                Strenuous activity accelerates lactic acidosis and rapid onset of rigor.
              </p>
            </div>

            {/* Cold stiffening check */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-200 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-teal-400" /> Cold Stiffening Check
              </label>
              <div className="flex items-center h-9">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={data.coldStiffeningSuspected}
                    onChange={(e) => onChange({ ...data, coldStiffeningSuspected: e.target.checked })}
                    className="rounded bg-slate-800 border-slate-700 text-teal-500 focus:ring-0"
                  />
                  <span>Suspected Freezing / Cold Stiffening (&lt;4°C)</span>
                </label>
              </div>
              <p className="text-xs text-slate-500">
                Freezing of muscle fluid mimics true rigor mortis.
              </p>
            </div>
          </div>

          {/* Quick Outcome Bar */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-teal-950/40 p-3.5 rounded-xl border border-teal-900/40 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
              <div>
                <span className="text-slate-400">Rigor Evaluation:</span>{" "}
                <span className="text-teal-300 font-bold font-mono">
                  {result.optimalHours}h
                </span>{" "}
                <span className="text-slate-400 text-xs">
                  (Estimated window: {result.minHours} – {result.maxHours} h)
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
                <span>Scientific Context & Nysten's Progression Law</span>
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
                  <strong>Physiological Mechanism:</strong> Cessation of aerobic respiration depletes adenosine triphosphate (ATP). Without ATP, myosin cannot dissociate from actin filaments, locking muscle fibers into rigid cross-bridges.
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-400">
                  <li><strong>Nysten's Rule of Onset:</strong> Small muscle groups (jaw, eyelids, face) develop perceptible stiffness first, progressing downward to neck, arms, trunk, and lower extremities.</li>
                  <li><strong>Resolution Phase:</strong> After 24–36 hours, endogenous proteolytic enzymes (calpains, cathepsins) degrade the myofilament architecture, producing secondary flaccidity.</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-500 flex items-center gap-2">
          <Info className="w-4 h-4 text-slate-600" />
          Rigor mortis evaluation is bypassed.
        </div>
      )}
    </>
  )}
</div>
  );
};
export default RigorMortisInput;
