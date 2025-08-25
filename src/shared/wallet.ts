import { decode, encode } from "cbor2";
import { bech32 as bech32lib } from "bech32";
import { CARDANO_WALLET_ENDPOINT } from "@/consts";

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

export function bech32ToHex(bech32: string): string {
  const decoded = bech32lib.decode(bech32, 1000);
  const bytes = bech32lib.fromWords(decoded.words);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export interface Extension {
  cip: number;
}

export interface CardanoFullAPI {
  cip95: {
    getPubDRepKey(): Promise<string>;
    getRegisteredPubStakeKeys(): Promise<string[]>;
    getUnregisteredPubStakeKeys(): Promise<string[]>;
  };
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
  getExtensions(): Promise<Array<Extension>>;
}

const getStakeKey = async (): Promise<string> => {
  const response = await fetch(
    `${CARDANO_WALLET_ENDPOINT}/wallets/${window.selectedWalletId}/stake-keys`
  );
  const data = await response.json();
  const stakeKey = data.ours[0].key;
  return stakeKey;
};

const isStakeKeyRegistered = async (stakeKey: string) => {
  const blockfrostResponse = await fetch(
    `https://private-cardano.dev.tekoapis.net/blockfrost/accounts/${stakeKey}/registrations`
  );
  const blockfrostData = await blockfrostResponse.json();

  // if error return false
  if (!blockfrostData || blockfrostData.error || blockfrostData.length == 0) {
    return false;
  }
  // if the most recent action was to register
  if (blockfrostData.reverse()[0].action == "registered") {
    return true;
  }

  return false;
};

export class LocalDanoWallet implements CardanoFullAPI {
  cip95 = {
    getPubDRepKey: async (): Promise<string> => {
      return window.dRepIdHex;
    },
    getRegisteredPubStakeKeys: async (): Promise<string[]> => {
      const stakeKey = await getStakeKey();
      if (await isStakeKeyRegistered(stakeKey)) {
        return [bech32ToHex(stakeKey)];
      } else {
        return [];
      }
    },
    getUnregisteredPubStakeKeys: async (): Promise<string[]> => {
      const stakeKey = await getStakeKey();
      if (await isStakeKeyRegistered(stakeKey)) {
        return [];
      } else {
        return [bech32ToHex(stakeKey)];
      }
    },
  };

  async getBalance(): Promise<string> {
    const walletId = window.selectedWalletId;
    const response = await fetch(
      `${CARDANO_WALLET_ENDPOINT}/wallets/${walletId}`
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

    return assetMap.size == 0
      ? uint8ArrayToHex(encode(lovelaceAmount))
      : uint8ArrayToHex(encode(objectToEncode));
  }

  async getUtxos(): Promise<Array<string>> {
    const address = window.selectedAddress;
    const response = await fetch(
      `https://private-cardano.dev.tekoapis.net/blockfrost/addresses/${address}/utxos`
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

      const secondElement = [
        hexToBytes(addressHex),
        [lovelaceAmount, assetMap],
      ];

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
      `https://private-cardano.dev.tekoapis.net/blockfrost/addresses/${address}/utxos`
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

    const secondElement = [hexToBytes(addressHex), [lovelaceAmount, assetMap]];

    const finalObject = [firstElement, secondElement];
    const encoded = encode(finalObject);

    return [uint8ArrayToHex(encoded)];
  }

  async signTx(tx: string, partialSign: boolean): Promise<string> {
    const walletId = window.selectedWalletId;

    // Request extension-resolved URL from the content script since 'chrome' is not available in page context
    const popupUrl: string = await new Promise((resolve) => {
      const onMessage = (event: MessageEvent) => {
        if (event.source !== window) return;
        if (
          event.data?.type === "LOCALDANO_EXTENSION_URL" &&
          event.data?.path === "passphrase-popup.html"
        ) {
          window.removeEventListener("message", onMessage);
          resolve(event.data.url as string);
        }
      };
      window.addEventListener("message", onMessage);
      window.postMessage(
        {
          type: "LOCALDANO_GET_EXTENSION_URL",
          path: "passphrase-popup.html",
          tx,
          walletId,
        },
        "*"
      );
    });

    return new Promise((resolve, reject) => {
      // Create popup window for passphrase input using the resolved extension URL
      const popup = window.open(
        popupUrl,
        "passphrase-popup",
        "width=450,height=350,resizable=no,scrollbars=no,status=no,menubar=no,toolbar=no,location=no"
      );

      if (!popup) {
        reject(new Error("Failed to open popup window"));
        return;
      }

      // Listen for messages from the popup
      const handleMessage = (event: MessageEvent) => {
        if (event.source !== popup) return;

        if (event.data.type === "PASSPHRASE_SUCCESS") {
          window.removeEventListener("message", handleMessage);
          const fullTx = event.data.signedTransaction;
          const decodedTx = decode(fullTx);
          const value = decodedTx[1].get(0);
          const signature =
            value !== undefined ? new Map([[0, value]]) : new Map();
          resolve(uint8ArrayToHex(encode(signature)));
        } else if (event.data.type === "PASSPHRASE_CANCELLED") {
          window.removeEventListener("message", handleMessage);
          reject(new Error("Transaction signing cancelled"));
        }
      };

      window.addEventListener("message", handleMessage);

      // Handle popup being closed manually
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          window.removeEventListener("message", handleMessage);
          reject(new Error("Popup window was closed"));
        }
      }, 1000);
    });
  }

  async submitTx(transaction: string): Promise<string> {
    const walletId = window.selectedWalletId;
    const response = await fetch(
      `${CARDANO_WALLET_ENDPOINT}/wallets/${walletId}/transactions-submit`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transaction,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to submit transaction: ${response.status}`);
    }

    const data = await response.json();
    return data.id;
  }

  async getUsedAddresses(pagination: {
    page: number;
    limit: number;
  }): Promise<Array<string>> {
    return [bech32ToHex(window.selectedAddress)];
  }

  async getNetworkId(): Promise<number> {
    return 0; // Actually "Localnet" - but set to 0 to pass Kotlin's networkID check
  }

  async signData(address: string, payload: string): Promise<string> {
    throw new Error("Not implemented");
  }

  async getExtensions(): Promise<Array<Extension>> {
    return [{ cip: 30 }, { cip: 95 }];
  }
}
