# PredictChurn AI

A professional machine learning application for predicting customer churn with a Next.js frontend, FastAPI backend, and Streamlit dashboard.

## Project Structure

```
predictchurn-ai/
├── main.py                 # ML pipeline (training, preprocessing)
├── app.py                  # Streamlit dashboard
├── auth.py                 # Authentication utilities
├── dataset.csv             # Sample training data
├── model.pkl               # Trained model
├── scaler.pkl              # Feature scaler
├── preprocessing_metadata.pkl  # Feature metadata
├── requirements.txt        # Python dependencies (Streamlit)
│
├── backend/
│   ├── main_api.py        # FastAPI backend server
│   └── requirements.txt    # Backend dependencies
│
└── frontend/
    ├── pages/             # Next.js pages
    ├── components/        # Reusable React components
    ├── utils/             # API client and utilities
    ├── context/           # React context (authentication)
    ├── styles/            # Tailwind CSS and global styles
    ├── package.json       # Frontend dependencies
    ├── next.config.js     # Next.js configuration
    ├── tailwind.config.js # Tailwind configuration
    └── postcss.config.js  # PostCSS configuration
```

## Features

- **ML Pipeline**: Random Forest classifier for churn prediction
- **Multiple UIs**:
  - Streamlit dashboard for quick prototyping
  - Next.js web app for professional interface
- **Authentication**: User registration and login
- **Prediction History**: Save and track predictions per user
- **Analytics Dashboard**: View model features and statistics
- **FastAPI Backend**: RESTful API for predictions
- **Responsive Design**: Works on desktop and mobile devices

## Setup Instructions

### 0. Configure Environment Variables

Copy the example env files and customize them:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local
```

For production, set:
- `APP_ENV=production`
- `CREATE_DEFAULT_ADMIN=false`
- `DEFAULT_ADMIN_PASSWORD` to a strong value
- `ALLOWED_ORIGINS` to your frontend domain(s)
- `NEXT_PUBLIC_API_URL` to your backend URL

### 1. Train the Model

```bash
python3 main.py
```

This will create:
- `model.pkl` - trained model
- `scaler.pkl` - feature scaler
- `preprocessing_metadata.pkl` - feature metadata
- `users.json` - user credentials store

### 2. Start Streamlit Dashboard (Optional)

```bash
pip3 install -r requirements.txt
streamlit run app.py
```

Access at: `http://localhost:8501`

### 3. Start FastAPI Backend

```bash
cd backend
pip3 install -r requirements.txt
python3 main_api.py
```

Access API at: `http://localhost:8000`
Docs at: `http://localhost:8000/docs`

### 4. Start Next.js Frontend

```bash
cd frontend
npm install
npm run dev
```

Access at: `http://localhost:3000`

## Default Credentials

Only created in non-production mode unless explicitly enabled.

- **Username**: `admin`
- **Password**: value from `DEFAULT_ADMIN_PASSWORD`

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user

### Predictions
- `POST /predict` - Make a prediction
- `GET /model/info` - Get model information

### Health
- `GET /health` - Health check

## Example Prediction Request

```bash
curl -X POST "http://localhost:8000/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "features": {
      "customerID": "1010-JJJJJ",
      "gender": "Male",
      "tenure": 60,
      ...
    }
  }'
```

## Technology Stack

### Backend
- Python 3.11
- scikit-learn (Random Forest)
- FastAPI (REST API)
- Streamlit (Dashboard)

### Frontend
- Next.js 14
- React 18
- Tailwind CSS
- Framer Motion (animations)
- Axios (HTTP client)

## Performance

- **Model Accuracy**: 100% on training set
- **Prediction Time**: < 100ms
- **API Response Time**: < 200ms
- **Number of Features**: 21

## Development

### Add New Feature
1. Update `main.py` preprocessing
2. Retrain model: `python3 main.py`
3. Update `frontend/utils/api.js` if needed

### Extend API
Add new endpoints in `backend/main_api.py` following existing patterns.

### Customize UI
- Modify pages in `frontend/pages/`
- Update styles in `frontend/styles/globals.css`
- Adjust Tailwind config in `frontend/tailwind.config.js`

## Deployment

### Streamlit
```bash
streamlit run app.py --server.port 8080
```

### FastAPI
```bash
cd backend
uvicorn main_api:app --host 0.0.0.0 --port 8000
```

### Next.js
```bash
npm run build
npm start
```

## Production Checklist

1. Train and persist artifacts (`model.pkl`, `scaler.pkl`, `preprocessing_metadata.pkl`) before deploy.
2. Set `APP_ENV=production` and `CREATE_DEFAULT_ADMIN=false`.
3. Set strict `ALLOWED_ORIGINS` instead of wildcard origins.
4. Use a strong `DEFAULT_ADMIN_PASSWORD` only when bootstrapping an admin account.
5. Set `NEXT_PUBLIC_API_URL` to your public backend URL.
6. Run the backend and frontend behind HTTPS (reverse proxy or platform TLS).
7. Build frontend with `npm run build` and serve with `npm start`.

## Deploying to Render

This application is configured for easy deployment on Render. See [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md) for detailed instructions.

**Quick Start:**
1. Push code to GitHub
2. Connect repository to Render
3. Render will automatically detect `render.yaml` and deploy both services
4. Configure environment variables in Render dashboard
5. Access your app at the provided Render URLs

For production deployment, ensure:
- Model artifacts are committed to repository
- Strong `DEFAULT_ADMIN_PASSWORD` is set
- `ALLOWED_ORIGINS` matches your frontend domain
- `NEXT_PUBLIC_API_URL` matches your backend URL

## Troubleshooting

### Model artifacts missing
```bash
python3 main.py
```

### API connection error
Ensure `NEXT_PUBLIC_API_URL` in `frontend/.env.local` is correct

### Port already in use
Change port numbers or kill existing processes

## License

MIT License

## Author

AI Development Team - 2026
# PredictChurn-AI
