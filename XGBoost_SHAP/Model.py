import pandas as pd
import numpy as np
import xgboost as xgb

from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score
)

#Load Datasets

train_df = pd.read_csv("training_preprocessed.csv")
test_df = pd.read_csv("test_preprocessed.csv")
validation_df = pd.read_csv("validation_preprocessed.csv")

print("Dataset sizes")
print("----------------------------")
print("Training   :", train_df.shape)
print("Test       :", test_df.shape)
print("Validation :", validation_df.shape)


# Target

TARGET = "synthetic_pmi_hours"

DROP_COLS = [
    "case_id",
    "synthetic_pmi_hours",
    "synthetic_conflict_case__METADATA_ONLY",
    "conflict_type__METADATA_ONLY"
]


# Only remove columns that actually exist
def prepare_dataset(df):

    drop_cols = [
        col for col in DROP_COLS
        if col in df.columns
    ]

    X = df.drop(columns=drop_cols)
    y = df[TARGET]

    return X, y


X_train, y_train = prepare_dataset(train_df)
X_test, y_test = prepare_dataset(test_df)
X_val, y_val = prepare_dataset(validation_df)


#Check whether all datasets have same features

print("\nFeature counts")
print("----------------------------")
print("Training   :", X_train.shape[1])
print("Test       :", X_test.shape[1])
print("Validation :", X_val.shape[1])


# Check missing features
missing_test = set(X_train.columns) - set(X_test.columns)
missing_val = set(X_train.columns) - set(X_val.columns)

if missing_test:
    raise ValueError(
        f"Test dataset is missing features: {missing_test}"
    )

if missing_val:
    raise ValueError(
        f"Validation dataset is missing features: {missing_val}"
    )


# Make feature order identical
X_test = X_test[X_train.columns]
X_val = X_val[X_train.columns]


#Train XGBoost

model = xgb.XGBRegressor(
    n_estimators=300,
    max_depth=6,
    learning_rate=0.03,
    subsample=0.85,
    colsample_bytree=0.85,
    objective="reg:squarederror",
    random_state=42
)

print("\nTraining XGBoost...")

model.fit(
    X_train,
    y_train
)

print("Training complete.")


#Calculate Metrics

def evaluate_model(model, X, y, dataset_name):

    predictions = model.predict(X)

    mae = mean_absolute_error(
        y,
        predictions
    )

    rmse = np.sqrt(
        mean_squared_error(
            y,
            predictions
        )
    )

    r2 = r2_score(
        y,
        predictions
    )

    print("\n================================")
    print(dataset_name)
    print("================================")

    print(f"MAE  : {mae:.2f} hours")
    print(f"RMSE : {rmse:.2f} hours")
    print(f"R²   : {r2:.4f}")

    return predictions, mae, rmse, r2


# Training Performance

train_pred, train_mae, train_rmse, train_r2 = evaluate_model(
    model,
    X_train,
    y_train,
    "TRAINING SET"
)


# Test Performance

test_pred, test_mae, test_rmse, test_r2 = evaluate_model(
    model,
    X_test,
    y_test,
    "TEST SET"
)


# Validation

val_pred, val_mae, val_rmse, val_r2 = evaluate_model(
    model,
    X_val,
    y_val,
    "FINAL VALIDATION SET"
)


# Model

model.save_model(
    "visionmortis_xgboost_pmi.json"
)

print("\nModel saved:")
print("visionmortis_xgboost_pmi.json")


#Validation Predictions

validation_results = pd.DataFrame({

    "actual_pmi_hours":
        y_val.values,

    "predicted_pmi_hours":
        val_pred

})

validation_results["absolute_error_hours"] = (
    abs(
        validation_results["actual_pmi_hours"]
        -
        validation_results["predicted_pmi_hours"]
    )
)

validation_results.to_csv(
    "VisionMortis_validation_predictions.csv",
    index=False
)

print(
    "\nValidation predictions saved as:"
    " VisionMortis_validation_predictions.csv"
)
