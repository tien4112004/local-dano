import { SendTransaction } from "@/components/wallet/SendTransaction";

const Send = () => {
  return (
    <div className="min-h-screen p-4 bg-background">
      <div className="max-w-md mx-auto">
        <SendTransaction />
      </div>
    </div>
  );
};

export default Send;