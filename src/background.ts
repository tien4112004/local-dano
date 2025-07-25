// Background script for the browser extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('LocalDano wallet extension installed');
});

// Handle messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request);
  
  if (request.type === 'GET_WALLET_DATA') {
    // Handle wallet data requests
    sendResponse({ success: true, data: 'mock_data' });
  }
  
  return true; // Keep the message channel open for async responses
});