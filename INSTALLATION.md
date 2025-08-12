# Installation Guide for Idea-lista

## Overview

**Idea-lista** is a professional Chrome extension that transforms your property search experience. It automatically analyzes Idealista listings, calculates professional scores, and helps you manage and compare properties efficiently.

### Key Features:
- 🏠 **Automatic Property Analysis** - Extracts all relevant data from listings
- 📊 **Professional Scoring System** - Ranks properties based on real estate criteria
- 🎨 **Color-Coded Interface** - Visual indicators for property quality
- 💾 **Property Management** - Save, compare, and organize your favorites
- 📈 **Smart Comparison** - See why one property is better than others
- 📋 **Export Functionality** - Download your property list for further analysis

## Step 1: Generate Icons

1. Open the `generate-icons.html` file in your web browser
2. Click "Generate All Icons" to download the three required icon files:
   - `icon16.png`
   - `icon48.png`
   - `icon128.png`
3. Move these files to the same folder as the other extension files

## Step 2: Install the Extension

### For Chrome/Edge:

1. Open your browser and navigate to `chrome://extensions/`
2. Enable "Developer mode" by toggling the switch in the top-right corner
3. Click "Load unpacked"
4. Select the folder containing all the extension files:
   - `manifest.json`
   - `content.js`
   - `styles.css`
   - `background.js`
   - `popup.html`
   - `popup.css`
   - `popup.js`
   - `icon16.png`
   - `icon48.png`
   - `icon128.png`
   - `README.md`
5. The extension should now appear in your extensions list

### Verify Installation:

1. You should see "Idea-lista" in your extensions list
2. The extension should show as "Enabled"
3. You should see the extension icon in your browser toolbar
4. Navigate to any Idealista property page (e.g., https://www.idealista.com/inmueble/88214200/)
5. You should see a compact analysis panel above the property details

## Step 3: Using the Property Manager

### Adding Properties:
1. Go to an Idealista property listing
2. Look for the analysis panel above the property details
3. Click the **"➕ Agregar"** button
4. You'll see a green confirmation: **"✅ Agregado"**

### Managing Your Properties:
1. Click the extension icon in your browser toolbar
2. The popup will show all your saved properties
3. Properties are automatically sorted by score (best first)
4. Each property shows:
   - **Price and key details**
   - **Professional score** (0-100)
   - **Color-coded quality indicator**
   - **Action buttons** (View, Remove)

### Understanding the Scoring System:
- **🟢 Excellent (80-100)**: Outstanding properties
- **🔵 Good (60-79)**: Very good options
- **🟡 Average (40-59)**: Decent properties
- **🔴 Poor (0-39)**: Below average

### Scoring Criteria:
- **Price (30%)**: Lower is better
- **Size (20%)**: Bigger is better
- **Rooms (15%)**: More rooms is better
- **Bathrooms (10%)**: More bathrooms is better
- **Features (15%)**: Heating, furnished, elevator, long-term rental
- **Price/m² (10%)**: Lower is better

### Advanced Features:

#### Viewing the Best Property:
- Click on **"🏆 Mejor: X€"** in the popup
- See detailed analysis of why it's the best
- Compare with other properties

#### Exporting Data:
- Click **"📊 Exportar"** in the popup
- Download a TSV file with all property data
- Perfect for Excel analysis

#### Debugging:
- Click **"🐛 Debug"** to see technical information
- Check browser console for detailed logs

## Step 4: Test the Complete Workflow

1. **Add Multiple Properties**:
   - Visit 3-4 different Idealista listings
   - Click "➕ Agregar" on each one
   - Verify you see the green confirmation

2. **Open the Manager**:
   - Click the extension icon
   - Verify properties appear in the popup
   - Check they're sorted by score

3. **Test Interactions**:
   - Click "Ver" to open a property
   - Click "Eliminar" to remove one
   - Click "🏆 Mejor" to see the analysis
   - Click "📊 Exportar" to download data

## Troubleshooting

### Extension Not Loading:
- Make sure all files are in the same folder
- Check that the icon files are named exactly as specified
- Ensure "Developer mode" is enabled
- Verify `background.js` is included

### Extension Not Working on Idealista:
- Refresh the page
- Check the browser console for errors (F12 → Console)
- Make sure you're on a valid property page URL
- Try clicking the extension icon to open the popup

### Properties Not Saving:
- Check that the extension has storage permissions
- Open browser console and look for error messages
- Try the debug button in the popup

### Popup Not Opening:
- Right-click the extension icon and select "Inspect popup"
- Check for JavaScript errors in the popup console
- Verify all popup files (`popup.html`, `popup.css`, `popup.js`) are present

### Icons Not Showing:
- Regenerate the icons using the `generate-icons.html` file
- Ensure the icon files are in the correct format (PNG)
- Check that the file names match exactly

## File Structure

Your extension folder should look like this:
```
idea-lista/
├── manifest.json
├── content.js
├── styles.css
├── background.js
├── popup.html
├── popup.css
├── popup.js
├── icon16.png
├── icon48.png
├── icon128.png
├── README.md
├── INSTALLATION.md
└── generate-icons.html
```

## Updating the Extension

To update the extension after making changes:
1. Go to `chrome://extensions/`
2. Find "Idea-lista"
3. Click the refresh/reload icon (🔄)
4. Or click "Remove" and "Load unpacked" again

## Uninstalling

To remove the extension:
1. Go to `chrome://extensions/`
2. Find "Idea-lista"
3. Click "Remove"
4. Confirm the removal
5. Note: This will delete all saved properties

## Professional Tips

### Best Practices:
- **Add properties systematically** - Don't add everything, be selective
- **Use the scoring system** - Focus on properties with scores above 60
- **Compare regularly** - Use the "🏆 Mejor" feature to understand differences
- **Export periodically** - Keep backups of your property list

### Understanding Scores:
- **85+**: Exceptional properties, act quickly
- **70-84**: Very good options, strong contenders
- **60-69**: Good properties, worth considering
- **Below 60**: May have significant drawbacks

### Workflow Optimization:
1. **Browse** Idealista listings
2. **Add** promising properties (score > 60)
3. **Review** your list in the popup
4. **Compare** using the "🏆 Mejor" feature
5. **Export** when ready to make decisions

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Use the debug button in the popup
3. Verify all files are present and correctly named
4. Try reinstalling the extension

Idea-lista is designed to make your property search more efficient and data-driven. Enjoy your enhanced Idealista experience! 🏠✨
