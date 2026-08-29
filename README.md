<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VisionMortis — Protocol One</title>

    <style>
        body {
            font-family: Arial, Helvetica, sans-serif;
            line-height: 1.6;
            color: #222;
            max-width: 1000px;
            margin: auto;
            padding: 40px;
            background: #ffffff;
        }

        h1 {
            text-align: center;
            color: #17365D;
            font-size: 42px;
            margin-bottom: 5px;
        }

        h2 {
            color: #17365D;
            border-bottom: 2px solid #C9A227;
            padding-bottom: 6px;
            margin-top: 40px;
        }

        h3 {
            color: #315B7D;
            margin-top: 25px;
        }

        .subtitle {
            text-align: center;
            font-size: 20px;
            font-weight: bold;
            color: #555;
        }

        .protocol {
            text-align: center;
            font-size: 18px;
            font-weight: bold;
            color: #C9A227;
        }

        .tagline {
            text-align: center;
            font-style: italic;
            color: #666;
        }

        .logo {
            display: block;
            margin: 25px auto;
            width: 180px;
        }

        .center {
            text-align: center;
        }

        .highlight {
            background: #F2F4F6;
            border-left: 5px solid #C9A227;
            padding: 15px 20px;
            margin: 20px 0;
        }

        .warning {
            background: #FFF8E6;
            border-left: 5px solid #C9A227;
            padding: 15px 20px;
            margin: 20px 0;
        }

        ul {
            margin-top: 8px;
        }

        li {
            margin-bottom: 6px;
        }

        code {
            background: #F1F1F1;
            padding: 3px 6px;
            border-radius: 4px;
        }

        pre {
            background: #F4F5F7;
            border: 1px solid #DDD;
            padding: 20px;
            overflow-x: auto;
            border-radius: 8px;
            font-size: 14px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }

        th {
            background: #17365D;
            color: white;
            padding: 12px;
            text-align: left;
        }

        td {
            border: 1px solid #DDD;
            padding: 12px;
        }

        tr:nth-child(even) {
            background: #F7F7F7;
        }

        .metric {
            font-size: 18px;
            font-weight: bold;
        }

        .footer {
            text-align: center;
            margin-top: 50px;
            padding-top: 25px;
            border-top: 2px solid #DDD;
            color: #666;
        }

        a {
            color: #17365D;
            font-weight: bold;
        }
    </style>
</head>

<body>

    <!-- HEADER -->

    <h1>VisionMortis</h1>

    <p class="subtitle">
        AI Decision-Support Tool for Post-Mortem Interval Estimation
    </p>

    <p class="protocol">
        Protocol One
    </p>

    <p class="tagline">
        Combining multimodal forensic evidence for preliminary and explainable PMI assessment
    </p>

    <!-- Uncomment when the logo has been uploaded -->
    <!--
    <img
        src="assets/visionmortis-logo.png"
        alt="VisionMortis Logo"
        class="logo"
    >
    -->

    <hr>

    <!-- OVERVIEW -->

    <h2>Overview</h2>

    <p>
        VisionMortis is a <strong>proof-of-concept AI decision-support tool</strong>
        designed to assist forensic professionals with the
        <strong>preliminary estimation of the post-mortem interval (PMI)</strong>.
    </p>

    <p>
        The system combines multiple forensic indicators, environmental factors,
        entomological findings, metabolite information, and image-based observations
        to produce a structured and explainable PMI assessment.
    </p>

    <p>
        Rather than relying on a single forensic indicator, VisionMortis is designed
        to integrate multiple sources of evidence, identify potential inconsistencies
        between indicators, and provide an explanation of the factors influencing
        the prediction.
    </p>

    <div class="warning">
        <strong>Important:</strong>
        VisionMortis is intended as a decision-support and educational prototype
        and is not designed to replace forensic expert judgment.
    </div>


    <!-- OBJECTIVES -->

    <h2>Objectives</h2>

    <p>The project aims to:</p>

    <ul>
        <li>Combine multiple forensic indicators for PMI estimation</li>
        <li>Integrate structured and image-based forensic information</li>
        <li>Generate a preliminary PMI range</li>
        <li>Provide a model-derived confidence score</li>
        <li>Identify potentially conflicting forensic evidence</li>
        <li>Provide explainability through feature contribution analysis</li>
        <li>Generate a structured forensic assessment report</li>
    </ul>


    <!-- KEY FEATURES -->

    <h2>Key Features</h2>

    <ul>
        <li>
            <strong>Multimodal Forensic Assessment</strong> —
            combines multiple PMI-related evidence sources
        </li>

        <li>
            <strong>Body Temperature Analysis</strong> —
            incorporates temperature-related PMI information
        </li>

        <li>
            <strong>Livor Mortis Assessment</strong> —
            incorporates lividity observations
        </li>

        <li>
            <strong>Rigor Mortis Assessment</strong> —
            incorporates rigor observations
        </li>

        <li>
            <strong>Decomposition Analysis</strong> —
            considers visible decomposition indicators
        </li>

        <li>
            <strong>Entomology Analysis</strong> —
            incorporates insect species findings
        </li>

        <li>
            <strong>Metabolite Information</strong> —
            incorporates selected metabolite observations
        </li>

        <li>
            <strong>Environmental Factors</strong> —
            considers ambient temperature, humidity, clothing, and body mass
        </li>

        <li>
            <strong>Computer Vision</strong> —
            extracts relevant observations from post-mortem images
        </li>

        <li>
            <strong>XGBoost PMI Regression</strong> —
            predicts PMI using structured features
        </li>

        <li>
            <strong>Consistency Analysis</strong> —
            identifies potentially conflicting indicators
        </li>

        <li>
            <strong>Explainability</strong> —
            identifies influential features contributing to the prediction
        </li>

        <li>
            <strong>Forensic Reporting</strong> —
            generates a structured case report containing the assessment
            and examiner notes
        </li>
    </ul>


    <!-- SYSTEM INPUTS -->

    <h2>System Inputs</h2>

    <p>
        VisionMortis is designed to incorporate several categories of information.
    </p>

    <h3>Forensic Indicators</h3>

    <ul>
        <li>Body Temperature</li>
        <li>Livor Mortis</li>
        <li>Rigor Mortis</li>
        <li>Decomposition Stage</li>
        <li>Entomology Findings</li>
        <li>Metabolites</li>
    </ul>

    <h3>Environmental Factors</h3>

    <ul>
        <li>Ambient Temperature</li>
        <li>Humidity</li>
        <li>Body Mass</li>
        <li>Clothing</li>
    </ul>

    <h3>Image-Based Information</h3>

    <p>
        Post-mortem images can be provided for computer vision-based analysis.
    </p>

    <p>
        The image analysis is intended to identify visible forensic characteristics
        that can contribute to the overall assessment.
    </p>


    <!-- ENTOMOLOGY -->

    <h2>Entomology</h2>

    <p>
        The prototype provides predefined options for commonly represented
        insect species:
    </p>

    <ul>
        <li><i>Calliphora vicina</i></li>
        <li><i>Phormia regina</i></li>
        <li><i>Sarcophaga bullata</i></li>
        <li><i>Lucilia sericata</i></li>
        <li><i>Chrysomya rufifacies</i></li>
        <li><i>Hydrotaea leucostoma</i></li>
        <li><i>Dermestes maculatus</i></li>
        <li><i>Necrobia rufipes</i></li>
    </ul>

    <p>
        Entomological findings are treated as one component of the overall
        evidence rather than as a standalone PMI determination.
    </p>


    <!-- METABOLITES -->

    <h2>Metabolites</h2>

    <p>
        The prototype can incorporate selected metabolite information, including:
    </p>

    <ul>
        <li>Hypoxanthine</li>
        <li>Lactic Acid</li>
        <li>Choline</li>
        <li>Taurine</li>
        <li>Glycerol</li>
        <li>Succinic Acid</li>
        <li>Formic Acid</li>
        <li>Uric Acid</li>
        <li>Creatine</li>
        <li>Putrescine</li>
        <li>Cadaverine</li>
    </ul>

    <p>
        Metabolite information is intended to provide an additional biochemical
        evidence stream for future multimodal PMI estimation.
    </p>


    <!-- DATASET -->

    <h2>Dataset</h2>

    <p>
        The current PMI prediction model was developed using a
        <strong>synthetic, literature-informed dataset</strong>.
    </p>

    <h3>Dataset Characteristics</h3>

    <ul>
        <li><strong>Total Cases:</strong> 500 unique synthetic cases</li>
        <li><strong>Format:</strong> CSV</li>
        <li><strong>Target Variable:</strong> PMI in hours</li>
        <li><strong>Data Type:</strong> Synthetic</li>
        <li><strong>Purpose:</strong> Proof-of-concept model development and evaluation</li>
    </ul>

    <p>
        The dataset represents combinations of forensic and environmental
        variables relevant to PMI estimation.
    </p>

    <div class="warning">
        <strong>Important:</strong>
        The dataset is synthetic and should not be considered validated
        forensic ground truth.
    </div>


    <!-- MACHINE LEARNING MODEL -->

    <h2>Machine Learning Model</h2>

    <p>
        The structured PMI prediction component uses an
        <strong>XGBoost Regressor</strong>.
    </p>

    <p>
        The model was independently trained as part of the VisionMortis project
        and subsequently prepared for integration with the web-based prototype.
    </p>

    <h3>Model Configuration</h3>

<pre>
Model: XGBRegressor

n_estimators     = 300
max_depth        = 6
learning_rate    = 0.03
subsample        = 0.85
colsample_bytree = 0.85
objective        = reg:squarederror
random_state     = 42
</pre>

    <p>
        The trained model is saved as:
    </p>

    <p>
        <code>visionmortis_xgboost_pmi.json</code>
    </p>


    <!-- AI ARCHITECTURE -->

    <h2>AI Architecture</h2>

    <p>
        The proposed VisionMortis architecture follows a multimodal
        evidence integration approach:
    </p>

<pre>
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
</pre>


    <!-- WORKFLOW -->

    <h2>Workflow</h2>

    <p>
        The VisionMortis workflow can be summarized as:
    </p>

<pre>
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
</pre>


    <!-- EXPLAINABILITY -->

    <h2>Explainability</h2>

    <p>
        VisionMortis is designed to incorporate
        <strong>SHAP (SHapley Additive exPlanations)</strong>
        for model interpretability.
    </p>

    <p>
        SHAP-based analysis can be used to determine the relative contribution
        of individual features to the model prediction.
    </p>

    <div class="highlight">
        <strong>Key Question:</strong><br>
        Which indicators influenced the PMI estimate most strongly?
    </div>

    <p>
        This provides greater transparency compared with presenting only
        a final numerical prediction.
    </p>


    <!-- CONSISTENCY ANALYSIS -->

    <h2>Consistency Analysis</h2>

    <p>
        A key component of VisionMortis is the ability to identify situations
        where different indicators provide conflicting evidence.
    </p>

<pre>
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
</pre>

    <p>
        If the evidence does not sufficiently agree, the system is designed
        to display an <strong>inconsistency alert</strong> rather than
        presenting the prediction without qualification.
    </p>


    <!-- PROTOTYPE -->

    <h2>Prototype</h2>

    <p>
        The VisionMortis web prototype was developed using
        <strong>Google AI Studio</strong>.
    </p>

    <p>
        The prototype provides an interface for:
    </p>

    <ul>
        <li>Entering forensic case information</li>
        <li>Recording body temperature</li>
        <li>Selecting livor mortis stage</li>
        <li>Selecting rigor mortis stage</li>
        <li>Selecting decomposition stage</li>
        <li>Entering environmental conditions</li>
        <li>Recording body mass and clothing</li>
        <li>Selecting entomology species</li>
        <li>Selecting metabolite information</li>
        <li>Uploading post-mortem images</li>
        <li>Performing image-based analysis</li>
        <li>Generating a preliminary PMI assessment</li>
        <li>Displaying confidence information</li>
        <li>Identifying potentially inconsistent evidence</li>
        <li>Viewing influential factors</li>
        <li>Generating a structured case report</li>
    </ul>

    <div class="center">
        <p>
            <a href="https://visionmortis-protocolone.ai.studio">
                Open VisionMortis Prototype
            </a>
        </p>
    </div>


    <!-- MODEL EVALUATION -->

    <h2>Model Evaluation</h2>

    <p>
        The XGBoost model was evaluated on
        <strong>previously unseen synthetic test cases</strong>.
    </p>

    <h3>Test Performance</h3>

    <table>
        <thead>
            <tr>
                <th>Metric</th>
                <th>Result</th>
            </tr>
        </thead>

        <tbody>
            <tr>
                <td>Test MAE</td>
                <td class="metric">29.95 hours</td>
            </tr>

            <tr>
                <td>Test RMSE</td>
                <td class="metric">54.23 hours</td>
            </tr>

            <tr>
                <td>Test R²</td>
                <td class="metric">0.8853</td>
            </tr>
        </tbody>
    </table>

    <h3>Interpretation</h3>

    <p>
        The model achieved an R² of <strong>0.8853</strong> on the current
        synthetic test set, indicating that the model explains a substantial
        proportion of the variation in the synthetic target values.
    </p>

    <p>
        The MAE indicates an average absolute prediction error of approximately
        <strong>29.95 hours</strong> on the test set.
    </p>

    <div class="warning">
        These results reflect performance on the current synthetic dataset only
        and should <strong>not</strong> be interpreted as forensic validation
        or real-world prediction accuracy.
    </div>


    <!-- LIMITATIONS -->

    <h2>Limitations</h2>

    <h3>1. Single Dataset</h3>

    <p>
        The current model evaluation is based on a single synthetic dataset.
    </p>

    <h3>2. Synthetic Data</h3>

    <p>
        The training and evaluation data do not represent validated
        forensic ground truth.
    </p>

    <h3>3. Real-World Generalization</h3>

    <p>
        Actual forensic cases may contain substantially greater variability
        than represented in the current dataset.
    </p>

    <h3>4. Limited External Validation</h3>

    <p>
        Independent real-world forensic datasets are required to assess
        generalizability.
    </p>

    <h3>5. Prototype Status</h3>

    <p>
        VisionMortis is currently a
        <strong>proof-of-concept decision-support prototype</strong>
        and should not be used as a standalone method for determining
        time of death.
    </p>


    <!-- FUTURE IMPROVEMENTS -->

    <h2>Future Improvements</h2>

    <ul>
        <li>Validation using independent real-world forensic datasets</li>
        <li>Expansion of the training dataset</li>
        <li>Improved diversity of synthetic cases</li>
        <li>Integration of validated metabolomic datasets</li>
        <li>Improved computer vision models</li>
        <li>Comparison with additional machine learning and deep learning models</li>
        <li>Improved uncertainty estimation</li>
        <li>More robust evidence consistency analysis</li>
        <li>External validation across different environmental conditions</li>
        <li>Further development of multimodal feature fusion</li>
    </ul>


    <!-- TECHNOLOGIES -->

    <h2>Technologies</h2>

    <p class="center">
        <strong>Python</strong> •
        <strong>Pandas</strong> •
        <strong>NumPy</strong> •
        <strong>Scikit-learn</strong> •
        <strong>XGBoost</strong> •
        <strong>SHAP</strong> •
        <strong>Computer Vision</strong> •
        <strong>Google AI Studio</strong>
    </p>


    <!-- REPOSITORY STRUCTURE -->

    <h2>Repository Structure</h2>

<pre>
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
</pre>


    <!-- INSTALLATION -->

    <h2>Installation</h2>

    <p>Clone the repository:</p>

<pre>
git clone https://github.com/YOUR-USERNAME/VisionMortis.git
</pre>

    <p>Navigate to the project directory:</p>

<pre>
cd VisionMortis
</pre>

    <p>Install the required Python packages:</p>

<pre>
pip install pandas numpy scikit-learn xgboost shap
</pre>


    <!-- USAGE -->

    <h2>Usage</h2>

    <p>
        The trained XGBoost model can be loaded using:
    </p>

<pre>
import xgboost as xgb

model = xgb.XGBRegressor()

model.load_model("visionmortis_xgboost_pmi.json")
</pre>

    <p>
        The model can then be used with appropriately preprocessed input
        features to generate PMI predictions.
    </p>


    <!-- RESEARCH CONTEXT -->

    <h2>Research Context</h2>

    <p>
        VisionMortis explores how
        <strong>machine learning and multimodal evidence integration</strong>
        could support forensic PMI assessment.
    </p>

    <p>
        The project focuses on combining information that is traditionally
        evaluated across different forensic domains into a single structured
        decision-support workflow.
    </p>

    <p>
        The system is designed around three principles:
    </p>

    <div class="center">

        <h3>COMBINE EVIDENCE</h3>

        <p>↓</p>

        <h3>EXPLAIN THE PREDICTION</h3>

        <p>↓</p>

        <h3>FLAG CONFLICTS</h3>

    </div>


    <!-- DISCLAIMER -->

    <h2>Disclaimer</h2>

    <p>
        VisionMortis is an <strong>academic proof-of-concept prototype</strong>
        developed for research, demonstration, and educational purposes.
    </p>

    <p>
        It is not a validated forensic instrument and should not be used to
        independently determine the post-mortem interval or replace qualified
        forensic professionals.
    </p>

    <p>
        The current machine learning evaluation uses synthetic data and
        requires further validation using appropriate real-world forensic
        datasets.
    </p>


    <!-- PROJECT -->

    <h2>Project</h2>

    <div class="center">

        <h2>VisionMortis — Protocol One</h2>

        <p>
            <strong>
                AI Decision-Support for Preliminary Post-Mortem Interval Estimation
            </strong>
        </p>

        <p>
            Combining forensic evidence, computer vision,
            machine learning, and explainability.
        </p>

    </div>


    <!-- AUTHORS -->

    <h2>Authors</h2>

    <div class="center">

        <p>
            <strong>Team Protocol One-Ayesha Moazzam, Asma Abdul Samathe, Fathima Shafriya, Ghaya Almatboona</strong>
        </p>

        <p>
            Developed as a forensic AI project in collaboration with the
            <strong>
                International Center for Forensic Sciences (ICFS), Dubai Police
            </strong>.
        </p>

    </div>


    <!-- FOOTER -->

    <div class="footer">

        <p>
            <strong>VisionMortis — Protocol One</strong>
        </p>

        <p>
            AI Decision-Support for Preliminary PMI Assessment
        </p>

    </div>

</body>
</html>
