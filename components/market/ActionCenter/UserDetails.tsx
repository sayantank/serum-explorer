import { ExternalLinkIcon } from "@heroicons/react/outline";
import { useWallet } from "@solana/wallet-adapter-react";
import { useSolana } from "../../../context";
import { useMarket } from "../../../context/market";
import { useTokenBalance } from "../../../hooks";
import { getExplorerAccountLink } from "../../../utils/general";
import { tokenAtomicsToPrettyDecimal } from "../../../utils/numerical";
import BN from "bn.js";

export const UserDetails = () => {
  const { cluster } = useSolana();
  const wallet = useWallet();
  const { baseMint, quoteMint } = useMarket();

  const { tokenAmount: baseBalance } = useTokenBalance(
    wallet.publicKey,
    baseMint?.address
  );
  const { tokenAmount: quoteBalance } = useTokenBalance(
    wallet.publicKey,
    quoteMint?.address
  );

  if (
    !wallet ||
    !wallet.publicKey ||
    !baseBalance ||
    !quoteBalance ||
    !baseMint ||
    !quoteMint
  )
    return null;

  return (
    <div className="p-3 bg-cyan-900 rounded-md space-y-2">
      <h3 className="text-lg font-semibold">User Details</h3>
      <div className="flex flex-col space-y-2 lg:space-y-0 lg:flex-row lg:space-x-4">
        <div>
          <h3 className="text-sm text-cyan-200 font-light">Address</h3>
          <div className="flex items-center space-x-1">
            <p className="">{wallet.publicKey.toString().slice(0, 10)}...</p>
            <a
              href={getExplorerAccountLink(wallet.publicKey, cluster.network)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLinkIcon className="h-4 w-4 cursor-pointer" />
            </a>
          </div>
        </div>
        <div className="flex space-x-4">
          <div>
            <h3 className="text-sm text-cyan-200 font-light">Base Balance</h3>
            <p className="text-lg font-bold">
              {tokenAtomicsToPrettyDecimal(
                new BN(baseBalance.amount),
                baseMint.decimals
              )}
            </p>
          </div>
          <div>
            <h3 className="text-sm text-cyan-200 font-light">Quote Balance</h3>
            <p className="text-lg font-bold">
              {tokenAtomicsToPrettyDecimal(
                new BN(quoteBalance.amount),
                quoteMint.decimals
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
