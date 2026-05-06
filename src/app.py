import os
import time
import joblib
import pandas as pd
import streamlit as st
import plotly.express as px
from pathlib import Path

from auth import create_default_admin, register_user, verify_user
from main import load_model, prepare_input_dataframe

PROJECT_ROOT = Path(__file__).resolve().parents[1]
ARTIFACTS = (
    str(PROJECT_ROOT / "models" / "model.pkl"),
    str(PROJECT_ROOT / "models" / "scaler.pkl"),
    str(PROJECT_ROOT / "models" / "preprocessing_metadata.pkl")
)


def app_header():
    st.markdown(
        """
        <style>
        .splash {text-align:center;padding:40px}
        .splash h1{font-size:34px;margin-bottom:6px}
        .splash p{color:#666;margin-top:0}
        </style>
        """,
        unsafe_allow_html=True,
    )


def splash_page():
    app_header()
    st.markdown('<div class="splash">', unsafe_allow_html=True)
    st.image(
        "https://streamlit.io/images/brand/streamlit-mark-secondary-colormark-darktext.png",
        width=120,
    )
    st.markdown("""
    # PredictChurn AI
    A small demonstration app for predicting customer churn using a Random Forest model.
    """)
    st.markdown("Use the sidebar to log in and explore the dashboard, make predictions, and manage your profile.")
    st.markdown("</div>", unsafe_allow_html=True)


def ensure_artifacts():
    missing = [p for p in ARTIFACTS if not os.path.exists(p)]
    if missing:
        st.error(f"Missing artifacts: {missing}. Run `python main.py` to train and save them.")
        return False
    return True


def build_predict_form(metadata):
    st.header("Predict Churn")
    with st.form("predict_form"):
        cols = st.columns(2)
        input_data = {}
        for i, col_name in enumerate(metadata["feature_columns"]):
            if col_name in metadata["numeric_columns"]:
                default_value = float(metadata["numeric_defaults"][col_name])
                input_data[col_name] = cols[i % 2].number_input(col_name, value=default_value)
            else:
                options = metadata["categorical_classes"][col_name]
                default_value = metadata["categorical_defaults"][col_name]
                input_data[col_name] = cols[i % 2].selectbox(col_name, options, index=options.index(default_value) if default_value in options else 0)

        save_pred = st.checkbox("Save this prediction to my profile (requires login)")
        submitted = st.form_submit_button("Predict")

    return submitted, input_data, save_pred


def show_dashboard(model, scaler, label_encoders, metadata):
    st.header("Model Dashboard")
    # Feature importances
    if hasattr(model, "feature_importances_"):
        fi = model.feature_importances_
        df_fi = pd.DataFrame({"feature": metadata["feature_columns"], "importance": fi})
        df_fi = df_fi.sort_values("importance", ascending=False)
        fig = px.bar(df_fi, x="importance", y="feature", orientation="h", title="Feature Importances")
        st.plotly_chart(fig, use_container_width=True)

    # Dataset summary if available
    if os.path.exists("dataset.csv"):
        df = pd.read_csv("dataset.csv")
        st.subheader("Dataset snapshot")
        st.dataframe(df.head())

        # Quick model accuracy on dataset (not a substitute for proper evaluation)
        try:
            X = df[metadata["feature_columns"]]
            # apply encoders and scaling
            X_prepared = prepare_input_dataframe(X, metadata, label_encoders)
            X_scaled = scaler.transform(X_prepared)
            preds = model.predict(X_scaled)
            st.metric("Dataset predictions", f"{(preds.mean()*100):.2f}% churn predicted")
        except Exception as e:
            st.info(f"Could not compute full-dataset metrics: {e}")


def save_prediction_for_user(username, input_data, prediction):
    fname = f"predictions_{username}.csv"
    df = pd.DataFrame([input_data])
    df["prediction"] = prediction
    df["timestamp"] = pd.Timestamp.now()
    if os.path.exists(fname):
        df.to_csv(fname, mode="a", header=False, index=False)
    else:
        df.to_csv(fname, index=False)


def profile_page(username):
    st.header("Profile")
    st.write(f"Logged in as **{username}**")
    fname = f"predictions_{username}.csv"
    if os.path.exists(fname):
        df = pd.read_csv(fname)
        st.subheader("Saved predictions")
        st.dataframe(df.tail(50))
    else:
        st.info("No saved predictions yet.")


def main():
    st.set_page_config(page_title="PredictChurn AI — Dashboard", layout="wide")

    create_default_admin()

    if "logged_in" not in st.session_state:
        st.session_state.logged_in = False
        st.session_state.username = None

    # Sidebar authentication
    with st.sidebar:
        st.title("Navigation")
        if not st.session_state.logged_in:
            st.subheader("Sign in")
            username = st.text_input("Username")
            password = st.text_input("Password", type="password")
            col1, col2 = st.columns(2)
            if col1.button("Login"):
                if verify_user(username, password):
                    st.session_state.logged_in = True
                    st.session_state.username = username
                    st.success("Logged in")
                    time.sleep(0.5)
                    try:
                        st.experimental_rerun()
                    except Exception:
                        pass
                else:
                    st.error("Invalid credentials")
            if col2.button("Register"):
                if username and password:
                    if register_user(username, password):
                        st.success("User registered; you can now log in")
                    else:
                        st.warning("User already exists")
                else:
                    st.warning("Provide username and password to register")
        else:
            st.write(f"Signed in as **{st.session_state.username}**")
            if st.button("Logout"):
                st.session_state.logged_in = False
                st.session_state.username = None
                try:
                    st.experimental_rerun()
                except Exception:
                    pass

        st.markdown("---")
        page_options = ["Home"] if not st.session_state.logged_in else ["Home", "Predict", "Dashboard", "Profile", "About"]
        page = st.selectbox("Go to", page_options)

    # Main area
    if page == "Home":
        splash_page()

    elif page == "Predict":
        if not ensure_artifacts():
            return
        model, scaler, label_encoders, metadata = load_model()
        submitted, input_data, save_pred = build_predict_form(metadata)
        if submitted:
            try:
                prepared = prepare_input_dataframe(input_data, metadata, label_encoders)
                scaled = scaler.transform(prepared)
                pred = model.predict(scaled)[0]
                label = "Customer will churn" if int(pred) == 1 else "Customer will not churn"
                st.success(label)
                if save_pred and st.session_state.logged_in:
                    save_prediction_for_user(st.session_state.username, input_data, label)
                    st.info("Saved to your profile")
            except Exception as e:
                st.error(f"Prediction failed: {e}")

    elif page == "Dashboard":
        if not ensure_artifacts():
            return
        model, scaler, label_encoders, metadata = load_model()
        show_dashboard(model, scaler, label_encoders, metadata)

    elif page == "Profile":
        if not st.session_state.logged_in:
            st.info("Log in to access your profile and saved predictions")
        else:
            profile_page(st.session_state.username)

    else:
        st.header("About")
        st.write(
            "This app showcases a churn prediction pipeline with a Streamlit UI, simple authentication, and a user profile to save predictions."
        )


if __name__ == "__main__":
    main()
