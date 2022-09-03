import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { FC, useRef, useState } from "react";
import { KeyIcon } from "@heroicons/react/outline";
import { useOutsideAlerter } from "../../../hooks/useOutsideAlerter";

export const WalletButton: FC = () => {
  const wallet = useWallet();
  const { visible, setVisible } = useWalletModal();

  const [showDropdown, setShowDropdown] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  useOutsideAlerter(dropdownRef, showDropdown, () => setShowDropdown(false));

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
        className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded"
      >
        <div className="md:block hidden py-2 px-4">
          {wallet.connected && wallet.publicKey
            ? `${wallet.publicKey.toString().slice(0, 6)}...`
            : "Connect"}
        </div>
        <div className="md:hidden p-2">
          <KeyIcon className="h-6 w-6" />
        </div>
      </button>
      <ul
        className={`${
          showDropdown ? "block" : "hidden"
        } absolute top-full w-64 my-2 py-2 bg-cyan-900 rounded flex flex-col space-y-1`}
      >
        <li
          className={`hover:bg-cyan-800 p-2 cursor-pointer`}
          onClick={() => {
            wallet.disconnect();
            setShowDropdown(false);
          }}
        >
          <div>
            <h2 className="font-medium">Disconnect</h2>
          </div>
        </li>
      </ul>
    </div>
  );
};
