import { CardanoFullAPI, LocalDanoWallet } from "./shared/wallet";

window.addEventListener("message", (event) => {
  if (event.source !== window) return;
  if (event.data?.type === "LOCALDANO_SET_WALLET_ID") {
    window.selectedWalletId = event.data.walletId;
    console.log(
      "Injected script set selectedWalletId:",
      window.selectedWalletId
    );
  }
});

interface Extension {
  cip: number;
}

interface Extensions {
  extensions: Array<Extension>;
}

interface LocalDanoInitialAPI {
  enable(): Promise<CardanoFullAPI>;
  isEnabled(): boolean;
  name: string;
  icon: string;
  apiVersion: string;
  supportedExtensions: Array<Extension>;
}

const localDanoInitialPI: LocalDanoInitialAPI = {
  name: "LocalDano",
  icon: "",
  apiVersion: "1.0.0",
  supportedExtensions: [],

  async enable(extensions?: Extensions): Promise<CardanoFullAPI> {
    return new LocalDanoWallet();
  },

  isEnabled(): boolean {
    return true;
  },
};

if (!window.cardano) {
  window.cardano = {};
}

window.cardano.localDano = localDanoInitialPI;

console.log("LocalDano wallet injected successfully");
