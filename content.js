// ============================================================================
// MEESHO EXTENSION - CONTENT SCRIPT
// ============================================================================

/**
 * Shows a simple popup notification message
 */
function showPopup(message, isError = false) {
  // Remove any existing popup
  const existing = document.getElementById("meesho-popup");
  if (existing) existing.remove();

  // Create popup element
  const popup = document.createElement("div");
  popup.id = "meesho-popup";
  popup.textContent = message;
  popup.style.cssText = `
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

  // Add to page
  document.body.appendChild(popup);

  // Remove after 5 seconds
  setTimeout(() => {
    if (popup.parentNode) {
      popup.remove();
    }
  }, 5000);
}

/**
 * Wait for element to appear in DOM
 */
function waitForElement(selector, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }

    const observer = new MutationObserver((mutations, obs) => {
      const element = document.querySelector(selector);
      if (element) {
        obs.disconnect();
        resolve(element);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element ${selector} not found within ${timeout}ms`));
    }, timeout);
  });
}

/**
 * Wait for a specified amount of time
 */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fill a dropdown field by clicking and selecting value
 */
async function fillDropdown(inputElement, value) {
  try {
    // Click to open dropdown
    inputElement.click();
    await delay(300);

    // Find the dropdown menu (usually appears as a MuiPopover or MuiMenu)
    const menu = document.querySelector(
      '[role="listbox"], [role="menu"], .MuiPopover-root, .MuiMenu-root'
    );
    if (!menu) {
      throw new Error("Dropdown menu not found");
    }

    // Find the option with the matching text
    const options = menu.querySelectorAll(
      '[role="option"], .MuiMenuItem-root, .MuiListItem-root'
    );
    let found = false;

    for (const option of options) {
      const text = option.textContent.trim();
      if (text === value || text.includes(value)) {
        option.click();
        found = true;
        await delay(200);
        break;
      }
    }

    if (!found) {
      throw new Error(`Option "${value}" not found in dropdown`);
    }

    return true;
  } catch (error) {
    console.error(`Error filling dropdown:`, error);
    return false;
  }
}

/**
 * Fill a text input field
 */
function fillInput(selector, value) {
  const input = document.querySelector(selector);
  if (input) {
    input.focus();
    input.value = value;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  }
  return false;
}

/**
 * Fill Product, Size and Inventory section
 */
async function fillProductSizeInventory() {
  try {
    showPopup("Filling Product, Size and Inventory...");

    // Fill GST (5%)
    const gstInput = document.querySelector("#supplier_gst_percent");
    if (gstInput) {
      await fillDropdown(gstInput, "5");
      await delay(300);
    }

    // Fill HSN Code (6204)
    const hsnInput = document.querySelector("#hsn_code");
    if (hsnInput) {
      await fillDropdown(hsnInput, "6204");
      await delay(300);
    }

    // Fill Net Weight (300 gms)
    fillInput("#product_weight_in_gms", "300");
    await delay(200);

    // Fill Product Name (optional - leaving empty as in filled example)
    // fillInput('#product_name', '');
    // await delay(200);

    // Fill Size dropdown - this is the complex part
    const sizeInput = document.querySelector(
      '#mui-52, input[placeholder="Select"][readonly]'
    );
    if (sizeInput) {
      // Click to open the size dropdown
      sizeInput.click();
      await delay(500);

      // Wait for dropdown to appear - try multiple selectors
      let dropdownContainer = null;
      const selectors = [
        ".css-60om15", // Specific class from size_dropdown.filled.html
        ".MuiPopover-root",
        ".MuiMenu-root",
        '[role="listbox"]',
        '[role="menu"]',
      ];

      for (const selector of selectors) {
        try {
          dropdownContainer = await waitForElement(selector, 2000);
          if (dropdownContainer) break;
        } catch (e) {
          continue;
        }
      }

      if (dropdownContainer) {
        // Sizes to select: 24, 26, 28, 30, 32, 34, 36, 38, 40
        const sizesToSelect = [
          "24",
          "26",
          "28",
          "30",
          "32",
          "34",
          "36",
          "38",
          "40",
        ];

        // Find all size options in the dropdown
        // Try multiple selectors to find size items
        let sizeOptions = dropdownContainer.querySelectorAll(
          ".MuiBox-root.css-1nuu1ju"
        );
        if (sizeOptions.length === 0) {
          // Try finding by container class
          const sizeContainer = document.querySelector(".css-60om15");
          if (sizeContainer) {
            sizeOptions = sizeContainer.querySelectorAll(
              '.MuiBox-root.css-1nuu1ju, div[class*="css-"]'
            );
          }
        }
        if (sizeOptions.length === 0) {
          sizeOptions = dropdownContainer.querySelectorAll(
            '[role="option"], .MuiMenuItem-root, .MuiListItem-root, div[class*="nuu1ju"]'
          );
        }

        console.log(`Found ${sizeOptions.length} size options in dropdown`);

        for (const option of sizeOptions) {
          // Get the text content - look for paragraph with class css-o501y2 or any paragraph
          const sizeTextElement =
            option.querySelector("p.css-o501y2, p") || option;
          let sizeText = sizeTextElement.textContent.trim();

          // Clean up the text (remove any extra whitespace)
          sizeText = sizeText.replace(/\s+/g, " ").trim();

          if (sizesToSelect.includes(sizeText)) {
            // Check if already selected (has checkmark with fill="#3C29B7")
            const svg = option.querySelector("svg");
            if (svg) {
              const checkmarkPath = svg.querySelector('path[fill="#3C29B7"]');
              if (!checkmarkPath) {
                // Not selected yet, click to select
                console.log(`Selecting size: ${sizeText}`);
                // Try clicking the entire option or the checkbox area
                const clickableElement = option.querySelector("svg") || option;
                clickableElement.click();
                await delay(150);
              } else {
                console.log(`Size ${sizeText} already selected`);
              }
            } else {
              // No SVG found, try clicking anyway
              console.log(`No SVG found for size ${sizeText}, clicking anyway`);
              option.click();
              await delay(150);
            }
          }
        }

        // Find and click Apply button
        await delay(300);

        // Look for Apply button - it might be in the dropdown, near the dropdown, or as a separate element
        let applyBtn = null;

        // First, try to find it within the dropdown container or its parent
        const parentContainer =
          dropdownContainer.parentElement || dropdownContainer;
        const buttonsInDropdown = parentContainer.querySelectorAll(
          'button, .MuiButton-root, [role="button"], span.MuiTypography-button'
        );

        for (const btn of buttonsInDropdown) {
          const btnText = btn.textContent.trim();
          if (
            btnText === "Apply" ||
            btnText === "APPLY" ||
            btnText.toLowerCase().includes("apply")
          ) {
            const rect = btn.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
              applyBtn = btn;
              break;
            }
          }
        }

        // If not found in dropdown, search the entire document for visible Apply buttons
        if (!applyBtn) {
          const allButtons = document.querySelectorAll(
            'button, .MuiButton-root, [role="button"], span.MuiTypography-button'
          );
          for (const btn of allButtons) {
            const btnText = btn.textContent.trim();
            if (
              btnText === "Apply" ||
              btnText === "APPLY" ||
              btnText.toLowerCase().includes("apply")
            ) {
              const rect = btn.getBoundingClientRect();
              // Check if button is visible and positioned near the dropdown
              if (
                rect.width > 0 &&
                rect.height > 0 &&
                rect.top < window.innerHeight
              ) {
                applyBtn = btn;
                break;
              }
            }
          }
        }

        if (applyBtn) {
          console.log("Clicking Apply button");
          applyBtn.scrollIntoView({ behavior: "smooth", block: "center" });
          await delay(200);
          applyBtn.click();
          await delay(500);
        } else {
          console.log("Apply button not found, trying alternative methods");
          // Try pressing Enter key on the input to apply
          sizeInput.focus();
          sizeInput.dispatchEvent(
            new KeyboardEvent("keydown", {
              key: "Enter",
              code: "Enter",
              keyCode: 13,
              bubbles: true,
            })
          );
          await delay(300);
          // Also try clicking outside to close
          document.body.click();
          await delay(300);
        }
      } else {
        console.log(
          "Dropdown container not found, trying direct value setting"
        );
        // Fallback: try to set value directly
        sizeInput.value = "24, 26, 28, 30, 32, 34, 36, 38, 40";
        sizeInput.dispatchEvent(new Event("input", { bubbles: true }));
        sizeInput.dispatchEvent(new Event("change", { bubbles: true }));
      }
    } else {
      console.log("Size input field not found");
    }

    showPopup("Product, Size and Inventory filled successfully!");
    return true;
  } catch (error) {
    console.error("Error filling Product, Size and Inventory:", error);
    showPopup("Error: " + error.message, true);
    return false;
  }
}

/**
 * Message listener for extension communication
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "fillProductSizeInventory") {
    fillProductSizeInventory().then((success) => {
      sendResponse({ success });
    });
    return true; // Indicates we will send a response asynchronously
  }
});

// Show popup when page loads
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    showPopup("Meesho Extension Loaded");
  });
} else {
  showPopup("Meesho Extension Loaded");
}
