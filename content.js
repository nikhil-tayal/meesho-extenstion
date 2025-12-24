// Content script to fill Meesho product variation form

// Sample data structure - Update this with your actual data
const SAMPLE_DATA = [
  {
    size: 24,
    meeshoPrice: 300,
    mrp: 999,
    inventory: 1000,
    waist: 24,
    hip: 30,
    length: 37,
    thigh: 10,
    rise: 11,
    inseam: 24,
  },
  {
    size: 26,
    meeshoPrice: 310,
    mrp: 999,
    inventory: 1000,
    waist: 26,
    hip: 32,
    length: 38,
    thigh: 10,
    rise: 11,
    inseam: 25,
  },
  {
    size: 28,
    meeshoPrice: 290,
    mrp: 999,
    inventory: 1000,
    waist: 28,
    hip: 34,
    length: 38,
    thigh: 11,
    rise: 11,
    inseam: 25,
  },
  {
    size: 30,
    meeshoPrice: 310,
    mrp: 999,
    inventory: 1000,
    waist: 30,
    hip: 36,
    length: 38,
    thigh: 11,
    rise: 11,
    inseam: 25,
  },
  {
    size: 32,
    meeshoPrice: 320,
    mrp: 999,
    inventory: 1000,
    waist: 32,
    hip: 38,
    length: 38,
    thigh: 12,
    rise: 11,
    inseam: 25,
  },
  {
    size: 34,
    meeshoPrice: 330,
    mrp: 999,
    inventory: 1000,
    waist: 34,
    hip: 40,
    length: 38,
    thigh: 13,
    rise: 12,
    inseam: 25,
  },
  {
    size: 36,
    meeshoPrice: 330,
    mrp: 999,
    inventory: 1,
    waist: 36,
    hip: 42,
    length: 38,
    thigh: 13,
    rise: 12,
    inseam: 26,
  },
  {
    size: 38,
    meeshoPrice: 340,
    mrp: 999,
    inventory: 1,
    waist: 38,
    hip: 44,
    length: 38,
    thigh: 14,
    rise: 11,
    inseam: 26,
  },
  {
    size: 40,
    meeshoPrice: 340,
    mrp: 999,
    inventory: 1,
    waist: 40,
    hip: 46,
    length: 39,
    thigh: 14,
    rise: 13,
    inseam: 26,
  },
];

// Helper function to set input value (for regular inputs)
function setInputValue(input, value) {
  if (!input || value === undefined || value === null) return;

  // Remove disabled and readonly attributes if present
  if (input.hasAttribute("disabled")) {
    input.removeAttribute("disabled");
  }
  if (input.hasAttribute("readonly")) {
    input.removeAttribute("readonly");
  }

  // Trigger focus and input events for React/Vue forms
  input.focus();

  // Set the value
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value"
  )?.set;
  if (nativeInputValueSetter) {
    nativeInputValueSetter.call(input, value);
  } else {
    input.value = value;
  }

  // Dispatch events to ensure form libraries detect the change
  input.dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));
  input.dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));
  input.dispatchEvent(new Event("blur", { bubbles: true }));

  // Also try React-specific events
  const nativeEvent = new Event("input", { bubbles: true });
  Object.defineProperty(nativeEvent, "target", {
    writable: false,
    value: input,
  });
  input.dispatchEvent(nativeEvent);

  input.blur();
}

// Helper function to set dropdown value (for readonly Material-UI dropdowns)
async function setDropdownValue(dropdownInput, value) {
  if (!dropdownInput || value === undefined || value === null) return false;

  const valueStr = String(value);
  let success = false;

  // Method 1: Try setting value directly first (simplest approach)
  try {
    // Remove readonly attribute temporarily
    const wasReadonly = dropdownInput.hasAttribute("readonly");
    if (wasReadonly) {
      dropdownInput.removeAttribute("readonly");
    }

    // Try setting value using native setter
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value"
    )?.set;
    if (nativeInputValueSetter) {
      nativeInputValueSetter.call(dropdownInput, valueStr);
    } else {
      dropdownInput.value = valueStr;
    }

    // Trigger all possible events
    dropdownInput.dispatchEvent(
      new Event("input", { bubbles: true, cancelable: true })
    );
    dropdownInput.dispatchEvent(
      new Event("change", { bubbles: true, cancelable: true })
    );
    dropdownInput.dispatchEvent(
      new Event("blur", { bubbles: true, cancelable: true })
    );

    // React-specific event
    const reactEvent = new Event("input", { bubbles: true });
    Object.defineProperty(reactEvent, "target", {
      writable: false,
      value: dropdownInput,
    });
    dropdownInput.dispatchEvent(reactEvent);

    // Restore readonly if it was there
    if (wasReadonly) {
      dropdownInput.setAttribute("readonly", "");
    }

    // Check if value was set
    if (dropdownInput.value === valueStr) {
      success = true;
    }
  } catch (error) {
    console.warn("Direct value setting failed:", error);
  }

  // Method 2: If direct setting didn't work, try clicking and selecting from menu
  if (!success) {
    try {
      // Click on the dropdown to open it
      dropdownInput.click();
      dropdownInput.focus();

      // Wait for the dropdown menu to appear
      await new Promise((resolve) => setTimeout(resolve, 400));

      // Find the dropdown menu (Material-UI uses portals)
      const menuSelectors = [
        '[role="listbox"]',
        '.MuiPaper-root[role="presentation"]',
        ".MuiPopover-paper",
        '[class*="MuiMenu-paper"]',
        '[class*="MuiPopover-root"] ul',
        'ul[role="listbox"]',
        ".MuiAutocomplete-listbox",
      ];

      let menu = null;
      for (const selector of menuSelectors) {
        const menus = document.querySelectorAll(selector);
        for (const m of menus) {
          if (m.offsetParent !== null) {
            // Check if visible
            menu = m;
            break;
          }
        }
        if (menu) break;
      }

      if (menu) {
        // Find the option with the matching value
        const options = menu.querySelectorAll(
          'li[role="option"], li[data-value], [role="option"], li'
        );

        for (const option of options) {
          const optionValue =
            option.getAttribute("data-value") ||
            option.textContent.trim() ||
            option.innerText.trim();
          const optionText =
            option.textContent.trim() || option.innerText.trim();

          if (
            String(optionValue) === valueStr ||
            optionText === valueStr ||
            optionText.startsWith(valueStr + " ") ||
            optionText.endsWith(" " + valueStr)
          ) {
            // Scroll into view if needed
            option.scrollIntoView({ block: "nearest", behavior: "smooth" });
            await new Promise((resolve) => setTimeout(resolve, 100));

            // Click the option
            option.click();
            await new Promise((resolve) => setTimeout(resolve, 200));

            // Verify the value was set
            if (dropdownInput.value === valueStr) {
              success = true;
              break;
            }
          }
        }

        // If still not found, try clicking by index (if menu options are in order)
        if (!success && options.length > 0) {
          const menuOptions = Array.from(options);
          const index = menuOptions.findIndex((opt) => {
            const text = opt.textContent.trim() || opt.innerText.trim();
            return text === valueStr || text.startsWith(valueStr);
          });
          if (index >= 0) {
            menuOptions[index].click();
            await new Promise((resolve) => setTimeout(resolve, 200));
            success = dropdownInput.value === valueStr;
          }
        }
      } else {
        console.warn("Dropdown menu not found after clicking");
      }
    } catch (error) {
      console.error("Error in dropdown menu selection:", error);
    }
  }

  return success;
}

// Function to get the size number from a row (div-based structure)
// Dynamic approach: finds the first div containing a p tag with a valid size number
function getRowSize(rowElement) {
  // Try specific selector first (for performance)
  let sizeDiv = rowElement.querySelector(
    "div.css-50izru, [class*='css-50izru']"
  );

  // If not found, use dynamic approach: find first div with a p containing a number
  if (!sizeDiv) {
    const allDivs = rowElement.querySelectorAll("div > p");
    for (const p of allDivs) {
      const sizeText = p.textContent.trim();
      const sizeNum = parseInt(sizeText);
      // Check if it's a valid size number (20-50 range for clothing sizes)
      if (!isNaN(sizeNum) && sizeNum >= 20 && sizeNum <= 50) {
        sizeDiv = p.parentElement;
        break;
      }
    }
  }

  if (sizeDiv) {
    const sizeP = sizeDiv.querySelector("p");
    if (sizeP) {
      const sizeText = sizeP.textContent.trim();
      const sizeNum = parseInt(sizeText);
      return isNaN(sizeNum) ? null : sizeNum;
    }
  }

  return null;
}

// Function to fill a single row
async function fillRow(rowElement, data) {
  try {
    // Find inputs within this row by ID (div-based structure)
    const meeshoPriceInput = rowElement.querySelector("input#meesho_price");
    const mrpInput = rowElement.querySelector("input#product_mrp");
    const inventoryInput = rowElement.querySelector("input#inventory");
    const waistInput = rowElement.querySelector('input[id="waist_size"]');
    const hipInput = rowElement.querySelector('input[id="hip_size"]');
    const lengthInput = rowElement.querySelector('input[id="length_size"]');
    const thighInput = rowElement.querySelector('input[id="thigh_size"]');
    const riseInput = rowElement.querySelector('input[id="rise_length"]');
    const inseamInput = rowElement.querySelector('input[id="inseam_length"]');

    // Fill regular inputs
    if (meeshoPriceInput) {
      setInputValue(meeshoPriceInput, data.meeshoPrice);
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Fill disabled fields (MRP and Inventory) - remove disabled attribute first
    if (mrpInput) {
      // Force remove disabled attribute
      mrpInput.removeAttribute("disabled");
      mrpInput.disabled = false;
      setInputValue(mrpInput, data.mrp);
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    if (inventoryInput) {
      // Force remove disabled attribute
      inventoryInput.removeAttribute("disabled");
      inventoryInput.disabled = false;
      setInputValue(inventoryInput, data.inventory);
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Fill dropdowns (readonly inputs that open menus)
    if (waistInput) {
      await setDropdownValue(waistInput, data.waist);
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    if (hipInput) {
      await setDropdownValue(hipInput, data.hip);
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    if (lengthInput) {
      await setDropdownValue(lengthInput, data.length);
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    if (thighInput) {
      await setDropdownValue(thighInput, data.thigh);
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    if (riseInput) {
      await setDropdownValue(riseInput, data.rise);
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    if (inseamInput) {
      await setDropdownValue(inseamInput, data.inseam);
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    return true;
  } catch (error) {
    console.error("Error filling row:", error);
    return false;
  }
}

// Main function to fill all variations
async function fillAllVariations(data = SAMPLE_DATA) {
  console.log("Starting to fill variations...");

  // Find all variation row containers (div-based structure)
  // Each row is a div with class css-1hw3sau
  let rows = document.querySelectorAll("div.css-1hw3sau");

  // If that doesn't work, try more flexible selectors
  if (rows.length === 0) {
    rows = document.querySelectorAll("[class*='css-1hw3sau']");
  }

  // Filter out rows that don't have a valid size number
  const dataRows = Array.from(rows).filter((row) => {
    const size = getRowSize(row);
    return size !== null && size >= 20 && size <= 50; // Reasonable size range
  });

  if (dataRows.length === 0) {
    console.error("Could not find variation rows. Debugging info:");
    console.log(
      "All css-1hw3sau divs:",
      document.querySelectorAll("div.css-1hw3sau").length
    );
    console.log(
      "All variation containers:",
      document.querySelectorAll("[class*='css-1hw3sau']").length
    );

    // Show what we found
    const allContainers = document.querySelectorAll(
      "div.css-1hw3sau, [class*='css-1hw3sau']"
    );
    if (allContainers.length > 0) {
      console.log("First container structure:", allContainers[0]);
      console.log("First container classes:", allContainers[0].className);
      const firstSize = getRowSize(allContainers[0]);
      console.log("First container size:", firstSize);
    }

    alert(
      "Could not find any variation rows. Please make sure you are on the correct page.\n\nCheck the browser console (F12) for debugging information."
    );
    showNotification("Error: No rows found. Check console for details.", true);
    return;
  }

  console.log(`Found ${dataRows.length} variation rows`);

  // Match rows with data by size
  const filledRows = [];

  for (const row of dataRows) {
    const rowSize = getRowSize(row);
    if (rowSize === null) continue;

    // Find matching data entry
    const matchingData = data.find((d) => d.size === rowSize);
    if (matchingData) {
      console.log(`Filling row for size ${rowSize}...`);
      await fillRow(row, matchingData);
      filledRows.push(rowSize);

      // Small delay between rows to avoid overwhelming the UI
      await new Promise((resolve) => setTimeout(resolve, 500));
    } else {
      console.warn(`No data found for size ${rowSize}`);
    }
  }

  console.log(`Finished filling ${filledRows.length} variations:`, filledRows);
  showNotification(`Successfully filled ${filledRows.length} variation(s)!`);
}

// Show notification
function showNotification(message, isError = false) {
  // Remove existing notification if any
  const existing = document.getElementById("meesho-fill-notification");
  if (existing) existing.remove();

  const notification = document.createElement("div");
  notification.id = "meesho-fill-notification";
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${isError ? "#f44336" : "#4CAF50"};
    color: white;
    padding: 15px 20px;
    border-radius: 5px;
    z-index: 10000;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    font-family: Arial, sans-serif;
    font-size: 14px;
    max-width: 300px;
  `;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 5000);
}

// Add Apply button to the page
function addApplyButton() {
  // Check if button already exists
  if (document.getElementById("meesho-fill-apply-btn")) {
    return;
  }

  const button = document.createElement("button");
  button.id = "meesho-fill-apply-btn";
  button.textContent = "Apply";
  button.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    background: #FF6B6B;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
    font-weight: bold;
    z-index: 10000;
    box-shadow: 0 4px 6px rgba(0,0,0,0.2);
    font-family: Arial, sans-serif;
    transition: all 0.3s ease;
  `;

  button.addEventListener("click", async () => {
    button.disabled = true;
    button.textContent = "Filling...";
    button.style.background = "#999";

    try {
      // Load data from storage or use sample data
      chrome.storage.local.get(["variationData"], (result) => {
        const dataToUse = result.variationData || SAMPLE_DATA;
        fillAllVariations(dataToUse)
          .then(() => {
            button.disabled = false;
            button.textContent = "Apply";
            button.style.background = "#FF6B6B";
          })
          .catch((error) => {
            console.error("Error filling variations:", error);
            button.disabled = false;
            button.textContent = "Apply";
            button.style.background = "#FF6B6B";
            showNotification("Error filling variations. Check console.", true);
          });
      });
    } catch (error) {
      console.error("Error:", error);
      button.disabled = false;
      button.textContent = "Apply";
      button.style.background = "#FF6B6B";
    }
  });

  // Add hover effect
  button.addEventListener("mouseenter", () => {
    if (!button.disabled) {
      button.style.background = "#FF5252";
      button.style.transform = "translateY(-2px)";
    }
  });
  button.addEventListener("mouseleave", () => {
    if (!button.disabled) {
      button.style.background = "#FF6B6B";
      button.style.transform = "translateY(0)";
    }
  });

  document.body.appendChild(button);
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "fillVariations") {
    fillAllVariations(request.data || SAMPLE_DATA)
      .then(() => {
        sendResponse({ success: true });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
    return true; // Will respond asynchronously
  } else if (request.action === "addButton") {
    addApplyButton();
    sendResponse({ success: true });
  }
  return true;
});

// Wait for variation rows to appear (for dynamically loaded content)
function waitForTable(maxWait = 10000) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const checkInterval = setInterval(() => {
      const containers = document.querySelectorAll(
        "div.css-1hw3sau, [class*='css-1hw3sau']"
      );
      const hasDataRows = Array.from(containers).some((container) => {
        const size = getRowSize(container);
        return size !== null && size >= 20 && size <= 50;
      });

      if (hasDataRows || Date.now() - startTime > maxWait) {
        clearInterval(checkInterval);
        resolve(hasDataRows);
      }
    }, 500);
  });
}

// Initialize when page loads
async function initialize() {
  // Wait for table to be ready
  await waitForTable();
  addApplyButton();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialize);
} else {
  initialize();
}
