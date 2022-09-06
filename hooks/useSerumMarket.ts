import { Market } from "@project-serum/serum";
import { useConnection } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { toast } from "react-toastify";
import useSWR from "swr";
import { useProgram } from "../context/SerumContext";

const fetcher = async (
  marketAddress: string,
  programID: PublicKey,
  connection: Connection
): Promise<Market> => {
  const market = await Market.load(
    connection,
    new PublicKey(marketAddress),
    { commitment: "confirmed" },
    programID
  );
  return market;
};

export const useSerumMarket = (marketAddress: string | undefined) => {
  const { connection } = useConnection();
  const { programID } = useProgram();

  const {
    data: serumMarket,
    error,
    isValidating,
    mutate,
  } = useSWR(
    () => marketAddress && programID && [marketAddress, programID, connection],
    fetcher,
    {
      revalidateOnFocus: false,
      // revalidateOnMount: false,
      // shouldRetryOnError: false,
      errorRetryCount: 1,
      onError: (err) => {
        console.error(err);
        toast.error("Failed to load market.");
      },
    }
  );

  const loading = !serumMarket && !error;

  return {
    serumMarket,
    loading,
    error,
    isValidating,
    mutate,
  };
};
