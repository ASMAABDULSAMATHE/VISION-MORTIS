import React, { useState, useMemo, useEffect } from "react";
import { ForensicCaseInput, VisionDetectionData } from "./types";
import { FORENSIC_PRESETS } from "./data/forensicPresets";
import { calculateCompositePmi } from "./utils/forensicCalculations";
import { validateCaseId, generateValidCaseId, getFormattedCurrentTimestamp, formatIndicatorTimestamp } from "./utils/validation";
import { auditPresetModifications } from "./utils/presetAudit";
import { RecreatedLogo } from "./components/RecreatedLogo";
import { AlgorMortisInput } from "./components/AlgorMortisInput";
import { LivorMortisInput } from "./components/LivorMortisInput";
import { RigorMortisInput } from "./components/RigorMortisInput";
import { DecompositionInput } from "./components/DecompositionInput";
import { EntomologyInput } from "./components/EntomologyInput";
import { MetabolomicsInput } from "./components/MetabolomicsInput";
import { ComputerVisionUpload } from "./components/ComputerVisionUpload";
import { PmiOutputPanel } from "./components/PmiOutputPanel";
import { MainSidePanel } from "./components/MainSidePanel";
import { ReportModal } from "./components/ReportModal";
import { AppFooter } from "./components/AppFooter";
import { ResetConfirmationModal } from "./components/ResetConfirmationModal";
import { GeneratedReportSection } from "./components/GeneratedReportSection";
import {
  Thermometer,
  Droplet,
  Droplets,
  Activity,
  Skull,
  Bug,
  TestTube2,
  Camera,
  Layers,
  FileText,
  BookOpen,
  Info,
  ShieldAlert,
  Sparkles,
  RotateCcw,
  Menu,
  X,
  Compass,
  FolderOpen,
  CheckCircle2,
  Calendar,
  User,
  MapPin,
  Clock,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Stethoscope,
  AlertTriangle,
  Wand2,
  SlidersHorizontal,
  FileSpreadsheet,
  ArrowLeft,
  LayoutDashboard,
} from "lucide-react";

export default function App() {
  // Page / View Routing: "workspace" (Data entry & analysis) vs "report" (Standardized case document)
  const [activePage, setActivePage] = useState<"workspace" | "report">("workspace");

  // Case State (initialized with Preset 1: Fresh Indoor Case)
  const [caseData, setCaseData] = useState<ForensicCaseInput>(FORENSIC_PRESETS[0]);
  const [activeWorkflowSection, setActiveWorkflowSection] = useState<string>("overview");

  // Accordion management: active open module ID - defaulted to null (indicators dropdowns closed by default)
  const [activeAccordionModule, setActiveAccordionModule] = useState<string | null>(null);
  const [autoExpandOnScroll, setAutoExpandOnScroll] = useState<boolean>(false);
  const [metadataCollapsed, setMetadataCollapsed] = useState<boolean>(false);

  // Main Side Panel (About / XGBoost / Guide / Limitations / Indicators)
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [sidePanelSection, setSidePanelSection] = useState<
    "about" | "xgboost" | "guide" | "limitations" | "indicators"
  >("about");

  // Report Modal (kept as quick print popout if requested)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Reset Confirmation Modal
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  // Workflow Sidebar: closed by default on mobile/iframe preview to prevent overlay popping up on front page
  const [isWorkflowSidebarOpen, setIsWorkflowSidebarOpen] = useState(false);

  // AI Pathology synthesis loading state
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSynthesisData, setAiSynthesisData] = useState<any>(null);

  // Vision data state
  const [visionData, setVisionData] = useState<VisionDetectionData>({
    analyzing: false,
    images: [],
  });

  // Real-time File Number / Case ID validation
  const caseIdValidation = useMemo(() => {
    return validateCaseId(caseData.caseId);
  }, [caseData.caseId]);

  // Calculate composite PMI dynamically whenever caseData changes
  const pmiResult = useMemo(() => {
    const res = calculateCompositePmi(caseData);
    if (aiSynthesisData) {
      res.aiSynthesis = aiSynthesisData;
    }
    return res;
  }, [caseData, aiSynthesisData]);

  // Audit preset modifications made by examiner
  const presetAudit = useMemo(() => {
    return auditPresetModifications(caseData);
  }, [caseData]);

  // Derived baseline comparisons for examiner modifications
  const baseline = presetAudit.baseline;
  const isTempModified = !!(baseline && caseData.ambientTempC !== baseline.ambientTempC);
  const baseTemp = baseline?.ambientTempC;

  const currentHumidity = caseData.relativeHumidityPercent ?? 50;
  const baseHumidity = baseline ? (baseline.relativeHumidityPercent ?? 50) : 50;
  const isHumidityModified = !!(baseline && currentHumidity !== baseHumidity);

  const isWeightModified = !!(baseline && caseData.bodyWeightKg !== baseline.bodyWeightKg);
  const baseWeight = baseline?.bodyWeightKg;

  // Reset to pure empty blank template (everything cleared)
  const handleResetBlank = () => {
    setCaseData({
      caseId: "",
      subjectNameOrIdentifier: "",
      ageYears: undefined,
      sex: "unknown",
      discoveryTimestamp: "",
      locationDescription: "",
      investigatorName: "",
      ambientTempC: 20.0,
      relativeHumidityPercent: 50,
      bodyWeightKg: 70,
      bodyFoundPosition: "supine",
      algorMortis: {
        enabled: false,
        rectalTempC: 37.0,
        ambientTempC: 20.0,
        bodyWeightKg: 70,
        clothingCoveringFactor: 1.0,
        clothingDescription: "",
        isBodyWet: false,
        airCurrentVelocity: "still",
      },
      livorMortis: {
        enabled: false,
        blanchability: "absent",
        colorHue: "violaceous",
        distributionPattern: "dependent",
        lividityPositionFound: "supine",
        suspectedBodyMovement: false,
        notes: "",
      },
      rigorMortis: {
        enabled: false,
        progressionStage: "absent_early",
        muscleGroups: {
          jawTemporomandibular: false,
          neckCervical: false,
          upperLimbsElbowsWrists: false,
          trunkAbdomen: false,
          lowerLimbsKneesAnkles: false,
        },
        preDeathPhysicalExertion: "none_at_rest",
        coldStiffeningSuspected: false,
      },
      decomposition: {
        enabled: false,
        headNeckScore: 1,
        trunkScore: 1,
        limbsScore: 1,
        totalBodyScore: 3,
        marblingPresent: false,
        rightIliacDiscoloration: false,
        bloatingAndPurge: false,
        skinSlippageBullae: false,
        mummificationOrAdipocere: false,
        skeletonizationBoneExposed: false,
        effectiveMeanTempC: 20.0,
      },
      entomology: {
        enabled: false,
        primaryInsectGroup: "none",
        developmentalStage: "none",
        larvalLengthMm: 0,
        maggotMassTempC: 20.0,
        indoorAccessDelayHours: 0,
      },
      metabolomics: {
        enabled: false,
        vitreousPotassiumMmolL: 4.0,
        vitreousHypoxanthineUmolL: undefined,
        activeMetabolites: [],
        suspectedRenalFailureOrTrauma: false,
      },
    });
    setAiSynthesisData(null);
    setVisionData({ analyzing: false, images: [] });
    setActiveAccordionModule(null);
  };

  // Scroll synchronization: track active section and optionally expand active module
  useEffect(() => {
    if (activePage !== "workspace") return;

    const moduleKeys = [
      "metadata",
      "vision",
      "algor",
      "livor",
      "rigor",
      "decomposition",
      "entomology",
      "metabolomics",
      "overview",
    ];

    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      window.requestAnimationFrame(() => {
        // Evaluate the active section based on the top boundary entering the focal header band (80px - 260px)
        const triggerTopOffset = 180;
        let matchedId: string | null = null;

        for (const key of moduleKeys) {
          const domId = `${key}-card`;
          const el = document.getElementById(domId);
          if (el) {
            const rect = el.getBoundingClientRect();
            // Match when the top of the card has reached near the top header zone and bottom is still below
            if (rect.top <= triggerTopOffset && rect.bottom > 90) {
              matchedId = key;
            }
          }
        }

        // If at the very top of the page, highlight metadata
        if (!matchedId && window.scrollY < 180) {
          matchedId = "metadata";
        }

        if (matchedId) {
          setActiveWorkflowSection(matchedId);
          if (autoExpandOnScroll && matchedId !== activeAccordionModule) {
            setActiveAccordionModule(matchedId);
          }
        }
        ticking = false;
      });
      ticking = true;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [autoExpandOnScroll, activeAccordionModule, activePage]);

  // Trigger server-side Gemini AI Pathologist synthesis
  const handleRunAiSynthesis = async () => {
    setIsAiLoading(true);
    try {
      const response = await fetch("/api/synthesize-pathology", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseData,
          calculatedPmi: pmiResult,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiSynthesisData(data);
      } else {
        // Fallback calculation synthesis
        setAiSynthesisData({
          expertSummary: `Multimodal analysis synthesizes an optimal Post-Mortem Interval of ${pmiResult.estimatedPmiOptimalHours} hours (calibrated range: ${pmiResult.estimatedPmiMinHours} to ${pmiResult.estimatedPmiMaxHours} hours). Estimated time of death corresponds to ${pmiResult.estimatedTimeOfDeathMin} through ${pmiResult.estimatedTimeOfDeathMax}.`,
          recommendedConfirmatoryTests: [
            "Vitreous humor electrolyte analysis ([K+] and hypoxanthine levels)",
            "Gastric content digestive status and meal timeline confirmation",
            "Scene ambient data logger temperature tracking over 48 hours",
          ],
        });
      }
    } catch (err) {
      console.error("AI synthesis error:", err);
      // Graceful clinical fallback
      setAiSynthesisData({
        expertSummary: `Multimodal analysis estimates PMI at ${pmiResult.estimatedPmiMinHours} to ${pmiResult.estimatedPmiMaxHours} hours, centering at ${pmiResult.estimatedPmiOptimalHours} hours. Core anchoring is driven by ${pmiResult.dominantIndicatorSummary.join(", ")}.`,
        recommendedConfirmatoryTests: [
          "Vitreous potassium [K+] concentration measurement",
          "Review of scene temperature records and victim activity logs",
        ],
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  // Apply Vision AI findings to case form
  const handleApplyVisionToCase = (vData: VisionDetectionData) => {
    const validForensic = (vData.images || []).filter((i) => !i.isUnrelated);
    if (validForensic.length === 0) {
      return;
    }

    const updated = { ...caseData };

    if (vData.estimatedTbs && validForensic.length > 0) {
      updated.decomposition = {
        ...updated.decomposition,
        enabled: true,
        headNeckScore: vData.estimatedTbs.headNeckScore,
        trunkScore: vData.estimatedTbs.trunkScore,
        limbsScore: vData.estimatedTbs.limbsScore,
        totalBodyScore: vData.estimatedTbs.totalScore,
        marblingPresent: vData.detectedDecompositionStage?.includes("marbling") || false,
        bloatingAndPurge: vData.detectedDecompositionStage?.includes("bloat") || false,
      };
    }

    if (vData.detectedLivor?.colorClassification && validForensic.length > 0) {
      updated.livorMortis = {
        ...updated.livorMortis,
        enabled: true,
        colorHue: vData.detectedLivor.colorClassification as any,
        suspectedBodyMovement: validForensic.length >= 2 && !!vData.detectedMovement?.suspectedMovement,
      };
    }

    if (vData.detectedEntomology?.insectsPresent && vData.detectedEntomology.primaryInsectStage && validForensic.length > 0) {
      updated.entomology = {
        ...updated.entomology,
        enabled: true,
        developmentalStage: vData.detectedEntomology.primaryInsectStage as any,
      };
    }

    if (vData.examinerNotes || vData.investigatorNotes) {
      const vNotes = (vData.examinerNotes || vData.investigatorNotes || "").trim();
      if (vNotes) {
        if (!updated.examinersNotes) {
          updated.examinersNotes = vNotes;
        } else if (!updated.examinersNotes.includes(vNotes)) {
          updated.examinersNotes = `${updated.examinersNotes}\n\n[Vision/Scene Notes]: ${vNotes}`;
        }
      }
    }

    const currentNow = getFormattedCurrentTimestamp();
    updated.indicatorTimings = {
      ...(updated.indicatorTimings || {}),
      vision: currentNow,
      ...(vData.estimatedTbs ? { decomposition: currentNow } : {}),
      ...(vData.detectedLivor ? { livor: currentNow } : {}),
      ...(vData.detectedEntomology ? { entomology: currentNow } : {}),
    };
    updated.lastModifiedAt = currentNow;

    setCaseData(updated);
  };

  const updateIndicatorModule = <
    K extends "algorMortis" | "livorMortis" | "rigorMortis" | "decomposition" | "entomology" | "metabolomics"
  >(
    key: K,
    updatedModuleData: ForensicCaseInput[K]
  ) => {
    const now = getFormattedCurrentTimestamp();
    const dataWithTime = {
      ...updatedModuleData,
      recordedAt: now,
    };
    const timingKey =
      key === "algorMortis"
        ? "algor"
        : key === "livorMortis"
        ? "livor"
        : key === "rigorMortis"
        ? "rigor"
        : key === "decomposition"
        ? "decomposition"
        : key === "entomology"
        ? "entomology"
        : "metabolomics";

    setCaseData((prev) => {
      const newAmbient =
        key === "algorMortis" && (updatedModuleData as any).ambientTempC !== undefined
          ? (updatedModuleData as any).ambientTempC
          : prev.ambientTempC;
      const newWeight =
        key === "algorMortis" && (updatedModuleData as any).bodyWeightKg !== undefined
          ? (updatedModuleData as any).bodyWeightKg
          : prev.bodyWeightKg;

      return {
        ...prev,
        ambientTempC: newAmbient,
        bodyWeightKg: newWeight,
        [key]: dataWithTime,
        indicatorTimings: {
          ...(prev.indicatorTimings || {}),
          [timingKey]: now,
        },
        lastModifiedAt: now,
      };
    });
  };

  const openSidePanel = (section: "about" | "xgboost" | "guide" | "limitations" | "indicators") => {
    setSidePanelSection(section);
    setIsSidePanelOpen(true);
  };

  const scrollToElement = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      // Calculate top position with header offset (sticky navbar + top notice bar ~ 85px)
      const headerOffset = 85;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: "smooth",
      });
    }
  };

  const toggleAccordion = (moduleId: string) => {
    if (activeAccordionModule === moduleId) {
      setActiveAccordionModule(null);
    } else {
      setActiveAccordionModule(moduleId);
      setActiveWorkflowSection(moduleId);
    }
  };

  // Indicator checklist for workflow sidebar
  const workflowSteps = [
    {
      id: "metadata",
      label: "1. Scene & Environment",
      icon: Compass,
      status: "ready",
      badge: `${caseData.ambientTempC}°C / ${caseData.relativeHumidityPercent ?? 50}% RH / ${caseData.bodyWeightKg}kg`,
    },
    {
      id: "vision",
      label: "2. Computer Vision AI (Up to 6)",
      icon: Camera,
      status: "ready",
      badge: visionData.images && visionData.images.length > 0 ? `${visionData.images.length} Loaded` : "Optional",
    },
    {
      id: "algor",
      label: "3. Algor Mortis (0–24h)",
      icon: Thermometer,
      status: caseData.algorMortis.enabled ? "active" : "bypassed",
      badge: caseData.algorMortis.enabled ? `${caseData.algorMortis.rectalTempC}°C` : "Off",
    },
    {
      id: "livor",
      label: "4. Livor Mortis (30m–12h)",
      icon: Droplet,
      status: caseData.livorMortis.enabled ? "active" : "bypassed",
      badge: caseData.livorMortis.enabled ? caseData.livorMortis.blanchability.replace(/_/g, " ") : "Off",
    },
    {
      id: "rigor",
      label: "5. Rigor Mortis (1–36h)",
      icon: Activity,
      status: caseData.rigorMortis.enabled ? "active" : "bypassed",
      badge: caseData.rigorMortis.enabled ? caseData.rigorMortis.progressionStage.replace(/_/g, " ") : "Off",
    },
    {
      id: "decomposition",
      label: "6. Decomposition / TBS",
      icon: Skull,
      status: caseData.decomposition.enabled ? "active" : "bypassed",
      badge: caseData.decomposition.enabled ? `TBS ${caseData.decomposition.totalBodyScore}` : "Off",
    },
    {
      id: "entomology",
      label: "7. Entomology (Days–Mo)",
      icon: Bug,
      status: caseData.entomology.enabled ? "active" : "bypassed",
      badge: caseData.entomology.enabled ? caseData.entomology.developmentalStage.replace(/_/g, " ") : "Off",
    },
    {
      id: "metabolomics",
      label: "8. Metabolomics",
      icon: TestTube2,
      status: caseData.metabolomics.enabled ? "active" : "bypassed",
      badge: caseData.metabolomics.enabled ? `${caseData.metabolomics.vitreousPotassiumMmolL} mmol/L` : "Off",
    },
    {
      id: "report",
      label: "9. Final Synthesis & Report",
      icon: FileText,
      status: activePage === "report" ? "active" : "inactive",
      badge: activePage === "report" ? "Active View" : `${pmiResult.estimatedPmiOptimalHours}h`,
    },
  ];

  // Global keyboard shortcuts to access side panels from anywhere
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT") {
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setIsWorkflowSidebarOpen((prev) => !prev);
      } else if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        openSidePanel("guide");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleNavigateToSection = (sectionId: string) => {
    if (sectionId === "report" || sectionId === "overview") {
      setActivePage("report");
      setActiveWorkflowSection("report");
      window.scrollTo({ top: 0, behavior: "smooth" });
      if (!aiSynthesisData && !isAiLoading) {
        handleRunAiSynthesis();
      }
      if (window.innerWidth < 1024) {
        setIsWorkflowSidebarOpen(false);
      }
      return;
    }

    const wasReport = activePage === "report";
    if (wasReport) {
      setActivePage("workspace");
    }

    setActiveWorkflowSection(sectionId);
    setActiveAccordionModule(sectionId);
    if (sectionId === "metadata") {
      setMetadataCollapsed(false);
    }
    const targetId = `${sectionId}-card`;
    
    // Give accordion state a brief tick to expand so scroll calculates the exact beginning of the card
    setTimeout(() => {
      scrollToElement(targetId);
    }, 40);

    if (window.innerWidth < 1024) {
      setIsWorkflowSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500/30 selection:text-teal-200">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-3 sm:px-4 lg:px-6 py-2 sm:py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo & Branding */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setIsWorkflowSidebarOpen(!isWorkflowSidebarOpen)}
              className="lg:hidden p-1.5 sm:p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              aria-label="Open navigator menu"
              title="Open navigator menu"
            >
              <Menu className="w-5 h-5 text-teal-400" />
            </button>

            <div
              className="flex items-center gap-3 cursor-pointer min-w-0"
              onClick={() => {
                setActivePage("workspace");
                scrollToElement("metadata-card");
              }}
            >
              <RecreatedLogo className="h-6 sm:h-7 w-auto shrink-0" />
              <div className="hidden lg:flex flex-col justify-center border-l border-slate-800/80 pl-3 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[9px] sm:text-[10px] font-semibold px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 shrink-0 whitespace-nowrap">
                    Protocol One
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-bold text-[#D4AF37] tracking-wider uppercase">
                    Research Prototype
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-medium leading-tight mt-0.5 truncate">
                  Forensic Post-Mortem Interval Estimation
                </div>
              </div>
            </div>
          </div>

          {/* Center/Right: View Switcher (Workspace vs Report Page) */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 shrink-0">
            <button
              type="button"
              onClick={() => {
                setActivePage("workspace");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activePage === "workspace"
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Workspace</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActivePage("report");
                setActiveWorkflowSection("report");
                window.scrollTo({ top: 0, behavior: "smooth" });
                if (!aiSynthesisData && !isAiLoading) {
                  handleRunAiSynthesis();
                }
              }}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activePage === "report"
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Report</span>
              {activePage !== "report" && (
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse hidden sm:inline-block" />
              )}
            </button>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Reset Button (Always asks confirmation & resets everything) */}
            <button
              type="button"
              onClick={() => setIsResetModalOpen(true)}
              title="Reset entire case data"
              className="p-1.5 sm:p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-400" />
              <span className="hidden md:inline text-slate-300">Reset</span>
            </button>

            {/* Reference Side Panel Buttons (Direct link to exact sections) */}
            <div className="hidden md:flex items-center gap-1 border-l border-slate-800 pl-2">
              <button
                type="button"
                onClick={() => openSidePanel("about")}
                className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Info className="w-3.5 h-3.5 text-teal-400" />
                <span>About</span>
              </button>

              <button
                type="button"
                onClick={() => openSidePanel("guide")}
                className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-teal-400" />
                <span>Guide</span>
              </button>

              <button
                type="button"
                onClick={() => openSidePanel("limitations")}
                className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span>Limitations</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Concise Forensic Accuracy Advisory Banner */}
      <div className="bg-amber-950/30 border-b border-amber-900/40 px-3 sm:px-4 lg:px-6 py-1.5 text-xs text-amber-200/90">
        <div className="max-w-7xl mx-auto flex items-center gap-2 min-w-0">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <p className="text-xs text-amber-200/90 truncate">
            <strong className="font-semibold text-amber-300">Notice:</strong> PMI estimates may be inaccurate due to training dataset limitations.
          </p>
        </div>
      </div>

      {/* Main App Layout: Workflow Sidebar + Content Canvas */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Workflow & Indicator Navigator Sidebar (Sticky on desktop so it remains in view while scrolling) */}
        <aside
          className={`no-scrollbar ${
            isWorkflowSidebarOpen
              ? "fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto flex items-start justify-center lg:relative lg:inset-auto lg:z-auto lg:bg-transparent lg:backdrop-blur-none lg:p-0 lg:col-span-3 lg:self-start lg:sticky lg:top-20 lg:max-h-[calc(100vh-5.5rem)] lg:block"
              : "hidden lg:block lg:col-span-3 lg:self-start lg:sticky lg:top-20 lg:max-h-[calc(100vh-5.5rem)]"
          }`}
          onClick={(e) => {
            if (e.target === e.currentTarget && window.innerWidth < 1024) setIsWorkflowSidebarOpen(false);
          }}
        >
          <div className="w-full max-w-sm lg:max-w-none bg-slate-900/95 rounded-2xl border border-slate-800 shadow-2xl max-h-[85vh] lg:max-h-[calc(100vh-5.5rem)] overflow-y-auto overscroll-contain no-scrollbar p-4 space-y-3.5 relative">
            {/* Mobile-only Close Button */}
            <button
              type="button"
              onClick={() => setIsWorkflowSidebarOpen(false)}
              className="lg:hidden absolute top-3 right-3 z-10 p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 transition-colors cursor-pointer"
              title="Close panel"
              aria-label="Close panel"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            {/* Quick Case Identifier Card */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-500">Active Case</span>
                <span className="font-mono text-teal-400 font-bold">{caseData.caseId || "None"}</span>
              </div>
              <div className="font-semibold text-slate-200 truncate">
                {caseData.presetName || caseData.subjectNameOrIdentifier || "Unassigned Subject"}
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate">{caseData.discoveryTimestamp || "No timestamp"}</span>
              </div>

              {/* Sidebar Quick Case Preset Switcher */}
              <div className="pt-2 border-t border-slate-800/60 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                    <FileSpreadsheet className="w-3 h-3 text-teal-400" />
                    <span>Preset Case:</span>
                  </label>
                  {presetAudit.isPreset && presetAudit.isModified && (
                    <button
                      type="button"
                      onClick={() => {
                        const orig = FORENSIC_PRESETS.find(
                          (p) => (caseData.presetId && p.presetId === caseData.presetId) || p.caseId === caseData.caseId
                        );
                        if (orig) {
                          setCaseData(orig);
                          setAiSynthesisData(null);
                        }
                      }}
                      className="text-[9px] text-amber-300 hover:text-white underline cursor-pointer"
                      title="Revert modifications to original preset baseline"
                    >
                      Revert Baseline
                    </button>
                  )}
                </div>
                {(() => {
                  const activePresetIdx = FORENSIC_PRESETS.findIndex(
                    (p) => (caseData.presetId && p.presetId === caseData.presetId) || p.caseId === caseData.caseId
                  );
                  return (
                    <>
                      <select
                        value={activePresetIdx >= 0 ? activePresetIdx : ""}
                        onChange={(e) => {
                          const idx = parseInt(e.target.value, 10);
                          if (!isNaN(idx) && FORENSIC_PRESETS[idx]) {
                            setCaseData(FORENSIC_PRESETS[idx]);
                            setAiSynthesisData(null);
                          }
                        }}
                        className="w-full bg-slate-900 border border-slate-700/80 hover:border-teal-500/80 rounded-lg px-2 py-1.5 text-[11px] text-teal-300 focus:outline-none focus:border-teal-400 cursor-pointer truncate"
                      >
                        <option value="" disabled>Select benchmark preset...</option>
                        {FORENSIC_PRESETS.map((preset, idx) => (
                          <option key={preset.presetId || preset.caseId || idx} value={idx}>
                            {preset.presetName || `${preset.caseId}: ${preset.subjectNameOrIdentifier}`}
                          </option>
                        ))}
                      </select>

                      {/* Preset Modification Status Badge in Sidebar */}
                      {presetAudit.isPreset && (
                        <div className="mt-1">
                          {presetAudit.isModified ? (
                            <div className="p-1.5 rounded-lg bg-amber-950/60 border border-amber-800/80 text-[10px] space-y-0.5">
                              <div className="text-amber-300 font-bold flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                                <span>Modified by Examiner ({presetAudit.modifiedCount} Δ)</span>
                              </div>
                              <div className="text-amber-200/80 text-[9px] truncate" title={presetAudit.modifiedFieldLabels.join(", ")}>
                                {presetAudit.modifiedFieldLabels.slice(0, 2).join(", ")}{presetAudit.modifiedFieldLabels.length > 2 ? "..." : ""}
                              </div>
                            </div>
                          ) : (
                            <div className="text-[10px] text-emerald-400 font-medium truncate flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                              <span className="truncate">Original: {FORENSIC_PRESETS[activePresetIdx]?.presetCategory || "Benchmark"}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Auto-Accordion On Scroll Switch */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/80 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <SlidersHorizontal className="w-3.5 h-3.5 text-teal-400" />
                <span>Scroll Accordion</span>
              </div>
              <button
                type="button"
                onClick={() => setAutoExpandOnScroll(!autoExpandOnScroll)}
                className={`text-[10px] font-semibold px-2 py-0.5 rounded cursor-pointer transition-colors ${
                  autoExpandOnScroll
                    ? "bg-teal-950 text-teal-300 border border-teal-800"
                    : "bg-slate-800 text-slate-400 border border-slate-700"
                }`}
              >
                {autoExpandOnScroll ? "Auto (Active)" : "Manual"}
              </button>
            </div>

            {/* Workflow Step Links */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 pt-1">
                Workflow Modules
              </div>
              {workflowSteps.map((step) => {
                const Icon = step.icon;
                const isCurrent =
                  (activePage === "report" && step.id === "report") ||
                  (activePage === "workspace" && (activeWorkflowSection === step.id || activeAccordionModule === step.id));
                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => handleNavigateToSection(step.id)}
                    className={`w-full p-2.5 rounded-xl text-left text-xs transition-all flex items-center justify-between gap-2 cursor-pointer ${
                      isCurrent
                        ? "bg-teal-950/90 border border-teal-500/80 text-teal-200 shadow-sm"
                        : "hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isCurrent ? "text-teal-400" : "text-slate-500"
                        }`}
                      />
                      <span className="truncate font-medium">{step.label}</span>
                    </div>

                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded truncate max-w-[90px] ${
                        isCurrent
                          ? "bg-teal-900/60 text-teal-300"
                          : "bg-slate-950 text-slate-500"
                      }`}
                    >
                      {step.badge}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Confidence & Indicator Balance Quick Gauge */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Model Harmony</span>
                <span className="font-mono text-teal-400 font-bold">{pmiResult.confidenceScore}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    pmiResult.confidenceScore >= 75
                      ? "bg-teal-400"
                      : pmiResult.confidenceScore >= 50
                      ? "bg-amber-400"
                      : "bg-rose-400"
                  }`}
                  style={{ width: `${pmiResult.confidenceScore}%` }}
                />
              </div>
              <div className="text-[11px] text-slate-500 flex justify-between">
                <span>{pmiResult.indicatorEvaluations.length} Active Signs</span>
                <span>{pmiResult.inconsistencyAlerts.length} Conflicts</span>
              </div>
            </div>

            {/* Quick Reference Links */}
            <div className="pt-2 border-t border-slate-800/80 space-y-1 text-xs">
              <button
                type="button"
                onClick={() => openSidePanel("indicators")}
                className="w-full text-left p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 flex items-center justify-between cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-teal-400" />
                  <span>Indicator Matrix</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              </button>
            </div>
          </div>
        </aside>

        {/* Right / Center Canvas: Interactive Forensic Inputs & Output Panels */}
        <main className="w-full lg:col-span-9 space-y-6">
          {activePage === "report" ? (
            /* Dedicated Medico-Legal Case Report Page */
            <div className="space-y-4">
              {/* Return to Workspace Breadcrumb Bar */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md no-print">
                <button
                  type="button"
                  onClick={() => {
                    setActivePage("workspace");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="text-xs font-semibold text-teal-300 hover:text-teal-200 flex items-center gap-2 cursor-pointer bg-slate-950 hover:bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-800 hover:border-teal-500/50 transition-colors shadow-sm"
                >
                  <ArrowLeft className="w-4 h-4 text-teal-400" />
                  <span>← Return to Case Workspace</span>
                </button>
                <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-400">
                  <span>Case ID: <strong className="font-mono text-teal-300">{caseData.caseId || "VM-UNASSIGNED"}</strong></span>
                  <span>•</span>
                  <span>Subject: <strong className="text-slate-200">{caseData.subjectNameOrIdentifier || "Unidentified Doe"}</strong></span>
                  <span>•</span>
                  <span className="font-mono text-teal-400 font-bold">{pmiResult.estimatedPmiOptimalHours}h Window</span>
                </div>
              </div>

              <GeneratedReportSection
                caseData={caseData}
                result={pmiResult}
                visionData={visionData}
                onScrollToSection={(sectionId) => handleNavigateToSection(sectionId)}
                onBackToWorkspace={(modKey) => handleNavigateToSection(modKey || "metadata")}
                onRunAiSynthesis={handleRunAiSynthesis}
                isAiLoading={isAiLoading}
              />
            </div>
          ) : (
            /* Main Case Workspace (Inputs, Computer Vision, & Model Synthesis) */
            <>
              {/* Research Prototype Disclaimer Banner */}
              <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/40 text-[#E5C158] px-4 py-3 rounded-2xl text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
                <div className="flex items-start sm:items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5 sm:mt-0" />
                  <div>
                    <span className="font-bold text-[#D4AF37] uppercase tracking-wider text-[11px] mr-1.5">
                      Research Prototype Disclaimer:
                    </span>
                    <span>
                      VisionMortis Protocol One provides AI-assisted decision-support for forensic post-mortem interval estimation. Estimations must be corroborated with formal autopsy, toxicology, and histological findings.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => openSidePanel("limitations")}
                  className="text-xs font-semibold text-[#D4AF37] underline hover:text-amber-200 cursor-pointer shrink-0 ml-6 sm:ml-0"
                >
                  Forensic Limitations & Scope
                </button>
              </div>

              {/* Quick Real-Time Status Bar with Jump to Final AI Synthesis & Report */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-400 font-medium">Real-Time Composite PMI</div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold font-mono text-teal-400">
                        {pmiResult.estimatedPmiOptimalHours} Hours
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        ({pmiResult.estimatedPmiMinHours}–{pmiResult.estimatedPmiMaxHours}h window)
                      </span>
                    </div>
                  </div>
                </div>

                {presetAudit.isModified && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/60 border border-amber-800/80 text-amber-300 text-xs w-full sm:w-auto">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="font-semibold">
                      {presetAudit.modifiedCount} Examiner Change{presetAudit.modifiedCount !== 1 ? "s" : ""} Active:
                    </span>
                    <span className="text-amber-200/90 font-mono text-[11px] truncate max-w-[220px] lg:max-w-xs" title={presetAudit.modifiedFieldLabels.join("; ")}>
                      {presetAudit.modifiedFieldLabels.join(", ")}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => handleNavigateToSection("report")}
                    className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-teal-950/50 cursor-pointer w-full sm:w-auto justify-center"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Open Final Synthesis & Report</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

          {/* Section 1: Case Discovery & Environmental Baseline Card (Collapsible) */}
          <div id="metadata-card" className="scroll-mt-24 rounded-xl bg-slate-900/90 border border-slate-800 p-3.5 sm:p-5 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
              <div
                className="flex items-center gap-3 cursor-pointer select-none min-w-0"
                onClick={() => setMetadataCollapsed(!metadataCollapsed)}
              >
                <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
                  <Compass className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-semibold text-slate-100 flex items-center gap-2">
                    <span className="truncate">1. Case Identification & Scene Baseline</span>
                    {metadataCollapsed ? (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-400 truncate sm:whitespace-normal">
                    Core parameters governing cooling and decay formulas
                  </p>
                </div>
              </div>

              {/* Quick Case Presets Loader - Fully Responsive Container */}
              <div className="w-full lg:w-auto min-w-0 flex flex-col gap-2 bg-slate-950/70 lg:bg-transparent p-2.5 lg:p-0 rounded-xl border lg:border-0 border-slate-800/80">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium shrink-0">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-teal-400" />
                    <span className="text-[11px] font-semibold text-slate-300">Case Preset:</span>
                  </div>
                  <div className="relative min-w-0 flex-1 w-full sm:w-auto">
                    {(() => {
                      const activePresetIdx = FORENSIC_PRESETS.findIndex(
                        (p) => (caseData.presetId && p.presetId === caseData.presetId) || p.caseId === caseData.caseId
                      );
                      return (
                        <select
                          value={activePresetIdx >= 0 ? activePresetIdx : ""}
                          onChange={(e) => {
                            const idx = parseInt(e.target.value, 10);
                            if (!isNaN(idx) && FORENSIC_PRESETS[idx]) {
                              setCaseData(FORENSIC_PRESETS[idx]);
                              setAiSynthesisData(null);
                            }
                          }}
                          className="w-full lg:w-72 max-w-full truncate bg-slate-900 lg:bg-slate-950 border border-slate-700/80 hover:border-teal-500/80 rounded-xl px-2.5 py-1.5 text-xs text-teal-300 focus:outline-none focus:border-teal-400 cursor-pointer shadow-sm"
                        >
                          <option value="" disabled>Load benchmark case...</option>
                          {FORENSIC_PRESETS.map((preset, idx) => (
                            <option key={preset.presetId || preset.caseId || idx} value={idx}>
                              {preset.presetName || `${preset.caseId}: ${preset.subjectNameOrIdentifier}`}
                            </option>
                          ))}
                        </select>
                      );
                    })()}
                  </div>
                </div>

                {/* Preset Modification Status Row in Section 1 */}
                {presetAudit.isPreset && (
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      {presetAudit.isModified ? (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-950/50 border border-amber-800/70 text-amber-300 w-full sm:w-auto">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className="font-semibold text-[11px]">
                            Modified by Examiner ({presetAudit.modifiedCount} adjusted parameter{presetAudit.modifiedCount !== 1 ? "s" : ""})
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const orig = FORENSIC_PRESETS.find(
                                (p) => (caseData.presetId && p.presetId === caseData.presetId) || p.caseId === caseData.caseId
                              );
                              if (orig) {
                                setCaseData(orig);
                                setAiSynthesisData(null);
                              }
                            }}
                            className="ml-auto text-[10px] text-amber-200 hover:text-white underline cursor-pointer font-medium pl-1"
                            title="Revert all changes back to original preset baseline"
                          >
                            Revert
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-[11px] font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>Original Benchmark Baseline (Unaltered)</span>
                        </div>
                      )}
                    </div>
                    {presetAudit.isModified && presetAudit.modifiedFieldLabels.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {presetAudit.modifiedFieldLabels.map((diff, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-950/80 text-amber-200 border border-amber-800/80"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                            {diff}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {!metadataCollapsed && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-xs animate-in fade-in duration-150">
                {/* Case ID / File Number */}
                <div className="space-y-1 sm:col-span-2 md:col-span-1">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-400 font-medium flex items-center gap-1.5">
                      <FolderOpen className="w-3.5 h-3.5 text-teal-400" /> File Number / Case ID
                    </label>
                    <button
                      type="button"
                      onClick={() => setCaseData({ ...caseData, caseId: generateValidCaseId() })}
                      className="text-[10px] text-teal-400 hover:text-teal-300 flex items-center gap-1 cursor-pointer font-medium"
                      title="Generate valid file number"
                    >
                      <Wand2 className="w-3 h-3" /> Auto-Gen ID
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={caseData.caseId}
                      placeholder="VM-DXB-2026-A841"
                      onChange={(e) => setCaseData({ ...caseData, caseId: e.target.value.toUpperCase() })}
                      className={`w-full bg-slate-950 border rounded-xl px-3 py-2 text-slate-200 focus:outline-none font-mono text-xs ${
                        caseIdValidation.isValid
                          ? "border-teal-600/80 focus:border-teal-400 pr-8"
                          : caseData.caseId
                          ? "border-amber-600/80 focus:border-amber-400 pr-8"
                          : "border-slate-800 focus:border-teal-500"
                      }`}
                    />
                    {caseData.caseId && (
                      <div className="absolute right-2.5 top-2.5">
                        {caseIdValidation.isValid ? (
                          <CheckCircle2 className="w-4 h-4 text-teal-400" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-amber-400" />
                        )}
                      </div>
                    )}
                  </div>
                  {/* Validation Status */}
                  <div className="text-[10px] leading-tight mt-1">
                    {caseIdValidation.isValid ? (
                      <span className="text-teal-400 font-mono">✓ Valid File Number (VM-[EMIRATE]-YYYY-XXXX)</span>
                    ) : caseData.caseId ? (
                      <span className="text-amber-400 font-medium">{caseIdValidation.error}</span>
                    ) : (
                      <span className="text-slate-500">Format: VM-DXB-YYYY-XXXX (3-letter emirate code + year + 4-char suffix)</span>
                    )}
                  </div>
                </div>

                {/* Subject Identifier */}
                <div className="space-y-1 sm:col-span-2 md:col-span-1">
                  <label className="text-slate-400 font-medium flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-teal-400" /> Subject Identifier
                  </label>
                  <input
                    type="text"
                    value={caseData.subjectNameOrIdentifier}
                    placeholder="e.g. John Doe / Subject #104"
                    onChange={(e) => setCaseData({ ...caseData, subjectNameOrIdentifier: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>

                {/* Subject Age (Years) */}
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-teal-400" /> Estimated Age (Years)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="120"
                    value={caseData.ageYears !== undefined ? caseData.ageYears : ""}
                    placeholder="Optional (e.g. 45)"
                    onChange={(e) => {
                      const val = e.target.value ? parseInt(e.target.value, 10) : undefined;
                      setCaseData({ ...caseData, ageYears: val });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-teal-500 font-mono"
                  />
                </div>

                {/* Biological Sex */}
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-teal-400" /> Biological Sex
                  </label>
                  <select
                    value={caseData.sex || "unknown"}
                    onChange={(e) => setCaseData({ ...caseData, sex: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-teal-500"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="unknown">Indeterminate / Unknown</option>
                  </select>
                </div>

                {/* Discovery Time */}
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-teal-400" /> Discovery Timestamp
                  </label>
                  <input
                    type="text"
                    value={caseData.discoveryTimestamp}
                    placeholder="e.g. 2026-08-22 08:30"
                    onChange={(e) => setCaseData({ ...caseData, discoveryTimestamp: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-teal-500 font-mono"
                  />
                </div>

                {/* Ambient Scene Temp */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-400 font-medium flex items-center gap-1.5">
                      <Thermometer className="w-3.5 h-3.5 text-amber-400" /> Ambient Scene Temp (°C)
                    </label>
                    {isTempModified && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950/90 text-amber-300 border border-amber-800/80 font-mono">
                        Base: {baseTemp}°C
                      </span>
                    )}
                  </div>
                  <input
                    type="number"
                    step="0.5"
                    value={caseData.ambientTempC}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 20;
                      setCaseData({
                        ...caseData,
                        ambientTempC: val,
                        algorMortis: { ...caseData.algorMortis, ambientTempC: val },
                        decomposition: { ...caseData.decomposition, effectiveMeanTempC: val },
                      });
                    }}
                    className={`w-full bg-slate-950 border ${
                      isTempModified ? "border-amber-700/80 text-amber-100" : "border-slate-800 text-slate-200"
                    } rounded-xl px-3 py-2 focus:outline-none focus:border-teal-500 font-mono`}
                  />
                </div>

                {/* Relative Humidity (%) */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-400 font-medium flex items-center gap-1.5">
                      <Droplets className="w-3.5 h-3.5 text-cyan-400" /> Relative Humidity (%)
                    </label>
                    {isHumidityModified && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950/90 text-amber-300 border border-amber-800/80 font-mono">
                        Base: {baseHumidity}%
                      </span>
                    )}
                  </div>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={caseData.relativeHumidityPercent !== undefined ? caseData.relativeHumidityPercent : 50}
                    onChange={(e) => {
                      const val = Math.min(100, Math.max(0, parseFloat(e.target.value) || 0));
                      setCaseData({
                        ...caseData,
                        relativeHumidityPercent: val,
                      });
                    }}
                    className={`w-full bg-slate-950 border ${
                      isHumidityModified ? "border-amber-700/80 text-amber-100" : "border-slate-800 text-slate-200"
                    } rounded-xl px-3 py-2 focus:outline-none focus:border-teal-500 font-mono`}
                  />
                </div>

                {/* Body Weight */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-400 font-medium flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-emerald-400" /> Body Mass (kg)
                    </label>
                    {isWeightModified && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950/90 text-amber-300 border border-amber-800/80 font-mono">
                        Base: {baseWeight}kg
                      </span>
                    )}
                  </div>
                  <input
                    type="number"
                    value={caseData.bodyWeightKg}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10) || 70;
                      setCaseData({
                        ...caseData,
                        bodyWeightKg: val,
                        algorMortis: { ...caseData.algorMortis, bodyWeightKg: val },
                      });
                    }}
                    className={`w-full bg-slate-950 border ${
                      isWeightModified ? "border-amber-700/80 text-amber-100" : "border-slate-800 text-slate-200"
                    } rounded-xl px-3 py-2 focus:outline-none focus:border-teal-500 font-mono`}
                  />
                </div>

                {/* Discovery Position */}
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-teal-400" /> Discovery Body Position
                  </label>
                  <select
                    value={caseData.bodyFoundPosition}
                    onChange={(e) => setCaseData({ ...caseData, bodyFoundPosition: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-teal-500 uppercase font-mono"
                  >
                    <option value="supine">Supine (Face Up)</option>
                    <option value="prone">Prone (Face Down)</option>
                    <option value="lateral_left">Lateral (Left Side)</option>
                    <option value="lateral_right">Lateral (Right Side)</option>
                    <option value="suspended_hanging">Suspended (Hanging)</option>
                    <option value="sitting">Sitting / Slumped</option>
                  </select>
                </div>

                {/* Scene Location */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-slate-400 font-medium flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-teal-400" /> Scene Location / Environmental Context
                  </label>
                  <input
                    type="text"
                    value={caseData.locationDescription || ""}
                    placeholder="e.g. Indoor residential apartment, AC running at 21°C"
                    onChange={(e) => setCaseData({ ...caseData, locationDescription: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>

                {/* Lead Investigator */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-slate-400 font-medium flex items-center gap-1.5">
                    <Stethoscope className="w-3.5 h-3.5 text-teal-400" /> Lead Medical Examiner / Forensic Officer
                  </label>
                  <input
                    type="text"
                    value={caseData.investigatorName || ""}
                    placeholder="e.g. Dr. A. Al-Mansoor, MD (Forensic Pathologist)"
                    onChange={(e) => setCaseData({ ...caseData, investigatorName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Computer Vision Multimodal Upload Card (Collapsible) */}
          <div id="vision-card" className="scroll-mt-24">
            <ComputerVisionUpload
              visionData={visionData}
              onVisionUpdate={setVisionData}
              onApplyToCase={handleApplyVisionToCase}
              isOpen={activeAccordionModule === "vision"}
              onToggleOpen={() => toggleAccordion("vision")}
            />
          </div>

          {/* Section 3: Algor Mortis Card (Collapsible) */}
          <div id="algor-card" className="scroll-mt-24">
            <AlgorMortisInput
              data={caseData.algorMortis}
              baselineData={presetAudit.baseline?.algorMortis}
              onChange={(updated) => updateIndicatorModule("algorMortis", updated)}
              isOpen={activeAccordionModule === "algor"}
              onToggleOpen={() => toggleAccordion("algor")}
            />
          </div>

          {/* Section 4: Livor Mortis Card (Collapsible) */}
          <div id="livor-card" className="scroll-mt-24">
            <LivorMortisInput
              data={caseData.livorMortis}
              bodyFoundPosition={caseData.bodyFoundPosition}
              onChange={(updated) => updateIndicatorModule("livorMortis", updated)}
              isOpen={activeAccordionModule === "livor"}
              onToggleOpen={() => toggleAccordion("livor")}
            />
          </div>

          {/* Section 5: Rigor Mortis Card (Collapsible) */}
          <div id="rigor-card" className="scroll-mt-24">
            <RigorMortisInput
              data={caseData.rigorMortis}
              onChange={(updated) => updateIndicatorModule("rigorMortis", updated)}
              isOpen={activeAccordionModule === "rigor"}
              onToggleOpen={() => toggleAccordion("rigor")}
            />
          </div>

          {/* Section 6: Decomposition & TBS Card (Collapsible) */}
          <div id="decomposition-card" className="scroll-mt-24">
            <DecompositionInput
              data={caseData.decomposition}
              onChange={(updated) => updateIndicatorModule("decomposition", updated)}
              isOpen={activeAccordionModule === "decomposition"}
              onToggleOpen={() => toggleAccordion("decomposition")}
            />
          </div>

          {/* Section 7: Forensic Entomology Card (Collapsible) */}
          <div id="entomology-card" className="scroll-mt-24">
            <EntomologyInput
              data={caseData.entomology}
              ambientTempC={caseData.ambientTempC}
              onChange={(updated) => updateIndicatorModule("entomology", updated)}
              isOpen={activeAccordionModule === "entomology"}
              onToggleOpen={() => toggleAccordion("entomology")}
            />
          </div>

          {/* Section 8: Metabolomics & Vitreous Card (Collapsible) */}
          <div id="metabolomics-card" className="scroll-mt-24">
            <MetabolomicsInput
              data={caseData.metabolomics}
              onChange={(updated) => updateIndicatorModule("metabolomics", updated)}
              isOpen={activeAccordionModule === "metabolomics"}
              onToggleOpen={() => toggleAccordion("metabolomics")}
            />
          </div>

          {/* Bottom Card: Proceed to Final Synthesis & Case Report Page */}
          <div className="rounded-2xl bg-gradient-to-r from-teal-950/90 via-slate-900 to-slate-900 border border-teal-500/50 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xl">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300 shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold text-slate-100">
                    Final Synthesis & Official Case Report
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-900/80 text-teal-300 border border-teal-700">
                    Official Page
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  All inputs are synchronized in real-time. Proceed to the report page for full multi-engine synthesis, XGBoost ML explainability, analytical cooling curves, and document export.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleNavigateToSection("report")}
              className="px-5 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-teal-950/60 cursor-pointer shrink-0 hover:scale-105 active:scale-95"
            >
              <span>Open Final Synthesis & Report</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </>
      )}
    </main>
      </div>

      {/* Application Footer Styled Similar to the Medico-Legal Report */}
      <AppFooter
        caseId={caseData.caseId}
        subjectIdentifier={caseData.subjectNameOrIdentifier}
        pmiResult={pmiResult}
        onNavigateToSection={handleNavigateToSection}
        onOpenSidePanel={openSidePanel}
        onOpenResetModal={() => setIsResetModalOpen(true)}
      />

      {/* Main Side Panel for About / User Guide / Limitations / Matrix / XGBoost */}
      <MainSidePanel
        isOpen={isSidePanelOpen}
        onClose={() => setIsSidePanelOpen(false)}
        activeSection={sidePanelSection}
      />

      {/* Standardized Medico-Legal Case Report Modal with Vision Data Support */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        caseData={caseData}
        result={pmiResult}
        visionData={visionData}
      />

      {/* Explicit Reset Confirmation Modal ("Ask again & reset the whole entire thing") */}
      <ResetConfirmationModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirmResetBlank={handleResetBlank}
        onLoadPreset={(preset) => {
          setCaseData(preset);
          setAiSynthesisData(null);
        }}
      />
    </div>
  );
}
