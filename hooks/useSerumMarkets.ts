import { Market } from "@project-serum/serum";
import { accountFlagsLayout } from "@project-serum/serum/lib/layout";
import { useConnection } from "@solana/wallet-adapter-react";
import {
  AccountInfo,
  Connection,
  ParsedAccountData,
  PublicKey,
} from "@solana/web3.js";
import { useState } from "react";
import useSWR from "swr";
import { useSerum } from "../context/SerumContext";

const marketFilter = (acc: {
  pubkey: PublicKey;
  account: AccountInfo<Buffer | ParsedAccountData>;
}) => {
  const bufferData = (acc.account.data as Buffer).slice(5, 70);
  const decoded = accountFlagsLayout().decode(bufferData);
  return decoded.initialized && decoded.market;
};

const fetcher = async (
  programID: PublicKey,
  connection: Connection
): Promise<Market[]> => {
  console.log(connection.rpcEndpoint);
  const accounts = await connection.getParsedProgramAccounts(programID);
  const markets = accounts.filter(marketFilter);

  console.log(markets);

  const fetchPromises = markets.map((m) =>
    Market.load(connection, m.pubkey, { commitment: "confirmed" }, programID)
  );
  const serumMarkets = await Promise.all(fetchPromises);

  return serumMarkets;
};

export const useSerumMarkets = () => {
  const { connection } = useConnection();
  const { programID } = useSerum();

  const {
    data: serumMarkets,
    isValidating,
    error,
    mutate,
  } = useSWR(programID && connection && [programID, connection], fetcher);

  const loading = !serumMarkets && !error;

  return {
    serumMarkets,
    loading,
    error,
    isValidating,
    mutate,
  };
};
