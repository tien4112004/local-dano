import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

interface Transaction {
  id: string;
  amount: {
    quantity: number;
    unit: string;
  };
  fee: {
    quantity: number;
    unit: string;
  };
  inserted_at: {
    time: string;
  };
  direction: "incoming" | "outgoing";
  status: string;
}

const TransactionHistory = () => {
  const navigate = useNavigate();

  const {
    data: transactions,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["transactions", window.selectedWalletId],
    queryFn: async (): Promise<Transaction[]> => {
      const response = await fetch(
        `http://103.126.158.239:58090/v2/wallets/${window.selectedWalletId}/transactions`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch transactions: ${response.status}`);
      }

      return response.json();
    },
    enabled: !!window.selectedWalletId,
  });

  const formatAmount = (amount: number) => {
    return (amount / 1_000_000).toFixed(2) + " ADA";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
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
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : error ? (
              <p className="text-destructive">Failed to load transactions</p>
            ) : !transactions || transactions.length === 0 ? (
              <p className="text-muted-foreground">No transactions found</p>
            ) : (
              <div className="space-y-2">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    onClick={() => navigate(`/transaction/${tx.id}`)}
                    className="p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {tx.direction === "outgoing" ? (
                          <ArrowUpRight className="h-4 w-4 text-destructive" />
                        ) : (
                          <ArrowDownLeft className="h-4 w-4 text-green-600" />
                        )}
                        <div>
                          <p className="font-medium">
                            {tx.direction === "outgoing" ? "Sent" : "Received"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(tx.inserted_at.time)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-medium ${
                            tx.direction === "outgoing"
                              ? "text-destructive"
                              : "text-green-600"
                          }`}
                        >
                          {tx.direction === "outgoing" ? "-" : "+"}
                          {formatAmount(tx.amount.quantity)}
                        </p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {tx.status}
                        </p>
                      </div>
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

export default TransactionHistory;
