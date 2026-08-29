# VisionMortis — Protocol One

## AI-Assisted Forensic Decision Support for Post-Mortem Interval Estimation

VisionMortis is a research prototype designed to support **post-mortem interval (PMI) estimation** by integrating multiple biological, environmental, visual, entomological, and metabolomic evidence streams.

> **Research Prototype:** VisionMortis is intended for research and educational purposes and does not replace professional forensic examination or expert judgment.

---

## Overview

Estimating the time since death is challenging because post-mortem changes are influenced by multiple biological and environmental factors. Individual indicators may provide useful information at different stages and may sometimes produce conflicting estimates.

VisionMortis explores a **multimodal and uncertainty-aware approach** that combines available evidence and highlights potential inconsistencies.

## Key Features

- Computer-vision analysis of post-mortem images
- Algor, livor, and rigor mortis assessment
- Decomposition analysis
- Entomology and metabolomics integration
- Environmental and contextual variables
- XGBoost-based PMI estimation
- SHAP-based model explainability
- Evidence consistency and conflict detection
- PMI range and confidence information
- Structured forensic-style reporting

## Workflow

```text
Case Input
    ↓
Visual & Forensic Evidence
    ↓
Computer Vision
    ↓
Preprocessing
    ↓
XGBoost PMI Estimation
    ↓
SHAP Explainability
    ↓
Consistency Analysis
    ↓
PMI Range + Confidence + Conflict Warning
    ↓
Report
```

## Dataset & Model

The current prototype uses literature-informed synthetic data for development and model training.

The model is evaluated using held-out synthetic data. These results demonstrate the potential of the approach but do not represent validation against real forensic ground truth.

## Limitations

VisionMortis is a research prototype and has not been sufficiently validated using real forensic cases.

It is intended to support expert judgment and must not be used as a standalone forensic method or as a replacement for qualified forensic professionals.

## Future Development

Future work may include:

- Validation using real forensic datasets
- Larger and more diverse datasets
- Additional validated PMI indicators
- Improved uncertainty calibration
- Expanded computer-vision capabilities
- iPad and forensic-tool integration

## Authors

**Protocol One — 2026**
<p>Developed as part of an internship at the International Center for Forensic Sciences (ICFS), Dubai Police.</p>

- Ghaya AlMatboona
- Ayesha Moazzam
- Asma Abdul Samathe
- Fathima Shafriya

## Repository

VisionMortis — Protocol One
[https://github.com/ASMAABDULSAMATHE/VISION-MORTIS]

## Originality & Attribution

VisionMortis and its overall concept, workflow, and original implementation are the work of Protocol One.

Please do not copy, reproduce, or present the core idea, concept, or implementation as your own. If you reference or build upon this project, please provide proper attribution to Protocol One and link to this repository.

## Disclaimer

VisionMortis is a research prototype for educational and experimental purposes. It does not provide definitive time-of-death determinations and should not replace professional forensic examination, validated forensic methodologies, or expert judgment.
