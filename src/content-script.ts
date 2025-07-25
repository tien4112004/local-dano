// Content script that injects the LocalDano API into the page
const script = document.createElement('script');
script.src = chrome.runtime.getURL('injected-script.js');
script.onload = function() {
  script.remove();
};
(document.head || document.documentElement).appendChild(script);