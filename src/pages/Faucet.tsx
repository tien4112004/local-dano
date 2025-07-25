import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Faucet = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Get wallet address from navigation state
  const walletAddress = location.state?.address;

  const handleSubmit = async () => {
    if (!amount || !walletAddress) {
      toast({
        title: "Error",
        description: "Please enter an amount",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("http://172.16.61.201:8888/top-up", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: walletAddress,
          amount: parseFloat(amount) * 1000000, // Convert ADA to lovelace
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to top up wallet");
      }

      toast({
        title: "Success",
        description: `Successfully topped up ${amount} ADA`,
      });

      // Navigate back to main page
      navigate("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to top up wallet",
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
            <CardTitle>Faucet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm text-muted-foreground">
                Wallet Address
              </Label>
              <div className="text-sm font-mono bg-muted p-2 rounded mt-1 break-all whitespace-pre-wrap">
                {walletAddress || "No wallet selected"}
              </div>
            </div>

            <div>
              <Label htmlFor="amount">Amount (ADA)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter ADA amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                step="0.000001"
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isLoading || !walletAddress}
              className="w-full"
            >
              {isLoading ? "Processing..." : "Submit"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Faucet;
