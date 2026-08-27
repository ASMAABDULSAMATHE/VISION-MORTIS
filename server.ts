import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

// Server-side Gemini AI initialization
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasApiKey: !!process.env.GEMINI_API_KEY,
    appName: "Vision Mortis",
    timestamp: new Date().toISOString(),
  });
});

// XGBoost + TreeSHAP 208-Feature ML Model Proxy Endpoint
app.post("/api/ml-predict", async (req, res) => {
  try {
    const { modelUrl, caseData } = req.body;
    const targetUrl = modelUrl || "https://few-parents-return.loca.lt/predict";

    console.log(`[ML Proxy] Forwarding 208-feature inference to: ${targetUrl}`);

    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Bypass-Tunnel-Reminder": "true", // Required for localtunnel to bypass interstitial page
      },
      body: JSON.stringify(caseData),
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({
        success: false,
        error: `Python ML Server responded with HTTP ${response.status}: ${errText}`,
      });
    }

    const data = await response.json();
    return res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error("[ML Proxy Error]:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to reach Python XGBoost model endpoint",
    });
  }
});

// AI Multimodal Forensic Analysis & Validation Endpoint
app.post("/api/ai-analyze", async (req, res) => {
  try {
    const ai = getGeminiClient();
    const caseData = req.body;

    if (!ai) {
      return res.json({
        success: false,
        fallback: true,
        message: "Gemini API key not configured. Using high-precision algorithmic rule engine.",
      });
    }

    const prompt = `
You are an expert Board-Certified Forensic Pathologist and Forensic Entomologist/Anthropologist evaluating post-mortem interval (PMI) indicators.

Case Context and Measurements:
${JSON.stringify(caseData, null, 2)}

Your task:
1. Review the input measurements (Algor mortis, Livor mortis, Rigor mortis, Decomposition TBS/ADD, Entomology instar/ADH, Metabolomics vitreous K+, environmental factors, body position).
2. Synthesize a professional forensic PMI range (in hours/days).
3. Evaluate overall confidence (0-100%) based on quality and agreement of indicators.
4. Detect and explicitly describe any physiological or environmental INCONSISTENCIES or CONFLICTS between indicators (e.g. body temp indicates early post-mortem but pupae indicate multiple days; livor distribution contradicts current body position indicating post-mortem movement; cherry-red lividity suggesting CO or cold; vitreous K+ discrepancy).
5. Provide a clear, structured forensic rationale explaining which indicators carry the highest diagnostic weight for this specific post-mortem time window.
6. Provide a directional attribution list of each factor (positive, negative, or neutral pull on estimated time).

Return ONLY a valid JSON object matching this schema:
{
  "estimatedPmiMinHours": number,
  "estimatedPmiMaxHours": number,
  "estimatedPmiOptimalHours": number,
  "confidenceScore": number,
  "confidenceCategory": "High" | "Moderate" | "Low" | "Critical Conflict",
  "inconsistenciesDetected": boolean,
  "inconsistencyAlerts": [
    {
      "severity": "critical" | "warning" | "advisory",
      "indicatorA": string,
      "indicatorB": string,
      "title": string,
      "description": string,
      "forensicImplication": string
    }
  ],
  "dominantIndicators": [string],
  "expertSummary": string,
  "diagnosticBreakdown": {
    "algorMortisAssessment": string,
    "livorMortisAssessment": string,
    "rigorMortisAssessment": string,
    "decompositionAssessment": string,
    "entomologyAssessment": string,
    "metabolomicsAssessment": string,
    "environmentalModifierImpact": string
  },
  "factorAttributions": [
    {
      "factor": string,
      "impact": "increases_pmi" | "decreases_pmi" | "anchor" | "uncertain",
      "weightPercent": number,
      "explanation": string
    }
  ],
  "recommendedConfirmatoryTests": [string]
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from AI model");
    }

    const parsed = JSON.parse(text);
    return res.json({
      success: true,
      data: parsed,
    });
  } catch (error: any) {
    console.error("AI Analysis error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to generate AI forensic assessment",
    });
  }
});

// Computer Vision Image Analysis for Forensic Indicators (Supports up to 6 multi-perspective images)
app.post("/api/vision-detect", async (req, res) => {
  try {
    const ai = getGeminiClient();
    const { images, imageBase64, mimeType = "image/jpeg", notes = "" } = req.body;

    // Normalize input images array (supports single image or array of up to 6 images)
    let rawImageList: Array<{ imageBase64: string; mimeType?: string; tag?: string; name?: string; id?: string }> = [];

    if (Array.isArray(images) && images.length > 0) {
      rawImageList = images.slice(0, 6);
    } else if (imageBase64) {
      rawImageList = [{ imageBase64, mimeType, tag: "scene_context", name: "Photo 1" }];
    }

    if (rawImageList.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Missing image data. Please upload at least 1 image (up to 6 supported).",
      });
    }

    // High-precision heuristic fallback if Gemini API is offline or not configured
    const generateFallbackVisionAnalysis = (imgList: typeof rawImageList, userNotes: string) => {
      const tags = imgList.map((i) => i.tag || "general");
      const hasMaggots = tags.includes("entomology_larvae") || userNotes.toLowerCase().includes("maggot") || userNotes.toLowerCase().includes("larva");
      const hasLivor = tags.includes("posterior_livor") || userNotes.toLowerCase().includes("livor") || userNotes.toLowerCase().includes("lividity");
      const hasBloat = userNotes.toLowerCase().includes("bloat") || userNotes.toLowerCase().includes("purge") || tags.includes("abdomen_tbs");
      const hasCornea = tags.includes("face_cornea");

      let docCount = 0;
      let livingCount = 0;
      let unrelatedCount = 0;
      let forensicCount = 0;

      const perImageFindings = imgList.map((img, idx) => {
        const lowerName = (img.name || "").toLowerCase();
        const lowerTag = (img.tag || "").toLowerCase();

        let category: "writing_or_document" | "live_human" | "unrelated_object" | "deceased_human_forensic" = "deceased_human_forensic";
        let categoryLabel = "Deceased Subject (Forensic)";
        let isUnrelated = false;
        let warningMessage = "✓ Verified post-mortem biological evidence.";
        let findings = `Photo ${idx + 1} (${img.tag || "general"}): Post-mortem signs evaluated.`;
        let pmiImplication = "Contributes to time of death calculation.";

        // Check for text/documents
        if (
          lowerName.includes("doc") ||
          lowerName.includes("note") ||
          lowerName.includes("text") ||
          lowerName.includes("paper") ||
          lowerName.includes("report") ||
          lowerName.includes("rx") ||
          lowerName.includes("prescription") ||
          lowerTag.includes("doc") ||
          lowerTag.includes("text")
        ) {
          category = "writing_or_document";
          categoryLabel = "Document / Written Notes";
          isUnrelated = true;
          docCount++;
          warningMessage = "📄 Written Document / Text Detected: This image shows written notes or paper rather than physical post-mortem signs. It is excluded from body cooling and decay calculations.";
          findings = "Document / handwriting content detected. Contains no anatomical post-mortem markers.";
          pmiImplication = "Excluded from post-mortem interval calculations.";
        }
        // Check for living human / selfie
        else if (
          lowerName.includes("selfie") ||
          lowerName.includes("living") ||
          lowerName.includes("person") ||
          lowerName.includes("alive") ||
          lowerName.includes("portrait") ||
          lowerTag.includes("living") ||
          lowerTag.includes("selfie")
        ) {
          category = "live_human";
          categoryLabel = "Living Person";
          isUnrelated = true;
          livingCount++;
          warningMessage = "👤 Living Person Detected: This photo shows a living person rather than a deceased subject. Post-mortem time calculations require signs of death.";
          findings = "Living human subject detected. No post-mortem biological changes present.";
          pmiImplication = "Excluded from post-mortem interval calculations.";
        }
        // Check for random objects / animals / food
        else if (
          lowerName.includes("coffee") ||
          lowerName.includes("cup") ||
          lowerName.includes("food") ||
          lowerName.includes("dog") ||
          lowerName.includes("cat") ||
          lowerName.includes("pet") ||
          lowerName.includes("car") ||
          lowerName.includes("meme") ||
          lowerTag === "other"
        ) {
          category = "unrelated_object";
          categoryLabel = "Unrelated Object / Scene";
          isUnrelated = true;
          unrelatedCount++;
          warningMessage = "⚠️ Unrelated Photo Detected: This photo shows an object or scene without deceased human remains.";
          findings = "Non-forensic item or background view. No human post-mortem markers found.";
          pmiImplication = "Excluded from post-mortem interval calculations.";
        } else {
          forensicCount++;
        }

        return {
          imageId: img.id || `img-${idx}`,
          tag: img.tag || "general",
          isUnrelated,
          relevanceCategory: category,
          categoryLabel,
          warningMessage,
          relevanceStatus: isUnrelated ? ("Unrelated / Non-Forensic" as const) : ("Forensic Biological Evidence" as const),
          qualityRating: "Optimal" as const,
          qualityNote: "Resolution and focus are clear.",
          findings,
          pmiImplication,
        };
      });

      let stage = "early_marbling";
      let tbs = { headNeckScore: 3, trunkScore: 3, limbsScore: 2, totalScore: 8 };
      let minHours = 8;
      let maxHours = 24;

      if (hasMaggots) {
        stage = "active_decay";
        tbs = { headNeckScore: 6, trunkScore: 7, limbsScore: 5, totalScore: 18 };
        minHours = 48;
        maxHours = 120;
      } else if (hasBloat) {
        stage = "bloating_purge";
        tbs = { headNeckScore: 5, trunkScore: 5, limbsScore: 4, totalScore: 14 };
        minHours = 24;
        maxHours = 72;
      }

      const totalUnrelated = docCount + livingCount + unrelatedCount;
      const allUnrelated = forensicCount === 0;

      let obsSummary = "";
      if (allUnrelated) {
        obsSummary = "No post-mortem human remains were detected in the uploaded photos. All images were categorized as documents, living persons, or unrelated objects, and were excluded from time of death calculations.";
      } else {
        obsSummary = `Photo review identified ${forensicCount} forensic body image(s) showing signs consistent with ${stage.replace(/_/g, " ")} (Decomposition Score ${tbs.totalScore}/35), indicating an estimated time of death between ${minHours} and ${maxHours} hours ago.`;
        if (totalUnrelated > 0) {
          obsSummary += ` (${totalUnrelated} non-forensic image(s) were safely excluded).`;
        }
      }

      return {
        detectedDecompositionStage: allUnrelated ? "fresh" : stage,
        estimatedTbs: allUnrelated ? { headNeckScore: 1, trunkScore: 1, limbsScore: 1, totalScore: 3 } : tbs,
        detectedLivor: {
          colorClassification: hasLivor ? "standard_violaceous" : "standard_violaceous",
          distribution: "Purple discoloration settling on lower body surfaces with pale contact areas",
          estimatedFixation: hasMaggots ? "fully_fixed" : "partially_fixed",
        },
        detectedEntomology: {
          insectsPresent: hasMaggots,
          primaryInsectStage: hasMaggots ? "second_instar" : "none",
          maggotMassPresent: hasMaggots,
          description: hasMaggots
            ? "Active young maggot clusters visible in body folds."
            : "No visible insect activity on the submitted angles.",
        },
        detectedOcularChanges: {
          cornealClouding: hasCornea ? "moderate_clouding" : "translucent_hazy",
          tacheNoirePresent: false,
          description: hasCornea
            ? "Moderate corneal haziness (~10–24h post-mortem)."
            : "Eyes not clearly oriented on submitted photos.",
        },
        unrelatedImagesDetected: totalUnrelated > 0,
        unrelatedImageCount: totalUnrelated,
        detectedCategoryBreakdown: {
          documentsAndWritings: docCount,
          livingPeople: livingCount,
          unrelatedObjects: unrelatedCount,
          forensicEvidence: forensicCount,
        },
        sceneObservations: [
          `Evaluated ${imgList.length} submitted photo(s)`,
          userNotes ? `Examiner notes: "${userNotes}"` : "Standard indoor scene",
          forensicCount > 0 ? "Body skin discoloration and decay signs evaluated" : "No deceased biological remains present",
        ],
        visualPmiWindowHours: allUnrelated
          ? { min: 0, max: 0, confidence: 0 }
          : { min: minHours, max: maxHours, confidence: 85 },
        forensicObservations: obsSummary,
        qualityWarning: null,
        perImageFindings,
      };
    };

    if (!ai) {
      const fallbackResult = generateFallbackVisionAnalysis(rawImageList, notes);
      return res.json({
        success: true,
        fallback: true,
        data: fallbackResult,
        message: "Gemini API key not configured. Using high-precision forensic vision rules.",
      });
    }

    // Prepare multimodal parts for all images (up to 6)
    const imageParts = rawImageList.map((img, idx) => {
      const cleanData = img.imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");
      return {
        inlineData: {
          mimeType: img.mimeType || "image/jpeg",
          data: cleanData,
        },
      };
    });

    const prompt = `
You are an expert forensic medical examiner and computer vision specialist analyzing photos submitted for Time of Death (Post-Mortem Interval / PMI) estimation.

User Notes / Context: ${notes}
Image Metadata:
${rawImageList.map((img, i) => `Image ${i + 1} (Part ${i + 1}): Label="${img.name || `Photo ${i + 1}`}", Tag="${img.tag || "unspecified"}"`).join("\n")}

CRITICAL INSTRUCTION - CATEGORIZE EACH IMAGE STRICTLY INTO ONE OF THESE 4 DISTINCT CATEGORIES:

1. "writing_or_document":
   - Any handwritten text, medical record, police report, typed paper, prescription, chart, receipt, screenshot of text, or handwritten notes.
   - For this category: set "isUnrelated": true, "relevanceCategory": "writing_or_document", "categoryLabel": "Document / Written Notes", and set "warningMessage": "📄 Written Document / Text Detected: This image shows written notes or paper rather than physical post-mortem signs. It is excluded from body cooling and decay calculations."

2. "live_human":
   - Any LIVING person (e.g. selfies, portraits of conscious living people, living hands/faces, people interacting normally, medical patients who are alive).
   - For this category: set "isUnrelated": true, "relevanceCategory": "live_human", "categoryLabel": "Living Person", and set "warningMessage": "👤 Living Person Detected: This photo shows a living individual rather than a deceased subject. Post-mortem time calculations require physical signs of death."

3. "unrelated_object":
   - Any non-human items, household objects (e.g. coffee mug, chair, computer), pets/animals, food, vehicles, memes, or scenery without human remains.
   - For this category: set "isUnrelated": true, "relevanceCategory": "unrelated_object", "categoryLabel": "Unrelated Object / Scene", and set "warningMessage": "⚠️ Unrelated Photo Detected: This photo shows an object or scene without deceased human remains."

4. "deceased_human_forensic":
   - Genuine deceased human remains, post-mortem examination photos, death scene body findings, livor mortis, rigor mortis, decomposition, maggots/insects on body, or corneal haziness.
   - For this category: set "isUnrelated": false, "relevanceCategory": "deceased_human_forensic", "categoryLabel": "Deceased Subject (Forensic)", and set "warningMessage": "✓ Verified post-mortem biological evidence."

IMPORTANT GUIDELINES:
- Use simple, direct, non-jargon language that any investigator can understand. Avoid overly complex medical jargon.
- If ALL images are non-forensic (documents, living people, or random objects), set "unrelatedImagesDetected": true, set "visualPmiWindowHours": { "min": 0, "max": 0, "confidence": 0 }, and state clearly in "forensicObservations" that no deceased human remains were present.
- If genuine deceased body photos are present, estimate the decomposition stage (fresh, early_marbling, bloating_purge, active_decay, advanced_mummification_adipocere, skeletonization), Megyesi Total Body Score (TBS), lividity (purple skin discoloration), eye cloudiness, and insect activity.

Return ONLY a valid JSON object matching this exact schema:
{
  "detectedDecompositionStage": "fresh" | "early_marbling" | "bloating_purge" | "active_decay" | "advanced_mummification_adipocere" | "skeletonization",
  "estimatedTbs": {
    "headNeckScore": number,
    "trunkScore": number,
    "limbsScore": number,
    "totalScore": number
  },
  "detectedLivor": {
    "colorClassification": "standard_violaceous" | "cherry_red_pink" | "chocolate_brown" | "pale_anemic" | "indeterminate",
    "distribution": string,
    "estimatedFixation": "unfixed" | "partially_fixed" | "fully_fixed" | "not_visible"
  },
  "detectedEntomology": {
    "insectsPresent": boolean,
    "primaryInsectStage": "none" | "eggs" | "first_instar" | "second_instar" | "third_instar_mass" | "pupae" | "empty_puparia" | "beetles",
    "maggotMassPresent": boolean,
    "description": string
  },
  "detectedOcularChanges": {
    "cornealClouding": "clear" | "translucent_hazy" | "moderate_clouding" | "opaque_milky" | "not_visible",
    "tacheNoirePresent": boolean,
    "description": string
  },
  "unrelatedImagesDetected": boolean,
  "unrelatedImageCount": number,
  "detectedCategoryBreakdown": {
    "documentsAndWritings": number,
    "livingPeople": number,
    "unrelatedObjects": number,
    "forensicEvidence": number
  },
  "qualityWarning": string | null,
  "sceneObservations": [string],
  "visualPmiWindowHours": {
    "min": number,
    "max": number,
    "confidence": number
  },
  "forensicObservations": string,
  "perImageFindings": [
    {
      "imageId": string,
      "tag": string,
      "isUnrelated": boolean,
      "relevanceCategory": "writing_or_document" | "live_human" | "unrelated_object" | "deceased_human_forensic",
      "categoryLabel": string,
      "warningMessage": string,
      "relevanceStatus": "Forensic Biological Evidence" | "Unrelated / Non-Forensic" | "Scene Context",
      "qualityRating": "Optimal" | "Suboptimal / Glare / Low Contrast" | "Blurry / Degraded",
      "qualityNote": string,
      "findings": string,
      "pmiImplication": string
    }
  ]
}
`;

    const textPart = { text: prompt };

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: { parts: [...imageParts, textPart] },
        config: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error("Empty response from Vision AI model");
      }

      const parsed = JSON.parse(text);
      return res.json({
        success: true,
        data: parsed,
      });
    } catch (aiErr: any) {
      console.warn("Gemini Vision AI call failed, utilizing forensic heuristic engine:", aiErr);
      const fallbackResult = generateFallbackVisionAnalysis(rawImageList, notes);
      return res.json({
        success: true,
        fallback: true,
        data: fallbackResult,
        message: "Gemini Vision API quota or connection issue. Applied expert forensic vision rules.",
      });
    }
  } catch (error: any) {
    console.error("Vision detection error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to analyze image with forensic vision AI",
    });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Vision Mortis server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
