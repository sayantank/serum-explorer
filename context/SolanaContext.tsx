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
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type ClusterType = "mainnet-beta" | "testnet" | "devnet" | "localnet";

type SolanaCluster = {
  label: string;
  network: ClusterType;
  endpoint: string;
};

type SolanaContextType = {
  cluster: SolanaCluster;
  setCluster: Dispatch<SetStateAction<SolanaCluster>>;
  customEndpoint: string;
  setCustomEndpoint: Dispatch<SetStateAction<string>>;
  isActiveCluster: (selectedCluster: SolanaCluster) => boolean;
};

type SolanaProviderProps = {
  children: ReactNode;
};

const SolanaContext = createContext<SolanaContextType | null>(null);

export const LOCALNET_URL = "https://localhost:8899";

export const CLUSTERS: SolanaCluster[] = [
  {
    label: "Mainnet (Solana)",
    network: "mainnet-beta",
    endpoint: clusterApiUrl("mainnet-beta"),
  },
  {
    label: "Mainnet (Serum)",
    network: "mainnet-beta",
    endpoint: "https://solana-api.projectserum.com",
  },
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
    network: "mainnet-beta", // Not relevant rn
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
  const [cluster, setCluster] = useState(CLUSTERS[0]);
  const [customEndpoint, setCustomEndpoint] = useState(LOCALNET_URL);

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

  useEffect(() => {
    console.log(endpoint);
  }, [endpoint]);

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
