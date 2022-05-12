import Link from "next/link";
import { useRouter } from "next/router";
import { FC } from "react";
import { useSolana } from "../../context/SolanaContext";
import { SettingsButton } from "./SettingsButton";
import { WalletButton } from "./WalletButton";

type HeaderProps = {};

const Header: FC<HeaderProps> = () => {
  const router = useRouter();
  const { cluster } = useSolana();

  return (
    <div className="w-full py-4 px-4 md:px-0 flex items-center justify-between border-b-2 border-b-cyan-900 mb-4">
      <Link
        href={{
          pathname: "/",
          query: router.query,
        }}
      >
        <a className="font-bold text-2xl text-white no-underline">
          Serum Explorer
        </a>
      </Link>
      <div className="flex items-center space-x-4">
        <p className="text-sm text-cyan-500 text-right">{cluster.label}</p>
        <SettingsButton />
        <WalletButton />
      </div>
    </div>
  );
};

export default Header;
