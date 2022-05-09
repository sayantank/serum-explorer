import { useConnection } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import useSWR from "swr";
import { getMint, Mint } from "@solana/spl-token-2";

const fetcher = async (
  mintAddress: PublicKey,
  connection: Connection
): Promise<Mint> => {
  const mint = await getMint(connection, mintAddress, "confirmed");
  return mint;
};

export const useSPLToken = (mintAddress: PublicKey | undefined) => {
  const { connection } = useConnection();

  const {
    data: mint,
    error,
    isValidating,
    mutate,
  } = useSWR(() => mintAddress && [mintAddress, connection], fetcher, {
    revalidateOnFocus: false,
  });

  const loading = !mint && !error;

  return {
    mint,
    loading,
    error,
    isValidating,
    mutate,
  };
};
