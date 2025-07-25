import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface WalletHeaderProps {
  address: string;
  balance: string;
  networkId: number;
}

export const WalletHeader = ({ address, balance, networkId }: WalletHeaderProps) => {
  const navigate = useNavigate();

  const formatBalance = (lovelace: string) => {
    const ada = (parseInt(lovelace) / 1000000).toFixed(2);
    return `${ada} ADA`;
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 10)}...${addr.slice(-10)}`;
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span>LocalDano Wallet</span>
          <Badge variant={networkId === 1 ? "default" : "secondary"}>
            {networkId === 1 ? "Mainnet" : "Testnet"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground">Balance</p>
            <p className="text-2xl font-bold">{formatBalance(balance)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Address</p>
            <p className="text-sm font-mono bg-muted p-2 rounded">
              {formatAddress(address)}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            <Button onClick={() => navigate('/create')} variant="outline" size="sm">
              Create
            </Button>
            <Button onClick={() => navigate('/send')} variant="outline" size="sm">
              Send
            </Button>
            <Button onClick={() => navigate('/tokens')} variant="outline" size="sm">
              Tokens
            </Button>
            <Button onClick={() => navigate('/history')} variant="outline" size="sm">
              History
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};