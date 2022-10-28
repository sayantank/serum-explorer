import { getAssociatedTokenAddress } from "@solana/spl-token-2";
import { useConnection } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import useSWR from "swr";

const fetcher = async ({
  connection,
  owner,
  mint,
}: {
  connection: Connection;
  owner?: PublicKey | null;
  mint?: PublicKey;
}) => {
  if (!owner || !mint) throw new Error("No owner or mint provided");

  const tokenAccount = await getAssociatedTokenAddress(mint, owner, true);
  return connection.getTokenAccountBalance(tokenAccount);
};

export const useTokenBalance = (owner?: PublicKey | null, mint?: PublicKey) => {
  const { connection } = useConnection();

  const { data, error, isValidating, mutate } = useSWR(
    () =>
      owner &&
      mint && [
        "balance",
        owner.toBase58(),
        mint.toBase58(),
        connection.rpcEndpoint,
      ],
    () => fetcher({ connection, owner, mint }),
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
