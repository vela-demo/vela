import { useState, useEffect, useCallback } from "react";
import { VelaClient } from "vela-sdk";
import type { Pool } from "../types/pool";

const CONTRACT_ID = process.env.EXPO_PUBLIC_CONTRACT_ID ?? "";
const RPC_URL = process.env.EXPO_PUBLIC_RPC_URL ?? "https://soroban-testnet.stellar.org";
const NETWORK_PASSPHRASE =
  process.env.EXPO_PUBLIC_NETWORK_PASSPHRASE ?? "Test SDF Network ; September 2015";
const INDEXER_URL = process.env.EXPO_PUBLIC_INDEXER_URL ?? "http://localhost:3001";

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

/**
 * Fetch pool data from the indexer first (fast), falling back to a direct
 * Soroban RPC call if the indexer is unavailable.
 */
async function fetchPool(poolId: string): Promise<Pool | null> {
  // 1. Try indexer
  try {
    const res = await fetch(`${INDEXER_URL.replace(/\/$/, "")}/api/pools/${encodeURIComponent(poolId)}`);
    if (res.ok) {
      const data = await res.json();
      if (data?.pool_id) {
        return {
          pool_id: data.pool_id,
          token: data.token,
          balance: BigInt(data.balance ?? "0"),
          admins: data.admins ?? [],
          threshold: Number(data.threshold ?? 1),
        };
      }
    }
  } catch {
    // indexer unreachable — fall through to contract
  }

  // 2. Fallback: read directly from Soroban contract
  const pool = await getClient().getPool(poolId);
  return pool;
}

export interface UsePoolReturn {
  pool: Pool | null;
  loading: boolean;
  error: string | null;
  isAdmin: (address: string) => boolean;
  refresh: () => void;
}

export function usePool(poolId: string): UsePoolReturn {
  const [pool, setPool] = useState<Pool | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPool = useCallback(async () => {
    if (!poolId) {
      setPool(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetchPool(poolId);
      if (!result) {
        setError("Pool not found");
      }
      setPool(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load pool. Please try again.");
      setPool(null);
    } finally {
      setLoading(false);
    }
  }, [poolId]);

  useEffect(() => {
    loadPool();
  }, [loadPool]);

  const isAdmin = useCallback(
    (address: string) => {
      return pool?.admins.includes(address) ?? false;
    },
    [pool]
  );

  const refresh = useCallback(() => {
    loadPool();
  }, [loadPool]);

  return { pool, loading, error, isAdmin, refresh };
}
