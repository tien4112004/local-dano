import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PassphraseDialogProps {
  open: boolean;
  onSign: (passphrase: string) => Promise<void>;
  onCancel: () => void;
}

export function PassphraseDialog({ open, onSign, onCancel }: PassphraseDialogProps) {
  const [passphrase, setPassphrase] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSign = async () => {
    if (!passphrase.trim()) return;
    
    setIsLoading(true);
    try {
      await onSign(passphrase);
      setPassphrase("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setPassphrase("");
    onCancel();
  };

  return (
    <Dialog open={open} onOpenChange={() => handleCancel()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Sign Transaction</DialogTitle>
          <DialogDescription>
            Enter your wallet passphrase to sign the transaction.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="passphrase" className="text-right">
              Passphrase
            </Label>
            <Input
              id="passphrase"
              type="password"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              className="col-span-3"
              placeholder="Enter your wallet passphrase"
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === "Enter" && passphrase.trim()) {
                  handleSign();
                }
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSign}
            disabled={!passphrase.trim() || isLoading}
          >
            {isLoading ? "Signing..." : "Sign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}