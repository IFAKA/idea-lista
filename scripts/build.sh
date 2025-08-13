#!/bin/bash

# Build script for Idea-lista Chrome Extension

echo "🔨 Building Idea-lista for production..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install --legacy-peer-deps
fi

# Run type checking
echo "🔍 Running type check..."
npm run type-check

# Build the project
echo "🏗️ Building project..."
npm run build

# Clean up any existing files in root
echo "🧹 Cleaning up existing files..."
rm -f popup.html popup.js popup.css

# Copy built files to root for Chrome extension
echo "📁 Copying built files to root..."
cp dist/src/popup.html ./popup.html
cp dist/popup.js ./
cp dist/popup.css ./

# Fix paths in popup.html
echo "🔧 Fixing paths in popup.html..."
sed -i '' 's|src="../popup.js"|src="./popup.js"|g' popup.html
sed -i '' 's|href="../popup.css"|href="./popup.css"|g' popup.html

# Copy extension files
echo "📁 Copying extension files..."
cp manifest.json ./
cp background.js ./
cp content.js ./
cp styles.css ./

# Copy static assets
echo "📁 Copying static assets..."
cp icon*.png . 2>/dev/null || echo "⚠️ Icon files not found, skipping..."

# Verify all required files exist
echo "✅ Verifying build..."
required_files=("manifest.json" "popup.html" "popup.js" "popup.css" "background.js" "content.js" "styles.css")
missing_files=()

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -eq 0 ]; then
    echo "✅ Build complete! All files are ready for Chrome extension"
    echo "📋 To load in Chrome:"
    echo "   1. Open chrome://extensions/"
    echo "   2. Enable 'Developer mode'"
    echo "   3. Click 'Load unpacked'"
    echo "   4. Select this directory"
else
    echo "❌ Build failed! Missing files:"
    for file in "${missing_files[@]}"; do
        echo "   - $file"
    done
    exit 1
fi
