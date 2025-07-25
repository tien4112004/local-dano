import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface WalletHeaderProps {
  address: string;
  balance: string;
  networkId: number;
}

export const WalletHeader = ({ address, balance, networkId }: WalletHeaderProps) => {
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
        </div>
      </CardContent>
    </Card>
  );
};