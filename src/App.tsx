import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { PassphraseDialog } from "@/components/wallet/PassphraseDialog";
import Index from "./pages/Index";
import Send from "./pages/Send";
import CreateWallet from "./pages/CreateWallet";
import Tokens from "./pages/Tokens";
import TransactionHistory from "./pages/TransactionHistory";
import Faucet from "./pages/Faucet";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [passphraseDialog, setPassphraseDialog] = useState<{
    open: boolean;
    onSign?: (passphrase: string) => Promise<void>;
    onCancel?: () => void;
  }>({ open: false });

  useEffect(() => {
    const handleShowPassphraseDialog = (event: CustomEvent) => {
      const { onSign, onCancel } = event.detail;
      setPassphraseDialog({
        open: true,
        onSign: async (passphrase: string) => {
          await onSign(passphrase);
          setPassphraseDialog({ open: false });
        },
        onCancel: () => {
          onCancel();
          setPassphraseDialog({ open: false });
        }
      });
    };

    window.addEventListener('show-passphrase-dialog', handleShowPassphraseDialog as EventListener);

    return () => {
      window.removeEventListener('show-passphrase-dialog', handleShowPassphraseDialog as EventListener);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <PassphraseDialog
          open={passphraseDialog.open}
          onSign={passphraseDialog.onSign || (() => Promise.resolve())}
          onCancel={passphraseDialog.onCancel || (() => {})}
        />
        <HashRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/send" element={<Send />} />
            <Route path="/create" element={<CreateWallet />} />
            <Route path="/tokens" element={<Tokens />} />
            <Route path="/history" element={<TransactionHistory />} />
            <Route path="/faucet" element={<Faucet />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </HashRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
