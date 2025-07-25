import { SendTransaction } from "@/components/wallet/SendTransaction";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Send = () => {
  const navigate = useNavigate();

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
        <SendTransaction />
      </div>
    </div>
  );
};

export default Send;