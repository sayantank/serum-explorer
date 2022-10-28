import { getMint } from "@solana/spl-token-2";
import { Connection, PublicKey } from "@solana/web3.js";

export const validateMint = async (
  connection: Connection,
  mintAddress: string
) => {
  try {
    const mint = await getMint(connection, new PublicKey(mintAddress));
    return mint;
  } catch (e) {
    return undefined;
  }
};
