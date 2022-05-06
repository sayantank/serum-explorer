import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { FC, FormEvent, useEffect, useRef, useState } from "react";
import {
  CLUSTERS,
  CUSTOM_RPC_CLUSTER,
  useSolana,
} from "../../../context/SolanaContext";
import { useOutsideAlerter } from "../../../hooks/useOutsideAlerter";

type WalletButtonProps = {};

export const WalletButton: FC<WalletButtonProps> = () => {
  const wallet = useWallet();
  const { connection } = useConnection();
  const { visible, setVisible } = useWalletModal();
  const { setCustomEndpoint, cluster, setCluster, isActiveCluster } =
    useSolana();

  const [endpoint, setEndpoint] = useState(CUSTOM_RPC_CLUSTER.endpoint);
  const [showDropdown, setShowDropdown] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  useOutsideAlerter(dropdownRef, showDropdown, () => setShowDropdown(false));

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      try {
        const endpointURL = new URL(endpoint);
        setCustomEndpoint(endpointURL.toString());
      } catch (e) {
        setCustomEndpoint(CUSTOM_RPC_CLUSTER.endpoint);
      }
    }, 1500);

    return () => clearTimeout(debounceTimer);
  }, [endpoint, setCustomEndpoint]);

  return (
    <div className="relative flex justify-end" ref={dropdownRef}>
      <button
        onClick={
          wallet.connected
            ? () => {
                setShowDropdown(!showDropdown);
              }
            : () => setVisible(!visible)
        }
        className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded"
      >
        {wallet.connected
          ? `${wallet.publicKey!.toString().slice(0, 6)}...`
          : "Connect"}
      </button>
      <ul
        className={`${
          showDropdown ? "block" : "hidden"
        } absolute top-full w-64 my-2 py-2 bg-cyan-900 rounded flex flex-col space-y-1`}
      >
        <li
          className={`hover:bg-cyan-800 p-2 cursor-pointer`}
          onClick={() => wallet.disconnect()}
        >
          <div>
            <h2 className="font-medium">Disconnect</h2>
          </div>
        </li>
      </ul>
    </div>
  );
};
