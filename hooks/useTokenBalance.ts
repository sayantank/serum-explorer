import { getAssociatedTokenAddress } from "@solana/spl-token-2";
import { useConnection } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import useSWR from "swr";

const fetcher = async (
  owner: PublicKey,
  mint: PublicKey,
  connection: Connection
) => {
  const tokenAccount = await getAssociatedTokenAddress(mint, owner, true);
  return connection.getTokenAccountBalance(tokenAccount);
};

export const useTokenBalance = (owner?: PublicKey | null, mint?: PublicKey) => {
  const { connection } = useConnection();

  const { data, error, isValidating, mutate } = useSWR(
    () => owner && mint && [owner, mint, connection],
    fetcher,
    {
      errorRetryCount: 1,
      onError: (err) => {
        console.error(`useTokenBalance: ${err}`);
      },
    }
  );

  const loading = !data && !error;

  return {
    tokenAmount: data?.value,
    loading,
    error,
    isValidating,
    mutate,
  };
};
