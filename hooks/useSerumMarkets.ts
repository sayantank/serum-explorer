import bs58 from "bs58";
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
import { useSolana } from "../context/SolanaContext";
import { MARKET_ACCOUNT_FLAGS_B58_ENCODED } from "../utils/constants";
import axios from "axios";

const isLocalhost = (url: string) => {
  return url.includes("localhost") || url.includes("127.0.0.1");
};

const fetcher = async (
  programID: PublicKey,
  connection: Connection,
  isLocalhost: boolean
): Promise<Market[]> => {
  let serumMarkets: Market[];

  if (isLocalhost) {
    const markets = await connection.getParsedProgramAccounts(programID, {
      filters: [
        {
          memcmp: {
            offset: 5,
            bytes: MARKET_ACCOUNT_FLAGS_B58_ENCODED,
          },
        },
      ],
    });

    const fetchPromises = markets.map((m) =>
      Market.load(connection, m.pubkey, { commitment: "confirmed" }, programID)
    );
    serumMarkets = await Promise.all(fetchPromises);
  } else {
    const data = await axios.get("https://serum-volume-tracker.vercel.app/");
    console.log(data.data);
    throw new Error("hello");
  }

  return serumMarkets;
};

export const useSerumMarkets = () => {
  const { cluster } = useSolana();
  const { connection } = useConnection();
  const { programID } = useSerum();

  const {
    data: serumMarkets,
    isValidating,
    error,
    mutate,
  } = useSWR(
    (cluster.network === "mainnet-beta" ||
      isLocalhost(connection.rpcEndpoint)) &&
      programID &&
      connection && [
        programID,
        connection,
        isLocalhost(connection.rpcEndpoint),
      ],
    fetcher,
    {
      errorRetryCount: 1,
    }
  );

  const loading = !serumMarkets && !error;

  return {
    serumMarkets,
    loading,
    error,
    isValidating,
    mutate,
  };
};
