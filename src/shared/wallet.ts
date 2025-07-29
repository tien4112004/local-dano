import { encode } from "cbor2";
import { bech32 as bech32lib } from "bech32";

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

function bech32ToHex(bech32: string): string {
  const decoded = bech32lib.decode(bech32, 1000);
  const bytes = bech32lib.fromWords(decoded.words);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export interface CardanoFullAPI {
  getBalance(): Promise<string>;
  getUtxos(): Promise<Array<string>>;
  getCollaterals(params?: { amount: string }): Promise<Array<string> | null>;
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
    const address = window.selectedAddress;
    const response = await fetch(
      `http://172.16.61.201:3000/addresses/${address}/utxos`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch UTXOs: ${response.status}`);
    }

    const data = await response.json();
    const results: string[] = [];

    for (const utxo of data) {
      const txHashBytes = hexToBytes(utxo.tx_hash);
      const txIndex = utxo.tx_index;

      // First element: [tx_hash_bytes, tx_index]
      const firstElement = [txHashBytes, txIndex];

      // Second element:
      const addressHex = bech32ToHex(utxo.address);

      const amountArray = utxo.amount;

      let lovelaceAmount = "0";
      const assetMap = new Map<Uint8Array, Map<Uint8Array, number>>();

      for (const amt of amountArray) {
        if (amt.unit === "lovelace") {
          lovelaceAmount = amt.quantity;
        } else {
          const policyId = amt.unit.slice(0, 56);
          const assetName = amt.unit.slice(56);

          const policyKey = hexToBytes(policyId);
          const assetKey = hexToBytes(assetName);

          if (!assetMap.has(policyKey)) {
            assetMap.set(policyKey, new Map());
          }

          const innerMap = assetMap.get(policyKey)!;
          innerMap.set(assetKey, Number(amt.quantity));
        }
      }

      const secondElement = [addressHex, [Number(lovelaceAmount), assetMap]];

      const finalObject = [firstElement, secondElement];
      const encoded = encode(finalObject);
      results.push(uint8ArrayToHex(encoded));
    }

    return results;
  }

  async getCollaterals(params?: {
    amount: string;
  }): Promise<Array<string> | null> {
    const address = window.selectedAddress;
    const response = await fetch(
      `http://172.16.61.201:3000/addresses/${address}/utxos`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch UTXOs: ${response.status}`);
    }

    const utxos = await response.json();
    if (!Array.isArray(utxos) || utxos.length === 0) {
      return null;
    }

    // Find the UTXO with the lowest lovelace amount
    let minUtxo = null;
    let minLovelace = Number.MAX_SAFE_INTEGER;

    for (const utxo of utxos) {
      const lovelaceEntry = utxo.amount.find(
        (a: { unit: string; quantity: number }) => a.unit === "lovelace"
      );
      if (!lovelaceEntry) continue;

      const lovelaceQty = Number(lovelaceEntry.quantity);
      if (lovelaceQty < minLovelace) {
        minLovelace = lovelaceQty;
        minUtxo = utxo;
      }
    }

    if (!minUtxo) return null;

    // Construct CBOR object like getUtxos()
    const txHashBytes = hexToBytes(minUtxo.tx_hash);
    const txIndex = minUtxo.tx_index;

    // First element: [tx_hash_bytes, tx_index]
    const firstElement = [txHashBytes, txIndex];

    // Second element
    const addressHex = bech32ToHex(minUtxo.address);

    const amountArray = minUtxo.amount;
    let lovelaceAmount = 0;
    const assetMap = new Map<Uint8Array, Map<Uint8Array, number>>();

    for (const amt of amountArray) {
      if (amt.unit === "lovelace") {
        lovelaceAmount = Number(amt.quantity);
      } else {
        const policyId = amt.unit.slice(0, 56);
        const assetName = amt.unit.slice(56);

        const policyKey = hexToBytes(policyId);
        const assetKey = hexToBytes(assetName);

        if (!assetMap.has(policyKey)) {
          assetMap.set(policyKey, new Map());
        }

        const innerMap = assetMap.get(policyKey)!;
        innerMap.set(assetKey, Number(amt.quantity));
      }
    }

    const secondElement = [addressHex, [lovelaceAmount, assetMap]];

    const finalObject = [firstElement, secondElement];
    const encoded = encode(finalObject);

    return [uint8ArrayToHex(encoded)];
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
