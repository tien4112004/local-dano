// Background script for the browser extension
chrome.runtime.onInstalled.addListener(() => {
  console.log("LocalDano wallet extension installed");
});

// Handle messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Background received message:", request);

  if (request.type === "GET_WALLET_DATA") {
    sendResponse({ success: true, data: "mock_data" });
  }

  if (request.type === "SET_SELECTED_WALLET_ID") {
    // Persist selected wallet ID in extension storage
    chrome.storage.local.set({ selectedWalletId: request.walletId }, () => {
      // Relay to content script
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: "FORWARD_WALLET_ID_TO_PAGE",
            walletId: request.walletId,
          });
        }
      });
    });
  }

  if (request.type === "SET_SELECTED_ADDRESS") {
    // Persist selected address in extension storage
    chrome.storage.local.set({ selectedAddress: request.address }, () => {
      // Relay to content script
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: "FORWARD_ADDRESS_TO_PAGE",
            address: request.address,
          });
        }
      });
    });
  }

  if (request.type === "SET_DREP_ID_HEX") {
    // Persist dRepIdHex in extension storage
    chrome.storage.local.set({ dRepIdHex: request.dRepIdHex }, () => {
      // Relay to content script
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: "FORWARD_DREP_ID_HEX_TO_PAGE",
            dRepIdHex: request.dRepIdHex,
          });
        }
      });
    });
  }

  return true; // For async sendResponse if needed
});

// Listen for tab updates to inject values into pages
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // Get stored values and inject them into the page
    chrome.storage.local.get(['selectedWalletId', 'selectedAddress', 'dRepIdHex'], (result) => {
      if (result.selectedWalletId) {
        chrome.tabs.sendMessage(tabId, {
          type: "INJECT_WALLET_ID",
          walletId: result.selectedWalletId,
        });
      }
      if (result.selectedAddress) {
        chrome.tabs.sendMessage(tabId, {
          type: "INJECT_ADDRESS",
          address: result.selectedAddress,
        });
      }
      if (result.dRepIdHex) {
        chrome.tabs.sendMessage(tabId, {
          type: "INJECT_DREP_ID_HEX",
          dRepIdHex: result.dRepIdHex,
        });
      }
    });
  }
});

console.log("✅ Background service worker loaded");
