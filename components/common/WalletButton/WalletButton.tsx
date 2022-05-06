import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { FC } from "react";

type WalletButtonProps = {};

export const WalletButton: FC<WalletButtonProps> = () => {
  const wallet = useWallet();
  const { visible, setVisible } = useWalletModal();

  return (
    <button
      onClick={
        wallet.connected
          ? () => wallet.disconnect()
          : () => setVisible(!visible)
      }
      className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded"
    >
      {wallet.connected
        ? `${wallet.publicKey!.toString().slice(0, 6)}...`
        : "Connect"}
    </button>
  );
};
