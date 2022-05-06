import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { FC, FormEvent, useEffect, useRef, useState } from "react";
import { CogIcon } from "@heroicons/react/outline";
import {
  CLUSTERS,
  CUSTOM_RPC_CLUSTER,
  useSolana,
} from "../../../context/SolanaContext";
import { useOutsideAlerter } from "../../../hooks/useOutsideAlerter";

type SettingButtonProps = {};

export const SettingsButton: FC<SettingButtonProps> = () => {
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
      <div
        onClick={() => setShowDropdown(!showDropdown)}
        className="cursor-pointer"
      >
        <CogIcon className="h-6 w-6 text-cyan-500" />
      </div>
      <ul
        className={`${
          showDropdown ? "block" : "hidden"
        } absolute top-full w-64 my-4 py-2 bg-cyan-900 rounded flex flex-col space-y-1`}
      >
        {CLUSTERS.map((cluster) => {
          if (cluster.label !== "Custom RPC")
            return (
              <li
                key={cluster.endpoint}
                onClick={() => setCluster(cluster)}
                className={`${
                  isActiveCluster(cluster) ? "bg-cyan-800" : "bg-cyan-900"
                } hover:bg-cyan-800 p-2 cursor-pointer`}
              >
                <div>
                  <h2 className="font-bold">{cluster.label}</h2>
                  <p className="text-xs">{cluster.endpoint}</p>
                </div>
              </li>
            );
        })}
        <li
          className={`${
            isActiveCluster(CUSTOM_RPC_CLUSTER) ? "bg-cyan-800" : "bg-cyan-900"
          } hover:bg-cyan-800 p-2 cursor-pointer`}
          onClick={() => setCluster(CUSTOM_RPC_CLUSTER)}
        >
          <div>
            <h2 className="font-bold">Custom RPC</h2>
            {cluster.label === "Custom RPC" && (
              <input
                type="text"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                className="border border-cyan-600 p-2 rounded my-2 w-full bg-cyan-700 focus:outline-none"
              />
            )}
          </div>
        </li>
      </ul>
    </div>
  );
};
