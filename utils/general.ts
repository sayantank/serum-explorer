import { PublicKey } from "@solana/web3.js";
import { ClusterType } from "../context";

export function classNames(...classes: string[]): string {
  return classes.filter(Boolean).join(" ");
}

export function getExplorerLink(txSig: string, cluster: ClusterType): string {
  return `https://explorer.solana.com/tx/${txSig}?cluster=${
    cluster === "mainnet-beta" ? null : cluster
  }`;
}

export function getExplorerAccountLink(
  account: PublicKey,
  cluster: ClusterType
): string {
  return `https://explorer.solana.com/address/${account.toString()}?cluster=${
    cluster === "mainnet-beta" ? null : cluster
  }`;
}
