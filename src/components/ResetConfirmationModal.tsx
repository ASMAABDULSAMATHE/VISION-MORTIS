import React from "react";
import { RotateCcw, AlertTriangle, X, Check, FileSpreadsheet } from "lucide-react";
import { FORENSIC_PRESETS } from "../data/forensicPresets";
import { ForensicCaseInput } from "../types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirmResetBlank: () => void;
  onLoadPreset: (preset: ForensicCaseInput) => void;
}

export const ResetConfirmationModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onConfirmResetBlank,
  onLoadPreset,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-150">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto no-scrollbar bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 sm:p-6 space-y-4 sm:space-y-5 animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Reset Entire Case Data?</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Confirm clearing all case parameters and forensic indicators
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning Details */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-300 space-y-2 leading-relaxed">
          <p className="font-medium text-amber-300">
            This will wipe the entire current case and reset all modules:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-400 text-xs">
            <li>A fresh Case File Number will be generated, and discovery timestamp will be stamped to the current moment.</li>
            <li>Subject demographics, scene location, photos, and notes will be cleared.</li>
            <li><strong>All 6 forensic modules (Algor, Livor, Rigor, TBS, Entomology, Metabolomics) will be switched OFF</strong> so you start completely clean.</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-2 border-t border-slate-800/80">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => {
              onConfirmResetBlank();
              onClose();
            }}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-rose-950/50 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Yes, Reset Everything (Clean Blank)</span>
          </button>
        </div>

        {/* Optional Presets Loader */}
        <div className="pt-3 border-t border-slate-800/60">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <FileSpreadsheet className="w-3.5 h-3.5 text-teal-400" />
            <span>Or Load a Standardized Sample Case:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {FORENSIC_PRESETS.map((preset, idx) => (
              <button
                key={preset.presetId || preset.caseId || idx}
                type="button"
                onClick={() => {
                  onLoadPreset(preset);
                  onClose();
                }}
                className="text-left p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-teal-800 text-xs transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="font-semibold text-slate-200 group-hover:text-teal-300 truncate">
                    {preset.presetName || preset.subjectNameOrIdentifier}
                  </span>
                  {preset.isHarmonicPreset && (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 shrink-0">
                      Harmonic
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5 flex items-center justify-between">
                  <span>{preset.caseId}</span>
                  <span className="text-slate-400 font-sans">{preset.presetCategory}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default ResetConfirmationModal;
