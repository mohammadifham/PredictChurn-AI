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

from auth import (
    create_default_admin,
    create_admins_from_env,
    register_user,
    verify_user,
)
from auth import get_user_role, list_users, delete_user, set_user_role, set_user_password
from typing import Any, Dict, Optional, List
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
    # Create any default admin(s) provided via environment.
    # `create_default_admin` is controlled by `CREATE_DEFAULT_ADMIN` and
    # `DEFAULT_ADMIN_PASSWORD`. `create_admins_from_env` allows multiple
    # admin accounts via `DEFAULT_ADMIN_USERS` (format: user:pass,user2:pass2).
    create_default_admin()
    create_admins_from_env()
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
    role: Optional[str] = Field(default="user")


class UserLoginRequest(BaseModel):
    username: str = Field(min_length=3, max_length=64)
    password: str = Field(min_length=8, max_length=128)


class UserResponse(BaseModel):
    username: str
    message: str
    role: Optional[str] = None


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
    if register_user(user.username, user.password, role=(user.role or "user")):
        return {"username": user.username, "message": "User registered successfully", "role": (user.role or "user")}
    else:
        raise HTTPException(status_code=409, detail="User already exists or password does not meet policy")


# Login endpoint
@app.post("/auth/login", response_model=UserResponse)
async def login(user: UserLoginRequest):
    if verify_user(user.username, user.password):
        role = get_user_role(user.username)
        return {"username": user.username, "message": "Login successful", "role": role}
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")


class AdminAuthRequest(BaseModel):
    admin_username: str
    admin_password: str


class RoleUpdateRequest(BaseModel):
    admin_username: str
    admin_password: str
    role: str = Field(default="admin")


class AdminCreateRequest(BaseModel):
    admin_username: str
    admin_password: str
    username: str = Field(min_length=3, max_length=64)
    password: str = Field(min_length=8, max_length=128)
    role: Optional[str] = Field(default="user")


class AdminPasswordRequest(BaseModel):
    admin_username: str
    admin_password: str
    new_password: str = Field(min_length=8, max_length=128)


class AdminBulkRequest(BaseModel):
    admin_username: str
    admin_password: str
    action: str
    users: List[str]


@app.post("/auth/users")
async def auth_list_users(auth: AdminAuthRequest):
    if not verify_user(auth.admin_username, auth.admin_password):
        raise HTTPException(status_code=401, detail="Invalid admin credentials")
    if get_user_role(auth.admin_username) != "admin":
        raise HTTPException(status_code=403, detail="Admin privileges required")
    return list_users()


@app.post("/auth/users/create")
async def auth_create_user(payload: AdminCreateRequest):
    if not verify_user(payload.admin_username, payload.admin_password):
        raise HTTPException(status_code=401, detail="Invalid admin credentials")
    if get_user_role(payload.admin_username) != "admin":
        raise HTTPException(status_code=403, detail="Admin privileges required")
    if register_user(payload.username, payload.password, role=(payload.role or "user")):
        return {"username": payload.username, "role": (payload.role or "user"), "message": "User created"}
    raise HTTPException(status_code=409, detail="User already exists or password policy failed")


@app.post("/auth/users/{username}/password")
async def auth_set_password(username: str, payload: AdminPasswordRequest):
    if not verify_user(payload.admin_username, payload.admin_password):
        raise HTTPException(status_code=401, detail="Invalid admin credentials")
    if get_user_role(payload.admin_username) != "admin":
        raise HTTPException(status_code=403, detail="Admin privileges required")
    if set_user_password(username, payload.new_password):
        return {"username": username, "message": "Password updated"}
    raise HTTPException(status_code=404, detail="User not found or password invalid")


@app.post("/auth/users/bulk")
async def auth_bulk_action(payload: AdminBulkRequest):
    if not verify_user(payload.admin_username, payload.admin_password):
        raise HTTPException(status_code=401, detail="Invalid admin credentials")
    if get_user_role(payload.admin_username) != "admin":
        raise HTTPException(status_code=403, detail="Admin privileges required")

    results = {"action": payload.action, "processed": {}, "errors": {}}
    for u in payload.users:
        try:
            if payload.action == "delete":
                if u == payload.admin_username:
                    results["errors"][u] = "Cannot delete acting admin"
                    continue
                ok = delete_user(u)
                if ok:
                    results["processed"][u] = "deleted"
                else:
                    results["errors"][u] = "not found"
            elif payload.action == "promote":
                ok = set_user_role(u, "admin")
                if ok:
                    results["processed"][u] = "promoted"
                else:
                    results["errors"][u] = "not found"
            elif payload.action == "demote":
                ok = set_user_role(u, "user")
                if ok:
                    results["processed"][u] = "demoted"
                else:
                    results["errors"][u] = "not found"
            else:
                results["errors"][u] = f"unknown action {payload.action}"
        except Exception as e:
            results["errors"][u] = str(e)

    return results


@app.delete("/auth/users/{username}")
async def auth_delete_user(username: str, auth: AdminAuthRequest):
    if not verify_user(auth.admin_username, auth.admin_password):
        raise HTTPException(status_code=401, detail="Invalid admin credentials")
    if get_user_role(auth.admin_username) != "admin":
        raise HTTPException(status_code=403, detail="Admin privileges required")
    if username == auth.admin_username:
        raise HTTPException(status_code=400, detail="Cannot delete the acting admin")
    if delete_user(username):
        return {"username": username, "message": "User deleted"}
    else:
        raise HTTPException(status_code=404, detail="User not found")


@app.post("/auth/users/{username}/role")
async def auth_set_role(username: str, payload: RoleUpdateRequest):
    if not verify_user(payload.admin_username, payload.admin_password):
        raise HTTPException(status_code=401, detail="Invalid admin credentials")
    if get_user_role(payload.admin_username) != "admin":
        raise HTTPException(status_code=403, detail="Admin privileges required")
    if set_user_role(username, payload.role):
        return {"username": username, "role": payload.role, "message": "Role updated"}
    raise HTTPException(status_code=404, detail="User not found")


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
