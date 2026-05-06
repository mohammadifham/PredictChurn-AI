import logging
import os
import sys
from contextlib import asynccontextmanager
from functools import lru_cache
from pathlib import Path
from typing import Any, Dict, Optional

import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

PROJECT_ROOT = Path(__file__).resolve().parents[1]
SRC_PATH = str(PROJECT_ROOT / "src")
if SRC_PATH not in sys.path:
    sys.path.insert(0, SRC_PATH)

from auth import create_default_admin, register_user, verify_user
from main import load_model, prepare_input_dataframe


logger = logging.getLogger("churn_api")
logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO").upper())

APP_ENV = os.getenv("APP_ENV", "development").lower()
ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:3000,http://localhost:3001",
    ).split(",")
    if origin.strip()
]


@asynccontextmanager
async def lifespan(_: FastAPI):
    if APP_ENV != "production":
        create_default_admin()
    logger.info("Application startup complete")
    yield
    logger.info("Application shutdown complete")


app = FastAPI(
    title="PredictChurn AI - Churn Prediction API",
    version="1.1.0",
    lifespan=lifespan,
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@lru_cache(maxsize=1)
def load_artifacts_cached():
    return load_model()

# Models
class PredictionRequest(BaseModel):
    features: Dict[str, Any]
    username: Optional[str] = None


class PredictionResponse(BaseModel):
    prediction: str
    confidence: float
    timestamp: str


class UserRegisterRequest(BaseModel):
    username: str = Field(min_length=3, max_length=64)
    password: str = Field(min_length=8, max_length=128)


class UserLoginRequest(BaseModel):
    username: str = Field(min_length=3, max_length=64)
    password: str = Field(min_length=8, max_length=128)


class UserResponse(BaseModel):
    username: str
    message: str


class HealthResponse(BaseModel):
    status: str
    message: str


# Health check
@app.get("/health", response_model=HealthResponse)
async def health():
    try:
        load_artifacts_cached()
        return {"status": "healthy", "message": "API is running"}
    except Exception:
        return {"status": "degraded", "message": "API is running, model artifacts unavailable"}


# Registration endpoint
@app.post("/auth/register", response_model=UserResponse)
async def register(user: UserRegisterRequest):
    if register_user(user.username, user.password):
        return {"username": user.username, "message": "User registered successfully"}
    else:
        raise HTTPException(status_code=409, detail="User already exists or password does not meet policy")


# Login endpoint
@app.post("/auth/login", response_model=UserResponse)
async def login(user: UserLoginRequest):
    if verify_user(user.username, user.password):
        return {"username": user.username, "message": "Login successful"}
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")


# Prediction endpoint
@app.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    try:
        model, scaler, label_encoders, metadata = load_artifacts_cached()
        
        prepared = prepare_input_dataframe(request.features, metadata, label_encoders)
        scaled = scaler.transform(prepared)
        
        pred = model.predict(scaled)[0]
        proba = model.predict_proba(scaled)[0]
        
        prediction_label = "Churn" if int(pred) == 1 else "No Churn"
        confidence = float(max(proba))
        
        return {
            "prediction": prediction_label,
            "confidence": confidence,
            "timestamp": pd.Timestamp.now().isoformat()
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Prediction failed: {str(e)}")
    except Exception as e:
        logger.exception("Unexpected prediction error")
        raise HTTPException(status_code=500, detail="Prediction failed due to internal server error")


# Model info endpoint
@app.get("/model/info")
async def model_info():
    try:
        _, _, _, metadata = load_artifacts_cached()
        return {
            "features": metadata["feature_columns"],
            "numeric_features": metadata["numeric_columns"],
            "categorical_features": metadata["categorical_columns"],
            "numeric_defaults": metadata["numeric_defaults"],
            "categorical_classes": metadata["categorical_classes"],
        }
    except Exception as e:
        logger.exception("Failed to fetch model info")
        raise HTTPException(status_code=500, detail="Failed to fetch model info")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host=os.getenv("API_HOST", "0.0.0.0"),
        port=int(os.getenv("API_PORT", "8000")),
    )
