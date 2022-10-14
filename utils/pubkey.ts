import { PublicKey } from "@solana/web3.js";

export function prettifyPubkey(pubkey: PublicKey, numChars = 10) {
  return pubkey.toString().slice(0, numChars) + "...";
}
