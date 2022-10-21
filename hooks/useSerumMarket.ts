import { Market } from "@project-serum/serum";
import { useConnection } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { toast } from "react-toastify";
import useSWR from "swr";
import { useSerum } from "../context/SerumContext";

const fetcher = async ({
  marketAddress,
  programID,
  connection,
}: {
  marketAddress?: string;
  programID: PublicKey;
  connection: Connection;
}): Promise<Market> => {
  console.log("[SERUM_EXPLORER] Fetching market...");

  if (!marketAddress) {
    throw new Error("No market address provided");
  }

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
  const { programID } = useSerum();

  const {
    data: serumMarket,
    error,
    isValidating,
    mutate,
  } = useSWR(
    () =>
      marketAddress && [
        "market",
        marketAddress,
        programID.toBase58(), // NOTE: programID kept here since we want to refetch market when programID changes
        connection.rpcEndpoint,
      ],
    () => fetcher({ marketAddress, programID, connection }),
    {
      revalidateOnFocus: false,
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
