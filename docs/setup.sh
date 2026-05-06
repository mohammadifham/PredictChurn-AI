#!/bin/bash
# Quick Start Script

echo "🚀 PredictChurn AI - Quick Start"
echo "=================================================="
echo ""

# Check Python
echo "✓ Checking Python..."
python3 --version

# Install backend dependencies
echo ""
echo "📦 Installing backend dependencies..."
cd backend
pip3 install -r requirements.txt
cd ..

# Train model (if not already trained)
if [ ! -f "model.pkl" ]; then
    echo ""
    echo "🤖 Training model..."
    python3 main.py
else
    echo "✓ Model already trained"
fi

echo ""
echo "✅ Backend setup complete!"
echo ""

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo ""
echo "✅ Frontend setup complete!"
echo ""

echo "=================================================="
echo "🎉 Setup Complete!"
echo ""
echo "To start the application:"
echo ""
echo "1. FastAPI Backend:"
echo "   cd backend && python3 main_api.py"
echo "   API: http://localhost:8000"
echo "   Docs: http://localhost:8000/docs"
echo ""
echo "2. Next.js Frontend:"
echo "   cd frontend && npm run dev"
echo "   Frontend: http://localhost:3000"
echo ""
echo "3. Streamlit Dashboard (optional):"
echo "   streamlit run app.py"
echo "   Dashboard: http://localhost:8501"
echo ""
echo "Default Login: admin / DEFAULT_ADMIN_PASSWORD (when CREATE_DEFAULT_ADMIN=true)"
echo "=================================================="
