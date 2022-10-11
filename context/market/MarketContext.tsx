import { Market, OpenOrders } from "@project-serum/serum";
import { createContext, ReactNode, useContext } from "react";
import { useMetaplexMetadata, useSPLToken } from "../../hooks";
import { programs } from "@metaplex/js";
import { Mint } from "@solana/spl-token-2";
import { Event } from "@project-serum/serum/lib/queue";
import { useConnection } from "@solana/wallet-adapter-react";
import useSWR, { KeyedMutator } from "swr";
import { Connection, PublicKey } from "@solana/web3.js";
import { Order } from "@project-serum/serum/lib/market";

type MarketData<T> = {
  data?: T;
  error: unknown;
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
  openOrders: MarketData<OpenOrders[]>;
  orders: MarketData<Order[]>;
  loading: boolean;
};

export type MarketProviderProps = {
  children: ReactNode;
  serumMarket?: Market;
  walletAddress?: PublicKey | null;
};

const MarketContext = createContext<MarketContextType | undefined>(undefined);

const eventQueueFetcher = ({
  serumMarket,
  connection,
}: {
  serumMarket: Market;
  connection: Connection;
}) => {
  console.log("[SERUM_EXPLORER] Fetching event queue...");
  return serumMarket.loadEventQueue(connection);
};

const openOrdersFetcher = ({
  serumMarket,
  walletAddress,
  connection,
}: {
  serumMarket: Market;
  walletAddress: PublicKey;
  connection: Connection;
}) => {
  console.log("[SERUM_EXPLORER] Fetching open orders...");
  return serumMarket.findOpenOrdersAccountsForOwner(connection, walletAddress);
};

const ordersFetcher = async ({
  serumMarket,
  walletAddress,
  connection,
}: {
  serumMarket: Market;
  walletAddress: PublicKey;
  connection: Connection;
}) => {
  console.log("[SERUM_EXPLORER] Fetching orders...");
  return serumMarket.loadOrdersForOwner(connection, walletAddress);
};

export const MarketProvider = ({
  children,
  serumMarket,
  walletAddress,
}: MarketProviderProps) => {
  const { connection } = useConnection();

  const {
    data: eventQueue,
    error: eventQueueError,
    isValidating: eventQueueIsValidating,
    mutate: eventQueueMutate,
  } = useSWR(
    () => serumMarket && { serumMarket, connection },
    eventQueueFetcher
  );

  const eventQueueLoading = !eventQueue && !eventQueueError;

  const {
    data: openOrders,
    error: openOrdersError,
    isValidating: openOrdersIsValidating,
    mutate: openOrdersMutate,
  } = useSWR(
    () =>
      serumMarket &&
      walletAddress && {
        type: "openOrders",
        serumMarket,
        walletAddress,
        connection,
      },
    openOrdersFetcher,
    {
      errorRetryCount: 1,
      errorRetryInterval: 5000,
    }
  );

  const openOrdersLoading = !openOrders && !openOrdersError;

  const {
    data: orders,
    error: ordersError,
    isValidating: ordersIsValidating,
    mutate: ordersMutate,
  } = useSWR(
    () =>
      serumMarket &&
      walletAddress && {
        type: "orders",
        serumMarket,
        walletAddress,
        connection,
      },
    ordersFetcher,
    {
      errorRetryCount: 1,
      errorRetryInterval: 5000,
    }
  );

  const ordersLoading = !orders && !ordersError;

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
        openOrders: {
          data: openOrders,
          error: openOrdersError,
          isLoading: openOrdersLoading,
          mutate: openOrdersMutate,
          isValidating: openOrdersIsValidating,
        },
        orders: {
          data: orders,
          error: ordersError,
          isLoading: ordersLoading,
          mutate: ordersMutate,
          isValidating: ordersIsValidating,
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
