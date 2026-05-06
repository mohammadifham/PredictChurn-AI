# Render Deployment Guide

This guide walks you through deploying PredictChurn AI on Render.

## Prerequisites

1. **GitHub Account**: Fork or push this repository to GitHub
2. **Render Account**: Sign up at https://render.com
3. **Model Artifacts**: Ensure `model.pkl`, `scaler.pkl`, and `preprocessing_metadata.pkl` are in the root directory

## Step 1: Prepare Your Repository

```bash
# Make sure all changes are committed
git add .
git commit -m "Prepare for Render deployment"
git push
```

The repository should already contain:
- `render.yaml` - Infrastructure configuration
- `backend/Procfile` - Backend startup configuration
- `backend/requirements.txt` - Pinned dependencies
- `frontend/package.json` - Frontend dependencies

## Step 2: Connect to Render

1. Go to https://render.com/dashboard
2. Click "New +" button
3. Select "Web Service from Git"
4. Connect your GitHub account
5. Select this repository

## Step 3: Deploy Using render.yaml

**Recommended: Deploy both services at once using `render.yaml`**

1. In Render dashboard, click "New +"
2. Select "Infrastructure as Code"
3. Select your GitHub repository
4. Select the branch (usually `main`)
5. Click "Deploy"

Render will automatically create:
- `predictchurn-ai-backend` service
- `predictchurn-ai-frontend` service

## Step 4: Configure Environment Variables

### For Backend Service

In Render dashboard, go to the backend service settings:

1. Click "Environment"
2. Add these variables:

| Key | Value | Note |
|-----|-------|------|
| `APP_ENV` | `production` | Required |
| `API_HOST` | `0.0.0.0` | Required for Render |
| `API_PORT` | `8000` | Required |
| `LOG_LEVEL` | `INFO` | Production logging |
| `CREATE_DEFAULT_ADMIN` | `false` | Disable auto-creation |
| `DEFAULT_ADMIN_PASSWORD` | `STRONG_PASSWORD` | Generate with: `openssl rand -base64 32` |
| `AUTH_HASH_ITERATIONS` | `200000` | Password hashing strength |
| `ALLOWED_ORIGINS` | `https://predictchurn-ai-frontend.onrender.com` | Your frontend URL |

### For Frontend Service

In Render dashboard, go to the frontend service settings:

1. Click "Environment"
2. Add these variables:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_API_URL` | `https://predictchurn-ai-backend.onrender.com` |
| `NEXT_PUBLIC_API_TIMEOUT_MS` | `15000` |

## Step 5: Set Up Model Artifacts

The model files (`model.pkl`, `scaler.pkl`, `preprocessing_metadata.pkl`) must be committed to your repository:

```bash
# Verify files are in root directory
ls -la model.pkl scaler.pkl preprocessing_metadata.pkl

# Add to git if not already included
git add model.pkl scaler.pkl preprocessing_metadata.pkl
git commit -m "Add trained model artifacts"
git push
```

**Note**: If model files are large, consider:
- Using Git LFS (Large File Storage)
- Or create a startup script to download them from cloud storage

## Step 6: Monitor Deployment

1. Go to your Render dashboard
2. Watch the deployment logs for both services
3. Once both services show "Live", your app is deployed!

## Step 7: First-Time Setup

After deployment, you may need to:

1. **Bootstrap Admin User** (if needed):
   - Set `CREATE_DEFAULT_ADMIN=true` temporarily in backend environment
   - Restart the service
   - Log in with admin / `DEFAULT_ADMIN_PASSWORD`
   - Then set `CREATE_DEFAULT_ADMIN=false` and restart again

2. **Initialize `users.json`**:
   - The backend creates this on first run
   - Users are persisted in a local file (consider using Render's persistent disk or PostgreSQL for production)

3. **Create Regular Users**:
   - Use the registration page at `/register`
   - Or use the API: `POST /auth/register`

## Deployment URLs

After successful deployment:

- **Frontend**: `https://predictchurn-ai-frontend.onrender.com`
- **Backend API**: `https://predictchurn-ai-backend.onrender.com`
- **API Docs**: `https://predictchurn-ai-backend.onrender.com/docs`
- **Health Check**: `https://predictchurn-ai-backend.onrender.com/health`

## Troubleshooting

### Backend Won't Start

Check logs for errors:
```
1. Click on backend service
2. Go to "Logs" tab
3. Look for error messages
```

Common issues:
- Missing environment variables
- Model artifacts not found
- Port conflict (shouldn't happen on Render)

### Frontend Can't Connect to API

1. Verify `NEXT_PUBLIC_API_URL` matches your backend URL
2. Check CORS settings in backend (`ALLOWED_ORIGINS` env var)
3. Ensure backend is running (check `/health` endpoint)

### Users.json Permission Issues

For persistent user storage in production, consider:
1. Adding Render Disk for persistent file storage
2. Migrating to PostgreSQL or another database
3. Using environment-based authentication

## Manual Redeployment

To redeploy without code changes:

1. Go to service in Render dashboard
2. Click "Manual Deploy" button
3. Select branch and click "Deploy"

## Scaling Considerations

- **Free Tier**: Single instance, shared resources (good for demo/dev)
- **Standard Tier**: Better performance, automatic scaling
- **Pro Tier**: Even more resources and features

For prediction workloads, Free or Standard tier is usually sufficient.

## Security Checklist

Before going to production:

- [ ] `DEFAULT_ADMIN_PASSWORD` is strong (use `openssl rand -base64 32`)
- [ ] `CREATE_DEFAULT_ADMIN` is set to `false`
- [ ] `APP_ENV` is set to `production`
- [ ] `ALLOWED_ORIGINS` is set to your frontend domain only
- [ ] Model artifacts are included in repository (or sourced from secure location)
- [ ] API has HTTPS (Render provides by default)
- [ ] Regular backups configured (for user data)

## Support

For Render-specific issues, visit: https://render.com/docs
For application issues, check the logs in Render dashboard.
"""
Render Deployment Configuration

This file contains environment variables needed for Render deployment.
Set these in your Render environment variables dashboard.

Backend Environment Variables (API Service):
- APP_ENV: Set to 'production'
- API_HOST: 0.0.0.0 (for Render)
- API_PORT: 8000
- LOG_LEVEL: INFO
- CREATE_DEFAULT_ADMIN: Set to 'false' in production
- DEFAULT_ADMIN_PASSWORD: Set a strong password (generate via: openssl rand -base64 32)
- AUTH_HASH_ITERATIONS: 200000 (or higher for better security)
- ALLOWED_ORIGINS: Your frontend URL (e.g., https://predictchurn-ai-frontend.onrender.com)

Frontend Environment Variables (Web Service):
- NEXT_PUBLIC_API_URL: Your backend API URL (e.g., https://predictchurn-ai-backend.onrender.com)
- NEXT_PUBLIC_API_TIMEOUT_MS: 15000

Important Notes:
1. Copy the content of this file to your Render environment variables dashboard
2. Generate a strong DEFAULT_ADMIN_PASSWORD using: openssl rand -base64 32
3. Update ALLOWED_ORIGINS to match your actual frontend URL
4. The render.yaml file in the root automatically configures both services
"""

# To generate a strong admin password:
# openssl rand -base64 32

# Example environment variables:
APP_ENV=production
API_HOST=0.0.0.0
API_PORT=8000
LOG_LEVEL=INFO
CREATE_DEFAULT_ADMIN=false
DEFAULT_ADMIN_PASSWORD=CHANGE_THIS_TO_STRONG_PASSWORD
AUTH_HASH_ITERATIONS=200000
ALLOWED_ORIGINS=https://predictchurn-ai-frontend.onrender.com

# Frontend
NEXT_PUBLIC_API_URL=https://predictchurn-ai-backend.onrender.com
NEXT_PUBLIC_API_TIMEOUT_MS=15000
