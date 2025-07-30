import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { mnemonicToEntropy } from "bip39";
import { Bip32PrivateKey } from "@emurgo/cardano-serialization-lib-asmjs";
import { harden } from "@/utils";

const CreateWallet = () => {
  const [mnemonic, setMnemonic] = useState("");
  const [walletName, setWalletName] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!mnemonic || !walletName) {
      toast({
        title: "Error",
        description: "Please fill in required fields",
        variant: "destructive",
      });
      return;
    }

    const entropy = mnemonicToEntropy(mnemonic);
    const rootKey = Bip32PrivateKey.from_bip39_entropy(
      Buffer.from(entropy, "hex"),
      Buffer.from("")
    );
    const accountKey = rootKey
      .derive(harden(1852)) // purpose
      .derive(harden(1815)) // coin type
      .derive(harden(0)); // default account index

    const dRepPrivKey = accountKey.derive(3).derive(0).to_raw_key(); // default keyIndex = 0
    const dRepPubKey = dRepPrivKey.to_public();
    const dRepIdHex = dRepPubKey.hash().to_hex();

    setIsLoading(true);
    try {
      const response = await fetch("http://103.126.158.239:58090/v2/wallets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: walletName,
          mnemonic_sentence: mnemonic.split(" "),
          passphrase: passphrase,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create wallet");
      }

      const result = await response.json();
      const walletId = result.id;

      // Update localStorage mapping: walletId => dRepIdHex
      const STORAGE_KEY = "walletDRepMappings";
      const currentMappings =
        JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") ?? {};
      currentMappings[walletId] = dRepIdHex;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentMappings));

      toast({
        title: "Wallet Created",
        description: `Successfully created wallet: ${walletName}`,
      });

      navigate("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create wallet",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 bg-background">
      <div className="max-w-md mx-auto space-y-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Create Wallet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mnemonic">Mnemonic Sentence *</Label>
              <Textarea
                id="mnemonic"
                placeholder="Enter your mnemonic phrase..."
                value={mnemonic}
                onChange={(e) => setMnemonic(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="walletName">Wallet Name *</Label>
              <Input
                id="walletName"
                placeholder="Enter wallet name"
                value={walletName}
                onChange={(e) => setWalletName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="passphrase">Passphrase</Label>
              <Input
                id="passphrase"
                type="password"
                placeholder="Enter passphrase (optional)"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
              />
            </div>
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Creating..." : "Create Wallet"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateWallet;
