import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  GlowWalletAdapter,
  PhantomWalletAdapter,
  SlopeWalletAdapter,
  TorusWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { clusterApiUrl, Connection } from "@solana/web3.js";
import { useRouter } from "next/router";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type ClusterType = "mainnet-beta" | "testnet" | "devnet" | "custom";

export type SolanaCluster = {
  label: string;
  network: ClusterType;
  endpoint: string;
};

type SolanaContextType = {
  cluster: SolanaCluster;
  setCluster: (cluster: SolanaCluster) => void;
  customEndpoint: string;
  setCustomEndpoint: (endpoint: string) => void;
  isActiveCluster: (selectedCluster: SolanaCluster) => boolean;
};

type SolanaProviderProps = {
  children: ReactNode;
};

const SolanaContext = createContext<SolanaContextType | null>(null);

export const CLUSTER_LOCAL_STORAGE_KEY = "cluster-serum-explorer";

export const LOCALNET_URL = "http://localhost:8899";

export const CLUSTERS: SolanaCluster[] = [
  {
    label: "Mainnet (Solana)",
    network: "mainnet-beta",
    endpoint: clusterApiUrl("mainnet-beta"),
  },
  // {
  //   label: "Mainnet (Serum)",
  //   network: "mainnet-beta",
  //   endpoint: "https://solana-api.projectserum.com",
  // },
  {
    label: "Testnet",
    network: "testnet",
    endpoint: clusterApiUrl("testnet"),
  },
  {
    label: "Devnet",
    network: "devnet",
    endpoint: clusterApiUrl("devnet"),
  },
  {
    label: "Custom RPC",
    network: "custom",
    endpoint: LOCALNET_URL,
  },
];

export const CUSTOM_RPC_CLUSTER = CLUSTERS[CLUSTERS.length - 1];

export const isActiveCluster = (
  cluster: SolanaCluster,
  connection: Connection
) => {
  return connection.rpcEndpoint === cluster.endpoint;
};

export const SolanaProvider = ({ children }: SolanaProviderProps) => {
  const [cluster, _setCluster] = useState(CLUSTERS[0]);
  const [customEndpoint, _setCustomEndpoint] = useState(LOCALNET_URL);

  const router = useRouter();

  const endpoint = useMemo(() => {
    if (cluster.label === "Custom RPC") {
      return customEndpoint;
    }
    return cluster.endpoint;
  }, [cluster, customEndpoint]);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new GlowWalletAdapter(),
      new SlopeWalletAdapter(),
      new TorusWalletAdapter(),
    ],
    []
  );

  const isActiveCluster = (selectedCluster: SolanaCluster): boolean => {
    return selectedCluster.label === cluster.label;
  };

  const setCluster = (cluster: SolanaCluster) => {
    const newQuery: {
      network?: string;
      customRPC?: string;
    } = {
      ...router.query,
      network: cluster.network,
    };

    if (cluster.network === "mainnet-beta") delete newQuery.network;

    if (cluster.network === "custom") newQuery.customRPC = LOCALNET_URL;
    else delete newQuery.customRPC;

    router.replace({
      query: newQuery,
    });
  };

  const setCustomEndpoint = (endpoint: string) => {
    if (cluster.network !== "custom") return;
    const newQuery: {
      customRPC?: string;
    } = {
      ...router.query,
      customRPC: endpoint,
    };
    router.replace({
      query: newQuery,
    });
  };

  useEffect(() => {
    if (router.query.network) {
      _setCluster(
        CLUSTERS.filter((c) => c.network === router.query.network)[0]
      );
    } else _setCluster(CLUSTERS[0]);
  }, [router.query.network]);

  useEffect(() => {
    if (router.query.customRPC) {
      _setCustomEndpoint(router.query.customRPC as string);
    }
  }, [router.query.customRPC]);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <SolanaContext.Provider
            value={{
              cluster,
              setCluster,
              customEndpoint,
              setCustomEndpoint,
              isActiveCluster,
            }}
          >
            {children}
          </SolanaContext.Provider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export const useSolana = () => {
  const solana = useContext(SolanaContext);

  if (!solana)
    throw new Error("Make sure you wrap your component with SolanaProvider");

  return solana;
};
