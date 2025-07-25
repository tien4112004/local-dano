import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TransactionHistory = () => {
  return (
    <div className="min-h-screen p-4 bg-background">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TransactionHistory;