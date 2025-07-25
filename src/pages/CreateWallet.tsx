import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement wallet creation logic
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Wallet Created",
        description: `Successfully created wallet: ${walletName}`,
      });
      
      setMnemonic("");
      setWalletName("");
      setPassphrase("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create wallet",
        variant: "destructive"
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
          onClick={() => navigate('/')}
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