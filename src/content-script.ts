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
const script = document.createElement("script");
script.src = chrome.runtime.getURL("injected-script.js");
script.onload = function () {
  script.remove();
};
(document.head || document.documentElement).appendChild(script);
