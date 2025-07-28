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
});
const script = document.createElement("script");
script.src = chrome.runtime.getURL("injected-script.js");
script.onload = function () {
  script.remove();
};
(document.head || document.documentElement).appendChild(script);
