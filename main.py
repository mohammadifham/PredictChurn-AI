import os
import joblib
import numpy as np
import pandas as pd

from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler


DATASET_PATH = "dataset.csv"
MODEL_PATH = "model.pkl"
SCALER_PATH = "scaler.pkl"
METADATA_PATH = "preprocessing_metadata.pkl"
TARGET_COLUMN = "Churn"


def load_data(file_path: str = DATASET_PATH) -> pd.DataFrame:
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Dataset not found: {file_path}")

    return pd.read_csv(file_path)


def normalize_target(series: pd.Series) -> pd.Series:
    if pd.api.types.is_numeric_dtype(series):
        return series.astype(int)

    normalized = series.astype(str).str.strip().str.lower()
    mapping = {"yes": 1, "no": 0, "1": 1, "0": 0, "true": 1, "false": 0}
    mapped = normalized.map(mapping)

    if mapped.isna().any():
        encoder = LabelEncoder()
        mapped = encoder.fit_transform(normalized)

    return pd.Series(mapped, index=series.index).astype(int)


def preprocess_data(df: pd.DataFrame):
    if TARGET_COLUMN not in df.columns:
        raise ValueError(f"Target column '{TARGET_COLUMN}' not found in dataset")

    df = df.copy()
    df = df.drop_duplicates()

    feature_columns = [column for column in df.columns if column != TARGET_COLUMN]
    numeric_columns = df[feature_columns].select_dtypes(include=[np.number]).columns.tolist()
    categorical_columns = [column for column in feature_columns if column not in numeric_columns]

    metadata = {
        "feature_columns": feature_columns,
        "numeric_columns": numeric_columns,
        "categorical_columns": categorical_columns,
        "numeric_defaults": {},
        "categorical_defaults": {},
        "categorical_classes": {},
        "target_mapping": {"No Churn": 0, "Churn": 1},
    }

    for column in numeric_columns:
        mean_value = df[column].mean()
        if pd.isna(mean_value):
            mean_value = 0.0
        df[column] = df[column].fillna(mean_value)
        metadata["numeric_defaults"][column] = float(mean_value)

    label_encoders = {}
    for column in categorical_columns:
        mode_series = df[column].mode(dropna=True)
        mode_value = mode_series.iloc[0] if not mode_series.empty else "Unknown"
        df[column] = df[column].fillna(mode_value).astype(str)

        encoder = LabelEncoder()
        df[column] = encoder.fit_transform(df[column])
        label_encoders[column] = encoder
        metadata["categorical_defaults"][column] = str(mode_value)
        metadata["categorical_classes"][column] = encoder.classes_.tolist()

    y = normalize_target(df[TARGET_COLUMN])
    X = df[feature_columns]

    return X, y, label_encoders, metadata


def train_model(X_train: pd.DataFrame, y_train: pd.Series) -> RandomForestClassifier:
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    return model


def save_artifacts(model, scaler, label_encoders, metadata) -> None:
    joblib.dump(model, MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)
    joblib.dump({"label_encoders": label_encoders, "metadata": metadata}, METADATA_PATH)


def load_model():
    if not os.path.exists(MODEL_PATH) or not os.path.exists(SCALER_PATH) or not os.path.exists(METADATA_PATH):
        raise FileNotFoundError(
            "Saved artifacts not found. Run main.py first to train and save the model."
        )

    model = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
    bundle = joblib.load(METADATA_PATH)
    return model, scaler, bundle["label_encoders"], bundle["metadata"]


def prepare_input_dataframe(input_data, metadata, label_encoders) -> pd.DataFrame:
    if isinstance(input_data, pd.DataFrame):
        input_df = input_data.copy()
    else:
        input_df = pd.DataFrame([input_data], columns=metadata["feature_columns"])

    for column in metadata["numeric_columns"]:
        input_df[column] = pd.to_numeric(input_df[column], errors="coerce")
        input_df[column] = input_df[column].fillna(metadata["numeric_defaults"][column])

    for column in metadata["categorical_columns"]:
        input_df[column] = input_df[column].astype(str).fillna(metadata["categorical_defaults"][column])
        encoder = label_encoders[column]
        valid_values = set(encoder.classes_.tolist())
        invalid_values = [value for value in input_df[column].tolist() if value not in valid_values]
        if invalid_values:
            raise ValueError(
                f"Invalid value(s) for '{column}': {invalid_values}. Allowed values: {encoder.classes_.tolist()}"
            )
        input_df[column] = encoder.transform(input_df[column])

    return input_df[metadata["feature_columns"]]


def predict_churn(input_data):
    model, scaler, label_encoders, metadata = load_model()
    input_df = prepare_input_dataframe(input_data, metadata, label_encoders)
    scaled_input = scaler.transform(input_df)
    prediction = model.predict(scaled_input)[0]
    return "Churn" if int(prediction) == 1 else "No Churn"


def get_user_input(metadata):
    user_data = []
    print("Enter customer feature values:\n")

    for column in metadata["feature_columns"]:
        if column in metadata["numeric_columns"]:
            default_value = metadata["numeric_defaults"][column]
            raw_value = input(f"{column} [numeric, default={default_value}]: ").strip()
            user_data.append(float(raw_value) if raw_value else default_value)
        else:
            options = metadata["categorical_classes"][column]
            prompt_text = f"{column} {options}: "
            raw_value = input(prompt_text).strip()
            if not raw_value:
                raw_value = metadata["categorical_defaults"][column]
            if raw_value not in options:
                raise ValueError(f"Invalid value for {column}. Allowed values: {options}")
            user_data.append(raw_value)

    return user_data


def train_pipeline():
    df = load_data()
    X, y, label_encoders, metadata = preprocess_data(df)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    model = train_model(X_train_scaled, y_train)
    predictions = model.predict(X_test_scaled)
    accuracy = accuracy_score(y_test, predictions)

    save_artifacts(model, scaler, label_encoders, metadata)

    print("Model trained successfully")
    print(f"Accuracy: {accuracy * 100:.2f}%")

    return metadata


def main():
    try:
        metadata = train_pipeline()
        while True:
            choice = input("\nDo you want to make a prediction? (y/n): ").strip().lower()
            if choice != "y":
                break

            try:
                user_data = get_user_input(metadata)
                result = predict_churn(user_data)
                print(f"Prediction: {result}")
            except Exception as prediction_error:
                print(f"Prediction error: {prediction_error}")
    except Exception as error:
        print(f"Error: {error}")


if __name__ == "__main__":
    main()