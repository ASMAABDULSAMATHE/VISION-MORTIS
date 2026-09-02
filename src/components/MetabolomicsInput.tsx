import React, { useState } from "react";
import { MetabolomicsData, ActiveMetaboliteItem } from "../types";
import { evaluateMetabolomics } from "../utils/forensicCalculations";
import { formatIndicatorTimestamp } from "../utils/validation";
import {
  TestTube2,
  Info,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Sparkles,
  Clock,
  Zap,
} from "lucide-react";

interface Props {
  data: MetabolomicsData;
  onChange: (updated: MetabolomicsData) => void;
  isOpen?: boolean;
  onToggleOpen?: () => void;
}

// Exactly the 11 validated post-mortem metabolites
export const METABOLITE_CATALOG = [
  {
    key: "vitreous_hypoxanthine",
    name: "Hypoxanthine (Hx)",
    unit: "µmol/L",
    defaultVal: 65,
    min: 10,
    max: 250,
    step: 1,
    referenceRange: "0 – 25 µmol/L (Antemortem baseline)",
    description: "Purine nucleotide catabolite formed by cellular ATP breakdown during post-mortem hypoxia (0–48h).",
    calculatePmi: (val: number) => {
      return Math.max(1, Math.min(72, (val - 20) / 3.8));
    },
  },
  {
    key: "vitreous_lactate",
    name: "L-Lactate",
    unit: "mmol/L",
    defaultVal: 14.5,
    min: 5,
    max: 40,
    step: 0.5,
    referenceRange: "5 – 11 mmol/L (Normal antemortem)",
    description: "Anaerobic glycolysis byproduct accumulating rapidly in early post-mortem interval (0–24h).",
    calculatePmi: (val: number) => {
      return Math.max(1, Math.min(36, (val - 7.5) * 1.6));
    },
  },
  {
    key: "choline",
    name: "Choline",
    unit: "µmol/L",
    defaultVal: 42,
    min: 10,
    max: 150,
    step: 1,
    referenceRange: "15 – 35 µmol/L (Physiological)",
    description: "Cell membrane phosphatidylcholine degradation product exhibiting steady autolytic rise.",
    calculatePmi: (val: number) => {
      return Math.max(1, Math.min(60, (val - 25) * 0.85));
    },
  },
  {
    key: "taurine",
    name: "Taurine",
    unit: "µmol/L",
    defaultVal: 68,
    min: 15,
    max: 200,
    step: 1,
    referenceRange: "30 – 55 µmol/L (Baseline)",
    description: "Osmoprotective free amino sulfonic acid released from retinal photoreceptors post-mortem.",
    calculatePmi: (val: number) => {
      return Math.max(1, Math.min(72, (val - 45) * 0.7));
    },
  },
  {
    key: "glycerol",
    name: "Glycerol",
    unit: "µmol/L",
    defaultVal: 115,
    min: 30,
    max: 350,
    step: 5,
    referenceRange: "40 – 90 µmol/L (Baseline)",
    description: "Lipolysis marker released through enzymatic breakdown of ocular and adipose triglycerides.",
    calculatePmi: (val: number) => {
      return Math.max(1, Math.min(72, (val - 70) * 0.4));
    },
  },
  {
    key: "succinic_acid",
    name: "Succinic Acid (Succinate)",
    unit: "µmol/L",
    defaultVal: 32,
    min: 5,
    max: 120,
    step: 1,
    referenceRange: "5 – 20 µmol/L (Baseline)",
    description: "TCA cycle intermediate accumulating under anoxic mitochondrial electron transport cessation.",
    calculatePmi: (val: number) => {
      return Math.max(1, Math.min(48, (val - 12) * 1.1));
    },
  },
  {
    key: "formic_acid",
    name: "Formic Acid (Formate)",
    unit: "µmol/L",
    defaultVal: 16,
    min: 2,
    max: 80,
    step: 1,
    referenceRange: "2 – 10 µmol/L (Baseline)",
    description: "One-carbon metabolism byproduct and bacterial fermentation precursor during early decomposition.",
    calculatePmi: (val: number) => {
      return Math.max(1, Math.min(50, (val - 6) * 1.4));
    },
  },
  {
    key: "uric_acid",
    name: "Uric Acid",
    unit: "µmol/L",
    defaultVal: 330,
    min: 100,
    max: 700,
    step: 5,
    referenceRange: "150 – 300 µmol/L (Physiological)",
    description: "Terminal product of purine catabolism; corroborates hypoxanthine degradation trajectory.",
    calculatePmi: (val: number) => {
      return Math.max(1, Math.min(72, (val - 220) * 0.28));
    },
  },
  {
    key: "creatine",
    name: "Creatine",
    unit: "µmol/L",
    defaultVal: 210,
    min: 50,
    max: 500,
    step: 5,
    referenceRange: "80 – 180 µmol/L (Baseline)",
    description: "Phosphocreatine energy buffer breakdown metabolite reflecting systemic cellular exhaustion.",
    calculatePmi: (val: number) => {
      return Math.max(1, Math.min(60, (val - 130) * 0.25));
    },
  },
  {
    key: "putrescine",
    name: "Putrescine",
    unit: "nmol/g",
    defaultVal: 45,
    min: 5,
    max: 300,
    step: 1,
    referenceRange: "5 – 25 nmol/g (Early/Pre-putrefaction)",
    description: "Biogenic polyamine formed by decarboxylation of ornithine; key early putrefactive biomarker.",
    calculatePmi: (val: number) => {
      return Math.max(4, Math.min(96, 12 + (val - 15) * 0.5));
    },
  },
  {
    key: "cadaverine",
    name: "Cadaverine",
    unit: "nmol/g",
    defaultVal: 58,
    min: 5,
    max: 350,
    step: 1,
    referenceRange: "5 – 25 nmol/g (Early/Pre-putrefaction)",
    description: "Diaminoalkane produced by microbial decarboxylation of lysine during tissue decomposition.",
    calculatePmi: (val: number) => {
      return Math.max(6, Math.min(120, 16 + (val - 20) * 0.45));
    },
  },
];

export const MetabolomicsInput: React.FC<Props> = ({
  data,
  onChange,
  isOpen,
  onToggleOpen,
}) => {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [selectedCatalogKey, setSelectedCatalogKey] = useState<string>("vitreous_hypoxanthine");

  // Controlled collapse state (from parent or internal)
  const isCollapsed = isOpen !== undefined ? !isOpen : internalCollapsed;
  const toggleCollapse = () => {
    if (onToggleOpen) onToggleOpen();
    else setInternalCollapsed(!internalCollapsed);
  };

  const result = evaluateMetabolomics(data);
  const activeMetabolites = data.selectedMetabolites || [];

  // Add single metabolite from catalog dropdown
  const handleAddMetabolite = (keyToAdd?: string) => {
    const targetKey = keyToAdd || selectedCatalogKey;
    const itemMeta = METABOLITE_CATALOG.find((m) => m.key === targetKey);
    if (!itemMeta) return;

    // Prevent duplicate entries
    const existing = activeMetabolites.find((m) => m.metaboliteKey === itemMeta.key);
    if (existing) return;

    const calcPmi = Number(itemMeta.calculatePmi(itemMeta.defaultVal).toFixed(1));
    const newItem: ActiveMetaboliteItem = {
      id: `metab-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      metaboliteKey: itemMeta.key,
      name: itemMeta.name,
      measuredValue: itemMeta.defaultVal,
      unit: itemMeta.unit,
      referenceRange: itemMeta.referenceRange,
      pmiContributionHours: calcPmi,
      confidence: 85,
      notes: itemMeta.description,
    };

    const updatedList = [...activeMetabolites, newItem];
    onChange({
      ...data,
      selectedMetabolites: updatedList,
    });
  };

  // Add All 11 Metabolites
  const handleAddAll11Metabolites = () => {
    const newItems: ActiveMetaboliteItem[] = [...activeMetabolites];

    for (const itemMeta of METABOLITE_CATALOG) {
      if (!newItems.some((m) => m.metaboliteKey === itemMeta.key)) {
        const calcPmi = Number(itemMeta.calculatePmi(itemMeta.defaultVal).toFixed(1));
        newItems.push({
          id: `metab-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          metaboliteKey: itemMeta.key,
          name: itemMeta.name,
          measuredValue: itemMeta.defaultVal,
          unit: itemMeta.unit,
          referenceRange: itemMeta.referenceRange,
          pmiContributionHours: calcPmi,
          confidence: 85,
          notes: itemMeta.description,
        });
      }
    }

    onChange({
      ...data,
      selectedMetabolites: newItems,
    });
  };

  // Update individual metabolite value
  const handleUpdateMetaboliteValue = (id: string, val: number) => {
    const updated = activeMetabolites.map((item) => {
      if (item.id === id) {
        const catalogDef = METABOLITE_CATALOG.find((c) => c.key === item.metaboliteKey);
        const calcPmi = catalogDef ? Number(catalogDef.calculatePmi(val).toFixed(1)) : item.pmiContributionHours;
        return {
          ...item,
          measuredValue: val,
          pmiContributionHours: calcPmi,
        };
      }
      return item;
    });

    const targetItem = activeMetabolites.find((m) => m.id === id);
    const extraUpdates: Partial<MetabolomicsData> = {};
    if (targetItem) {
      if (targetItem.metaboliteKey === "vitreous_hypoxanthine") extraUpdates.vitreousHypoxanthineUmolL = val;
      if (targetItem.metaboliteKey === "vitreous_lactate") extraUpdates.vitreousLactateMmolL = val;
    }

    onChange({
      ...data,
      ...extraUpdates,
      selectedMetabolites: updated,
    });
  };

  // Remove individual metabolite
  const handleRemoveMetabolite = (id: string) => {
    onChange({
      ...data,
      selectedMetabolites: activeMetabolites.filter((item) => item.id !== id),
    });
  };

  // Available metabolites not yet added
  const availableMetabolites = METABOLITE_CATALOG.filter(
    (cat) => !activeMetabolites.some((m) => m.metaboliteKey === cat.key)
  );

  return (
    <div
      id="metabolomics-module-container"
      className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-4 hover:border-slate-700/80 transition-all shadow-md"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
            <TestTube2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span>Metabolomics Analysis (11 Metabolites)</span>
              {data.recordedAt && (
                <span className="text-[10px] font-mono text-teal-300 px-2 py-0.5 rounded-md bg-slate-950/90 border border-slate-800 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-teal-400" />
                  <span>Logged: {formatIndicatorTimestamp(data.recordedAt)}</span>
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400">
              Quantitative multi-marker biochemical chronometry across 11 validated metabolites
            </p>
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
              {/* Action Toolbar */}
              <div className="bg-slate-950/70 p-4 rounded-xl border border-teal-900/40 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                      <span>11 Validated Metabolites</span>
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Hypoxanthine, Lactate, Choline, Taurine, Glycerol, Succinate, Formate, Urate, Creatine, Putrescine, Cadaverine
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {availableMetabolites.length > 0 && (
                      <select
                        value={selectedCatalogKey}
                        onChange={(e) => setSelectedCatalogKey(e.target.value)}
                        className="bg-slate-900 border border-teal-700/60 text-slate-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-teal-400 cursor-pointer"
                      >
                        {availableMetabolites.map((cat) => (
                          <option key={cat.key} value={cat.key}>
                            {cat.name} ({cat.unit})
                          </option>
                        ))}
                      </select>
                    )}

                    {availableMetabolites.length > 0 && (
                      <button
                        type="button"
                        onClick={() => handleAddMetabolite()}
                        className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Analyte</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleAddAll11Metabolites}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-teal-300 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                      title="Load all 11 metabolites"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>{activeMetabolites.length === 11 ? "All 11 Loaded" : "Add All 11 Analytes"}</span>
                    </button>
                  </div>
                </div>

                {/* List of Active Metabolites */}
                {activeMetabolites.length > 0 ? (
                  <div className="space-y-2.5 pt-2">
                    {activeMetabolites.map((item) => {
                      const catalogDef = METABOLITE_CATALOG.find((c) => c.key === item.metaboliteKey);
                      const min = catalogDef?.min || 0;
                      const max = catalogDef?.max || 100;
                      const step = catalogDef?.step || 1;

                      return (
                        <div
                          key={item.id}
                          className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl space-y-2.5 hover:border-slate-700 transition-colors"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                            <div className="space-y-0.5 min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-slate-200">{item.name}</span>
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800/60">
                                  Ref: {item.referenceRange}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400">{item.notes}</p>
                            </div>

                            <div className="flex items-center gap-2.5 shrink-0">
                              {/* Measured value number input */}
                              <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-700">
                                <span className="text-[10px] text-slate-400 uppercase font-semibold">Value:</span>
                                <input
                                  type="number"
                                  min={min}
                                  max={max}
                                  step={step}
                                  value={item.measuredValue}
                                  onChange={(e) =>
                                    handleUpdateMetaboliteValue(item.id, parseFloat(e.target.value) || 0)
                                  }
                                  className="w-14 bg-transparent text-teal-300 font-mono font-bold text-xs focus:outline-none text-right"
                                />
                                <span className="text-slate-400 font-mono text-[10px]">{item.unit}</span>
                              </div>

                              {/* Estimated Single Analyte PMI */}
                              <div className="bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-right">
                                <span className="text-[9.5px] text-slate-500 uppercase block font-semibold">Est. PMI</span>
                                <span className="text-amber-300 font-mono font-bold text-xs">
                                  ~{item.pmiContributionHours.toFixed(1)}h
                                </span>
                              </div>

                              {/* Remove button */}
                              <button
                                type="button"
                                onClick={() => handleRemoveMetabolite(item.id)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                                title={`Remove ${item.name}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Range Slider */}
                          <div className="space-y-1">
                            <input
                              type="range"
                              min={min}
                              max={max}
                              step={step}
                              value={item.measuredValue}
                              onChange={(e) =>
                                handleUpdateMetaboliteValue(item.id, parseFloat(e.target.value) || 0)
                              }
                              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
                            />
                            <div className="flex justify-between text-[9.5px] text-slate-500 font-mono">
                              <span>{min} {item.unit}</span>
                              <span className="text-slate-400">{((min + max) / 2).toFixed(0)} {item.unit}</span>
                              <span>{max} {item.unit}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-400 text-xs border border-dashed border-slate-800 rounded-xl space-y-2">
                    <p>No metabolites currently loaded.</p>
                    <button
                      type="button"
                      onClick={handleAddAll11Metabolites}
                      className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Zap className="w-4 h-4 text-amber-300" />
                      <span>Load All 11 Validated Metabolites</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Quick Consensus Bar */}
              <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-teal-950/40 p-3.5 rounded-xl border border-teal-900/40 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400" />
                  <div>
                    <span className="text-slate-400">Metabolomics Composite Estimate:</span>{" "}
                    <span className="text-teal-300 font-bold font-mono">
                      {result.optimalHours}h
                    </span>{" "}
                    <span className="text-slate-400 text-xs">
                      (Window: {result.minHours} – {result.maxHours} h)
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-[11px]">
                    {activeMetabolites.length} / 11 Analytes Active
                  </span>
                  <span className="text-emerald-400 font-semibold text-xs">
                    {result.confidence}% Confidence
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-500 flex items-center gap-2">
              <Info className="w-4 h-4 text-slate-600" />
              Metabolomics testing is bypassed.
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MetabolomicsInput;
