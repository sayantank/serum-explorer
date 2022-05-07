import Link from "next/link";
import { FC } from "react";
import { useSolana } from "../../context/SolanaContext";
import { SettingsButton } from "./SettingsButton";
import { WalletButton } from "./WalletButton";

type HeaderProps = {};

const Header: FC<HeaderProps> = () => {
  const { cluster } = useSolana();

  return (
    <div className="w-full p-4 flex items-center justify-between">
      <Link href="/">
        <a className="font-bold text-2xl text-white no-underline">
          Serum Explorer
        </a>
      </Link>
      <div className="flex items-center space-x-4">
        <p className="text-sm text-cyan-500">{cluster.label}</p>
        <SettingsButton />
        <WalletButton />
      </div>
    </div>
  );
};

export default Header;
