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
    // Relay to content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: "FORWARD_WALLET_ID_TO_PAGE",
          walletId: request.walletId,
        });
      }
    });
  }

  if (request.type === "SET_SELECTED_ADDRESS") {
    // Relay to content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: "FORWARD_ADDRESS_TO_PAGE",
          address: request.address,
        });
      }
    });
  }

  if (request.type === "SET_DREP_ID_HEX") {
    // Relay to content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: "FORWARD_DREP_ID_HEX_TO_PAGE",
          dRepIdHex: request.dRepIdHex,
        });
      }
    });
  }

  return true; // For async sendResponse if needed
});

console.log("✅ Background service worker loaded");
