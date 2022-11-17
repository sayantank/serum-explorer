import { getAccount, getMint } from "@solana/spl-token-2";
import { Connection, PublicKey } from "@solana/web3.js";

export const validateMint = async (
  connection: Connection,
  mintAddress: string
) => {
  const mint = await getMint(connection, new PublicKey(mintAddress));
  return mint;
};

export const validateTokenAccount = async (
  connection: Connection,
  tokenAccountAddress: string,
  mintAddress: string,
  ownerAddress: string
) => {
  const account = await getAccount(
    connection,
    new PublicKey(tokenAccountAddress)
  );
  if (
    account.mint.toBase58() === mintAddress &&
    account.owner.toBase58() === ownerAddress
  ) {
    return account;
  } else throw new Error("Invalid mint/owner for token account");
};
