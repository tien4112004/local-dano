import { useState, useEffect } from "react";
import { WalletHeader } from "@/components/wallet/WalletHeader";
import { WalletList } from "@/components/wallet/WalletList";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { LocalDanoWallet } from "@/shared/wallet";

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
  const [devMode, setDevMode] = useState(false);
  const [devResults, setDevResults] = useState<Record<string, any>>({});
  const [devInputs, setDevInputs] = useState<Record<string, any>>({
    signTx: { tx: "", partialSign: false },
    submitTx: { transaction: "" },
    getUsedAddresses: { page: 1, limit: 10 },
    signData: { address: "", payload: "" },
  });

  useEffect(() => {
    // Initialize wallet data
    console.log("LocalDano Wallet Extension loaded");

    // Store selected wallet for injected script access and fetch address
    if (selectedWallet) {
      console.log("Saving wallets");
      chrome.runtime.sendMessage({
        type: "SET_SELECTED_WALLET_ID",
        walletId: selectedWallet.id,
      });
      window.selectedWalletId = selectedWallet.id;

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

  const callWalletFunction = async (functionName: string) => {
    try {
      const wallet = new LocalDanoWallet();
      let result;

      switch (functionName) {
        case "getBalance":
          result = await wallet.getBalance();
          break;
        case "getUtxos":
          result = await wallet.getUtxos();
          break;
        case "getCollaterals":
          result = await wallet.getCollaterals();
          break;
        case "getNetworkId":
          result = await wallet.getNetworkId();
          break;
        case "getExtensions":
          result = await wallet.getExtensions();
          break;
        case "signTx":
          result = await wallet.signTx(
            devInputs.signTx.tx,
            devInputs.signTx.partialSign
          );
          break;
        case "submitTx":
          result = await wallet.submitTx(devInputs.submitTx.transaction);
          break;
        case "getUsedAddresses":
          result = await wallet.getUsedAddresses(devInputs.getUsedAddresses);
          break;
        case "signData":
          result = await wallet.signData(
            devInputs.signData.address,
            devInputs.signData.payload
          );
          break;
        default:
          throw new Error(`Unknown function: ${functionName}`);
      }

      setDevResults((prev) => ({ ...prev, [functionName]: result }));
    } catch (error) {
      setDevResults((prev) => ({
        ...prev,
        [functionName]: `Error: ${error.message}`,
      }));
    }
  };

  const updateDevInput = (functionName: string, field: string, value: any) => {
    setDevInputs((prev) => ({
      ...prev,
      [functionName]: { ...prev[functionName], [field]: value },
    }));
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

        {/* Dev Mode Toggle */}
        <div className="flex items-center space-x-2 p-3 border rounded-lg">
          <Switch
            id="dev-mode"
            checked={devMode}
            onCheckedChange={setDevMode}
          />
          <Label htmlFor="dev-mode">Developer Mode</Label>
        </div>

        {/* Dev Testing Section */}
        {devMode && (
          <Card>
            <CardHeader>
              <CardTitle>LocalDano Wallet Functions Testing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Functions without parameters */}
              {[
                "getBalance",
                "getUtxos",
                "getCollaterals",
                "getNetworkId",
                "getExtensions",
              ].map((func) => (
                <div key={func} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="font-medium">{func}()</Label>
                    <Button size="sm" onClick={() => callWalletFunction(func)}>
                      Call
                    </Button>
                  </div>
                  {devResults[func] && (
                    <div className="p-2 bg-muted rounded text-sm font-mono">
                      {typeof devResults[func] === "object"
                        ? JSON.stringify(devResults[func], null, 2)
                        : String(devResults[func])}
                    </div>
                  )}
                </div>
              ))}

              {/* signTx function */}
              <div className="space-y-2">
                <Label className="font-medium">signTx(tx, partialSign)</Label>
                <Input
                  placeholder="Transaction hex"
                  value={devInputs.signTx.tx}
                  onChange={(e) =>
                    updateDevInput("signTx", "tx", e.target.value)
                  }
                />
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="partial-sign"
                    checked={devInputs.signTx.partialSign}
                    onCheckedChange={(checked) =>
                      updateDevInput("signTx", "partialSign", checked)
                    }
                  />
                  <Label htmlFor="partial-sign">Partial Sign</Label>
                </div>
                <Button size="sm" onClick={() => callWalletFunction("signTx")}>
                  Call
                </Button>
                {devResults.signTx && (
                  <div className="p-2 bg-muted rounded text-sm font-mono">
                    {String(devResults.signTx)}
                  </div>
                )}
              </div>

              {/* submitTx function */}
              <div className="space-y-2">
                <Label className="font-medium">submitTx(transaction)</Label>
                <Input
                  placeholder="Transaction hex"
                  value={devInputs.submitTx.transaction}
                  onChange={(e) =>
                    updateDevInput("submitTx", "transaction", e.target.value)
                  }
                />
                <Button
                  size="sm"
                  onClick={() => callWalletFunction("submitTx")}
                >
                  Call
                </Button>
                {devResults.submitTx && (
                  <div className="p-2 bg-muted rounded text-sm font-mono">
                    {String(devResults.submitTx)}
                  </div>
                )}
              </div>

              {/* getUsedAddresses function */}
              <div className="space-y-2">
                <Label className="font-medium">
                  getUsedAddresses(pagination)
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="Page"
                    value={devInputs.getUsedAddresses.page}
                    onChange={(e) =>
                      updateDevInput(
                        "getUsedAddresses",
                        "page",
                        parseInt(e.target.value) || 1
                      )
                    }
                  />
                  <Input
                    type="number"
                    placeholder="Limit"
                    value={devInputs.getUsedAddresses.limit}
                    onChange={(e) =>
                      updateDevInput(
                        "getUsedAddresses",
                        "limit",
                        parseInt(e.target.value) || 10
                      )
                    }
                  />
                </div>
                <Button
                  size="sm"
                  onClick={() => callWalletFunction("getUsedAddresses")}
                >
                  Call
                </Button>
                {devResults.getUsedAddresses && (
                  <div className="p-2 bg-muted rounded text-sm font-mono">
                    {JSON.stringify(devResults.getUsedAddresses, null, 2)}
                  </div>
                )}
              </div>

              {/* signData function */}
              <div className="space-y-2">
                <Label className="font-medium">
                  signData(address, payload)
                </Label>
                <Input
                  placeholder="Address"
                  value={devInputs.signData.address}
                  onChange={(e) =>
                    updateDevInput("signData", "address", e.target.value)
                  }
                />
                <Input
                  placeholder="Payload"
                  value={devInputs.signData.payload}
                  onChange={(e) =>
                    updateDevInput("signData", "payload", e.target.value)
                  }
                />
                <Button
                  size="sm"
                  onClick={() => callWalletFunction("signData")}
                >
                  Call
                </Button>
                {devResults.signData && (
                  <div className="p-2 bg-muted rounded text-sm font-mono">
                    {String(devResults.signData)}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;
