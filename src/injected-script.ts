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

interface LocalDanoInitialAPI {
  enable(): Promise<CardanoFullAPI>;
  isEnabled(): boolean;
  name: string;
}

class LocalDanoWallet implements CardanoFullAPI {
  async getBalance(): Promise<string> {
    // Get balance from selected wallet or fallback to mock
    const selectedWalletId = window.selectedWalletId;
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
    return [window.selectedAddress]
  }

  async getNetworkId(): Promise<number> {
    return 0; // Actually "Localnet" - but set to 0 to pass Kotlin's networkID check
  }

  async signData(address: string, payload: string): Promise<string> {
    throw new Error('Not implemented');
  }

  async getExtensions(): Promise<Array<string>> {
    return ["cip30", "cip95"];
  }
}

const localDanoInitialPI: LocalDanoInitialAPI = {
  name: "LocalDano",
  
  async enable(): Promise<CardanoFullAPI> {
    return new LocalDanoWallet();
  },

  isEnabled(): boolean {
    return true;
  }
};

if (!window.cardano) {
  window.cardano = {};
}

window.cardano.localDano = localDanoInitialPI;

console.log('LocalDano wallet injected successfully');