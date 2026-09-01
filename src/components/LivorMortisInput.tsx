import React, { useState } from "react";
import { BodyPosition, LivorMortisData } from "../types";
import {
  Droplet,
  AlertTriangle,
  Info,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Clock,
} from "lucide-react";
import { evaluateLivorMortis } from "../utils/forensicCalculations";
import { formatIndicatorTimestamp } from "../utils/validation";

interface Props {
  data: LivorMortisData;
  bodyFoundPosition: BodyPosition;
  onChange: (updated: LivorMortisData) => void;
  isOpen?: boolean;
  onToggleOpen?: () => void;
}

const BLANCH_OPTIONS = [
  {
    id: "absent",
    title: "Absent / Faint",
    window: "0 – 2 Hours",
    desc: "No perceptible intravascular pooling or only faint discoloration.",
  },
  {
    id: "fully_blanchable",
    title: "Fully Blanchable",
    window: "1 – 6 Hours",
    desc: "Disappears completely under thumb pressure; blood remains within capillary lumen.",
  },
  {
    id: "partially_blanchable",
    title: "Partially Blanchable",
    window: "6 – 12 Hours",
    desc: "Incomplete/delayed blanching with firm pressure; perivascular hemolysis beginning.",
  },
  {
    id: "fixed_unblanchable",
    title: "Fixed / Non-Blanchable",
    window: "> 10 – 12+ Hours",
    desc: "No change upon deep pressure; complete hemoglobin diffusion into dermis.",
  },
];

const COLOR_OPTIONS = [
  {
    id: "violaceous",
    title: "Violaceous / Dark Purple",
    badge: "Standard",
    desc: "Normal deoxygenated venous pooling in dependent dermal capillaries.",
    badgeClass: "bg-teal-950/80 text-teal-300 border-teal-800",
  },
  {
    id: "cherry_red",
    title: "Cherry-Red / Bright Pink",
    badge: "Toxicology / Cold",
    desc: "Carbon monoxide (COHb >30%), Cyanide intoxication, or prolonged hypothermic cold exposure.",
    badgeClass: "bg-rose-950/80 text-rose-300 border-rose-800",
  },
  {
    id: "chocolate_brown",
    title: "Chocolate / Muddy Brown",
    badge: "Methemoglobin",
    desc: "Methemoglobinemia from chlorate, nitrite, or aniline dye poisoning.",
    badgeClass: "bg-amber-950/80 text-amber-300 border-amber-800",
  },
  {
    id: "pale_anemic",
    title: "Pale / Indistinct",
    badge: "Hemorrhage",
    desc: "Severe exsanguination (massive blood loss), severe anemia, or cold immersion.",
    badgeClass: "bg-slate-800 text-slate-300 border-slate-700",
  },
];

const DISTRIBUTION_OPTIONS = [
  { id: "posterior", label: "Posterior Dependent", desc: "Back, buttocks, calves (sparing pressure points)" },
  { id: "anterior", label: "Anterior Dependent", desc: "Face, chest, abdomen, anterior thighs" },
  { id: "lateral_sided", label: "Lateral Sided", desc: "One side of body (right or left dependent)" },
  { id: "generalized", label: "Generalized / Diffuse", desc: "Widespread without clear gravitational margin" },
  { id: "dual_discordant", label: "Dual / Discordant Zones", desc: "Two distinct planes (indicates body movement)" },
];

export const LivorMortisInput: React.FC<Props> = ({
  data,
  bodyFoundPosition,
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

  const result = evaluateLivorMortis(data);

  // Detect discordance between body position found and lividity distribution
  const isSupine = bodyFoundPosition === "supine";
  const isProne = bodyFoundPosition === "prone";
  const isAnteriorLividity = data.distributionPattern === "anterior";
  const isPosteriorLividity = data.distributionPattern === "posterior";

  const isPositionConflict =
    (isSupine && isAnteriorLividity) ||
    (isProne && isPosteriorLividity) ||
    data.distributionPattern === "dual_discordant" ||
    data.suspectedBodyMovement;

  return (
    <div id="livor-mortis-card" className="rounded-xl bg-slate-900/90 border border-slate-800 p-5 space-y-4 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <Droplet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2 flex-wrap">
              <span>Livor Mortis</span>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-teal-950/80 text-teal-400 border border-teal-800/50">
                30 min – 12 Hours
              </span>
              {data.recordedAt && (
                <span className="text-[10px] font-mono text-teal-300 px-2 py-0.5 rounded-md bg-slate-950/90 border border-slate-800 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-teal-400" />
                  <span>Logged: {formatIndicatorTimestamp(data.recordedAt)}</span>
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400">Post-mortem gravitational settling of blood and fixation timeline</p>
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
              {/* Blanchability Stages */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-2">
                  Digital Pressure Blanching Test (Fixation Stage)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {BLANCH_OPTIONS.map((opt) => {
                    const isSelected = data.blanchability === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => onChange({ ...data, blanchability: opt.id as any })}
                        className={`p-3.5 text-left rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-teal-950/90 border-teal-500 text-teal-100 shadow-sm shadow-teal-900/30 ring-1 ring-teal-500/50"
                            : "bg-slate-950/60 border-slate-800/80 hover:border-slate-700 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span>{opt.title}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-teal-300 border border-teal-900/40">
                            {opt.window}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{opt.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Coloration & Diagnostic Hue */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-2">
                  Color Hue / Diagnostic Staining
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {COLOR_OPTIONS.map((opt) => {
                    const isSelected = data.colorHue === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => onChange({ ...data, colorHue: opt.id as any })}
                        className={`p-3.5 text-left rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-slate-900 border-teal-400 text-slate-100 shadow-sm ring-1 ring-teal-500/40"
                            : "bg-slate-950/60 border-slate-800/80 hover:border-slate-700 text-slate-400"
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-medium">
                          <span className="font-semibold text-slate-200">{opt.title}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded border ${opt.badgeClass}`}>
                            {opt.badge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{opt.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Distribution Pattern & Relocation Flag */}
              <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/80 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="text-xs">
                    <span className="font-semibold text-slate-200">Lividity Distribution Pattern</span>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Cross-checked against body discovery position:{" "}
                      <span className="font-mono text-teal-400 font-semibold uppercase">{bodyFoundPosition}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={data.distributionPattern}
                      onChange={(e) => onChange({ ...data, distributionPattern: e.target.value as any })}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500 font-medium cursor-pointer"
                    >
                      {DISTRIBUTION_OPTIONS.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Position Discordance Alert Warning */}
                {isPositionConflict && (
                  <div className="p-3.5 rounded-xl bg-amber-950/60 border border-amber-600/60 text-amber-200 text-xs flex items-start gap-2.5 animate-pulse">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-amber-300">
                        Positional Discordance Detected (Post-Mortem Body Relocation)
                      </div>
                      <p className="text-xs text-amber-200/90 mt-1 leading-relaxed">
                        Lividity is recorded on the{" "}
                        <span className="underline font-mono">{data.distributionPattern.toUpperCase()}</span> surface, but the body
                        was discovered in <span className="underline font-mono">{bodyFoundPosition.toUpperCase()}</span> position.
                        This strongly suggests the deceased was moved after hypostasis had become fixed (at least 6-12h post-mortem).
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Outcome Bar */}
              <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-teal-950/40 p-3.5 rounded-xl border border-teal-900/40 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400" />
                  <div>
                    <span className="text-slate-400">Livor Evaluation:</span>{" "}
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

              {/* Collapsible Extra Scientific Information */}
              <div className="border border-slate-800/70 rounded-xl overflow-hidden bg-slate-950/30 text-xs">
                <button
                  type="button"
                  onClick={() => setShowExtraInfo(!showExtraInfo)}
                  className="w-full p-3 flex items-center justify-between text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 transition-colors cursor-pointer text-left"
                >
                  <span className="flex items-center gap-2 font-medium">
                    <HelpCircle className="w-3.5 h-3.5 text-teal-400" />
                    <span>Scientific Context & Lividity Fixation Physiology</span>
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
                      <strong>Hypostasis (Livor Mortis) Stages:</strong> Gravity causes passive settling of erythrocyte columns into dermal post-capillary venules.
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-slate-400">
                      <li><strong>Blanchability Phase (1–6h):</strong> Thumb compression displaces intravascular blood from capillaries, causing transient blanching.</li>
                      <li><strong>Fixation Phase (&gt;10–12h):</strong> Perivascular hemolysis causes hemoglobin to stain surrounding dermis, rendering lividity permanent and non-blanchable.</li>
                      <li><strong>Discordance Utility:</strong> If a body in supine position exhibits anterior lividity, post-mortem repositioning after fixation is confirmed.</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-500 flex items-center gap-2">
              <Info className="w-4 h-4 text-slate-600" />
              Livor mortis assessment is bypassed.
            </div>
          )}
        </>
      )}
    </div>
  );
};
export default LivorMortisInput;
