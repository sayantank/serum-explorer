import { KeyIcon } from "@heroicons/react/24/outline";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { FC, useRef, useState } from "react";
import { useOutsideAlerter } from "../../hooks/useOutsideAlerter";
import { copyTextToClipboard } from "../../utils/general";

const WalletButton: FC = () => {
  const wallet = useWallet();
  const { visible, setVisible } = useWalletModal();

  const [showDropdown, setShowDropdown] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  useOutsideAlerter(dropdownRef, showDropdown, () => setShowDropdown(false));

  const handleCopyClick = () => {
    if (!wallet.publicKey) return;

    // Asynchronously call copyTextToClipboard
    copyTextToClipboard(wallet.publicKey.toBase58())
      .then(() => {
        // If successful, update the isCopied state value
        setIsCopied(true);
        setTimeout(() => {
          setIsCopied(false);
        }, 1500);
      })
      .catch((err) => {
        console.log(err);
      });
  };

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
        className="bg-slate-700 hover:bg-slate-600 rounded-md focus:outline-none focus-visible:ring-1 focus-visible:ring-cyan-500 focus-visible:ring-opacity-75 transition-colors"
      >
        <div className="md:block hidden py-2 px-4 text-sm text-slate-200 group-hover:text-slate-300">
          {wallet.connected && wallet.publicKey
            ? `${wallet.publicKey.toString().slice(0, 6)}...`
            : "Connect"}
        </div>
        <div className="md:hidden p-1.5">
          <KeyIcon className="h-5 w-5" />
        </div>
      </button>
      <ul
        className={`${
          showDropdown ? "block" : "hidden"
        } absolute top-full w-64 my-2  bg-slate-800 py-1 border border-slate-700 rounded flex flex-col space-y-1`}
      >
        <li
          className="hover:bg-slate-700 p-2 cursor-pointer"
          onClick={handleCopyClick}
        >
          <div>
            <p className="text-sm text-slate-300">
              {isCopied ? "Copied!" : "Copy Address"}
            </p>
          </div>
        </li>
        <li
          className={`hover:bg-slate-700 p-2 cursor-pointer`}
          onClick={() => {
            wallet.disconnect();
            setShowDropdown(false);
          }}
        >
          <div>
            <h2 className="text-sm text-slate-300">Disconnect</h2>
          </div>
        </li>
      </ul>
    </div>
  );
};

export default WalletButton;
