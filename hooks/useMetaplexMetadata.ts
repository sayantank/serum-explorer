import { programs } from "@metaplex/js";
const {
  metadata: { Metadata },
} = programs;

import { useConnection } from "@solana/wallet-adapter-react";
import { Connection } from "@solana/web3.js";
import { toast } from "react-toastify";
import useSWR from "swr";

const fetcher = async (
  mint: string,
  connection: Connection
): Promise<programs.metadata.Metadata> => {
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
  } = useSWR(() => mint && connection && [mint, connection], fetcher, {
    revalidateOnFocus: false,
    revalidateOnMount: false,
    shouldRetryOnError: false,
    onError: (err) => {
      console.error(err);
      toast.error("Failed to load market.");
    },
  });

  const loading = !metadata && !error;

  return {
    metadata,
    loading,
    error,
    isValidating,
    mutate,
  };
};
