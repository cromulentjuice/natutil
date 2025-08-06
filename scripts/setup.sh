#!/bin/bash

echo "Setting up XML to Excel Converter..."

# Create Flask backend directory
mkdir -p flask-backend

# Install Python dependencies
echo "Installing Python dependencies..."
cd flask-backend
pip install -r requirements.txt

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
cd ..
npm install

echo "Setup complete!"
echo ""
echo "To run the application:"
echo "1. Start Flask backend: cd flask-backend && python app.py"
echo "2. Start Next.js frontend: npm run dev"
echo ""
echo "The Flask API will run on http://localhost:5000"
echo "The Next.js app will run on http://localhost:3000"
