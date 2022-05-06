import { useWallet } from "@solana/wallet-adapter-react";
import {
  WalletMultiButton,
  WalletModalButton,
  useWalletModal,
} from "@solana/wallet-adapter-react-ui";
import { FC } from "react";
import { SettingsButton } from "./SettingsButton";
import { WalletButton } from "./WalletButton";

type HeaderProps = {};

const Header: FC<HeaderProps> = () => {
  const wallet = useWallet();
  const { visible, setVisible } = useWalletModal();

  return (
    <div className="w-full p-4 flex items-center justify-between">
      <h1 className="font-bold text-2xl text-white">Serum Explorer</h1>
      <div className="flex items-center space-x-4">
        <WalletButton />
        <SettingsButton />
      </div>
    </div>
  );
};

export default Header;
