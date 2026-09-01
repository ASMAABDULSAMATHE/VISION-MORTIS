import React, { useState } from "react";
import { AlgorMortisData } from "../types";
import { calculateHenssgeAlgorMortis } from "../utils/forensicCalculations";
import { formatIndicatorTimestamp } from "../utils/validation";
import {
  Thermometer,
  Wind,
  Droplets,
  Info,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Clock,
} from "lucide-react";

interface Props {
  data: AlgorMortisData;
  onChange: (updated: AlgorMortisData) => void;
  isOpen?: boolean;
  onToggleOpen?: () => void;
  baselineData?: AlgorMortisData;
}

const CLOTHING_PRESETS = [
  { label: "Naked", factor: 1.0, desc: "Standard unclad baseline" },
  { label: "Light clothing (1-2 layers)", factor: 1.1, desc: "Pajamas, T-shirt" },
  { label: "Normal clothing (2-3 layers)", factor: 1.2, desc: "Shirt, trousers, underwear" },
  { label: "Heavy winter / insulated", factor: 1.4, desc: "Coat, thick sweater, boots" },
  { label: "In bed with heavy blanket", factor: 1.7, desc: "Duvet / heavy insulation" },
  { label: "Flowing cold water", factor: 0.5, desc: "Rapid convective cooling" },
  { label: "Stagnant cold water", factor: 0.75, desc: "Conductive aquatic cooling" },
];

export const AlgorMortisInput: React.FC<Props> = ({
  data,
  onChange,
  isOpen,
  onToggleOpen,
  baselineData,
}) => {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [showExtraInfo, setShowExtraInfo] = useState(false);

  const isCollapsed = isOpen !== undefined ? !isOpen : internalCollapsed;
  const toggleCollapse = () => {
    if (onToggleOpen) onToggleOpen();
    else setInternalCollapsed(!internalCollapsed);
  };

  const result = calculateHenssgeAlgorMortis(
    data.rectalTempC,
    data.ambientTempC,
    data.bodyWeightKg,
    data.clothingCoveringFactor
  );

  return (
    <div id="algor-mortis-card" className="rounded-xl bg-slate-900/90 border border-slate-800 p-5 space-y-4 transition-all">
      {/* Header with Collapse and Toggle */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <Thermometer className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2 flex-wrap">
              <span>Algor Mortis</span>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-teal-950/80 text-teal-400 border border-teal-800/50">
                0 – 24 Hours
              </span>
              {data.recordedAt && (
                <span className="text-[10px] font-mono text-teal-300 px-2 py-0.5 rounded-md bg-slate-950/90 border border-slate-800 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-teal-400" />
                  <span>Logged: {formatIndicatorTimestamp(data.recordedAt)}</span>
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400">Henssge double-exponential nomogram core body temperature cooling</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Active/Bypassed Switch */}
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={data.enabled}
              onChange={(e) => onChange({ ...data, enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
            <span className="ml-2 text-xs font-medium text-slate-300 hidden sm:inline">
              {data.enabled ? "Active" : "Bypassed"}
            </span>
          </label>

          {/* Module Box Collapse Button */}
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
              {/* Temperature Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Rectal Core Temp */}
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-medium flex items-center gap-1.5">
                      <Thermometer className="w-3.5 h-3.5 text-rose-400" /> Core / Rectal Temp
                    </span>
                    <div className="flex items-center gap-1.5">
                      {baselineData && baselineData.rectalTempC !== data.rectalTempC && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950/90 text-amber-300 border border-amber-800/80 font-mono">
                          Base: {baselineData.rectalTempC.toFixed(1)}°C
                        </span>
                      )}
                      <span className="text-teal-400 font-bold text-sm font-mono">{data.rectalTempC.toFixed(1)} °C</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="38"
                    step="0.1"
                    value={data.rectalTempC}
                    onChange={(e) => onChange({ ...data, rectalTempC: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>10.0°C (Cooled)</span>
                    <span>37.2°C (Normothermia)</span>
                  </div>
                </div>

                {/* Ambient Scene Temp */}
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-medium flex items-center gap-1.5">
                      <Thermometer className="w-3.5 h-3.5 text-amber-400" /> Ambient Scene Temp
                    </span>
                    <div className="flex items-center gap-1.5">
                      {baselineData && baselineData.ambientTempC !== data.ambientTempC && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950/90 text-amber-300 border border-amber-800/80 font-mono">
                          Base: {baselineData.ambientTempC.toFixed(1)}°C
                        </span>
                      )}
                      <span className="text-amber-400 font-bold text-sm font-mono">{data.ambientTempC.toFixed(1)} °C</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="-5"
                    max="40"
                    step="0.5"
                    value={data.ambientTempC}
                    onChange={(e) => onChange({ ...data, ambientTempC: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>-5.0°C</span>
                    <span>20.0°C (Room)</span>
                    <span>40.0°C</span>
                  </div>
                </div>

                {/* Body Mass */}
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-medium">Estimated Body Mass</span>
                    <div className="flex items-center gap-1.5">
                      {baselineData && baselineData.bodyWeightKg !== data.bodyWeightKg && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950/90 text-amber-300 border border-amber-800/80 font-mono">
                          Base: {baselineData.bodyWeightKg}kg
                        </span>
                      )}
                      <span className="text-emerald-400 font-bold text-sm font-mono">{data.bodyWeightKg} kg</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="160"
                    step="1"
                    value={data.bodyWeightKg}
                    onChange={(e) => onChange({ ...data, bodyWeightKg: parseInt(e.target.value, 10) })}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>30 kg</span>
                    <span>75 kg</span>
                    <span>160 kg</span>
                  </div>
                </div>
              </div>

              {/* Clothing & Environmental Corrective Factor (C) */}
              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/60 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">
                    Henssge Corrective Factor (<span className="text-teal-400 font-mono">C = {data.clothingCoveringFactor.toFixed(2)}</span>)
                  </span>
                  <span className="text-xs text-slate-400">Select scene condition to adjust cooling rate</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                  {CLOTHING_PRESETS.map((preset) => {
                    const isSelected = Math.abs(data.clothingCoveringFactor - preset.factor) < 0.05;
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() =>
                          onChange({
                            ...data,
                            clothingCoveringFactor: preset.factor,
                            clothingDescription: preset.label,
                          })
                        }
                        className={`p-3 text-left rounded-xl border transition-all text-xs cursor-pointer ${
                          isSelected
                            ? "bg-teal-950/80 border-teal-500 text-teal-200 shadow-sm shadow-teal-900/30"
                            : "bg-slate-900/70 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <div className="font-medium text-xs leading-tight flex items-center justify-between">
                          <span>{preset.label}</span>
                          <span className="font-mono text-[10px] opacity-80">C={preset.factor}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">{preset.desc}</div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-800/60 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={data.isBodyWet}
                      onChange={(e) => onChange({ ...data, isBodyWet: e.target.checked })}
                      className="rounded bg-slate-800 border-slate-700 text-teal-500 focus:ring-0"
                    />
                    <Droplets className="w-3.5 h-3.5 text-teal-400" />
                    <span>Wet body surface (accelerated evaporation)</span>
                  </label>

                  <div className="flex items-center gap-2 text-slate-300 ml-auto">
                    <Wind className="w-3.5 h-3.5 text-teal-400" />
                    <span className="text-slate-400">Air movement:</span>
                    <select
                      value={data.airCurrentVelocity}
                      onChange={(e) => onChange({ ...data, airCurrentVelocity: e.target.value as any })}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-teal-500 cursor-pointer"
                    >
                      <option value="still">Still Air (Indoor)</option>
                      <option value="moderate_breeze">Moderate Breeze</option>
                      <option value="strong_wind">Strong Wind</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Henssge Instant Solution Bar */}
              <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-teal-950/40 p-4 rounded-xl border border-teal-900/40 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-400" />
                  <div className="text-xs">
                    <span className="text-slate-400">Henssge Algor Estimate:</span>{" "}
                    <span className="text-teal-300 font-bold text-sm font-mono">
                      {result.pmiHours} hours
                    </span>{" "}
                    <span className="text-slate-400 text-xs">
                      (95% CI: {result.minHours} – {result.maxHours} h)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 font-mono text-[11px]">
                    k = {(1.2815 / (Math.pow(data.bodyWeightKg, 0.625) * data.clothingCoveringFactor) - 0.0284).toFixed(4)}
                  </span>
                  <span className="text-emerald-400 font-semibold">{result.confidence}% Confidence</span>
                </div>
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
                    <span>Scientific Context & Henssge Methodology</span>
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
                      <strong>Henssge Nomogram Core Principles:</strong> Algor mortis models the initial post-mortem temperature plateau followed by exponential descent toward ambient equilibrium.
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-slate-400">
                      <li><strong>Temperature Plateau:</strong> Typically lasts 1 to 3 hours post-mortem before linear cooling begins.</li>
                      <li><strong>Corrective Factor (C):</strong> Accounts for insulation (clothing layers, bedding) and convective cooling (wind, immersion).</li>
                      <li><strong>Limitation Window:</strong> Most reliable within the first 24 hours. Once core temperature reaches within 1°C of ambient temperature, thermal gradient precision decreases.</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-500 flex items-center gap-2">
              <Info className="w-4 h-4 text-slate-600" />
              Algor mortis calculations are currently bypassed (e.g. for advanced skeletonized remains or missing rectal temperature).
            </div>
          )}
        </>
      )}
    </div>
  );
};
export default AlgorMortisInput;
