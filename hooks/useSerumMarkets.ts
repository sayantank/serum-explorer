import { useConnection } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import useSWR from "swr";
import { useProgram } from "../context/SerumContext";
import { ClusterType, useSolana } from "../context/SolanaContext";
import { MARKET_ACCOUNT_FLAGS_B58_ENCODED } from "../utils/constants";
import axios from "axios";
import { toast } from "react-toastify";

export type SerumMarketInfo = {
  address: PublicKey;
  baseSymbol?: string;
  quoteSymbol?: string;
};

const fetcher = async (
  programID: string,
  rpcEndpoint: string,
  cluster: ClusterType
): Promise<SerumMarketInfo[]> => {
  console.log(`[SERUM_EXPLORER] Fetching markets...`);
  const connection = new Connection(rpcEndpoint);
  let serumMarkets: SerumMarketInfo[];

  // if "custom", user will have to make sure their RPC provider supports getProgramAccounts
  if (cluster !== "mainnet-beta") {
    const markets = await connection.getParsedProgramAccounts(
      new PublicKey(programID),
      {
        filters: [
          {
            memcmp: {
              offset: 5,
              bytes: MARKET_ACCOUNT_FLAGS_B58_ENCODED,
            },
          },
        ],
      }
    );
    serumMarkets = markets.map((m) => ({ address: m.pubkey }));
  } else {
    const { data } = await axios.get<{
      tvl: number;
      total_vol_1d: number;
      markets: {
        market_address: string;
        base_symbol: string;
        quote_symbol: string;
      }[];
    }>("https://serum-volume-tracker.vercel.app/api");
    serumMarkets = data.markets.map((m) => ({
      address: new PublicKey(m.market_address),
      baseSymbol: m.base_symbol,
      quoteSymbol: m.quote_symbol,
    }));
  }

  return serumMarkets;
};

/**
 * Returns the list of Markets for a given Program ID.
 *
 * Currently, this only returns markets for localnet or Serum Dex V3 on mainnet-beta.
 */
export const useSerumMarkets = () => {
  const { cluster } = useSolana();
  const { connection } = useConnection();
  const { programID } = useProgram();

  // FIX: Object as key doesn't seem to be working with cache, hence stringifying stuff.
  const {
    data: serumMarkets,
    isValidating,
    error,
    mutate,
  } = useSWR(
    () =>
      programID &&
      connection && [
        programID.toBase58(),
        connection.rpcEndpoint,
        cluster.network,
        "markets",
      ],
    fetcher,
    {
      errorRetryCount: 1,
      // FIX: revalidateOnMount should be false, but it wouldn't fetch on initial mount also for some reason.
      revalidateOnFocus: cluster.network !== "mainnet-beta", // NOTE: Since mainnet-beta data is from VYBE API, we don't have to revalidate at all.
      revalidateIfStale: false,
      onError: (err) => {
        console.error(err);
        toast.error("Failed to load market.");
      },
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
