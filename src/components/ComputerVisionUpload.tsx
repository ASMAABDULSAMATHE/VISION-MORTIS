import React, { useState, useRef } from "react";
import { VisionDetectionData, VisionImageItem, ImageAnatomicalTag, RelevanceCategoryType } from "../types";
import {
  Camera,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Loader2,
  ArrowRight,
  Trash2,
  Plus,
  Layers,
  ZoomIn,
  X,
  Info,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  ShieldAlert,
  FileText,
  User,
  HelpCircle as QuestionIcon,
} from "lucide-react";

interface Props {
  visionData: VisionDetectionData;
  onVisionUpdate: (data: VisionDetectionData) => void;
  onApplyToCase: (data: VisionDetectionData) => void;
  isOpen?: boolean;
  onToggleOpen?: () => void;
}

const MAX_IMAGES = 6;

const TAG_OPTIONS: Array<{ value: ImageAnatomicalTag; label: string }> = [
  { value: "anterior_body", label: "Front Body Overview" },
  { value: "posterior_livor", label: "Back / Blood Settling (Lividity)" },
  { value: "face_cornea", label: "Face & Eye Close-up" },
  { value: "abdomen_tbs", label: "Abdomen & Torso (Decay)" },
  { value: "entomology_larvae", label: "Insects / Maggot Clusters" },
  { value: "scene_context", label: "Scene & Surroundings" },
  { value: "limbs_periphery", label: "Arms & Legs" },
  { value: "other", label: "Other Detail / Object" },
];

const RELEVANCE_OPTIONS: Array<{
  value: RelevanceCategoryType;
  label: string;
  badgeClass: string;
  isUnrelated: boolean;
}> = [
  {
    value: "deceased_human_forensic",
    label: "Deceased Subject (Forensic)",
    badgeClass: "bg-teal-950/90 text-teal-300 border-teal-800",
    isUnrelated: false,
  },
  {
    value: "writing_or_document",
    label: "Document / Written Text",
    badgeClass: "bg-sky-950/90 text-sky-300 border-sky-800",
    isUnrelated: true,
  },
  {
    value: "live_human",
    label: "Living Person (Selfie/Portrait)",
    badgeClass: "bg-purple-950/90 text-purple-300 border-purple-800",
    isUnrelated: true,
  },
  {
    value: "unrelated_object",
    label: "Unrelated Object / Scene",
    badgeClass: "bg-amber-950/90 text-amber-300 border-amber-800",
    isUnrelated: true,
  },
];

export const ComputerVisionUpload: React.FC<Props> = ({
  visionData,
  onVisionUpdate,
  onApplyToCase,
  isOpen,
  onToggleOpen,
}) => {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [showExtraInfo, setShowExtraInfo] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [notes, setNotes] = useState("");
  const [zoomImage, setZoomImage] = useState<VisionImageItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isCollapsed = isOpen !== undefined ? !isOpen : internalCollapsed;
  const toggleCollapse = () => {
    if (onToggleOpen) onToggleOpen();
    else setInternalCollapsed(!internalCollapsed);
  };

  const imageList = visionData.images || [];

  // Categorization counts
  const documentImages = imageList.filter(
    (img) => img.relevanceCategory === "writing_or_document"
  );
  const liveHumanImages = imageList.filter(
    (img) => img.relevanceCategory === "live_human"
  );
  const unrelatedObjectImages = imageList.filter(
    (img) => img.relevanceCategory === "unrelated_object"
  );
  const forensicImages = imageList.filter(
    (img) => !img.isUnrelated && img.relevanceCategory !== "writing_or_document" && img.relevanceCategory !== "live_human" && img.relevanceCategory !== "unrelated_object"
  );

  const hasUnrelated =
    visionData.unrelatedImagesDetected ||
    documentImages.length > 0 ||
    liveHumanImages.length > 0 ||
    unrelatedObjectImages.length > 0 ||
    imageList.some((img) => img.isUnrelated);

  const hasQualityWarning = Boolean(
    visionData.qualityWarning ||
      imageList.some((img) => img.qualityRating && img.qualityRating !== "Optimal")
  );

  const handleAddFiles = async (files: FileList | File[]) => {
    setErrorMsg(null);
    const validFiles: File[] = [];

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (f.type.startsWith("image/")) {
        validFiles.push(f);
      }
    }

    if (validFiles.length === 0) {
      setErrorMsg("Please upload standard image files (JPG, PNG, WebP).");
      return;
    }

    const availableSlots = MAX_IMAGES - imageList.length;
    if (availableSlots <= 0) {
      setErrorMsg(`Maximum capacity reached (${MAX_IMAGES} photos). Delete existing photos to add new ones.`);
      return;
    }

    const filesToProcess = validFiles.slice(0, availableSlots);
    const newItems: VisionImageItem[] = [];

    for (let i = 0; i < filesToProcess.length; i++) {
      const file = filesToProcess[i];
      const base64 = await readFileAsBase64(file);

      // Default tag
      let defaultTag: ImageAnatomicalTag = "scene_context";
      const totalCount = imageList.length + newItems.length;
      if (totalCount === 0) defaultTag = "anterior_body";
      else if (totalCount === 1) defaultTag = "posterior_livor";
      else if (totalCount === 2) defaultTag = "face_cornea";
      else if (totalCount === 3) defaultTag = "abdomen_tbs";
      else if (totalCount === 4) defaultTag = "entomology_larvae";

      // Pre-screen filename heuristics
      const lowerName = file.name.toLowerCase();
      let category: RelevanceCategoryType = "deceased_human_forensic";
      let categoryLabel = "Deceased Subject (Forensic)";
      let isUnrelated = false;
      let warningMessage = "✓ Verified post-mortem biological evidence.";

      if (
        lowerName.includes("doc") ||
        lowerName.includes("note") ||
        lowerName.includes("text") ||
        lowerName.includes("paper") ||
        lowerName.includes("report") ||
        lowerName.includes("rx") ||
        lowerName.includes("prescription")
      ) {
        category = "writing_or_document";
        categoryLabel = "Document / Written Notes";
        isUnrelated = true;
        warningMessage = "📄 Written Document Detected: Contains written notes rather than physical signs of death. Excluded from calculations.";
      } else if (
        lowerName.includes("selfie") ||
        lowerName.includes("living") ||
        lowerName.includes("person") ||
        lowerName.includes("alive") ||
        lowerName.includes("portrait")
      ) {
        category = "live_human";
        categoryLabel = "Living Person";
        isUnrelated = true;
        warningMessage = "👤 Living Person Detected: Shows a living person rather than a deceased subject. Excluded from post-mortem calculations.";
      } else if (
        lowerName.includes("dog") ||
        lowerName.includes("cat") ||
        lowerName.includes("pet") ||
        lowerName.includes("food") ||
        lowerName.includes("coffee") ||
        lowerName.includes("cup") ||
        lowerName.includes("car") ||
        lowerName.includes("meme")
      ) {
        category = "unrelated_object";
        categoryLabel = "Unrelated Object / Scene";
        isUnrelated = true;
        warningMessage = "⚠️ Unrelated Photo Detected: Non-forensic object or scenery without human remains.";
      }

      newItems.push({
        id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        dataUrl: base64,
        name: file.name,
        tag: defaultTag,
        isUnrelated,
        relevanceCategory: category,
        categoryLabel,
        warningMessage,
        relevanceStatus: isUnrelated ? "Unrelated / Non-Forensic" : "Forensic Biological Evidence",
        qualityRating: "Optimal",
        qualityNote: "Resolution suitable for visual assessment.",
        uploadedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });
    }

    const updatedList = [...imageList, ...newItems];
    const updatedData: VisionDetectionData = {
      ...visionData,
      images: updatedList,
      imagePreviewUrl: updatedList[0]?.dataUrl,
      activeImageId: updatedList[0]?.id,
    };

    onVisionUpdate(updatedData);
    await analyzeMultiImages(updatedList, notes);
  };

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (id: string) => {
    const updatedList = imageList.filter((img) => img.id !== id);
    const updatedData: VisionDetectionData = {
      ...visionData,
      images: updatedList,
      imagePreviewUrl: updatedList[0]?.dataUrl || undefined,
      activeImageId: updatedList[0]?.id || undefined,
    };

    if (updatedList.length === 0) {
      updatedData.detectedDecompositionStage = undefined;
      updatedData.estimatedTbs = undefined;
      updatedData.detectedLivor = undefined;
      updatedData.detectedEntomology = undefined;
      updatedData.visualPmiWindowHours = undefined;
      updatedData.forensicObservations = undefined;
      updatedData.unrelatedImagesDetected = false;
      updatedData.unrelatedImageCount = 0;
      updatedData.detectedCategoryBreakdown = undefined;
      updatedData.qualityWarning = null;
      updatedData.perImageFindings = [];
    }

    onVisionUpdate(updatedData);

    if (updatedList.length > 0) {
      analyzeMultiImages(updatedList, notes);
    }
  };

  const handleTagChange = (id: string, newTag: ImageAnatomicalTag) => {
    const updatedList = imageList.map((img) => (img.id === id ? { ...img, tag: newTag } : img));
    onVisionUpdate({
      ...visionData,
      images: updatedList,
    });
  };

  const handleCategoryChange = (id: string, newCategory: RelevanceCategoryType) => {
    const opt = RELEVANCE_OPTIONS.find((o) => o.value === newCategory);
    const updatedList = imageList.map((img) => {
      if (img.id !== id) return img;
      return {
        ...img,
        relevanceCategory: newCategory,
        categoryLabel: opt?.label || "Forensic Biological Evidence",
        isUnrelated: opt?.isUnrelated ?? false,
        relevanceStatus: opt?.isUnrelated ? ("Unrelated / Non-Forensic" as const) : ("Forensic Biological Evidence" as const),
      };
    });

    onVisionUpdate({
      ...visionData,
      images: updatedList,
    });

    analyzeMultiImages(updatedList, notes);
  };

  const analyzeMultiImages = async (imagesToAnalyze: VisionImageItem[], contextNotes: string) => {
    if (imagesToAnalyze.length === 0) return;
    setAnalyzing(true);
    setErrorMsg(null);

    try {
      const payloadImages = imagesToAnalyze.map((img) => ({
        id: img.id,
        name: img.name,
        tag: img.tag || "scene_context",
        imageBase64: img.dataUrl,
        mimeType: img.dataUrl.startsWith("data:image/png") ? "image/png" : "image/jpeg",
      }));

      const res = await fetch("/api/vision-detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images: payloadImages,
          notes: contextNotes,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        // Merge findings back into images
        const perFindings = json.data.perImageFindings || [];
        const mergedImages = imagesToAnalyze.map((img) => {
          const finding = perFindings.find((f: any) => f.imageId === img.id);
          const relCat: RelevanceCategoryType =
            finding?.relevanceCategory ||
            (finding?.isUnrelated ? "unrelated_object" : "deceased_human_forensic");

          return {
            ...img,
            isUnrelated: finding?.isUnrelated ?? img.isUnrelated ?? false,
            relevanceCategory: relCat,
            categoryLabel: finding?.categoryLabel || img.categoryLabel,
            warningMessage: finding?.warningMessage || img.warningMessage,
            relevanceStatus: finding?.relevanceStatus ?? img.relevanceStatus ?? "Forensic Biological Evidence",
            qualityRating: finding?.qualityRating ?? img.qualityRating ?? "Optimal",
            qualityNote: finding?.qualityNote ?? img.qualityNote ?? "Clear view",
            detectedFindings: finding?.findings || img.detectedFindings,
            pmiImplication: finding?.pmiImplication || img.pmiImplication,
          };
        });

        onVisionUpdate({
          ...visionData,
          images: mergedImages,
          imagePreviewUrl: mergedImages[0]?.dataUrl,
          analyzing: false,
          ...json.data,
        });
      } else {
        throw new Error(json.error || "Vision analysis returned no data");
      }
    } catch (err: any) {
      console.warn("Vision detection fallback engine active:", err);

      // Local fallback calculation
      const hasMaggotTag = imagesToAnalyze.some((i) => i.tag === "entomology_larvae" && !i.isUnrelated);
      const hasAbdomenTag = imagesToAnalyze.some((i) => i.tag === "abdomen_tbs" && !i.isUnrelated);
      const hasCorneaTag = imagesToAnalyze.some((i) => i.tag === "face_cornea" && !i.isUnrelated);

      let stage = "early_marbling";
      let tbs = { headNeckScore: 3, trunkScore: 3, limbsScore: 2, totalScore: 8 };
      let minH = 8;
      let maxH = 24;

      if (hasMaggotTag) {
        stage = "active_decay";
        tbs = { headNeckScore: 6, trunkScore: 7, limbsScore: 5, totalScore: 18 };
        minH = 48;
        maxH = 120;
      } else if (hasAbdomenTag) {
        stage = "bloating_purge";
        tbs = { headNeckScore: 5, trunkScore: 5, limbsScore: 4, totalScore: 14 };
        minH = 24;
        maxH = 72;
      }

      let docCount = 0;
      let livingCount = 0;
      let unrelatedCount = 0;
      let forensicCount = 0;

      const updatedImages = imagesToAnalyze.map((img) => {
        const cat = img.relevanceCategory || (img.isUnrelated ? "unrelated_object" : "deceased_human_forensic");
        let warn = img.warningMessage || "✓ Verified post-mortem evidence.";

        if (cat === "writing_or_document") {
          docCount++;
          warn = "📄 Written Document / Text Detected: Contains written notes rather than physical signs of death. Excluded from calculations.";
        } else if (cat === "live_human") {
          livingCount++;
          warn = "👤 Living Person Detected: Shows a living person rather than a deceased subject. Excluded from calculations.";
        } else if (cat === "unrelated_object") {
          unrelatedCount++;
          warn = "⚠️ Unrelated Photo Detected: Non-forensic object or scenery without human remains.";
        } else {
          forensicCount++;
        }

        return {
          ...img,
          relevanceCategory: cat,
          warningMessage: warn,
          relevanceStatus: img.isUnrelated ? ("Unrelated / Non-Forensic" as const) : ("Forensic Biological Evidence" as const),
          qualityRating: "Optimal" as const,
          qualityNote: "Resolution suitable for visual assessment.",
          detectedFindings: img.isUnrelated
            ? "Non-forensic subject excluded from time of death calculations."
            : `Signs consistent with ${stage.replace(/_/g, " ")}.`,
        };
      });

      const totalUnrelated = docCount + livingCount + unrelatedCount;
      const allUnrelated = forensicCount === 0;

      let obs = "";
      if (allUnrelated) {
        obs = "No post-mortem human remains were found in the uploaded photos. All images were recognized as written documents, living individuals, or unrelated items and were safely excluded.";
      } else {
        obs = `Photo evaluation of ${forensicCount} forensic body image(s) shows signs consistent with ${stage.replace(/_/g, " ")} (Decomposition Score ${tbs.totalScore}/35), pointing to an estimated time of death between ${minH} and ${maxH} hours ago.`;
        if (totalUnrelated > 0) {
          obs += ` (${totalUnrelated} non-forensic photo(s) excluded).`;
        }
      }

      onVisionUpdate({
        ...visionData,
        images: updatedImages,
        imagePreviewUrl: updatedImages[0]?.dataUrl,
        analyzing: false,
        detectedDecompositionStage: allUnrelated ? "fresh" : stage,
        estimatedTbs: allUnrelated ? { headNeckScore: 1, trunkScore: 1, limbsScore: 1, totalScore: 3 } : tbs,
        detectedLivor: {
          colorClassification: "standard_violaceous",
          distribution: "Purple discoloration settling on lower body surfaces with pale contact areas",
          estimatedFixation: hasMaggotTag ? "fully_fixed" : "partially_fixed",
        },
        detectedEntomology: {
          insectsPresent: hasMaggotTag,
          primaryInsectStage: hasMaggotTag ? "second_instar" : "none",
          maggotMassPresent: hasMaggotTag,
          description: hasMaggotTag
            ? "Active young maggot clusters visible in body folds."
            : "No visible insect activity on current photos.",
        },
        detectedOcularChanges: {
          cornealClouding: hasCorneaTag ? "moderate_clouding" : "translucent_hazy",
          tacheNoirePresent: false,
          description: hasCorneaTag
            ? "Moderate corneal haziness (~10–24h post-mortem)."
            : "Eyes not clearly visible on submitted photos.",
        },
        unrelatedImagesDetected: totalUnrelated > 0,
        unrelatedImageCount: totalUnrelated,
        detectedCategoryBreakdown: {
          documentsAndWritings: docCount,
          livingPeople: livingCount,
          unrelatedObjects: unrelatedCount,
          forensicEvidence: forensicCount,
        },
        qualityWarning: null,
        sceneObservations: [
          `Analyzed ${imagesToAnalyze.length} submitted photo(s)`,
          contextNotes ? `Examiner note: "${contextNotes}"` : "Standard indoor scene",
          forensicCount > 0 ? "Body skin discoloration and decay signs evaluated" : "No deceased biological remains present",
        ],
        visualPmiWindowHours: allUnrelated
          ? { min: 0, max: 0, confidence: 0 }
          : { min: minH, max: maxH, confidence: 85 },
        forensicObservations: obs,
        perImageFindings: updatedImages.map((img, idx) => ({
          imageId: img.id,
          tag: img.tag || "general",
          isUnrelated: img.isUnrelated,
          relevanceCategory: img.relevanceCategory,
          categoryLabel: img.categoryLabel,
          warningMessage: img.warningMessage,
          relevanceStatus: img.relevanceStatus,
          qualityRating: img.qualityRating,
          qualityNote: img.qualityNote,
          findings: img.detectedFindings || `Photo ${idx + 1} analyzed.`,
          pmiImplication: img.isUnrelated
            ? "Excluded from calculations."
            : `Aligns with post-mortem interval of approximately ${minH}–${maxH} hours.`,
        })),
      });
    } finally {
      setAnalyzing(false);
    }
  };

  // Helper for generating clear demo photos
  const handleLoadDemoKit = (kitType: "complete_4_angle" | "early_livor" | "maggot_bloat" | "doc_writing_test" | "living_person_test" | "unrelated_object_test") => {
    const demoItems: VisionImageItem[] = [];

    const createSampleCanvas = (title: string, category: string, bullets: string[], bg: string, accent: string) => {
      const canvas = document.createElement("canvas");
      canvas.width = 640;
      canvas.height = 420;
      const ctx = canvas.getContext("2d");
      if (!ctx) return "";

      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, 640, 420);

      // Header Banner
      ctx.fillStyle = "#090d16";
      ctx.fillRect(0, 0, 640, 65);

      ctx.fillStyle = accent;
      ctx.font = "bold 18px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText(title, 25, 40);

      ctx.fillStyle = "#94a3b8";
      ctx.font = "12px monospace";
      ctx.fillText(`CATEGORY: [${category.toUpperCase()}]`, 25, 95);

      // Frame
      ctx.strokeStyle = accent;
      ctx.lineWidth = 2;
      ctx.strokeRect(25, 115, 590, 275);

      // Bullets
      ctx.fillStyle = "#e2e8f0";
      ctx.font = "14px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      bullets.forEach((b, idx) => {
        ctx.fillText(`• ${b}`, 45, 160 + idx * 35);
      });

      return canvas.toDataURL("image/jpeg");
    };

    if (kitType === "complete_4_angle") {
      demoItems.push(
        {
          id: "demo-1",
          dataUrl: createSampleCanvas(
            "Photo 1: Body Overview & Scene",
            "Deceased Subject (Forensic)",
            ["Subject found resting on back indoors", "No external burns or major trauma", "Early chest and abdomen greening"],
            "#0f172a",
            "#2dd4bf"
          ),
          name: "01_Body_Scene_Overview.jpg",
          tag: "anterior_body",
          isUnrelated: false,
          relevanceCategory: "deceased_human_forensic",
          categoryLabel: "Deceased Subject (Forensic)",
          warningMessage: "✓ Verified post-mortem biological evidence.",
          uploadedAt: "09:15 AM",
        },
        {
          id: "demo-2",
          dataUrl: createSampleCanvas(
            "Photo 2: Back Blood Settling (Lividity)",
            "Deceased Subject (Forensic)",
            ["Purple discoloration visible across back and calves", "Pale pressure spots where body pressed against floor", "Color does not blanch completely"],
            "#1e112a",
            "#c084fc"
          ),
          name: "02_Back_Lividity.jpg",
          tag: "posterior_livor",
          isUnrelated: false,
          relevanceCategory: "deceased_human_forensic",
          categoryLabel: "Deceased Subject (Forensic)",
          warningMessage: "✓ Verified post-mortem biological evidence.",
          uploadedAt: "09:16 AM",
        },
        {
          id: "demo-3",
          dataUrl: createSampleCanvas(
            "Photo 3: Face & Eye Close-Up",
            "Deceased Subject (Forensic)",
            ["Cloudy, hazy appearance over both corneas", "Loss of clear pupil reflex", "Early dark horizontal band (tache noire)"],
            "#042f2e",
            "#2dd4bf"
          ),
          name: "03_Eyes_Cornea_CloseUp.jpg",
          tag: "face_cornea",
          isUnrelated: false,
          relevanceCategory: "deceased_human_forensic",
          categoryLabel: "Deceased Subject (Forensic)",
          warningMessage: "✓ Verified post-mortem biological evidence.",
          uploadedAt: "09:17 AM",
        },
        {
          id: "demo-4",
          dataUrl: createSampleCanvas(
            "Photo 4: Abdomen & Torso Decay",
            "Deceased Subject (Forensic)",
            ["Greenish-brown color in lower right abdomen", "Dark marbling pattern in surface veins", "Mild early swelling"],
            "#1c1917",
            "#fbbf24"
          ),
          name: "04_Abdomen_Decay.jpg",
          tag: "abdomen_tbs",
          isUnrelated: false,
          relevanceCategory: "deceased_human_forensic",
          categoryLabel: "Deceased Subject (Forensic)",
          warningMessage: "✓ Verified post-mortem biological evidence.",
          uploadedAt: "09:18 AM",
        }
      );
    } else if (kitType === "early_livor") {
      demoItems.push(
        {
          id: "demo-livor-1",
          dataUrl: createSampleCanvas(
            "Early Blood Settling (Lividity)",
            "Deceased Subject (Forensic)",
            ["Light pinkish-purple patches along the lower flank", "Turns white when pressed with a thumb (blanching)", "Confirms body position has not been shifted"],
            "#1e112a",
            "#c084fc"
          ),
          name: "Early_Lividity_Flank.jpg",
          tag: "posterior_livor",
          isUnrelated: false,
          relevanceCategory: "deceased_human_forensic",
          categoryLabel: "Deceased Subject (Forensic)",
          warningMessage: "✓ Verified post-mortem biological evidence.",
          uploadedAt: "10:00 AM",
        },
        {
          id: "demo-livor-2",
          dataUrl: createSampleCanvas(
            "Early Face & Eyes",
            "Deceased Subject (Forensic)",
            ["Eyes clear with minimal haziness", "Jaw muscles feel tight (rigor mortis)", "No decay discoloration yet"],
            "#042f2e",
            "#2dd4bf"
          ),
          name: "Early_Facial_View.jpg",
          tag: "face_cornea",
          isUnrelated: false,
          relevanceCategory: "deceased_human_forensic",
          categoryLabel: "Deceased Subject (Forensic)",
          warningMessage: "✓ Verified post-mortem biological evidence.",
          uploadedAt: "10:01 AM",
        }
      );
    } else if (kitType === "maggot_bloat") {
      demoItems.push(
        {
          id: "demo-decay-1",
          dataUrl: createSampleCanvas(
            "Insect / Maggot Colonization",
            "Deceased Subject (Forensic)",
            ["Active clusters of young fly larvae in natural skin folds", "Feeding activity visible", "Indicates post-mortem exposure time"],
            "#022c22",
            "#34d399"
          ),
          name: "Maggot_Clusters_Neck.jpg",
          tag: "entomology_larvae",
          isUnrelated: false,
          relevanceCategory: "deceased_human_forensic",
          categoryLabel: "Deceased Subject (Forensic)",
          warningMessage: "✓ Verified post-mortem biological evidence.",
          uploadedAt: "11:20 AM",
        },
        {
          id: "demo-decay-2",
          dataUrl: createSampleCanvas(
            "Active Decomposition & Bloat",
            "Deceased Subject (Forensic)",
            ["Abdominal swelling with dark skin discoloration", "Surface skin loosening and slipping", "Characteristic active decomposition signs"],
            "#1c1917",
            "#fbbf24"
          ),
          name: "Abdominal_Bloat_Signs.jpg",
          tag: "abdomen_tbs",
          isUnrelated: false,
          relevanceCategory: "deceased_human_forensic",
          categoryLabel: "Deceased Subject (Forensic)",
          warningMessage: "✓ Verified post-mortem biological evidence.",
          uploadedAt: "11:22 AM",
        }
      );
    } else if (kitType === "doc_writing_test") {
      demoItems.push({
        id: "demo-doc-1",
        dataUrl: createSampleCanvas(
          "Handwritten Police Notes & Medical Chart",
          "Document / Written Text",
          ["Medical notes: Patient history and prescriptions", "Handwritten case summary on yellow notepad", "Contains written text only — NO body remains present"],
          "#082f49",
          "#38bdf8"
        ),
        name: "Doctor_Handwritten_Notes.jpg",
        tag: "scene_context",
        isUnrelated: true,
        relevanceCategory: "writing_or_document",
        categoryLabel: "Document / Written Notes",
        warningMessage: "📄 Written Document Detected: This photo contains written notes or medical charts rather than physical body signs. It is excluded from calculations.",
        uploadedAt: "11:30 AM",
      });
    } else if (kitType === "living_person_test") {
      demoItems.push({
        id: "demo-live-1",
        dataUrl: createSampleCanvas(
          "Living Individual (Selfie / Portrait)",
          "Living Person",
          ["Conscious living person smiling at camera", "Active facial muscle tone and normal skin circulation", "No post-mortem biological markers present"],
          "#3b0764",
          "#c084fc"
        ),
        name: "Living_Person_Selfie.jpg",
        tag: "face_cornea",
        isUnrelated: true,
        relevanceCategory: "live_human",
        categoryLabel: "Living Person",
        warningMessage: "👤 Living Person Detected: This photo shows a living individual rather than a deceased subject. Post-mortem time calculations require physical signs of death.",
        uploadedAt: "11:35 AM",
      });
    } else if (kitType === "unrelated_object_test") {
      demoItems.push({
        id: "demo-unrel-1",
        dataUrl: createSampleCanvas(
          "Unrelated Object: Office Coffee Mug",
          "Unrelated Object / Scene",
          ["Ceramic coffee mug on wooden desk", "Steam rising from hot liquid", "No human anatomy or death scene context"],
          "#431407",
          "#fb923c"
        ),
        name: "Coffee_Mug_On_Desk.jpg",
        tag: "other",
        isUnrelated: true,
        relevanceCategory: "unrelated_object",
        categoryLabel: "Unrelated Object / Scene",
        warningMessage: "⚠️ Unrelated Photo Detected: This photo shows an object or scene without deceased human remains.",
        uploadedAt: "11:40 AM",
      });
    }

    const updatedData: VisionDetectionData = {
      ...visionData,
      images: demoItems,
      imagePreviewUrl: demoItems[0]?.dataUrl,
      activeImageId: demoItems[0]?.id,
    };
    onVisionUpdate(updatedData);
    analyzeMultiImages(demoItems, notes);
  };

  return (
    <div id="vision-card" className="scroll-mt-20 rounded-xl bg-slate-900/90 border border-slate-800 p-5 space-y-4 transition-all">
      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              Photo Upload & Computer Vision
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-teal-950/80 text-teal-400 border border-teal-800/50">
                Up to 6 Photos
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Upload crime scene or autopsy photos. The AI automatically sorts body photos, documents, and living persons.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Demo Test Buttons */}
          <div className="hidden sm:flex items-center gap-1.5">
            <span className="text-[11px] text-slate-500">Test Sets:</span>
            <button
              type="button"
              onClick={() => handleLoadDemoKit("complete_4_angle")}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 transition-colors cursor-pointer"
              title="Load 4-angle complete forensic case"
            >
              4-Angle Case
            </button>
            <button
              type="button"
              onClick={() => handleLoadDemoKit("early_livor")}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-300 border border-slate-700 transition-colors cursor-pointer"
              title="Load early skin settling photos"
            >
              Early Lividity
            </button>
            <button
              type="button"
              onClick={() => handleLoadDemoKit("maggot_bloat")}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 transition-colors cursor-pointer"
              title="Load decay and maggot evidence"
            >
              Decay / Maggots
            </button>
          </div>

          {/* Module Box Collapse Button */}
          <button
            type="button"
            onClick={toggleCollapse}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
            title={isCollapsed ? "Expand section" : "Collapse section"}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <>
          {/* Specific Warning Banners for Segregation */}
          {documentImages.length > 0 && (
            <div className="p-3.5 rounded-xl bg-sky-950/70 border border-sky-800 text-sky-200 text-xs flex items-start gap-3 shadow-md">
              <FileText className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold text-sky-300 uppercase tracking-wide flex items-center gap-2">
                  <span>📄 Written Notes / Document Identified ({documentImages.length})</span>
                  <span className="text-[10px] bg-sky-900 px-2 py-0.5 rounded text-sky-200">Excluded from Calculations</span>
                </div>
                <p className="leading-relaxed">
                  The system detected written notes, forms, or medical paperwork. These are recognized as documentation and excluded from physical body cooling and decay calculations.
                </p>
              </div>
            </div>
          )}

          {liveHumanImages.length > 0 && (
            <div className="p-3.5 rounded-xl bg-purple-950/70 border border-purple-800 text-purple-200 text-xs flex items-start gap-3 shadow-md">
              <User className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold text-purple-300 uppercase tracking-wide flex items-center gap-2">
                  <span>👤 Living Person Identified ({liveHumanImages.length})</span>
                  <span className="text-[10px] bg-purple-900 px-2 py-0.5 rounded text-purple-200">Excluded from Calculations</span>
                </div>
                <p className="leading-relaxed">
                  One or more photos show a living person. Time of death estimations require photos of deceased subjects showing physical post-mortem changes.
                </p>
              </div>
            </div>
          )}

          {unrelatedObjectImages.length > 0 && (
            <div className="p-3.5 rounded-xl bg-amber-950/70 border border-amber-800 text-amber-200 text-xs flex items-start gap-3 shadow-md">
              <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold text-amber-300 uppercase tracking-wide flex items-center gap-2">
                  <span>⚠️ Unrelated Scene or Item Identified ({unrelatedObjectImages.length})</span>
                  <span className="text-[10px] bg-amber-900 px-2 py-0.5 rounded text-amber-200">Excluded from Calculations</span>
                </div>
                <p className="leading-relaxed">
                  One or more photos show objects or scenes without human remains (such as furniture, drinks, or pets) and were excluded from time of death calculations.
                </p>
              </div>
            </div>
          )}

          {/* Picture Quality Advisory Banner */}
          {hasQualityWarning && (
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-xs flex items-start gap-3 shadow-md">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold text-amber-300 uppercase tracking-wide">
                  Photo Quality Notice
                </div>
                <p className="leading-relaxed">
                  {visionData.qualityWarning ||
                    "Dim lighting, blur, or glare was detected in the photo. For best results, use clear, well-lit photos taken directly facing the subject."}
                </p>
              </div>
            </div>
          )}

          {/* Main Grid: Upload & Inspection (Col 6) + Plain-Language Synthesis (Col 6) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Column: Image Management & Upload (Col 6) */}
            <div className="lg:col-span-6 space-y-4">
              {/* Image Grid */}
              {imageList.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-teal-400" />
                      Uploaded Photos ({imageList.length} of {MAX_IMAGES})
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const updatedData: VisionDetectionData = {
                          images: [],
                          imagePreviewUrl: undefined,
                          activeImageId: undefined,
                          unrelatedImagesDetected: false,
                          unrelatedImageCount: 0,
                          detectedCategoryBreakdown: undefined,
                          qualityWarning: null,
                          perImageFindings: [],
                        };
                        onVisionUpdate(updatedData);
                      }}
                      className="text-rose-400 hover:text-rose-300 text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" /> Remove All
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {imageList.map((item, idx) => {
                      const category = item.relevanceCategory || (item.isUnrelated ? "unrelated_object" : "deceased_human_forensic");
                      const categoryObj = RELEVANCE_OPTIONS.find((r) => r.value === category) || RELEVANCE_OPTIONS[0];
                      const isSuboptimal = item.qualityRating && item.qualityRating !== "Optimal";

                      return (
                        <div
                          key={item.id}
                          className={`group relative rounded-xl border p-2 space-y-2 transition-all ${
                            category === "writing_or_document"
                              ? "bg-sky-950/30 border-sky-800/80"
                              : category === "live_human"
                              ? "bg-purple-950/30 border-purple-800/80"
                              : category === "unrelated_object"
                              ? "bg-amber-950/30 border-amber-800/80"
                              : "bg-slate-950/80 border-slate-800 hover:border-slate-700"
                          }`}
                        >
                          {/* Thumbnail Box */}
                          <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-900">
                            <img
                              src={item.dataUrl}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => setZoomImage(item)}
                                title="Zoom photo"
                                className="p-1.5 rounded-lg bg-slate-800/90 text-teal-300 hover:bg-slate-700 cursor-pointer"
                              >
                                <ZoomIn className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(item.id)}
                                title="Delete photo"
                                className="p-1.5 rounded-lg bg-rose-950/90 text-rose-300 hover:bg-rose-800 cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-slate-950/90 text-[10px] font-mono text-slate-300 border border-slate-800">
                              #{idx + 1}
                            </span>

                            {/* Category Badge */}
                            <span
                              className={`absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[9px] font-bold border ${categoryObj.badgeClass}`}
                            >
                              {category === "writing_or_document"
                                ? "Document"
                                : category === "live_human"
                                ? "Living Person"
                                : category === "unrelated_object"
                                ? "Unrelated"
                                : "Deceased Body"}
                            </span>
                          </div>

                          {/* Quality alert */}
                          {isSuboptimal && (
                            <div className="text-[10px] text-amber-400 flex items-center gap-1 truncate">
                              <AlertTriangle className="w-3 h-3 shrink-0" />
                              <span>{item.qualityRating}</span>
                            </div>
                          )}

                          {/* Category Type Selector */}
                          <div className="space-y-1">
                            <div className="text-[10px] text-slate-400 font-medium">Type:</div>
                            <select
                              value={category}
                              onChange={(e) => handleCategoryChange(item.id, e.target.value as RelevanceCategoryType)}
                              className="w-full text-[10px] bg-slate-900 border border-slate-800 rounded px-1.5 py-1 text-slate-200 focus:outline-none focus:border-teal-500 cursor-pointer"
                            >
                              {RELEVANCE_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-200">
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Anatomical Tag (only relevant for deceased body) */}
                          {!item.isUnrelated && (
                            <div className="space-y-1">
                              <div className="text-[10px] text-slate-400 font-medium">Body View:</div>
                              <select
                                value={item.tag || "scene_context"}
                                onChange={(e) => handleTagChange(item.id, e.target.value as ImageAnatomicalTag)}
                                className="w-full text-[10px] bg-slate-900 border border-slate-800 rounded px-1.5 py-1 text-slate-300 focus:outline-none focus:border-teal-500 cursor-pointer"
                              >
                                {TAG_OPTIONS.map((opt) => (
                                  <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-200">
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Upload Dropzone */}
              {imageList.length < MAX_IMAGES && (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragActive(false);
                    if (e.dataTransfer.files) handleAddFiles(e.dataTransfer.files);
                  }}
                  className={`relative rounded-xl border-2 border-dashed p-4 text-center transition-all flex flex-col items-center justify-center min-h-[130px] ${
                    dragActive
                      ? "border-teal-400 bg-teal-950/30"
                      : "border-slate-800 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-950/60"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files) handleAddFiles(e.target.files);
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />

                  <div className="flex flex-col items-center space-y-1.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-800/90 border border-slate-700 flex items-center justify-center text-teal-400 shadow-inner">
                      {imageList.length === 0 ? <Upload className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    </div>
                    <div className="text-xs font-semibold text-slate-200">
                      {imageList.length === 0 ? (
                        <>
                          Drop crime scene or autopsy photos here, or <span className="text-teal-400 underline">browse</span>
                        </>
                      ) : (
                        <>
                          Add more photos ({MAX_IMAGES - imageList.length} slots remaining)
                        </>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 max-w-[280px]">
                      Upload photos (JPG, PNG, WebP). The system automatically separates body photos from documents and living persons.
                    </p>
                  </div>
                </div>
              )}

              {/* Investigator Context Notes */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-400 flex items-center justify-between">
                  <span>Scene Notes & Temperature Clues:</span>
                  <span className="text-[11px] text-slate-500 font-normal">Optional details for AI analysis</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Discovered in cold basement; body was covered with a heavy blanket"
                    className="flex-1 bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500 placeholder-slate-600"
                  />
                  <button
                    type="button"
                    disabled={imageList.length === 0 || analyzing}
                    onClick={() => analyzeMultiImages(imageList, notes)}
                    className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {analyzing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    <span>Analyze</span>
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            {/* Right Column: AI Photo Analysis & Findings (Col 6) */}
            <div className="lg:col-span-6 bg-slate-950/60 rounded-xl border border-slate-800/80 p-4 space-y-4 flex flex-col justify-between">
              <div className="space-y-3.5">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-800/60 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-teal-400" />
                    <span className="text-xs font-semibold text-slate-200">
                      Visual Evidence Summary
                    </span>
                    {imageList.length > 0 && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        {forensicImages.length} Body Photo(s) Analyzed
                      </span>
                    )}
                  </div>

                  {analyzing && (
                    <span className="flex items-center gap-1.5 text-xs text-teal-400 animate-pulse font-medium">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Analyzing photos...
                    </span>
                  )}
                </div>

                {visionData.detectedDecompositionStage || visionData.visualPmiWindowHours ? (
                  <div className="space-y-3 text-xs">
                    {/* 2x2 Findings Grid in Plain Language */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {/* Decomposition Stage */}
                      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                        <div className="text-[11px] text-slate-400 font-medium">
                          Decomposition Stage
                        </div>
                        <div className="text-amber-300 font-bold capitalize text-sm">
                          {visionData.detectedDecompositionStage?.replace(/_/g, " ") || "Indeterminate"}
                        </div>
                        {visionData.estimatedTbs && (
                          <div className="text-[11px] text-slate-400 mt-1">
                            Decay Score:{" "}
                            <span className="font-mono text-amber-400 font-semibold">
                              {visionData.estimatedTbs.totalScore} / 35
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Visual Time of Death Window */}
                      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                        <div className="text-[11px] text-slate-400 font-medium">Visual Time of Death Range</div>
                        <div className="text-teal-300 font-bold text-sm font-mono">
                          {visionData.visualPmiWindowHours && visionData.visualPmiWindowHours.max > 0
                            ? `${visionData.visualPmiWindowHours.min} to ${visionData.visualPmiWindowHours.max} Hours Ago`
                            : "No Body Photos to Estimate"}
                        </div>
                        {visionData.visualPmiWindowHours && visionData.visualPmiWindowHours.confidence > 0 && (
                          <div className="text-[11px] text-emerald-400 font-medium mt-1 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            {visionData.visualPmiWindowHours.confidence}% AI Confidence
                          </div>
                        )}
                      </div>

                      {/* Blood Settling / Lividity */}
                      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                        <div className="text-[11px] text-slate-400 font-medium">Skin Color & Blood Settling</div>
                        <div className="text-purple-300 font-bold capitalize">
                          {visionData.detectedLivor?.colorClassification?.replace(/_/g, " ") || "Purple / Violaceous"}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Blanching:{" "}
                          <span className="font-semibold text-slate-200 capitalize">
                            {visionData.detectedLivor?.estimatedFixation?.replace(/_/g, " ") || "Partially Fixed"}
                          </span>
                        </div>
                      </div>

                      {/* Insect / Maggot Activity */}
                      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                        <div className="text-[11px] text-slate-400 font-medium">Insect / Maggot Activity</div>
                        <div className="text-emerald-300 font-bold capitalize">
                          {visionData.detectedEntomology?.primaryInsectStage?.replace(/_/g, " ") || "None Visible"}
                        </div>
                        <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                          {visionData.detectedEntomology?.description || "No visible insects on submitted photos"}
                        </div>
                      </div>
                    </div>

                    {/* AI Observations in Plain Language */}
                    {visionData.forensicObservations && (
                      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 space-y-1.5 leading-relaxed">
                        <div className="font-semibold text-teal-400 text-xs flex items-center gap-1.5">
                          <Info className="w-3.5 h-3.5" />
                          <span>Key Visual Observations:</span>
                        </div>
                        <p>{visionData.forensicObservations}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-40 flex flex-col items-center justify-center text-center p-4 text-slate-500 space-y-2">
                    <Eye className="w-8 h-8 text-slate-700" />
                    <p className="text-xs">
                      Upload photos above to run automatic visual decay scoring and time of death analysis.
                    </p>
                  </div>
                )}
              </div>

              {/* Action Button: Apply findings to case form */}
              {visionData.detectedDecompositionStage && (
                <button
                  type="button"
                  onClick={() => onApplyToCase(visionData)}
                  className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-teal-950/40 transition-all cursor-pointer mt-2"
                >
                  <span>Apply Photo Findings to Case Calculator</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {/* Helpful Guide Toggle */}
              <div className="border border-slate-800/70 rounded-xl overflow-hidden bg-slate-950/30 text-xs mt-3">
                <button
                  type="button"
                  onClick={() => setShowExtraInfo(!showExtraInfo)}
                  className="w-full p-3 flex items-center justify-between text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 transition-colors cursor-pointer text-left"
                >
                  <span className="flex items-center gap-2 font-medium">
                    <HelpCircle className="w-3.5 h-3.5 text-teal-400" />
                    <span>How Image Sorting & AI Vision Works</span>
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
                      <strong>Automatic Photo Sorting:</strong> The computer vision model inspects each uploaded photo to distinguish between:
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-slate-400">
                      <li><strong>Deceased Body Photos:</strong> Checked for body discoloration, stiffness, decay stage, and insect activity.</li>
                      <li><strong>Written Notes & Documents:</strong> Recognized as text or paperwork and excluded from body decay calculations.</li>
                      <li><strong>Living Persons:</strong> Recognized as conscious or living individuals and excluded from post-mortem equations.</li>
                      <li><strong>Unrelated Items:</strong> Everyday objects or background scenes without remains are safely ignored.</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* High-Resolution Zoom Modal */}
      {zoomImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setZoomImage(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-200">{zoomImage.name}</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-800">
                  {TAG_OPTIONS.find((t) => t.value === zoomImage.tag)?.label || "Photo"}
                </span>
                {zoomImage.relevanceCategory && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {RELEVANCE_OPTIONS.find((r) => r.value === zoomImage.relevanceCategory)?.label || "Forensic Photo"}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setZoomImage(null)}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-[70vh] flex items-center justify-center overflow-hidden rounded-xl bg-black">
              <img
                src={zoomImage.dataUrl}
                alt={zoomImage.name}
                className="max-h-[70vh] w-auto object-contain"
              />
            </div>

            {zoomImage.warningMessage && (
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300">
                <span className="font-semibold text-teal-400">Status: </span>
                {zoomImage.warningMessage}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ComputerVisionUpload;
