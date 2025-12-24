# Meesho Product Variation Filler Extension

A Chrome/Brave extension to automatically fill product variation details on Meesho.

## Setup Instructions

1. **Load the extension:**
   - Open Chrome/Brave and go to `chrome://extensions/` (or `brave://extensions/`)
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select this directory

2. **Update Data (Optional):**
   - Open `content.js`
   - Modify the `SAMPLE_DATA` array with your product variation data
   - The data structure should match: `{ size, meeshoPrice, mrp, inventory, waist, hip, length, thigh, rise, inseam }`

## How to Use

1. Navigate to the Meesho product variation page (the page with the table of sizes 24, 26, 28, etc.)
2. The extension will automatically add a red "Apply" button in the top-right corner
3. Click the "Apply" button to fill all variations
4. The extension will match each row by size and fill the corresponding data

## Features

- **Automatic Row Detection**: Finds all variation rows in the table
- **Size Matching**: Matches data to rows based on the size number
- **Smart Dropdown Handling**: Automatically opens and selects values in Material-UI dropdowns
- **Progress Feedback**: Shows notifications when filling is complete
- **Error Handling**: Gracefully handles missing fields or errors

## Data Structure

The extension expects data in this format:

```javascript
{
  size: 24,              // Size number (24, 26, 28, etc.)
  meeshoPrice: 300,      // Meesho selling price
  mrp: 999,              // Maximum Retail Price
  inventory: 1000,       // Stock quantity
  waist: 24,             // Waist size
  hip: 30,               // Hip size
  length: 37,            // Length size
  thigh: 10,             // Thigh size
  rise: 11,              // Rise length
  inseam: 26             // Inseam length
}
```

## Current Implementation

The extension fills these fields:
1. ✅ Meesho Price (`input[name="meesho_price"]`)
2. ✅ MRP (`input[name="product_mrp"]`)
3. ✅ Inventory (`input[name="inventory"]`)
4. ✅ Waist Size (`input[id="waist_size"]` - dropdown)
5. ✅ Hip Size (`input[id="hip_size"]` - dropdown)
6. ✅ Length Size (`input[id="length_size"]` - dropdown)
7. ✅ Thigh Size (`input[id="thigh_size"]` - dropdown)
8. ✅ Rise Length (`input[id="rise_length"]` - dropdown)
9. ✅ Inseam Length (`input[id="inseam_length"]` - dropdown)

## Troubleshooting

**If dropdowns don't fill correctly:**
- The extension tries to click and select from Material-UI dropdowns
- If this doesn't work, you may need to manually adjust the `setDropdownValue` function
- Check the browser console (F12) for any error messages

**If rows aren't found:**
- Make sure you're on the correct Meesho page with the variation table
- The extension looks for rows with class `MuiTableRow-root MuiTableRow-hover`
- Check the browser console for debugging information

## Files Structure

- `manifest.json` - Extension configuration
- `content.js` - Main script that fills the form (contains all the logic)
- `popup.html/js` - Extension popup interface
- `styles.css` - Additional styling
- `table.html` - Reference HTML structure (for development)

