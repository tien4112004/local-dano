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

  return true; // For async sendResponse if needed
});

console.log("✅ Background service worker loaded");
