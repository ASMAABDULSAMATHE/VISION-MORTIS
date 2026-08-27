import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Info,
  ShieldAlert,
  HelpCircle,
  Layers,
  CheckCircle2,
  AlertTriangle,
  X,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Award,
  Thermometer,
  Droplet,
  Activity,
  Skull,
  Bug,
  TestTube2,
} from "lucide-react";
import { RecreatedLogo } from "./RecreatedLogo";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  activeSection?: "about" | "guide" | "indicators" | "xgboost" | "limitations";
}

export const MainSidePanel: React.FC<Props> = ({
  isOpen,
  onClose,
  activeSection = "about",
}) => {
  const [currentTab, setCurrentTab] = useState<
    "about" | "guide" | "indicators" | "xgboost" | "limitations"
  >(activeSection);

  useEffect(() => {
    if (isOpen && activeSection) {
      setCurrentTab(activeSection);
    }
  }, [isOpen, activeSection]);

  // Handle ESC key to close on all devices with keyboard
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-md transition-opacity"
    >
      <div className="w-full max-w-2xl lg:max-w-3xl h-full bg-slate-900 border-l border-slate-800/90 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <RecreatedLogo className="w-9 h-9 shrink-0" showSubtitle={false} />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight">
                  VisionMortis
                </h2>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-teal-950 text-teal-400 border border-teal-800/80">
                  Protocol One
                </span>
              </div>
              <div className="text-xs text-slate-300 font-medium mt-0.5">
                Post Mortem Interval Estimation
              </div>
              <div className="text-[11px] font-bold text-[#D4AF37] tracking-wider uppercase mt-0.5">
                Research Prototype
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
            aria-label="Close side panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Spacious Tab Navigation without visible scrollbar */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-4 sm:px-6 py-2.5 overflow-x-auto gap-2 no-scrollbar scrollbar-none">
          {[
            { id: "about", label: "About & Protocol One", icon: Info },
            { id: "guide", label: "User Guide", icon: BookOpen },
            { id: "indicators", label: "Indicator Matrix", icon: Layers },
            { id: "xgboost", label: "XGBoost & SHAP AI", icon: Sparkles },
            { id: "limitations", label: "Limitations & Legal", icon: ShieldAlert },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCurrentTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? "bg-teal-950 text-teal-300 border border-teal-700/80 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent"
                }`}
              >
                <Icon className="w-4 h-4 text-teal-400" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body - fully scrollable without visible scrollbar */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6 text-slate-300 text-sm leading-relaxed no-scrollbar scrollbar-none">
          {/* 1. About Tab */}
          {currentTab === "about" && (
            <div className="space-y-6">
              {/* Hero Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-950 to-teal-950/40 border border-teal-900/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-teal-400">
                    Forensic AI Prototype
                  </span>
                  <span className="text-xs font-medium text-slate-400">
                    Initiative <strong className="text-slate-200">Protocol One</strong>
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-100">
                  Welcome to VisionMortis
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong>VisionMortis</strong> is an advanced decision-support prototype built by <strong>Protocol One</strong>. It synthesizes multiple forensic death investigation markers into a statistically weighted, scientifically grounded estimate of the Post-Mortem Interval (PMI) and estimated Time of Death (TOD).
                </p>
              </div>

              {/* Core Pillars */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Key System Capabilities
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                    <div className="flex items-center gap-2 text-teal-400 font-semibold text-xs">
                      <CheckCircle2 className="w-4 h-4 text-teal-400" />
                      Dynamic Temporal Weighting
                    </div>
                    <p className="text-xs text-slate-400 pl-6">
                      Automatically weights each biological sign according to its established scientific reliability window (e.g. Henssge body cooling for 0–24 hours, Megyesi TBS decomposition for days and weeks).
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                    <div className="flex items-center gap-2 text-teal-400 font-semibold text-xs">
                      <CheckCircle2 className="w-4 h-4 text-teal-400" />
                      Intelligent Conflict & Relocation Detection
                    </div>
                    <p className="text-xs text-slate-400 pl-6">
                      Flags physiological contradictions such as fixed hypostasis conflicting with discovery posture, which indicates post-mortem body relocation.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                    <div className="flex items-center gap-2 text-teal-400 font-semibold text-xs">
                      <CheckCircle2 className="w-4 h-4 text-teal-400" />
                      Transparent Factor Attributions
                    </div>
                    <p className="text-xs text-slate-400 pl-6">
                      Breaks down precisely how each indicator pulls the calculated time window shorter or longer, providing transparent reasoning for courtroom reports.
                    </p>
                  </div>
                </div>
              </div>

              {/* Scientific Basis */}
              <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 space-y-2">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Scientific Literature
                </h4>
                <p className="text-xs text-slate-400">
                  Formulas are rooted in peer-reviewed forensic pathology: <em>Henssge double-exponential nomograms</em>, <em>Megyesi Total Body Score (TBS) Accumulated Degree Days (ADD)</em>, <em>Nysten's law of rigor mortis</em>, and <em>Madea / Sturner vitreous potassium electrolyte formulas</em>.
                </p>
              </div>
            </div>
          )}

          {/* 2. User Guide Tab */}
          {currentTab === "guide" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-100 mb-1">
                  How to Use VisionMortis
                </h3>
                <p className="text-xs text-slate-400">
                  Follow this straightforward 5-step workflow to conduct a complete forensic estimation.
                </p>
              </div>

              <div className="space-y-3.5">
                {[
                  {
                    step: "1",
                    title: "Scene & Environmental Baseline",
                    desc: "Set the case ID, date/time of discovery, ambient temperature at the scene, and estimated body weight. These baseline metrics calibrate all cooling and decomposition models.",
                  },
                  {
                    step: "2",
                    title: "Early Indicators (0 to 24 Hours)",
                    desc: "Enter core rectal temperature and clothing coverage (Algor Mortis), check lividity blanchability and color (Livor Mortis), and assess muscle stiffness progression (Rigor Mortis).",
                  },
                  {
                    step: "3",
                    title: "Extended Markers (Days to Weeks)",
                    desc: "For decomposing remains, record Total Body Score for head, trunk, and limbs (Decomposition), inspect insect instars (Entomology), or enter vitreous potassium levels.",
                  },
                  {
                    step: "4",
                    title: "Computer Vision Analysis (Optional)",
                    desc: "Upload scene or autopsy images. Vision AI inspects decomposition stages and lividity hues, allowing you to sync findings directly to the form with one click.",
                  },
                  {
                    step: "5",
                    title: "Review Results & Export Report",
                    desc: "Inspect the final PMI range, check any inconsistency warnings, review factor attributions, and print or copy a standardized medico-legal case report.",
                  },
                ].map((item) => (
                  <div
                    key={item.step}
                    className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex gap-3.5 items-start"
                  >
                    <div className="w-7 h-7 rounded-lg bg-teal-950 text-teal-300 border border-teal-800/80 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      {item.step}
                    </div>
                    <div className="space-y-1">
                      <div className="font-semibold text-slate-200 text-xs">
                        {item.title}
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Forensic Indicators Matrix */}
          {currentTab === "indicators" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-100 mb-1">
                  Forensic Indicator Matrix
                </h3>
                <p className="text-xs text-slate-400">
                  Reliability windows, core mathematical equations, and potential confounders.
                </p>
              </div>

              <div className="space-y-3.5">
                {[
                  {
                    icon: Thermometer,
                    name: "Algor Mortis (Body Cooling)",
                    window: "0 – 24 Hours",
                    model: "Henssge Double-Exponential Nomogram",
                    confounders: "Clothing insulation, body habitus, wind speed, water submersion.",
                    color: "border-teal-800/80 text-teal-300",
                  },
                  {
                    icon: Droplet,
                    name: "Livor Mortis (Hypostasis)",
                    window: "30 min – 12 Hours",
                    model: "Intravascular pooling & capillary fixation",
                    confounders: "Severe blood loss, dark pigmentation, CO/cyanide poisoning.",
                    color: "border-teal-800/80 text-teal-300",
                  },
                  {
                    icon: Activity,
                    name: "Rigor Mortis (Stiffness)",
                    window: "1 – 36 Hours",
                    model: "Nysten's Law & ATP chemical depletion",
                    confounders: "Pre-mortem heavy exercise/convulsions, cold ambient stiffening.",
                    color: "border-teal-800/80 text-teal-300",
                  },
                  {
                    icon: Skull,
                    name: "Decomposition (Megyesi TBS)",
                    window: "24 Hours – Months",
                    model: "Total Body Score & Accumulated Degree Days (ADD)",
                    confounders: "Scavenging, soil composition, humidity, microclimates.",
                    color: "border-amber-800/80 text-amber-300",
                  },
                  {
                    icon: Bug,
                    name: "Forensic Entomology",
                    window: "Days – Months",
                    model: "Blowfly & flesh fly instar thermal kinetics (ADH)",
                    confounders: "Indoor enclosed rooms, nocturnal delay, maggot mass heat.",
                    color: "border-teal-800/80 text-teal-300",
                  },
                  {
                    icon: TestTube2,
                    name: "Metabolomics (Vitreous Potassium [K+])",
                    window: "0 – 72 Hours",
                    model: "Madea and Sturner linear electrolyte diffusion",
                    confounders: "Pre-existing renal failure, eye trauma, high ambient temperatures.",
                    color: "border-teal-800/80 text-teal-300",
                  },
                ].map((ind, idx) => {
                  const Icon = ind.icon;
                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-100 text-xs flex items-center gap-2">
                          <Icon className="w-4 h-4 text-teal-400" />
                          {ind.name}
                        </span>
                        <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-teal-300">
                          {ind.window}
                        </span>
                      </div>
                      <div className="text-xs text-slate-300">
                        <strong className="text-slate-400">Model:</strong> {ind.model}
                      </div>
                      <div className="text-xs text-slate-400">
                        <strong className="text-slate-400">Confounders:</strong> {ind.confounders}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. XGBoost & TreeSHAP Dedicated Tab */}
          {currentTab === "xgboost" && (
            <div className="space-y-6">
              {/* Header Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-950 to-emerald-950/40 border border-emerald-900/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-emerald-400">
                    Machine Learning Engine
                  </span>
                  <span className="text-xs font-mono text-emerald-300 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded">
                    212 Features Vectorized
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-100">
                  XGBoost & TreeSHAP Explainability
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  How our trained machine learning model estimates the Post-Mortem Interval (PMI) and transparently explains every single factor's contribution in simple terms.
                </p>
              </div>

              {/* XGBoost in simple terms */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-emerald-900/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-emerald-950 border border-emerald-700 text-emerald-400">
                      <Sparkles className="w-4 h-4" />
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                        1. What is XGBoost? (The Predictor)
                      </h4>
                      <p className="text-[11px] text-emerald-400 font-mono">Gradient Boosted Decision Trees</p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                    High Accuracy
                  </span>
                </div>

                <div className="space-y-2.5 text-xs text-slate-300 leading-relaxed pt-1">
                  <p>
                    Think of <strong>XGBoost</strong> as a committee of hundreds of smart decision trees working in sequence.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1">
                      <strong className="text-slate-200 text-xs flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        Simultaneous 212 Inputs
                      </strong>
                      <p className="text-[11px] text-slate-400">
                        Instead of looking at body temperature or decomposition in isolation, it analyzes all 212 data points together (temperatures, chemical values, insects, and body findings).
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1">
                      <strong className="text-slate-200 text-xs flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        Self-Correcting Trees
                      </strong>
                      <p className="text-[11px] text-slate-400">
                        Each new decision tree focuses on correcting the errors made by previous trees, producing a robust and highly calibrated estimated time window.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* TreeSHAP in simple terms */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-cyan-900/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-700 text-cyan-400">
                      <Layers className="w-4 h-4" />
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                        2. What is SHAP / TreeSHAP? (The Explainer)
                      </h4>
                      <p className="text-[11px] text-cyan-400 font-mono">Shapley Additive exPlanations</p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                    Zero Black Box
                  </span>
                </div>

                <div className="space-y-3 text-xs text-slate-300 leading-relaxed pt-1">
                  <p>
                    In medico-legal and courtroom testimony, a "black box" number cannot be trusted. <strong>TreeSHAP</strong> mathematically calculates the exact contribution of each individual observation:
                  </p>

                  <div className="space-y-2">
                    <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-amber-950 border border-amber-700 text-amber-300 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        A
                      </span>
                      <div>
                        <strong className="text-slate-200 block text-xs">Starts at a Population Baseline (E[y])</strong>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          It starts with the average time of death across all forensic training cases.
                        </p>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-300 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        B
                      </span>
                      <div>
                        <strong className="text-slate-200 block text-xs">Quantifies Positive and Negative "Pushes"</strong>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Every clue pushes the timeline. For example, <em>"Core rectal temp of 28.5°C"</em> adds +9.4 hours, while <em>"Blanchable lividity"</em> pulls the timeline back by -6.2 hours.
                        </p>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-teal-950 border border-teal-700 text-teal-300 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        C
                      </span>
                      <div>
                        <strong className="text-slate-200 block text-xs">100% Exact Additive Accounting</strong>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Baseline + (Sum of all SHAP values) = <strong>Exact Final PMI</strong>. Nothing is hidden or approximated.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Execution Speed Note */}
              <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-slate-300">Client-Side High-Speed Execution</span>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                  Sub-millisecond (&lt;1ms)
                </span>
              </div>
            </div>
          )}

          {/* 4. Limitations & Legal Disclaimer */}
          {currentTab === "limitations" && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/40 text-[#E5C158] space-y-2">
                <div className="flex items-center gap-2 font-bold text-[#D4AF37] text-xs">
                  <AlertTriangle className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span>Research Prototype & Medico-Legal Disclaimer</span>
                </div>
                <p className="text-xs leading-relaxed text-[#E5C158]/90">
                  <strong>VisionMortis</strong> is an AI-assisted decision-support research prototype created by <strong>Protocol One</strong>. Estimations produced by this platform must always be correlated with a complete forensic autopsy, scene context, toxicology, and histological findings.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Critical Environmental Confounders
                </h4>
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 space-y-1">
                    <strong className="text-slate-200 text-xs block">
                      1. Ambient Temperature Swings
                    </strong>
                    <p className="text-slate-400 text-xs">
                      Large day-to-night temperature swings can accelerate or decelerate cooling beyond standard Henssge averages. Whenever possible, review scene data logger logs.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 space-y-1">
                    <strong className="text-slate-200 text-xs block">
                      2. Pre-Mortem Fever or Hypothermia
                    </strong>
                    <p className="text-slate-400 text-xs">
                      Pre-mortem hyperthermia (e.g. fatal sepsis) will artificially lengthen estimated PMI if a standard 37.2°C baseline is presumed.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 space-y-1">
                    <strong className="text-slate-200 text-xs block">
                      3. Insect Access Barriers
                    </strong>
                    <p className="text-slate-400 text-xs">
                      Enclosed rooms, wrapping, or burial delay insect colonization. Entomology provides a minimum post-mortem colonization interval rather than an absolute upper ceiling.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between text-xs text-slate-400">
          <span>
            <strong className="text-slate-200">VisionMortis</strong> • <strong className="text-teal-400">Protocol One</strong>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};

export default MainSidePanel;
