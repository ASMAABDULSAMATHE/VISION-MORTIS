%pip install shap

import shap
import matplotlib.pyplot as plt

explainer = shap.TreeExplainer(model)

shap_values = explainer.shap_values(X_test)

print("SHAP calculation complete.")
print("Shape:", shap_values.shape)

mean_abs_shap = np.abs(shap_values).mean(axis=0)

shap_importance = pd.DataFrame({
    "feature": X_test.columns,
    "mean_abs_shap": mean_abs_shap
})

shap_importance = shap_importance.sort_values(
    "mean_abs_shap",
    ascending=False
)

shap_importance.head(20)

shap.summary_plot(
    shap_values,
    X_test
)

shap.summary_plot(
    shap_values,
    X_test
)

