import { Market } from "@project-serum/serum";
import { createContext, ReactNode, useContext, useEffect } from "react";
import { useMetaplexMetadata, useSPLToken } from "../../hooks";
import { programs } from "@metaplex/js";
import { Mint } from "@solana/spl-token-2";
import { Event } from "@project-serum/serum/lib/queue";
import { useConnection } from "@solana/wallet-adapter-react";
import useSWR, { KeyedMutator } from "swr";
import { Connection } from "@solana/web3.js";

type MarketData<T> = {
  data?: T;
  error: any;
  isLoading: boolean;
  mutate: KeyedMutator<T>;
  isValidating: boolean;
};

export type MarketContextType = {
  serumMarket?: Market;
  baseMetadata?: programs.metadata.Metadata;
  quoteMetadata?: programs.metadata.Metadata;
  baseMint?: Mint;
  quoteMint?: Mint;
  eventQueue: MarketData<Event[]>;
  loading: boolean;
};

export type MarketProviderProps = {
  children: ReactNode;
  serumMarket?: Market;
};

const MarketContext = createContext<MarketContextType | undefined>(undefined);

const eventQueueFetcher = (serumMarket: Market, connection: Connection) =>
  serumMarket.loadEventQueue(connection);

export const MarketProvider = ({
  children,
  serumMarket,
}: MarketProviderProps) => {
  const { connection } = useConnection();

  const {
    data: eventQueue,
    error: eventQueueError,
    isValidating: eventQueueIsValidating,
    mutate: eventQueueMutate,
  } = useSWR(() => serumMarket && [serumMarket, connection], eventQueueFetcher);

  const eventQueueLoading = !eventQueue && !eventQueueError;

  const { metadata: baseMetadata } = useMetaplexMetadata(
    serumMarket?.baseMintAddress.toString()
  );
  const { metadata: quoteMetadata } = useMetaplexMetadata(
    serumMarket?.quoteMintAddress.toString()
  );

  const { mint: baseMint, loading: baseMintLoading } = useSPLToken(
    serumMarket?.baseMintAddress
  );
  const { mint: quoteMint, loading: quoteMintLoading } = useSPLToken(
    serumMarket?.quoteMintAddress
  );

  return (
    <MarketContext.Provider
      value={{
        serumMarket,
        baseMetadata,
        quoteMetadata,
        baseMint,
        quoteMint,
        eventQueue: {
          data: eventQueue,
          error: eventQueueError,
          isLoading: eventQueueLoading,
          mutate: eventQueueMutate,
          isValidating: eventQueueIsValidating,
        },
        loading: eventQueueLoading || baseMintLoading || quoteMintLoading,
      }}
    >
      {children}
    </MarketContext.Provider>
  );
};

export const useMarket = () => {
  const market = useContext(MarketContext);
  if (!market) {
    throw new Error("useMarket must be used within a MarketProvider");
  }

  return market;
};
