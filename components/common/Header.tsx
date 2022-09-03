import { useRouter } from "next/router";
import { ParsedUrlQuery } from "querystring";
import { FC } from "react";
import { useSolana } from "../../context/SolanaContext";
import { SettingsButton } from "./SettingsButton";
import { WalletButton } from "./WalletButton";

const Header: FC = () => {
  const router = useRouter();
  const { cluster } = useSolana();

  const sanitizeQuery = (query: ParsedUrlQuery) => {
    if (query.address) {
      delete query.address;
    }
    return { ...query };
  };

  return (
    <div className="w-full py-4 px-4 md:px-0 flex items-center justify-between border-b-2 border-b-cyan-900 mb-4">
      <button
        className="font-bold text-2xl text-white no-underline text-left"
        onClick={() =>
          router.push({ pathname: "/", query: sanitizeQuery(router.query) })
        }
      >
        Serum Explorer
      </button>
      <div className="flex items-center space-x-4">
        <p className="text-sm text-cyan-500 text-right">{cluster.label}</p>
        <SettingsButton />
        <WalletButton />
      </div>
    </div>
  );
};

export default Header;
