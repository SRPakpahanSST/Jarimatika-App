#!/bin/bash
# Setup script for Streamlit deployment

echo "🚀 Setting up Jarimatika App..."

# Create virtual environment if not exists
if [ ! -d ".venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv .venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source .venv/bin/activate

# Install dependencies
echo "📦 Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Download model files if needed
if [ ! -f "model/model.json" ]; then
    echo "📥 Downloading model files..."
    mkdir -p model
    # Add model download logic here if needed
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p assets/images
mkdir -p logs
mkdir -p checkpoints

# Set environment variables
echo "⚙️ Setting environment variables..."
cp .env.example .env 2>/dev/null || true

echo "✅ Setup complete!"
echo "Run: streamlit run app.py"