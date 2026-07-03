#!/bin/bash
# Quick deployment script for Jarimatika App

echo "🚀 Deploying Jarimatika App..."

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check Python version
echo "🔍 Checking Python version..."
python_version=$(python3 --version 2>&1 | awk '{print $2}')
if [[ $python_version != 3.1* ]]; then
    echo -e "${RED}❌ Python 3.10+ required (found $python_version)${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Python $python_version detected${NC}"

# Create virtual environment
echo "📦 Creating virtual environment..."
if [ -d ".venv" ]; then
    echo "🗑️ Removing existing virtual environment..."
    rm -rf .venv
fi
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
echo "📦 Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Check for model files
if [ ! -f "model/model.json" ]; then
    echo -e "${RED}⚠️ Model files not found!${NC}"
    echo "Creating model directory..."
    mkdir -p model
    echo -e "${YELLOW}Please place model files in the 'model' directory${NC}"
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p assets/images
mkdir -p logs
mkdir -p checkpoints
mkdir -p .streamlit

# Copy Streamlit config
if [ ! -f ".streamlit/config.toml" ]; then
    echo "📄 Creating Streamlit config..."
    cp .streamlit/config.toml.example .streamlit/config.toml 2>/dev/null || echo "[theme]" > .streamlit/config.toml
fi

# Start the application
echo -e "${GREEN}✅ Deployment setup complete!${NC}"
echo "🚀 Starting Jarimatika App..."
streamlit run app.py