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
  serumMarket?: Market;
  connection: Connection;
}) => {
  if (!serumMarket) throw new Error("Serum market not found");
  return serumMarket.loadEventQueue(connection);
};

const openOrdersFetcher = ({
  serumMarket,
  walletAddress,
  connection,
}: {
  serumMarket?: Market;
  walletAddress?: PublicKey | null;
  connection: Connection;
}) => {
  if (!serumMarket || !walletAddress)
    throw new Error("Serum market or wallet address not found");
  return serumMarket.findOpenOrdersAccountsForOwner(connection, walletAddress);
};

const ordersFetcher = async ({
  serumMarket,
  walletAddress,
  connection,
}: {
  serumMarket?: Market;
  walletAddress?: PublicKey | null;
  connection: Connection;
}) => {
  if (!serumMarket || !walletAddress)
    throw new Error("Serum market or wallet address not found");

  return serumMarket.loadOrdersForOwner(connection, walletAddress);
};

export const MarketProvider = ({
  children,
  serumMarket,
  walletAddress,
}: MarketProviderProps) => {
  const { connection } = useConnection();

  // INFO: https://frontend-digest.com/dependent-and-conditional-data-fetching-with-useswr-b5178a85185
  const {
    data: eventQueue,
    error: eventQueueError,
    isValidating: eventQueueIsValidating,
    mutate: eventQueueMutate,
  } = useSWR(
    () =>
      serumMarket && [
        "eventQueue",
        serumMarket.address.toBase58(), // NOTE: programId not required in key because one address can't be a market in two different programs (unless network is changed, which is handled below)
        connection.rpcEndpoint, // NOTE: might not be needed, but thinking about the possibility of markets having same address in different network.
      ],
    () => eventQueueFetcher({ serumMarket, connection }),
    {
      revalidateOnFocus: false,
    }
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
      walletAddress && [
        "openOrders",
        walletAddress.toBase58(),
        serumMarket.address.toBase58(),
        connection.rpcEndpoint,
      ],
    () => openOrdersFetcher({ serumMarket, walletAddress, connection }),
    {
      errorRetryCount: 1,
      errorRetryInterval: 5000,
      revalidateOnFocus: false,
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
      walletAddress && [
        "orders",
        walletAddress.toBase58(),
        serumMarket.address.toBase58(),
        connection.rpcEndpoint,
      ],
    () => ordersFetcher({ serumMarket, walletAddress, connection }),
    {
      errorRetryCount: 1,
      errorRetryInterval: 5000,
      revalidateOnFocus: false,
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
