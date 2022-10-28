import { programs } from "@metaplex/js";
const {
  metadata: { Metadata },
} = programs;

import { useConnection } from "@solana/wallet-adapter-react";
import { Connection } from "@solana/web3.js";
import useSWR from "swr";

const fetcher = async ({
  mint,
  connection,
}: {
  mint?: string;
  connection: Connection;
}): Promise<programs.metadata.Metadata> => {
  const metadata = await Metadata.load(
    connection,
    await Metadata.getPDA(mint ? mint : "")
  );
  return metadata;
};

export const useMetaplexMetadata = (mint?: string) => {
  const { connection } = useConnection();

  const {
    data: metadata,
    error,
    isValidating,
    mutate,
  } = useSWR(
    () => mint && connection && ["metadata", mint, connection.rpcEndpoint],
    () => fetcher({ mint, connection }),
    {
      revalidateOnFocus: false,
      // revalidateOnMount: false,
      revalidateIfStale: false,
      errorRetryCount: 1,
      onError: (err) => {
        console.error(err);
        // NOTE: Decided not to show snackbar for unavailable metadata.
        // toast.error("Failed to load Token Metadata.");
      },
    }
  );

  const loading = !metadata && !error;

  return {
    metadata,
    loading,
    error,
    isValidating,
    mutate,
  };
};
