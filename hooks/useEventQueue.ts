import { Market } from "@project-serum/serum";
import { useConnection } from "@solana/wallet-adapter-react";
import { Connection } from "@solana/web3.js";
import { useEffect } from "react";
import useSWR from "swr";

const fetcher = (serumMarket: Market, connection: Connection) =>
  serumMarket.loadEventQueue(connection);

export const useEventQueue = (serumMarket: Market | undefined) => {
  const { connection } = useConnection();

  useEffect(() => {
    if (serumMarket) console.log(serumMarket.address.toString());
  }, [serumMarket]);

  const {
    data: eventQueue,
    error,
    isValidating,
    mutate,
  } = useSWR(() => serumMarket && [serumMarket, connection], fetcher);

  const loading = !eventQueue && !error;

  return {
    eventQueue,
    loading,
    error,
    isValidating,
    mutate,
  };
};
