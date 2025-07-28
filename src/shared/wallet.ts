import { encode } from "cbor2";

const uint8ArrayToHex = (array: Uint8Array): string => {
  return Array.from(array)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

const hexToBytes = (hex: string): Uint8Array => {
  if (hex.length % 2 !== 0) throw new Error("Invalid hex string");
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
};

export interface CardanoFullAPI {
  getBalance(): Promise<string>;
  getUtxos(): Promise<Array<string>>;
  getCollaterals(): Promise<Array<string> | null>;
  signTx(tx: string, partialSign: boolean): Promise<string>;
  submitTx(transaction: string): Promise<string>;
  getUsedAddresses(pagination: {
    page: number;
    limit: number;
  }): Promise<Array<string>>;
  getNetworkId(): Promise<number>;
  signData(address: string, payload: string): Promise<string>;
  getExtensions(): Promise<Array<string>>;
}

export class LocalDanoWallet implements CardanoFullAPI {
  async getBalance(): Promise<string> {
    const walletId = window.selectedWalletId;
    const response = await fetch(
      `http://172.16.61.201:8090/v2/wallets/${walletId}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch wallet: ${response.status}`);
    }

    const data = await response.json();

    const lovelaceAmount: number = data.balance.total.quantity;

    const assetMap = new Map<Uint8Array, Map<Uint8Array, number>>();

    for (const asset of data.assets.total) {
      const policyId = asset.policy_id;
      const assetName = asset.asset_name || "";
      const quantity = asset.quantity;

      const policyKey = hexToBytes(policyId);
      const assetKey = hexToBytes(assetName);

      if (!assetMap.has(policyKey)) {
        assetMap.set(policyKey, new Map());
      }

      const childMap = assetMap.get(policyKey)!;
      childMap.set(assetKey, quantity);
    }

    const objectToEncode: [number, Map<Uint8Array, Map<Uint8Array, number>>] = [
      lovelaceAmount,
      assetMap,
    ];

    return uint8ArrayToHex(encode(objectToEncode));
  }

  async getUtxos(): Promise<Array<string>> {
    // Mock UTXOs
    return [
      "82825820a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890123456000",
      "82825820b2c3d4e5f6789012345678901234567890123456789012345678901234567890123456001",
    ];
  }

  async getCollaterals(): Promise<Array<string> | null> {
    // Mock collateral UTXOs
    return [
      "82825820c3d4e5f6789012345678901234567890123456789012345678901234567890123456002",
    ];
  }

  async signTx(tx: string, partialSign: boolean): Promise<string> {
    // Mock transaction signing
    console.log("Signing transaction:", { tx, partialSign });
    return tx + "_signed";
  }

  async submitTx(transaction: string): Promise<string> {
    // Mock transaction submission
    console.log("Submitting transaction:", transaction);
    return "a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890";
  }

  async getUsedAddresses(pagination: {
    page: number;
    limit: number;
  }): Promise<Array<string>> {
    return [window.selectedAddress];
  }

  async getNetworkId(): Promise<number> {
    return 0; // Actually "Localnet" - but set to 0 to pass Kotlin's networkID check
  }

  async signData(address: string, payload: string): Promise<string> {
    throw new Error("Not implemented");
  }

  async getExtensions(): Promise<Array<string>> {
    return ["cip30", "cip95"];
  }
}
