import { useState, useCallback } from "react";
import { VelaClient } from "vela-sdk";
import { recordPoolDeposit } from "../utils/poolStore";
import { useSubmitTx } from "./useSubmitTx";

const CONTRACT_ID = process.env.EXPO_PUBLIC_CONTRACT_ID ?? "";
const RPC_URL = process.env.EXPO_PUBLIC_RPC_URL ?? "https://soroban-testnet.stellar.org";
const NETWORK_PASSPHRASE =
  process.env.EXPO_PUBLIC_NETWORK_PASSPHRASE ?? "Test SDF Network ; September 2015";

let _client: VelaClient | null = null;
function getClient(): VelaClient {
  if (!_client) {
    _client = new VelaClient({
      contractId: CONTRACT_ID,
      rpcUrl: RPC_URL,
      networkPassphrase: NETWORK_PASSPHRASE,
    });
  }
  return _client;
}

export interface DepositState {
  pending: boolean;
  success: boolean;
  error: string | null;
  txHash?: string;
}

export interface UsePoolDepositReturn extends DepositState {
  deposit: (poolId: string, amount: string, token: string, depositorAddress: string) => Promise<void>;
  reset: () => void;
}

/**
 * usePoolDeposit
 *
 * Builds a real pool_deposit transaction XDR via VelaClient.preparePoolDepositTx,
 * routes it through useSubmitTx (wallet sign + Soroban RPC broadcast), and
 * records the deposit locally only after chain confirmation.
 */
export function usePoolDeposit(): UsePoolDepositReturn {
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string>();

  const submitTx = useSubmitTx();

  const deposit = useCallback(
    async (poolId: string, amount: string, token: string, depositorAddress: string) => {
      setPending(true);
      setError(null);
      setSuccess(false);

      try {
        if (!amount || parseFloat(amount) <= 0) {
          throw new Error("Amount must be greater than zero");
        }
        if (!token) {
          throw new Error("Token address is required");
        }
        if (!depositorAddress) {
          throw new Error("Wallet not connected");
        }

        // Convert human-readable amount to stroops (7 decimal places for Stellar)
        const amountStroops = BigInt(Math.floor(parseFloat(amount) * 10_000_000));

        // Build the real pool_deposit transaction XDR
        const txXdr = await getClient().preparePoolDepositTx(
          depositorAddress,
          poolId,
          token,
          amountStroops
        );

        const hash = await submitTx(txXdr);

        // Record the deposit locally only after the chain confirms it
        recordPoolDeposit(poolId, amount);

        setTxHash(hash);
        setSuccess(true);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Deposit failed. Please try again.";
        setError(message);
      } finally {
        setPending(false);
      }
    },
    [submitTx]
  );

  const reset = useCallback(() => {
    setPending(false);
    setSuccess(false);
    setError(null);
    setTxHash(undefined);
  }, []);

  return {
    pending,
    success,
    error,
    txHash,
    deposit,
    reset,
  };
}
