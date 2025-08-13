#!/bin/bash

echo "🔍 Verifying Idea-lista build..."

# Check required files
required_files=(
    "manifest.json"
    "popup.html"
    "popup.js"
    "popup.css"
    "background.js"
    "content.js"
    "styles.css"
    "icon16.png"
    "icon48.png"
    "icon128.png"
)

missing_files=()
invalid_files=()

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        missing_files+=("$file")
    elif [ ! -s "$file" ]; then
        invalid_files+=("$file (empty)")
    fi
done

# Check manifest.json structure
if [ -f "manifest.json" ]; then
    if ! jq empty manifest.json 2>/dev/null; then
        invalid_files+=("manifest.json (invalid JSON)")
    fi
fi

# Check popup.html structure
if [ -f "popup.html" ]; then
    if ! grep -q "popup.js" popup.html; then
        invalid_files+=("popup.html (missing popup.js reference)")
    fi
    if ! grep -q "popup.css" popup.html; then
        invalid_files+=("popup.html (missing popup.css reference)")
    fi
fi

# Report results
if [ ${#missing_files[@]} -eq 0 ] && [ ${#invalid_files[@]} -eq 0 ]; then
    echo "✅ Build verification passed!"
    echo "📋 All required files are present and valid"
    echo "🚀 Extension is ready to load in Chrome"
else
    echo "❌ Build verification failed!"
    
    if [ ${#missing_files[@]} -gt 0 ]; then
        echo "📁 Missing files:"
        for file in "${missing_files[@]}"; do
            echo "   - $file"
        done
    fi
    
    if [ ${#invalid_files[@]} -gt 0 ]; then
        echo "⚠️ Invalid files:"
        for file in "${invalid_files[@]}"; do
            echo "   - $file"
        done
    fi
    
    exit 1
fi
