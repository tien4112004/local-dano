export {};

declare global {
    interface Window {
        selectedWalletId?: string;
        selectedAddress?: string;
    }
}