import { programs } from "@metaplex/js";
const {
  metadata: { Metadata },
} = programs;

import { useConnection } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";

export const useMetaplexMetadata = (mint?: string) => {
  const { connection } = useConnection();

  const [metadata, setMetadata] = useState<programs.metadata.Metadata | null>(
    null
  );

  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const ownedMetadata = await Metadata.load(
          connection,
          await Metadata.getPDA(mint ? mint : "")
        );
        setMetadata(ownedMetadata);
      } catch (e) {
        // TODO: snackbar
        setMetadata(null);
      }
    };
    loadMetadata();
  }, [connection, mint]);

  return metadata;
};
