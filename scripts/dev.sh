#!/bin/bash

# Development script for Idea-lista Chrome Extension

echo "🚀 Starting Idea-lista development..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install --legacy-peer-deps
fi

# Start development server
echo "🔧 Starting development server..."
npm run dev
