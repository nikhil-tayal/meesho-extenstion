// Popup script
document.addEventListener("DOMContentLoaded", () => {
  const fillBtn = document.getElementById("fillBtn");
  const addButtonBtn = document.getElementById("addButtonBtn");
  const fillProductSizeBtn = document.getElementById("fillProductSizeBtn");
  const status = document.getElementById("status");

  function showStatus(message, isError = false) {
    if (status) {
      status.textContent = message;
      status.className = `status ${isError ? "error" : "success"}`;
      setTimeout(() => {
        status.className = "status";
      }, 3000);
    }
  }

  if (fillBtn) {
    fillBtn.addEventListener("click", async () => {
      try {
        const [tab] = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });

        // Load data from storage
        chrome.storage.local.get(["variationData"], (result) => {
          chrome.tabs.sendMessage(
            tab.id,
            {
              action: "fillVariations",
              data: result.variationData,
            },
            (response) => {
              if (chrome.runtime.lastError) {
                showStatus("Error: " + chrome.runtime.lastError.message, true);
              } else {
                showStatus("Variations filled successfully!");
              }
            }
          );
        });
      } catch (error) {
        showStatus("Error: " + error.message, true);
      }
    });
  }

  if (addButtonBtn) {
    addButtonBtn.addEventListener("click", async () => {
      try {
        const [tab] = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });
        chrome.tabs.sendMessage(tab.id, { action: "addButton" }, (response) => {
          if (chrome.runtime.lastError) {
            showStatus("Error: " + chrome.runtime.lastError.message, true);
          } else {
            showStatus("Apply button added to page!");
          }
        });
      } catch (error) {
        showStatus("Error: " + error.message, true);
      }
    });
  }

  if (fillProductSizeBtn) {
    fillProductSizeBtn.addEventListener("click", async () => {
      try {
        const [tab] = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });
        chrome.tabs.sendMessage(
          tab.id,
          { action: "fillProductSizeInventory" },
          (response) => {
            if (chrome.runtime.lastError) {
              showStatus("Error: " + chrome.runtime.lastError.message, true);
            } else if (response && response.success) {
              showStatus("Product, Size and Inventory filled successfully!");
            } else {
              showStatus("Failed to fill Product, Size and Inventory", true);
            }
          }
        );
      } catch (error) {
        showStatus("Error: " + error.message, true);
      }
    });
  }
});
