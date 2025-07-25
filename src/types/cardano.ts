export interface Pagination {
  page: number;
  limit: number;
}

export interface CardanoFullAPI {
  getBalance(): Promise<string>;
  getUtxos(): Promise<Array<string>>;
  getCollaterals(): Promise<Array<string> | null>;
  signTx(tx: string, partialSign: boolean): Promise<string>;
  submitTx(transaction: string): Promise<string>;
  getUsedAddresses(pagination: Pagination): Promise<Array<string>>;
  getNetworkId(): Promise<number>;
  signData(address: string, payload: string): Promise<string>;
  getExtensions(): Promise<Array<string>>;
}

export interface LocalDanoAPI {
  enable(): Promise<CardanoFullAPI>;
  isEnabled(): boolean;
  name: string;
}

declare global {
  interface Window {
    cardano?: {
      localDano?: LocalDanoAPI;
      [key: string]: any;
    };
  }
}