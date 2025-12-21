# Meesho Supplier Auto-Fill Chrome Extension

A Chrome extension that automatically fills input fields and select values in Meesho supplier forms.

## Features

- 🚀 **Auto-fill on page load** - Automatically fills form fields when the page loads
- ⚙️ **Configurable values** - Set default values for all fields via the popup
- 🎯 **Target specific fields** - Fill individual fields or all fields at once
- 💾 **Save settings** - Your preferences are saved and synced across devices
- 🔄 **React/SPA support** - Works with React-based forms and single-page applications

## Installation

1. **Download or clone this repository**

2. **Open Chrome Extensions page**
   - Go to `chrome://extensions/`
   - Or navigate to: Menu (⋮) → Extensions → Manage Extensions

3. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top right corner

4. **Load the extension**
   - Click "Load unpacked"
   - Select the folder containing this extension

5. **Add icons (optional)**
   - The extension references icon files (`icon16.png`, `icon48.png`, `icon128.png`)
   - You can create simple icons or use placeholder images
   - Or remove the icon references from `manifest.json` if you don't need them

## Usage

### Setting up default values

1. Click the extension icon in your Chrome toolbar
2. Enter values for the fields you want to auto-fill
3. Click "Save" to store your preferences
4. Toggle "Auto-fill on page load" to enable/disable automatic filling

### Manual fill

1. Navigate to a Meesho supplier form page
2. Click the extension icon
3. Enter or adjust values
4. Click "Fill Now" to immediately fill all fields on the page

### Supported Fields

- **Meesho Price*** (id: `meesho_price`)
- **Wrong/Defective Returns Price** (id: `only_wrong_return_price`)
- **MRP*** (id: `product_mrp`)
- **Inventory*** (id: `inventory`)
- **SKU ID** (id: `supplier_sku_id`)
- **Waist Size*** (id: `waist_size`)
- **Hip Size** (id: `hip_size`)
- **Length Size** (id: `length_size`)
- **Thigh Size** (id: `thigh_size`)
- **Rise Length** (id: `rise_length`)
- **Inseam Length** (id: `inseam_length`)

## How It Works

- **Content Script** (`content.js`): Injected into Meesho pages to detect and fill form fields
- **Popup** (`popup.html/js`): User interface for configuring values and triggering fills
- **Background Service Worker** (`background.js`): Handles extension lifecycle and storage

The extension uses Chrome's storage API to save your preferences and automatically fills fields when:
- The page loads
- New content is dynamically added (for SPAs)
- You manually trigger a fill from the popup

## Development

### File Structure

```
meesho-extension-chrome/
├── manifest.json       # Extension manifest
├── content.js          # Content script (runs on Meesho pages)
├── popup.html          # Popup UI
├── popup.js            # Popup logic
├── background.js       # Background service worker
├── icon16.png          # Extension icon (16x16)
├── icon48.png          # Extension icon (48x48)
├── icon128.png         # Extension icon (128x128)
└── README.md           # This file
```

### Making Changes

1. Edit the relevant files
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card
4. Test your changes

## Troubleshooting

- **Fields not filling?**
  - Make sure you're on a Meesho domain (`*.meesho.com`)
  - Check the browser console for errors (F12)
  - Verify the field IDs match the form fields

- **Values not saving?**
  - Check Chrome's storage permissions
  - Try disabling and re-enabling the extension

- **Auto-fill not working?**
  - Check if "Auto-fill on page load" is enabled in the popup
  - Some pages may load fields dynamically - wait a few seconds or use "Fill Now"

## License

MIT License - feel free to modify and use as needed.

