import { Market } from "@project-serum/serum";
import { useConnection } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { useState } from "react";
import useSWR from "swr";
import { useSerum } from "../context/SerumContext";

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
  const { programID } = useSerum();

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
