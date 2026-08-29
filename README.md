Yes — here is the **full copy-paste HTML version** of the README, including the sections, formatting, architecture, results, limitations, prototype, and project information.

````html
<h1 align="center">VisionMortis</h1>

<p align="center">
  <strong>AI Decision-Support Tool for Post-Mortem Interval Estimation</strong>
</p>

<p align="center">
  <strong>Protocol One</strong>
</p>

<p align="center">
  <em>Combining multimodal forensic evidence for preliminary and explainable PMI assessment</em>
</p>

<p align="center">
  <img src="assets/visionmortis-logo.png" alt="VisionMortis Logo" width="180">
</p>

---

## Overview

VisionMortis is a **proof-of-concept AI decision-support tool** designed to assist forensic professionals with the **preliminary estimation of the post-mortem interval (PMI)**.

The system combines multiple forensic indicators, environmental factors, entomological findings, metabolite information, and image-based observations to produce a structured and explainable PMI assessment.

Rather than relying on a single forensic indicator, VisionMortis is designed to integrate multiple sources of evidence, identify potential inconsistencies between indicators, and provide an explanation of the factors influencing the prediction.

> **VisionMortis is intended as a decision-support and educational prototype and is not designed to replace forensic expert judgment.**

---

## Objectives

The project aims to:

- Combine multiple forensic indicators for PMI estimation
- Integrate structured and image-based forensic information
- Generate a preliminary PMI range
- Provide a model-derived confidence score
- Identify potentially conflicting forensic evidence
- Provide explainability through feature contribution analysis
- Generate a structured forensic assessment report

---

## Key Features

<ul>
  <li><strong>Multimodal Forensic Assessment</strong> — combines multiple PMI-related evidence sources</li>
  <li><strong>Body Temperature Analysis</strong> — incorporates temperature-related PMI information</li>
  <li><strong>Livor Mortis Assessment</strong> — incorporates lividity observations</li>
  <li><strong>Rigor Mortis Assessment</strong> — incorporates rigor observations</li>
  <li><strong>Decomposition Analysis</strong> — considers visible decomposition indicators</li>
  <li><strong>Entomology Analysis</strong> — incorporates insect species findings</li>
  <li><strong>Metabolite Information</strong> — incorporates selected metabolite observations</li>
  <li><strong>Environmental Factors</strong> — considers ambient temperature, humidity, clothing, and body mass</li>
  <li><strong>Computer Vision</strong> — extracts relevant observations from post-mortem images</li>
  <li><strong>XGBoost PMI Regression</strong> — predicts PMI using structured features</li>
  <li><strong>Consistency Analysis</strong> — identifies potentially conflicting indicators</li>
  <li><strong>Explainability</strong> — identifies influential features contributing to the prediction</li>
  <li><strong>Forensic Reporting</strong> — generates a structured case report containing the assessment and examiner notes</li>
</ul>

---

## System Inputs

VisionMortis is designed to incorporate several categories of information.

### Forensic Indicators

- Body Temperature
- Livor Mortis
- Rigor Mortis
- Decomposition Stage
- Entomology Findings
- Metabolites

### Environmental Factors

- Ambient Temperature
- Humidity
- Body Mass
- Clothing

### Image-Based Information

Post-mortem images can be provided for computer vision-based analysis.

The image analysis is intended to identify visible forensic characteristics that can contribute to the overall assessment.

---

## Entomology

The prototype provides predefined options for commonly represented insect species:

- <i>Calliphora vicina</i>
- <i>Phormia regina</i>
- <i>Sarcophaga bullata</i>
- <i>Lucilia sericata</i>
- <i>Chrysomya rufifacies</i>
- <i>Hydrotaea leucostoma</i>
- <i>Dermestes maculatus</i>
- <i>Necrobia rufipes</i>

Entomological findings are treated as one component of the overall evidence rather than as a standalone PMI determination.

---

## Metabolites

The prototype can incorporate selected metabolite information, including:

- Hypoxanthine
- Lactic Acid
- Choline
- Taurine
- Glycerol
- Succinic Acid
- Formic Acid
- Uric Acid
- Creatine
- Putrescine
- Cadaverine

Metabolite information is intended to provide an additional biochemical evidence stream for future multimodal PMI estimation.

---

## Dataset

The current PMI prediction model was developed using a **synthetic, literature-informed dataset**.

### Dataset Characteristics

- **Total Cases:** 500 unique synthetic cases
- **Format:** CSV
- **Target Variable:** PMI in hours
- **Data Type:** Synthetic
- **Purpose:** Proof-of-concept model development and evaluation

The dataset represents combinations of forensic and environmental variables relevant to PMI estimation.

> **Important:** The dataset is synthetic and should not be considered validated forensic ground truth.

---

## Machine Learning Model

The structured PMI prediction component uses an **XGBoost Regressor**.

The model was independently trained as part of the VisionMortis project and subsequently prepared for integration with the web-based prototype.

### Model Configuration

```text
Model: XGBRegressor

n_estimators     = 300
max_depth        = 6
learning_rate    = 0.03
subsample        = 0.85
colsample_bytree = 0.85
objective        = reg:squarederror
random_state     = 42
````

The trained model is saved as:

```text
visionmortis_xgboost_pmi.json
```

---

## AI Architecture

The proposed VisionMortis architecture follows a multimodal evidence integration approach:

```text
                  ┌─────────────────────────┐
                  │   Post-Mortem Images    │
                  └────────────┬────────────┘
                               ↓
                  ┌─────────────────────────┐
                  │   Computer Vision       │
                  │   Feature Extraction    │
                  └────────────┬────────────┘
                               │
                               │
┌──────────────────┐           │
│ Forensic Data    │───────────┤
│ Temperature      │           │
│ Livor Mortis     │           │
│ Rigor Mortis     │           │
│ Decomposition    │           │
└──────────────────┘           │
                               ↓
┌──────────────────┐   ┌──────────────────────┐
│ Environmental    │──→│ Multimodal Evidence │
│ Temperature      │   │      Integration     │
│ Humidity         │   └──────────┬───────────┘
│ Body Mass        │              ↓
│ Clothing         │   ┌──────────────────────┐
└──────────────────┘   │ Indicator-Specific   │
                       │ PMI Estimation        │
┌──────────────────┐   └──────────┬───────────┘
│ Entomology       │              ↓
│ Species Findings │   ┌──────────────────────┐
└────────┬─────────┘   │ XGBoost Regression   │
         │             └──────────┬───────────┘
         │                        ↓
         │             ┌──────────────────────┐
┌────────▼─────────┐   │ Evidence Fusion &    │
│ Metabolites      │──→│ Consistency Analysis │
└──────────────────┘   └──────────┬───────────┘
                                  ↓
                 ┌────────────────────────────────┐
                 │           OUTPUT                │
                 │                                │
                 │  • PMI Range                   │
                 │  • Confidence Score            │
                 │  • Inconsistency Alert         │
                 │  • Feature Contributions       │
                 │  • Structured Report           │
                 └────────────────────────────────┘
```

---

## Workflow

The VisionMortis workflow can be summarized as:

```text
Case Information
       ↓
Forensic Indicators
       ↓
Environmental & Contextual Data
       ↓
Entomology & Metabolites
       ↓
Post-Mortem Images
       ↓
Computer Vision Feature Extraction
       ↓
Structured Feature Integration
       ↓
XGBoost PMI Prediction
       ↓
Evidence Fusion
       ↓
Consistency Analysis
       ↓
PMI Range + Confidence + Explanation
       ↓
Final Report
```

---

## Explainability

VisionMortis is designed to incorporate **SHAP (SHapley Additive exPlanations)** for model interpretability.

SHAP-based analysis can be used to determine the relative contribution of individual features to the model prediction.

The explanation component is intended to answer:

> **Which indicators influenced the PMI estimate most strongly?**

This provides greater transparency compared with presenting only a final numerical prediction.

---

## Consistency Analysis

A key component of VisionMortis is the ability to identify situations where different indicators provide conflicting evidence.

For example:

```text
Temperature Evidence
        ↓
   PMI Window A

Decomposition Evidence
        ↓
   PMI Window B

Entomology Evidence
        ↓
   PMI Window C

        ↓

CONSISTENCY ANALYSIS

        ↓

Evidence Agreement
        OR
Potential Conflict
```

If the evidence does not sufficiently agree, the system is designed to display an **inconsistency alert** rather than presenting the prediction without qualification.

---

## Prototype

The VisionMortis web prototype was developed using **Google AI Studio**.

The prototype provides an interface for:

* Entering forensic case information
* Recording body temperature
* Selecting livor mortis stage
* Selecting rigor mortis stage
* Selecting decomposition stage
* Entering environmental conditions
* Recording body mass and clothing
* Selecting entomology species
* Selecting metabolite information
* Uploading post-mortem images
* Performing image-based analysis
* Generating a preliminary PMI assessment
* Displaying confidence information
* Identifying potentially inconsistent evidence
* Viewing influential factors
* Generating a structured report

### Prototype

<p align="center">
  <a href="https://visionmortis-protocolone.ai.studio">
    <strong>Open VisionMortis Prototype</strong>
  </a>
</p>

---

## Model Evaluation

The XGBoost model was evaluated on **previously unseen synthetic test cases**.

### Test Performance

| Metric    |          Result |
| --------- | --------------: |
| Test MAE  | **29.95 hours** |
| Test RMSE | **54.23 hours** |
| Test R²   |      **0.8853** |

### Interpretation

The model achieved an R² of **0.8853** on the current synthetic test set, indicating that the model explains a substantial proportion of the variation in the synthetic target values.

The MAE indicates an average absolute prediction error of approximately **29.95 hours** on the test set.

> These results reflect performance on the current synthetic dataset only and should **not be interpreted as forensic validation or real-world prediction accuracy**.

---

## Limitations

### 1. Single Dataset

The current model evaluation is based on a single synthetic dataset.

### 2. Synthetic Data

The training and evaluation data do not represent validated forensic ground truth.

### 3. Real-World Generalization

Actual forensic cases may contain substantially greater variability than represented in the current dataset.

### 4. Limited External Validation

Independent real-world forensic datasets are required to assess generalizability.

### 5. Prototype Status

VisionMortis is currently a **proof-of-concept decision-support prototype** and should not be used as a standalone method for determining time of death.

---

## Future Improvements

Future development could include:

* Validation using independent real-world forensic datasets
* Expansion of the training dataset
* Improved diversity of synthetic cases
* Integration of validated metabolomic datasets
* Improved computer vision models
* Comparison with additional machine learning and deep learning models
* Improved uncertainty estimation
* More robust evidence consistency analysis
* External validation across different environmental conditions
* Further development of multimodal feature fusion

---

## Technologies

<p align="center">

<strong>Python</strong> • <strong>Pandas</strong> • <strong>NumPy</strong> • <strong>Scikit-learn</strong> • <strong>XGBoost</strong> • <strong>SHAP</strong> • <strong>Computer Vision</strong> • <strong>Google AI Studio</strong>

</p>

---

## Repository Structure

```text
VisionMortis/
│
├── training_preprocessed.csv
│
├── visionmortis_xgboost_pmi.json
│
├── README.md
│
├── assets/
│   └── visionmortis-logo.png
│
└── prototype/
    └── VisionMortis Web Application
```

---

## Installation

Clone the repository:

```bash
git clone https://github.com/YOUR-USERNAME/VisionMortis.git
```

Navigate to the project directory:

```bash
cd VisionMortis
```

Install the required Python packages:

```bash
pip install pandas numpy scikit-learn xgboost shap
```

---

## Usage

The trained XGBoost model can be loaded using:

```python
import xgboost as xgb

model = xgb.XGBRegressor()

model.load_model("visionmortis_xgboost_pmi.json")
```

The model can then be used with appropriately preprocessed input features to generate PMI predictions.

---

## Research Context

VisionMortis explores how **machine learning and multimodal evidence integration** could support forensic PMI assessment.

The project focuses on combining information that is traditionally evaluated across different forensic domains into a single structured decision-support workflow.

The system is designed around three principles:

<p align="center">
<strong>COMBINE EVIDENCE</strong>
<br>
↓
<br>
<strong>EXPLAIN THE PREDICTION</strong>
<br>
↓
<br>
<strong>FLAG CONFLICTS</strong>
</p>

---

## Disclaimer

VisionMortis is an **academic proof-of-concept prototype** developed for research, demonstration, and educational purposes.

It is not a validated forensic instrument and should not be used to independently determine the post-mortem interval or replace qualified forensic professionals.

The current machine learning evaluation uses synthetic data and requires further validation using appropriate real-world forensic datasets.

---

## Project

<h2 align="center">VisionMortis — Protocol One</h2>

<p align="center">
  <strong>AI Decision-Support for Preliminary Post-Mortem Interval Estimation</strong>
</p>

<p align="center">
  Combining forensic evidence, computer vision, machine learning, and explainability.
</p>

---

## Authors

<p align="center">
  <strong>Asma Abdul Samathe and Team</strong>
</p>

<p align="center">
  Developed as a forensic AI project in collaboration with the
  <strong>International Center for Forensic Sciences (ICFS), Dubai Police</strong>.
</p>
```

**One important thing:** if you don't actually have `assets/visionmortis-logo.png` in your GitHub repository, remove that `<img>` section for now, otherwise GitHub will show a broken image. Once you upload your logo into an `assets` folder, you can keep it.
