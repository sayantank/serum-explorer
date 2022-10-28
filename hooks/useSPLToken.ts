import { useConnection } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import useSWR from "swr";
import { getMint, Mint } from "@solana/spl-token-2";
import { toast } from "react-toastify";

const fetcher = async ({
  connection,
  mintAddress,
}: {
  connection: Connection;
  mintAddress?: PublicKey;
}): Promise<Mint> => {
  if (!mintAddress) throw new Error("No mint address provided");

  return getMint(connection, mintAddress, "confirmed");
};

export const useSPLToken = (mintAddress: PublicKey | undefined) => {
  const { connection } = useConnection();

  const {
    data: mint,
    error,
    isValidating,
    mutate,
  } = useSWR(
    () =>
      mintAddress && ["mint", mintAddress.toBase58(), connection.rpcEndpoint],
    () => fetcher({ connection, mintAddress }),
    {
      revalidateOnFocus: false,
      errorRetryCount: 1,
      onError: (err) => {
        console.error(err);
        toast.error("Failed to SPL Token data.");
      },
    }
  );

  const loading = !mint && !error;

  return {
    mint,
    loading,
    error,
    isValidating,
    mutate,
  };
};
