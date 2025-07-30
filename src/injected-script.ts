import { CardanoFullAPI, Extension, LocalDanoWallet } from "./shared/wallet";

window.addEventListener("message", (event) => {
  console.log(event.data);
  if (event.source !== window) return;
  if (event.data?.type === "LOCALDANO_SET_WALLET_ID") {
    window.selectedWalletId = event.data.walletId;
    console.log(
      "Injected script set selectedWalletId:",
      window.selectedWalletId
    );
  }
  if (event.data?.type === "LOCALDANO_SET_ADDRESS") {
    window.selectedAddress = event.data.address;
    console.log("Injected script set selectedAddress:", window.selectedAddress);
  }
  if (event.data?.type === "LOCALDANO_SET_DREP_ID_HEX") {
    window.dRepIdHex = event.data.dRepIdHex;
    console.log("Injected script set dRepIdHex:", window.dRepIdHex);
  }
});

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
  supportedExtensions: [{ cip: 95 }],

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
