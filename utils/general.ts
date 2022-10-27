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

export const isLocalhost = (url: string) => {
  return url.includes("localhost") || url.includes("127.0.0.1");
};

export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function copyTextToClipboard(text: string) {
  if ("clipboard" in navigator) {
    return await navigator.clipboard.writeText(text);
  } else {
    return document.execCommand("copy", true, text);
  }
}
