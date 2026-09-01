import React, { useState } from "react";
import { EntomologyData, EntomologyInsectStage } from "../types";
import { evaluateEntomology } from "../utils/forensicCalculations";
import { formatIndicatorTimestamp } from "../utils/validation";
import {
  Bug,
  Info,
  CheckCircle2,
  Flame,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Clock,
} from "lucide-react";

interface Props {
  data: EntomologyData;
  ambientTempC: number;
  onChange: (updated: EntomologyData) => void;
  isOpen?: boolean;
  onToggleOpen?: () => void;
}

const INSECT_STAGES: Array<{ id: EntomologyInsectStage; title: string; window: string; desc: string; sizeMm: string }> = [
  {
    id: "none",
    title: "No Colonization",
    window: "Early (< 24h) or Excluded",
    desc: "No insect oviposition, eggs, or larvae observed on remains.",
    sizeMm: "0 mm",
  },
  {
    id: "eggs",
    title: "Eggs / Oviposition Clusters",
    window: "8 – 24 Hours",
    desc: "Egg rafts deposited in natural orifices (eyes, nose, mouth) or trauma sites.",
    sizeMm: "1 – 2 mm",
  },
  {
    id: "larva_instar_1",
    title: "1st Instar Larvae",
    window: "1 – 2 Days (24–48h)",
    desc: "Very small newly hatched larvae, 1 posterior spiracular slit.",
    sizeMm: "2 – 4 mm",
  },
  {
    id: "larva_instar_2",
    title: "2nd Instar Larvae",
    window: "2 – 4 Days (48–96h)",
    desc: "Active feeding, 2 posterior spiracular slits, visible cephalopharyngeal skeleton.",
    sizeMm: "5 – 9 mm",
  },
  {
    id: "larva_instar_3_feeding",
    title: "3rd Instar Larvae (Feeding)",
    window: "4 – 6 Days (96–144h)",
    desc: "Voracious feeding maggots in dense masses generating thermal heat, 3 spiracular slits.",
    sizeMm: "10 – 16 mm",
  },
  {
    id: "larva_instar_3_wandering",
    title: "3rd Instar Larvae (Wandering)",
    window: "6 – 8 Days (144–192h)",
    desc: "Post-feeding stage; larvae leave the body to seek dry substrate/soil to pupate.",
    sizeMm: "12 – 17 mm",
  },
  {
    id: "pupae",
    title: "Puparia / Pupae",
    window: "8 – 14 Days",
    desc: "Hardened, coarctate pupal cases tanning to dark reddish-brown.",
    sizeMm: "6 – 9 mm",
  },
  {
    id: "empty_puparia",
    title: "Empty Puparia / Adult Emergence",
    window: "> 14 – 21+ Days",
    desc: "Open pupal cases with operculum popped; first generation adult blowflies emerged.",
    sizeMm: "N/A",
  },
  {
    id: "dermestid_beetles",
    title: "Coleoptera / Dermestid Beetles",
    window: "3 – 6+ Weeks",
    desc: "Beetle adults and fuzzy larvae feeding on dried skin, cartilage, and bone.",
    sizeMm: "5 – 12 mm",
  },
];

export const EntomologyInput: React.FC<Props> = ({
  data,
  ambientTempC,
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

  const result = evaluateEntomology(data, ambientTempC);

  const handleStageSelect = (stageId: EntomologyInsectStage) => {
    let size = data.larvalLengthMm;
    if (stageId === "none") size = 0;
    else if (stageId === "eggs") size = 1.5;
    else if (stageId === "larva_instar_1") size = 3.0;
    else if (stageId === "larva_instar_2") size = 7.0;
    else if (stageId === "larva_instar_3_feeding") size = 13.0;
    else if (stageId === "larva_instar_3_wandering") size = 15.0;
    else if (stageId === "pupae") size = 8.0;

    onChange({
      ...data,
      developmentalStage: stageId,
      larvalLengthMm: size,
    });
  };

  return (
    <div id="entomology-card" className="rounded-xl bg-slate-900/90 border border-slate-800 p-5 space-y-4 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <Bug className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2 flex-wrap">
              <span>Forensic Entomology</span>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-teal-950/80 text-teal-400 border border-teal-800/50">
                Days – Months
              </span>
              {data.recordedAt && (
                <span className="text-[10px] font-mono text-teal-300 px-2 py-0.5 rounded-md bg-slate-950/90 border border-slate-800 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-teal-400" />
                  <span>Logged: {formatIndicatorTimestamp(data.recordedAt)}</span>
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400">Diptera & Coleoptera succession, larval instar development & Accumulated Degree Hours (ADH)</p>
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
              {/* Insect Group & Species */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/50 p-4 rounded-xl border border-slate-800/80 text-xs">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-200">Dominant Colonizing Taxon</label>
                  <select
                    value={data.primaryInsectGroup}
                    onChange={(e) => onChange({ ...data, primaryInsectGroup: e.target.value as any })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                  >
                    <option value="Calliphoridae_blowfly">Calliphoridae (Blowflies: Calliphora, Lucilia, Chrysomya)</option>
                    <option value="Sarcophagidae_fleshfly">Sarcophagidae (Flesh flies: Sarcophaga - Larviposition)</option>
                    <option value="Muscidae_housefly">Muscidae (House & Stable flies)</option>
                    <option value="Coleoptera_beetles">Coleoptera (Dermestid & Silphid beetles)</option>
                    <option value="none">None Detected</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-200 flex items-center justify-between">
                    <span>Access Delay Barrier</span>
                    <span className="text-teal-400 font-mono font-bold">{data.indoorAccessDelayHours} h</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="72"
                    step="2"
                    value={data.indoorAccessDelayHours}
                    onChange={(e) => onChange({ ...data, indoorAccessDelayHours: parseInt(e.target.value, 10) })}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
                  />
                  <p className="text-xs text-slate-500">
                    Closed windows, sealed containers, or burial delay initial fly oviposition access.
                  </p>
                </div>
              </div>

              {/* Developmental Instar Stages Selection */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-200">
                  Oldest Recovered Insect Developmental Stage
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {INSECT_STAGES.map((stg) => {
                    const isSelected = data.developmentalStage === stg.id;
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
                          <span>{stg.title}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-teal-300 border border-teal-900/40">
                            {stg.window}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1.5 leading-snug">{stg.desc}</p>
                        <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500 border-t border-slate-800/60 pt-1.5">
                          <span>Typ. Length: {stg.sizeMm}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Maggot Mass Temperature & Measured Length */}
              {data.developmentalStage !== "none" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/40 p-4 rounded-xl border border-slate-800/60 text-xs">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-300">Measured Larval Length</span>
                      <span className="text-teal-400 font-mono font-bold">{data.larvalLengthMm} mm</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      step="0.5"
                      value={data.larvalLengthMm}
                      onChange={(e) => onChange({ ...data, larvalLengthMm: parseFloat(e.target.value) })}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 text-amber-400" /> Maggot Mass Temperature
                      </span>
                      <span className="text-amber-400 font-mono font-bold">{data.maggotMassTempC} °C</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="45"
                      step="0.5"
                      value={data.maggotMassTempC}
                      onChange={(e) => onChange({ ...data, maggotMassTempC: parseFloat(e.target.value) })}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                    />
                    <p className="text-xs text-slate-500">
                      Masses of 3rd instar maggots can elevate local temperature by +5 to +15°C above ambient.
                    </p>
                  </div>
                </div>
              )}

              {/* Quick Outcome Bar */}
              <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-teal-950/40 p-3.5 rounded-xl border border-teal-900/40 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400" />
                  <div>
                    <span className="text-slate-400">Entomology Min PMI:</span>{" "}
                    <span className="text-teal-300 font-bold font-mono">
                      {result.optimalHours}h
                    </span>{" "}
                    <span className="text-slate-400 text-xs">
                      (Estimated window: {result.minHours} – {result.maxHours} h / {(result.optimalHours / 24).toFixed(1)} days)
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
                    <span>Scientific Context & Minimum PMI from Entomological Succession</span>
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
                      <strong>Minimum Post-Mortem Colonization Interval (minPMI):</strong> Based on thermal accumulation requirements (Accumulated Degree Hours, ADH = (Temp - Base Temp) × Hours).
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-slate-400">
                      <li><strong>Primary Succession:</strong> Calliphoridae (blowflies) arrive within minutes to hours of death under open exposure.</li>
                      <li><strong>Indoor / Barrier Delays:</strong> Sealed structures, burial, or enclosed containers create an oviposition lag time (typically 12–48h) that must be added to larval age.</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-500 flex items-center gap-2">
              <Info className="w-4 h-4 text-slate-600" />
              Forensic entomology evaluation is bypassed.
            </div>
          )}
        </>
      )}
    </div>
  );
};
export default EntomologyInput;
