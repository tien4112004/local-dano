import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowDownLeft,
  ExternalLink,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface TransactionDetail {
  id: string;
  amount: {
    quantity: number;
    unit: string;
  };
  fee: {
    quantity: number;
    unit: string;
  };
  deposit_taken?: {
    quantity: number;
    unit: string;
  };
  deposit_returned?: {
    quantity: number;
    unit: string;
  };
  inserted_at: {
    time: string;
    height: {
      quantity: number;
      unit: string;
    };
  };
  direction: "incoming" | "outgoing";
  status: string;
  inputs: Array<{
    address: string;
    amount: {
      quantity: number;
      unit: string;
    };
    assets?: Array<{
      policy_id: string;
      asset_name: string;
      quantity: number;
    }>;
  }>;
  outputs: Array<{
    address: string;
    amount: {
      quantity: number;
      unit: string;
    };
    assets?: Array<{
      policy_id: string;
      asset_name: string;
      quantity: number;
    }>;
  }>;
}

const TransactionDetail = () => {
  const navigate = useNavigate();
  const { transactionId } = useParams<{ transactionId: string }>();

  const {
    data: transaction,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["transaction", window.selectedWalletId, transactionId],
    queryFn: async (): Promise<TransactionDetail> => {
      const response = await fetch(
        `http://172.16.61.201:8090/v2/wallets/${window.selectedWalletId}/transactions/${transactionId}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch transaction: ${response.status}`);
      }

      return response.json();
    },
    enabled: !!window.selectedWalletId && !!transactionId,
  });

  const formatAmount = (amount: number) => {
    return (amount / 1_000_000).toFixed(6) + " ADA";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const truncateAddress = (address: string) => {
    return `${address?.slice(0, 8)}...${address?.slice(-8)}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-4 bg-background">
        <div className="max-w-md mx-auto space-y-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/history")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="min-h-screen p-4 bg-background">
        <div className="max-w-md mx-auto space-y-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/history")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Card>
            <CardContent className="p-6">
              <p className="text-destructive">
                Failed to load transaction details
              </p>
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
          onClick={() => navigate("/history")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              {transaction.direction === "outgoing" ? (
                <ArrowUpRight className="h-5 w-5 text-destructive" />
              ) : (
                <ArrowDownLeft className="h-5 w-5 text-green-600" />
              )}
              <div>
                <CardTitle>
                  {transaction.direction === "outgoing" ? "Sent" : "Received"}
                </CardTitle>
                <Badge
                  variant={
                    transaction.status === "in_ledger" ? "default" : "secondary"
                  }
                >
                  {transaction.status.replace("_", " ")}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Amount */}
            <div className="space-y-2">
              <h3 className="font-medium">Amount</h3>
              <p
                className={`text-2xl font-bold ${
                  transaction.direction === "outgoing"
                    ? "text-destructive"
                    : "text-green-600"
                }`}
              >
                {transaction.direction === "outgoing" ? "-" : "+"}
                {formatAmount(transaction.amount?.quantity)}
              </p>
            </div>

            {/* Transaction Details */}
            <div className="space-y-3">
              <h3 className="font-medium">Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transaction ID:</span>
                  <span className="font-mono text-xs">
                    {truncateAddress(transaction.id)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fee:</span>
                  <span>{formatAmount(transaction.fee?.quantity)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span>{formatDate(transaction.inserted_at.time)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Block Height:</span>
                  <span>{transaction.inserted_at.height?.quantity}</span>
                </div>
                {transaction.deposit_taken &&
                  transaction.deposit_taken.quantity > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Deposit Taken:
                      </span>
                      <span>
                        {formatAmount(transaction.deposit_taken?.quantity)}
                      </span>
                    </div>
                  )}
                {transaction.deposit_returned &&
                  transaction.deposit_returned?.quantity > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Deposit Returned:
                      </span>
                      <span>
                        {formatAmount(transaction.deposit_returned?.quantity)}
                      </span>
                    </div>
                  )}
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-3">
              <h3 className="font-medium">
                Inputs ({transaction.inputs.length})
              </h3>
              <div className="space-y-2">
                {transaction.inputs.map((input, index) => (
                  <div key={index} className="p-2 bg-muted rounded-lg">
                    <div className="flex justify-between items-start text-sm">
                      <span className="font-mono text-xs text-muted-foreground">
                        {input.address
                          ? truncateAddress(input.address)
                          : "Unknown"}
                      </span>
                      <span>
                        {input.amount?.quantity
                          ? formatAmount(input.amount?.quantity)
                          : "Unknown"}
                      </span>
                    </div>
                    {input.assets && input.assets.length > 0 && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        +{input.assets.length} asset(s)
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Outputs */}
            <div className="space-y-3">
              <h3 className="font-medium">
                Outputs ({transaction.outputs.length})
              </h3>
              <div className="space-y-2">
                {transaction.outputs.map((output, index) => (
                  <div key={index} className="p-2 bg-muted rounded-lg">
                    <div className="flex justify-between items-start text-sm">
                      <span className="font-mono text-xs text-muted-foreground">
                        {truncateAddress(output.address)}
                      </span>
                      <span>{formatAmount(output.amount?.quantity)}</span>
                    </div>
                    {output.assets && output.assets.length > 0 && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        +{output.assets.length} asset(s)
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TransactionDetail;
