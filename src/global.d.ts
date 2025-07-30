export {};

declare global {
  interface Window {
    selectedWalletId?: string;
    selectedAddress?: string;
    dRepIdHex: string;
    cardano?: {
      localDano?: LocalDanoAPI;
    };
  }
}
