# VisionMortis — Protocol One
## Master Multimodal Dataset — Reference Documentation

> Compiled from `VisionMortis_master_multimodal_workbook.xlsx` — Executive Dashboard, Data Dictionary, Data Provenance, and Validation & QC Metrics sheets. Case-level records are provided separately as [`visionmortis_master_multimodal.csv`](../data/raw/visionmortis_master_multimodal.csv).

---

## 1. Overview

VisionMortis is a research prototype supporting post-mortem interval (PMI) estimation by integrating biological, environmental, visual, entomological, and metabolomic evidence streams into a single multimodal dataset.

**Governance status:** Prototype dataset; literature/data-informed synthetic. **Not validated against real forensic ground truth.**

### 1.1 Dataset Summary

| Metric | Value |
|---|---|
| Total Synthetic Cases | 500 |
| Multimodal Modalities | 9 (Algor, Livor, Rigor, Decomposition, Entomology, Metabolomics, Environmental, Movement/Context, CV) |
| Total Master Features (columns) | 72 |
| ML-Ready Encoded Features (columns) | 112 |
| Incomplete Case Cohort | 198 cases (39.6%) — deliberately missing modality data for robustness testing |
| Forensic Conflict Cohort | 55 cases (11.0%) — deliberately contradictory evidence for discordance testing |

> **Note:** figures above reflect the 500-case dataset as verified directly from the Master Multimodal Data sheet. The workbook's Executive Dashboard / Validation & QC Metrics sheets contain some legacy figures (e.g. a *"Total Cases Generated: 3000"* entry, and modality completeness rates computed against a different case count) inherited from an earlier data-generation run; these have **not** been carried into this document.

## 2. Modality Integration & Statistical Profile

| Modality | Key Variables | Completeness | Forensic Foundation | Status |
|---|---|---|---|---|
| 1. Algor Mortis | `body_temperature_C`, `algor_observation_confidence` | 90.8% | Henssge multi-exponential cooling model | Fully Integrated |
| 2. Livor Mortis | `livor_stage`, `livor_observation_confidence` | 93.6% | Hypostasis fixation dynamics & color transitions | Fully Integrated |
| 3. Rigor Mortis | `rigor_stage`, `rigor_observation_confidence` | 91.8% | Nysten's law & thermal acceleration kinetics | Fully Integrated |
| 4. Decomposition | 19 morphological binary indicators, score, stage | 100.0% | geoFOR & Megyesi Total Body Score (TBS) | Fully Integrated |
| 5. Entomology | `insect_present`, `insect_species`, `insect_stage` | 100.0% | OJP taxa reference & ADD developmental succession | Fully Integrated |
| 6. Metabolomics | 11 metabolites (hypoxanthine, choline, cadaverine, etc.) | 88.2% | Empirical post-mortem biomarker kinetic distributions | Embedded in Master CSV |
| 7. Environmental Context | `ambient_temp`, `humidity`, `body_mass`, `clothing`, `site` | 100.0% | Scene microclimate & deposition taphonomy | Fully Integrated |
| 8. Movement / Context | `body_movement_position_change`, `movement_conf` | 100.0% | Scene manipulation context (Non-clock evidence) | Fully Integrated |
| 9. CV Structured Outputs | `cv_decomposition`, `cv_livor`, `cv_entomology`, `cv_movement` | 90.4% | Deep neural network multi-image prediction placeholders | Fully Integrated |

> Completeness rates above are recomputed directly from the 500-case Master Multimodal Data sheet (percentage of cases with a non-zero observation confidence, or the relevant availability flag set to 1).

## 3. Validation & QC Metrics

| Metric Description | Validation Value / Status |
|---|---|
| Total Cases Generated | 500 |
| Total Features in Master CSV | 72 |
| Total Columns in ML-Ready CSV | 112 |
| PMI Minimum (hours) | 0.70 |
| PMI Maximum (hours) | 1179.79 |
| PMI Median (hours) | 76.24 |
| Ambient Temperature Mean (°C) | 19.38 |
| Relative Humidity Mean (%) | 61.56 |
| Body Mass Mean (kg) | 74.12 |
| Incomplete / Missing Modality Cases | 198 |
| Incomplete Cases Percentage (%) | 39.60% |
| Conflicting Synthetic Cases | 55 |
| Conflicting Cases Percentage (%) | 11.00% |
| Metabolomics Fully Available Cases | 441 |
| Metabolomics Fully Available Percentage (%) | 88.20% |
| Computer Vision Observations Available (%) | 90.40% |

## 4. Data Dictionary

Full variable-level reference for the 72-column Master Multimodal Data table. All variables are synthetic (literature/data-informed); none constitute validated forensic ground truth.

> Every variable's `real_or_synthetic` value is `synthetic` — omitted below as a repeated column.

| Variable | Description | Type | Unit | Allowed Values / Range | Source / Inspiration | Role | Limitations |
|---|---|---|---|---|---|---|---|
| `case_id` | Unique identifier for synthetic case | string | N/A | VM-SYN-xxxxx | Project identifier convention | ID / metadata | Synthetic identifier |
| `synthetic_pmi_hours` | Latent post-mortem interval (time since death) | float | hours | 0.5 to 1200.0 | Forensic pathology literature | Target / Latent label | Latent ground truth for benchmarking only |
| `ambient_temperature_C` | Ambient environmental temperature at deposition scene | float | °C | -5.0 to 42.0 | Climatological and forensic scene data | Feature (Environment) | Static average scene temperature |
| `relative_humidity_percent` | Environmental relative humidity percentage | float | % | 15.0 to 98.0 | Climatological reference data | Feature (Environment) | Static average scene humidity |
| `body_mass_kg` | Body mass / weight of the deceased | float | kg | 40.0 to 140.0 | Anthropometric forensic references | Feature (Anthropometry) | Thermal inertia modifier |
| `clothing` | Clothing and coverage level | categorical | N/A | unclothed, light, heavy, insulated, unknown | Henssge nomogram cooling categories | Feature (Context) | Categorical thermal resistance |
| `deposition_site` | Location and environment of body placement | categorical | N/A | indoor, ground_surface, shallow_burial, deep_burial, water, vehicle, unknown | Forensic taphonomy literature (geoFOR) | Feature (Context) | Categorical deposition scenario |
| `body_temperature_C` | Rectal/core body temperature | float | °C | -10.0 to 41.0 | Henssge double exponential cooling model | Feature (Algor Mortis) | Uncertainty plateau after reaching ambient |
| `algor_observation_confidence` | Algor mortis measurement confidence score | float | 0-1 score | 0.0 to 1.0 | Expert forensic certainty modeling | Weight / Modality Confidence | Subjective confidence metric |
| `livor_stage` | Hypostasis / livor mortis staging | categorical | N/A | Not detectable, Early / patchy, Confluent / blanches, Partially fixed, Fully fixed, Unobservable | Forensic pathology physical examination | Feature (Livor Mortis) | Overlapping temporal transitions |
| `rigor_stage` | Post-mortem muscle stiffening staging | categorical | N/A | Absent, Beginning, Partial, Complete, Passing off, Resolved, Unobservable | Nysten's law & muscle rigor literature | Feature (Rigor Mortis) | Temperature dependent speed |
| `decomposition_stage` | Overall gross morphological decomposition stage | categorical | N/A | Fresh, Early decomposition, Bloat, Active decay, Advanced decay, Skeletonization | Galloway / Megyesi Total Body Score staging | Feature (Decomposition) | Continuous process discretized |
| `decomposition_observation_score` | Total body decomposition morphological score | float | score (TBS) | 1.0 to 40.0 | Megyesi et al. Total Body Score (TBS) | Feature (Decomposition) | Modified synthetic scale |
| `insect_present` | Presence of necrophagous insects on body | binary | 0/1 | 0, 1 | Forensic entomology field protocols | Feature (Entomology) | Seasonal/accessibility dependent |
| `insect_species` | Dominant colonizing insect species | categorical | N/A | Calliphoridae / Sarcophagidae / Dermestidae taxa | OJP / Forensic Entomology Taxa References | Feature (Entomology) | Dominant primary colonizer only |
| `insect_developmental_stage` | Oldest developmental instar / life stage present | categorical | N/A | Eggs to Late succession | Thermal summation & ADD instar models | Feature (Entomology) | Minimum PMI indicator |
| `hypoxanthine_umol_L` | Vitreous humor / blood hypoxanthine concentration | float | µmol/L | 5.0 to 350.0 | Post-mortem biochemical & metabolomic literature | Feature (Metabolomics) | Synthetic biochemical proxy |
| `lactic_acid_mmol_L` | Anaerobic post-mortem lactate concentration | float | mmol/L | 0.5 to 35.0 | Biochemical post-mortem kinetics | Feature (Metabolomics) | Rapid early saturation |
| `choline_umol_L` | Membrane phospholipid autolysis marker | float | µmol/L | 5.0 to 400.0 | Forensic metabolomics literature | Feature (Metabolomics) | Synthetic biochemical proxy |
| `putrescine_nmol_g` | Putrefaction biogenic polyamine concentration | float | nmol/g | 0.1 to 8500.0 | Post-mortem cadaveric amine kinetics | Feature (Metabolomics) | High exponential variance |
| `cadaverine_nmol_g` | Lysine decarboxylation amine concentration | float | nmol/g | 0.1 to 9500.0 | Forensic decomposition biochemistry | Feature (Metabolomics) | Microbiome/temp dependent |
| `body_movement_position_change` | Forensic evidence of body relocation/manipulation | categorical | N/A | Not detected, Possible, Detected, Unknown | Scene investigation & livor pattern discordance | Contextual Evidence (Non-clock) | Contextual modifier only |
| `cv_available` | Computer vision structured predictions available | binary | 0/1 | 0, 1 | VisionMortis pipeline architectural design | CV Modality Availability | Placeholder for neural CV inputs |
| `missing_indicator_count` | Number of modalities missing in case observation | integer | count | 0 to 6 | Pipeline robust test criteria | Quality metric / Filter | Synthetic missingness injection |
| `synthetic_conflict_case` | Flag indicating deliberate contradictory evidence | binary | 0/1 | 0, 1 | Real-world forensic discordance simulation | Stress testing / Robustness evaluation | Artificially induced discordance |
| `data_origin` | Provenance flag for dataset generation source | string | N/A | literature/data-informed synthetic | VISIONMORTIS project governance | Metadata / Provenance | Fixed provenance string |
| `validation_status` | Regulatory and forensic validation disclaimer | string | N/A | Prototype dataset; not validated forensic ground truth | Ethical and scientific disclosure requirement | Metadata / Governance | Not ground truth |

## 5. Data Provenance

Scientific literature underpinning each modality's synthetic modeling approach. All modalities are explicitly marked as not validated against real forensic ground truth.

| Modality | Data Source Type | Scientific Reference | Modeling Method | Forensic Ground Truth |
|---|---|---|---|---|
| Algor Mortis | Literature-informed synthetic | Henssge C. (1988) Death time estimation using body cooling. Int J Legal Med. | Multi-exponential cooling with body mass and clothing insulation coefficients | **No** |
| Livor Mortis | Literature-informed synthetic | Mallach HJ. (1964) Zur Frage der Todeszeitbestimmung nach der Leichenblasse und den Totenflecken. | Probabilistic ordinal transition model with overlapping temporal windows | **No** |
| Rigor Mortis | Literature-informed synthetic | Nysten P. / Krompecher T. (1981) Experimental evaluation of rigor mortis progression. | Temperature-accelerated kinetic staging (onset, peak, resolution) | **No** |
| Decomposition Morphology | geoFOR & Galloway inspired synthetic | Megyesi MS, Nawrocki SP, Haskell NH. (2005) Using accumulated degree-days to estimate PMI. JFS. | Accumulated Degree Day (ADD) simulation with 19 distinct morphological criteria | **No** |
| Forensic Entomology | OJP / Literature-informed synthetic | Catts EP, Goff ML. (1992) Forensic entomology in criminal investigations. Annu Rev Entomol. | Species-specific thermal development thresholds (Calliphoridae, Sarcophagidae, Dermestidae) | **No** |
| Metabolomics | Literature/data-informed synthetic | Donaldson AE, Lamont IL. (2013) Metabolomics for postmortem interval estimation. J Forensic Sci. | Multivariate kinetic sampling with non-linear post-mortem biomarker dynamics (hypoxanthine, amines, etc.) | **No** |
| Body Movement & Context | Forensic pathology context modeling | Spitz and Fisher's Medicolegal Investigation of Death (5th Edition). | Categorical contextual evidence generation uncoupled from direct clock formulas | **No** |
| CV Structured Outputs | Synthetic structured observations | VisionMortis pipeline architectural specifications (multimodal fusion testbeds) | Simulated multi-image deep neural network output distributions with classification uncertainty | **No** |

## 6. Governance & Disclaimer

VisionMortis is a research prototype for educational and experimental purposes. All case data in this dataset is literature/data-informed **synthetic** data — it does not represent real forensic cases and has not been validated against real forensic ground truth.

This dataset does not provide definitive time-of-death determinations and should not be used as a standalone forensic method or as a replacement for validated forensic methodologies or expert judgment.

Developed as part of an internship at the **International Center for Forensic Sciences (ICFS), Dubai Police** — Protocol One, 2026 (Ghaya, Ayesha, Asma, Fathima).
