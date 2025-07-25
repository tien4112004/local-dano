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
    address: "addr1qx2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3jcu5d8ps7zex2k2xt3uqxgjqnnj0vs2qd4a2ksq8t4cqg2jk5z8",
    balance: "1000000000", // 1000 ADA in lovelace
    networkId: 1
  });

  useEffect(() => {
    // Initialize wallet data
    console.log("LocalDano Wallet Extension loaded");
    
    // Store selected wallet for injected script access
    if (selectedWallet) {
      (window as any).selectedWalletId = selectedWallet.id;
      setWalletData({
        address: selectedWallet.id,
        balance: (selectedWallet.balance.total.quantity * 1000000).toString(), // Convert to lovelace
        networkId: 1
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
          address={walletData.address}
          balance={walletData.balance}
          networkId={walletData.networkId}
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
