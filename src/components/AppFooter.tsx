import React from "react";
import {
  FileText,
  RotateCcw,
  Info,
  BookOpen,
  ShieldAlert,
  Layers,
  Sparkles,
  ArrowUp,
  AlertTriangle,
  Compass,
  CheckCircle2,
  Thermometer,
  Droplet,
  Activity,
  Skull,
  Bug,
  TestTube2,
  Camera,
  ExternalLink,
} from "lucide-react";
import { RecreatedLogo } from "./RecreatedLogo";
import { validateCaseId, generateCaseIntegrityHash } from "../utils/validation";
import { PmiCalculationResult } from "../types";

interface Props {
  caseId: string;
  subjectIdentifier?: string;
  pmiResult: PmiCalculationResult;
  onNavigateToSection: (sectionId: string) => void;
  onOpenSidePanel: (section: "about" | "guide" | "limitations" | "indicators" | "xgboost") => void;
  onOpenResetModal: () => void;
}

export const AppFooter: React.FC<Props> = ({
  caseId,
  subjectIdentifier,
  pmiResult,
  onNavigateToSection,
  onOpenSidePanel,
  onOpenResetModal,
}) => {
  const validation = validateCaseId(caseId);
  const integrityHash = generateCaseIntegrityHash(
    caseId || "VM-CASE",
    new Date().toISOString().slice(0, 10),
    pmiResult.estimatedPmiOptimalHours
  );

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="mt-12 bg-slate-950 border-t border-slate-800 text-slate-400 text-xs font-sans">
      {/* Main Footer Navigation Grid */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-start">
        {/* Col 1: Brand & Overview */}
        <div className="space-y-3.5">
          <div className="space-y-2">
            <RecreatedLogo className="h-6 sm:h-7 w-auto shrink-0" />
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-cyan-950/90 text-cyan-300 border border-cyan-800">
                Protocol One
              </span>
              <span className="text-[10px] font-bold text-[#D4AF37] tracking-wider uppercase">
                Research Prototype
              </span>
            </div>
            <div className="text-xs text-slate-300 font-medium">Forensic Post-Mortem Interval Estimation</div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Combines body cooling calculations, skin discoloration, muscle stiffening, decomposition scoring, insect activity, and eye fluid chemistry to estimate time of death.
          </p>
          <div className="pt-1">
            <button
              type="button"
              onClick={() => onNavigateToSection("metadata")}
              className="text-xs text-teal-400 hover:text-teal-300 font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Back to Scene &amp; Case Setup</span>
            </button>
          </div>
        </div>

        {/* Col 2: Direct Jump to Case Sections */}
        <div className="space-y-2.5">
          <div className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-teal-400" />
            <span>Jump to Section</span>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-400">
            <li>
              <button
                type="button"
                onClick={() => onNavigateToSection("vision")}
                className="hover:text-teal-300 transition-colors cursor-pointer text-left flex items-center gap-1.5"
              >
                <Camera className="w-3 h-3 text-slate-500" />
                <span>• Computer Vision AI (Multimodal Imaging)</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNavigateToSection("algor")}
                className="hover:text-teal-300 transition-colors cursor-pointer text-left flex items-center gap-1.5"
              >
                <Thermometer className="w-3 h-3 text-slate-500" />
                <span>• Algor Mortis (Body Cooling)</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNavigateToSection("livor")}
                className="hover:text-teal-300 transition-colors cursor-pointer text-left flex items-center gap-1.5"
              >
                <Droplet className="w-3 h-3 text-slate-500" />
                <span>• Livor Mortis</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNavigateToSection("rigor")}
                className="hover:text-teal-300 transition-colors cursor-pointer text-left flex items-center gap-1.5"
              >
                <Activity className="w-3 h-3 text-slate-500" />
                <span>• Rigor Mortis (Muscle Stiffening)</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNavigateToSection("decomposition")}
                className="hover:text-teal-300 transition-colors cursor-pointer text-left flex items-center gap-1.5"
              >
                <Skull className="w-3 h-3 text-slate-500" />
                <span>• Decomposition (Megyesi Total Body Score)</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNavigateToSection("entomology")}
                className="hover:text-teal-300 transition-colors cursor-pointer text-left flex items-center gap-1.5"
              >
                <Bug className="w-3 h-3 text-slate-500" />
                <span>• Forensic Entomology (Insect Succession)</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNavigateToSection("metabolomics")}
                className="hover:text-teal-300 transition-colors cursor-pointer text-left flex items-center gap-1.5"
              >
                <TestTube2 className="w-3 h-3 text-slate-500" />
                <span>• Metabolomics (Vitreous Potassium [K+])</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNavigateToSection("report")}
                className="text-teal-400 hover:text-teal-300 font-semibold transition-colors cursor-pointer text-left flex items-center gap-1.5 pt-1"
              >
                <FileText className="w-3 h-3" />
                <span>• Case Report &amp; Medico-Legal Synthesis</span>
              </button>
            </li>
          </ul>
        </div>

        {/* Col 3: Information & Reference Guides */}
        <div className="space-y-2.5">
          <div className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5 text-teal-400" />
            <span>Guides &amp; Reference</span>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-400">
            <li>
              <button
                type="button"
                onClick={() => onOpenSidePanel("about")}
                className="hover:text-teal-300 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Info className="w-3 h-3 text-teal-400" />
                <span>About VisionMortis &amp; Protocol One</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onOpenSidePanel("guide")}
                className="hover:text-teal-300 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <BookOpen className="w-3 h-3 text-teal-400" />
                <span>How to Use: Step-by-Step Guide</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onOpenSidePanel("limitations")}
                className="hover:text-amber-300 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <ShieldAlert className="w-3 h-3 text-amber-400" />
                <span>Forensic Limitations &amp; Warnings</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onOpenSidePanel("indicators")}
                className="hover:text-teal-300 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Layers className="w-3 h-3 text-teal-400" />
                <span>Timeline Matrix &amp; Reference Guide</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onOpenSidePanel("xgboost")}
                className="hover:text-teal-300 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-3 h-3 text-teal-400" />
                <span>AI Model Weights &amp; Feature Map</span>
              </button>
            </li>
          </ul>
        </div>

        {/* Col 4: Active Case Summary & Quick Actions */}
        <div className="space-y-3 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
            <span>Active Case Status</span>
            {validation.isValid ? (
              <span className="flex items-center gap-1 text-[10px] text-teal-400 font-mono">
                <CheckCircle2 className="w-3 h-3" /> Valid ID
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] text-amber-400 font-mono">
                <AlertTriangle className="w-3 h-3" /> Check ID
              </span>
            )}
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">File ID:</span>
              <span className="font-mono text-slate-200 font-bold">{caseId || "Not Set"}</span>
            </div>
            {subjectIdentifier && (
              <div className="flex justify-between truncate">
                <span className="text-slate-500">Subject:</span>
                <span className="text-slate-300 truncate max-w-[130px]">{subjectIdentifier}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">Best Estimate:</span>
              <span className="font-mono text-teal-400 font-bold">
                {pmiResult.estimatedPmiOptimalHours} Hours
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Confidence:</span>
              <span className="font-mono text-slate-200">
                {pmiResult.confidenceScore}% ({pmiResult.confidenceScore >= 75 ? "High" : pmiResult.confidenceScore >= 50 ? "Moderate" : "Low"})
              </span>
            </div>
            <div className="flex justify-between text-[10px] pt-1 border-t border-slate-800 text-slate-500">
              <span>Integrity Code:</span>
              <span className="font-mono text-slate-400 truncate max-w-[110px]">{integrityHash}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => onNavigateToSection("report")}
              className="flex-1 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Full Report</span>
            </button>

            <button
              type="button"
              onClick={onOpenResetModal}
              title="Reset entire form"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Sub-footer */}
      <div className="bg-slate-950 border-t border-slate-900 px-4 lg:px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <div className="flex items-center gap-2 flex-wrap">
            <span>
              <strong>VisionMortis</strong> • Prototype System by <strong className="text-slate-300">Protocol One</strong>
            </span>
            <span>•</span>
            <span>Peer-reviewed forensic calculations</span>
            <span>•</span>
            <span className="text-[#D4AF37] font-medium">Research Prototype</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={scrollToTop}
              className="flex items-center gap-1 hover:text-slate-300 transition-colors cursor-pointer"
            >
              <span>Back to top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;

