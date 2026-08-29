# Install SHAP library for model explainability
%pip install shap

import shap
import matplotlib.pyplot as plt

# Create a TreeExplainer for the trained XGBoost model
explainer = shap.TreeExplainer(model)

# Compute SHAP values for the test set
# Each value represents how much a feature pushed the prediction
# above/below the baseline (average) prediction for that specific case
shap_values = explainer.shap_values(X_test)

print("SHAP calculation complete.")
print("Shape:", shap_values.shape) # (n_samples, n_features)

# Calculate mean absolute SHAP value per feature
# This gives an overall measure of each feature's importance across all cases
mean_abs_shap = np.abs(shap_values).mean(axis=0)

# Build a dataframe pairing each feature with its importance score
shap_importance = pd.DataFrame({
    "feature": X_test.columns,
    "mean_abs_shap": mean_abs_shap
})

# Sort features from most to least important
shap_importance = shap_importance.sort_values(
    "mean_abs_shap",
    ascending=False
)

# Display the top 20 most important features
shap_importance.head(20)

# Generate summary plot
# Shows feature importance + how feature values (high/low) affect the direction of the prediction
shap.summary_plot(
    shap_values,
    X_test
)


