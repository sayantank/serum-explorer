import { Market } from "@project-serum/serum";
import { createContext, ReactNode, useContext, useEffect } from "react";
import { useEventQueue, useMetaplexMetadata, useSPLToken } from "../../hooks";
import { programs } from "@metaplex/js";
import { Mint } from "@solana/spl-token-2";
import { Event } from "@project-serum/serum/lib/queue";

export type MarketContextType = {
  serumMarket?: Market;
  baseMetadata?: programs.metadata.Metadata;
  quoteMetadata?: programs.metadata.Metadata;
  baseMint?: Mint;
  quoteMint?: Mint;
  eventQueue?: Event[];
  loading: boolean;
};

export type MarketProviderProps = {
  children: ReactNode;
  serumMarket?: Market;
};

const MarketContext = createContext<MarketContextType | undefined>(undefined);

export const MarketProvider = ({
  children,
  serumMarket,
}: MarketProviderProps) => {
  const { eventQueue, loading: eventQueueLoading } = useEventQueue(serumMarket);

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
        eventQueue,
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
