// Content script that injects the LocalDano API into the page
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "FORWARD_WALLET_ID_TO_PAGE") {
    window.postMessage(
      {
        type: "LOCALDANO_SET_WALLET_ID",
        walletId: message.walletId,
      },
      "*"
    );
  }
  if (message.type === "FORWARD_ADDRESS_TO_PAGE") {
    window.postMessage(
      {
        type: "LOCALDANO_SET_ADDRESS",
        address: message.address,
      },
      "*"
    );
  }
  if (message.type === "FORWARD_DREP_ID_HEX_TO_PAGE") {
    window.postMessage(
      {
        type: "LOCALDANO_SET_DREP_ID_HEX",
        dRepIdHex: message.dRepIdHex,
      },
      "*"
    );
  }
});

// Bridge: page -> content-script -> extension URL
window.addEventListener("message", (event) => {
  if (event.source !== window) return;
  const data = event.data as any;
  if (data?.type === "LOCALDANO_GET_EXTENSION_URL") {
    const path = data.path || "passphrase-popup.html";
    const base = chrome.runtime.getURL(path);
    const url =
      base +
      "?tx=" +
      encodeURIComponent(data.tx) +
      "&walletId=" +
      encodeURIComponent(data.walletId);

    window.postMessage({ type: "LOCALDANO_EXTENSION_URL", path, url }, "*");
  }
});

const script = document.createElement("script");
script.src = chrome.runtime.getURL("injected-script.js");
script.onload = function () {
  script.remove();

  setTimeout(() => {
    chrome.storage.local.get(
      ["selectedWalletId", "selectedAddress", "dRepIdHex"],
      (result) => {
        if (result.selectedWalletId) {
          window.postMessage(
            {
              type: "LOCALDANO_SET_WALLET_ID",
              walletId: result.selectedWalletId,
            },
            "*"
          );
        }
        if (result.selectedAddress) {
          window.postMessage(
            {
              type: "LOCALDANO_SET_ADDRESS",
              address: result.selectedAddress,
            },
            "*"
          );
        }
        if (result.dRepIdHex) {
          window.postMessage(
            {
              type: "LOCALDANO_SET_DREP_ID_HEX",
              dRepIdHex: result.dRepIdHex,
            },
            "*"
          );
        }
      }
    );
  }, 100);
};
(document.head || document.documentElement).appendChild(script);
