// This script runs in the page context, not extension context
// So we can't import modules, we need to define types inline

interface CardanoFullAPI {
  getBalance(): Promise<string>;
  getUtxos(): Promise<Array<string>>;
  getCollaterals(): Promise<Array<string> | null>;
  signTx(tx: string, partialSign: boolean): Promise<string>;
  submitTx(transaction: string): Promise<string>;
  getUsedAddresses(pagination: { page: number; limit: number }): Promise<Array<string>>;
  getNetworkId(): Promise<number>;
  signData(address: string, payload: string): Promise<string>;
  getExtensions(): Promise<Array<string>>;
}

interface LocalDanoAPI {
  enable(): Promise<CardanoFullAPI>;
  isEnabled(): boolean;
  name: string;
}

// Mock implementation of CardanoFullAPI
class LocalDanoWallet implements CardanoFullAPI {
  async getBalance(): Promise<string> {
    // Get balance from selected wallet or fallback to mock
    const selectedWalletId = (window as any).selectedWalletId;
    if (selectedWalletId) {
      // In a real implementation, you would fetch the actual balance
      // For now, return mock balance
      return "1000000000"; // 1000 ADA
    }
    return "1000000000"; // 1000 ADA
  }

  async getUtxos(): Promise<Array<string>> {
    // Mock UTXOs
    return [
      "82825820a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890123456000",
      "82825820b2c3d4e5f6789012345678901234567890123456789012345678901234567890123456001"
    ];
  }

  async getCollaterals(): Promise<Array<string> | null> {
    // Mock collateral UTXOs
    return [
      "82825820c3d4e5f6789012345678901234567890123456789012345678901234567890123456002"
    ];
  }

  async signTx(tx: string, partialSign: boolean): Promise<string> {
    // Mock transaction signing
    console.log('Signing transaction:', { tx, partialSign });
    return tx + "_signed";
  }

  async submitTx(transaction: string): Promise<string> {
    // Mock transaction submission
    console.log('Submitting transaction:', transaction);
    return "a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890";
  }

  async getUsedAddresses(pagination: { page: number; limit: number }): Promise<Array<string>> {
    // Mock used addresses
    return [
      "addr1qx2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3jcu5d8ps7zex2k2xt3uqxgjqnnj0vs2qd4a2ksq8t4cqg2jk5z8",
      "addr1qy1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12"
    ].slice((pagination.page - 1) * pagination.limit, pagination.page * pagination.limit);
  }

  async getNetworkId(): Promise<number> {
    // Return testnet (0) or mainnet (1)
    return 1; // mainnet
  }

  async signData(address: string, payload: string): Promise<string> {
    // Mock data signing
    console.log('Signing data:', { address, payload });
    return "signed_" + payload;
  }

  async getExtensions(): Promise<Array<string>> {
    return ["cip30", "cip95"];
  }
}

// LocalDano API implementation
const localDanoAPI: LocalDanoAPI = {
  name: "LocalDano",
  
  async enable(): Promise<CardanoFullAPI> {
    // In a real implementation, this would show a connection prompt
    console.log('LocalDano wallet enabled');
    return new LocalDanoWallet();
  },

  isEnabled(): boolean {
    return true;
  }
};

// Inject into window.cardano
if (!window.cardano) {
  window.cardano = {};
}

window.cardano.localDano = localDanoAPI;

console.log('LocalDano wallet injected successfully');