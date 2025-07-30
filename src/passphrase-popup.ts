// Passphrase popup window logic
let isLoading = false;

interface SignRequest {
  tx: string;
  walletId: string;
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("passphraseForm") as HTMLFormElement;
  const passphraseInput = document.getElementById(
    "passphrase"
  ) as HTMLInputElement;
  const cancelBtn = document.getElementById("cancelBtn") as HTMLButtonElement;
  const signBtn = document.getElementById("signBtn") as HTMLButtonElement;
  const signText = document.getElementById("signText") as HTMLSpanElement;
  const errorDiv = document.getElementById("error") as HTMLDivElement;

  // Get signing request from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const tx = urlParams.get("tx");
  const walletId = urlParams.get("walletId");

  if (!tx || !walletId) {
    showError("Invalid signing request");
    return;
  }

  // Focus on passphrase input
  passphraseInput.focus();

  // Handle form submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const passphrase = passphraseInput.value.trim();
    if (!passphrase) {
      showError("Please enter your passphrase");
      return;
    }

    await handleSign(passphrase, tx, walletId);
  });

  // Handle cancel button
  cancelBtn.addEventListener("click", () => {
    // Send cancellation message to parent window
    if (window.opener) {
      window.opener.postMessage(
        {
          type: "PASSPHRASE_CANCELLED",
        },
        "*"
      );
    }
    window.close();
  });

  function showError(message: string) {
    errorDiv.textContent = message;
    errorDiv.style.display = "block";
  }

  function hideError() {
    errorDiv.style.display = "none";
  }

  function setLoading(loading: boolean) {
    isLoading = loading;
    passphraseInput.disabled = loading;
    cancelBtn.disabled = loading;
    signBtn.disabled = loading;

    if (loading) {
      signText.innerHTML = '<span class="loading"></span>Signing...';
    } else {
      signText.textContent = "Sign";
    }
  }

  async function handleSign(passphrase: string, tx: string, walletId: string) {
    hideError();
    setLoading(true);

    try {
      const response = await fetch(
        `http://103.126.158.239:58090/v2/wallets/${walletId}/transactions-sign`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            passphrase,
            transaction: tx,
            encoding: "base16",
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to sign transaction: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();

      // Send success message to parent window
      if (window.opener) {
        window.opener.postMessage(
          {
            type: "PASSPHRASE_SUCCESS",
            signedTransaction: data.transaction,
          },
          "*"
        );
      }

      // Close the popup
      window.close();
    } catch (error) {
      console.error("Signing error:", error);
      showError(
        error instanceof Error ? error.message : "Failed to sign transaction"
      );
    } finally {
      setLoading(false);
    }
  }
});
