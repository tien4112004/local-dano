import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Coins } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

interface WalletBalance {
  available: { quantity: number; unit: string };
  reward: { quantity: number; unit: string };
  total: { quantity: number; unit: string };
}

interface Asset {
  policy_id: string;
  asset_name: string;
  quantity: number;
}

interface WalletData {
  id: string;
  name: string;
  balance: WalletBalance;
  assets: {
    available: Asset[];
    total: Asset[];
  };
}

const Tokens = () => {
  const navigate = useNavigate();
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        const selectedWalletId = (window as any).selectedWalletId;
        if (!selectedWalletId) {
          throw new Error('No wallet selected');
        }

        const response = await fetch(
          `http://172.16.61.201:8090/v2/wallets/${selectedWalletId}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch wallet data: ${response.status}`);
        }

        const data = await response.json();
        setWalletData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchWalletData();
  }, []);

  const formatLovelace = (quantity: number) => {
    return (quantity / 1_000_000).toFixed(6);
  };

  const formatAssetName = (assetName: string) => {
    if (!assetName) return 'Native Token';
    // Convert hex to string if possible
    try {
      return Buffer.from(assetName, 'hex').toString('utf8') || assetName;
    } catch {
      return assetName;
    }
  };

  if (loading) {
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
            <CardContent className="p-6">
              <div className="text-center">Loading wallet data...</div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
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
            <CardContent className="p-6">
              <div className="text-center text-destructive">Error: {error}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
        
        {/* Wallet Balance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5" />
              Wallet Balance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Balance</p>
              <p className="text-2xl font-bold">
                {walletData ? formatLovelace(walletData.balance.total.quantity) : '0'} ADA
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="font-semibold">
                  {walletData ? formatLovelace(walletData.balance.available.quantity) : '0'} ADA
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rewards</p>
                <p className="font-semibold">
                  {walletData ? formatLovelace(walletData.balance.reward.quantity) : '0'} ADA
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assets */}
        <Card>
          <CardHeader>
            <CardTitle>Assets</CardTitle>
          </CardHeader>
          <CardContent>
            {walletData?.assets.total.length === 0 ? (
              <p className="text-muted-foreground text-center">No assets found</p>
            ) : (
              <div className="space-y-3">
                {walletData?.assets.total.map((asset, index) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{formatAssetName(asset.asset_name)}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        Policy: {asset.policy_id.substring(0, 8)}...
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{asset.quantity.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Tokens;