import { useState, useEffect } from "react";
import { WalletHeader } from "@/components/wallet/WalletHeader";
import { WalletList } from "@/components/wallet/WalletList";

interface Wallet {
  id: string;
  name: string;
  balance: {
    total: {
      quantity: number;
      unit: string;
    };
  };
}

const Index = () => {
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [walletData, setWalletData] = useState({
    address: "",
    balance: "1000000000", // 1000 ADA in lovelace
    networkId: 1,
  });

  useEffect(() => {
    // Initialize wallet data
    console.log("LocalDano Wallet Extension loaded");

    // Store selected wallet for injected script access and fetch address
    if (selectedWallet) {
      (window as any).selectedWalletId = selectedWallet.id;

      // Fetch wallet addresses
      const fetchWalletAddress = async () => {
        try {
          const response = await fetch(
            `http://172.16.61.201:8090/v2/wallets/${selectedWallet.id}/addresses`
          );
          if (response.ok) {
            const addresses = await response.json();
            const address = addresses.length > 0 ? addresses[0].id : "";
            setWalletData({
              address,
              balance: selectedWallet.balance.total.quantity.toString(),
              networkId: 1,
            });
          }
        } catch (error) {
          console.error("Failed to fetch wallet addresses:", error);
        }
      };

      fetchWalletAddress();
    } else {
      setWalletData({
        address: "",
        balance: "1000000000",
        networkId: 1,
      });
    }
  }, [selectedWallet]);

  const handleWalletSelect = (wallet: Wallet) => {
    setSelectedWallet(wallet);
  };

  return (
    <div className="min-h-screen p-4 bg-background">
      <div className="max-w-md mx-auto space-y-4">
        <WalletHeader
          address={selectedWallet ? walletData.address : undefined}
          balance={selectedWallet ? walletData.balance : undefined}
          networkId={walletData.networkId}
          hasSelectedWallet={!!selectedWallet}
          selectedWalletId={selectedWallet?.id}
        />
        <WalletList
          onWalletSelect={handleWalletSelect}
          selectedWalletId={selectedWallet?.id}
        />
      </div>
    </div>
  );
};

export default Index;
