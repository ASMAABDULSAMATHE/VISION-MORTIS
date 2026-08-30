import React from "react";
import { ShieldAlert, AlertTriangle, FileText, User, Trash2, ArrowRight } from "lucide-react";
import { VisionImageItem, UnrelatedImageIssue } from "../types";

interface Props {
  unrelatedImages: VisionImageItem[];
  issuesList?: UnrelatedImageIssue[];
  onRemoveImage: (id: string) => void;
  onRemoveAllUnrelated: () => void;
}

export const UnrelatedIssueAlert: React.FC<Props> = ({
  unrelatedImages,
  issuesList,
  onRemoveImage,
  onRemoveAllUnrelated,
}) => {
  if (unrelatedImages.length === 0) return null;

  return (
    <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-slate-200 text-xs space-y-3 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rose-800/60 pb-2.5">
        <div className="flex items-center gap-2 font-bold text-rose-300 uppercase tracking-wide">
          <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
          <span>Automated Issue: {unrelatedImages.length} Non-Forensic Photo(s) Excluded</span>
        </div>
        <button
          type="button"
          onClick={onRemoveAllUnrelated}
          className="px-2.5 py-1 rounded-lg bg-rose-900/80 hover:bg-rose-800 text-rose-200 text-[11px] font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Remove All {unrelatedImages.length} Excluded Photo(s)</span>
        </button>
      </div>

      <p className="text-slate-300 leading-relaxed text-xs">
        VisionMortis automated triage detected non-biological or non-forensic content. Handwritten notes, medical forms, living person portraits, and unrelated background objects <strong>cannot provide post-mortem cooling or decay rate markers</strong> and are strictly excluded from time of death calculations.
      </p>

      {/* Grid of flagged issues */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
        {unrelatedImages.map((img) => {
          const isDoc =
            img.unrelatedIssueType === "handwritten_document" ||
            img.relevanceCategory === "writing_or_document" ||
            (img.name || "").toLowerCase().includes("doc") ||
            (img.name || "").toLowerCase().includes("note");
          const isLive =
            img.unrelatedIssueType === "live_person" ||
            img.relevanceCategory === "live_human" ||
            (img.name || "").toLowerCase().includes("live") ||
            (img.name || "").toLowerCase().includes("person");

          const issueTitle = isDoc
            ? "Handwritten Note / Document Issue"
            : isLive
            ? "Living Person Photo Issue"
            : "Unrelated Non-Forensic Item";

          const issueDescription =
            img.unrelatedIssueDescription ||
            (isDoc
              ? "Contains written text or medical documents rather than post-mortem signs. Excluded from decay & cooling formulas."
              : isLive
              ? "Shows a living individual. Post-mortem interval calculation requires physical biological changes of death."
              : "Lacks human post-mortem markers. Excluded from time of death estimations.");

          return (
            <div
              key={img.id}
              className="p-3 rounded-lg bg-slate-950/80 border border-rose-900/70 flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-rose-950 border border-rose-800 flex items-center justify-center text-rose-400 shrink-0 mt-0.5">
                  {isDoc ? <FileText className="w-3.5 h-3.5" /> : isLive ? <User className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-semibold text-rose-200 text-xs truncate max-w-[160px]">
                      {img.name}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 font-bold border border-rose-800">
                      {issueTitle}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    {issueDescription}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onRemoveImage(img.id)}
                title="Remove this excluded photo"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-300 hover:bg-rose-950/80 transition-colors shrink-0 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
