import { useWallet } from "@solana/wallet-adapter-react";
import { useSolana } from "../../../context";
import { useMarket } from "../../../context/market";
import { useTokenBalance } from "../../../hooks";
import { getExplorerAccountLink } from "../../../utils/general";
import { tokenAtomicsToPrettyDecimal } from "../../../utils/numerical";
import BN from "bn.js";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { useMemo, useState } from "react";
import { Mint } from "@solana/spl-token-2";
import MintTokenModal from "../../common/Modals/MintTokenModal";

export const UserDetails = () => {
  const { cluster } = useSolana();
  const wallet = useWallet();
  const { baseMint, quoteMint } = useMarket();

  const [isMintModalOpen, setIsMintModalOpen] = useState(false);
  const [toMint, setToMint] = useState<Mint | null>(null);

  const { tokenAmount: baseBalance, mutate: baseMutate } = useTokenBalance(
    wallet.publicKey,
    baseMint?.address
  );
  const { tokenAmount: quoteBalance, mutate: quoteMutate } = useTokenBalance(
    wallet.publicKey,
    quoteMint?.address
  );

  const isWalletBaseAuthority = useMemo(() => {
    if (!baseMint?.mintAuthority || !wallet.publicKey) return false;

    return wallet.publicKey.toBase58() === baseMint.mintAuthority.toBase58();
  }, [wallet.publicKey, baseMint?.mintAuthority]);

  const isWalletQuoteAuthority = useMemo(() => {
    if (!quoteMint?.mintAuthority || !wallet.publicKey) return false;

    return (
      wallet.publicKey?.toBase58() === quoteMint?.mintAuthority?.toBase58()
    );
  }, [wallet.publicKey, quoteMint?.mintAuthority]);

  const handleMintModalOpen = (mint?: Mint) => {
    if (!mint) return;
    setToMint(mint);
    setIsMintModalOpen(true);
  };

  const handleMintModalClose = async () => {
    if (!toMint) return;

    if (toMint.address.toBase58() === baseMint?.address.toBase58())
      await baseMutate();
    else if (toMint.address.toBase58() === quoteMint?.address.toBase58())
      await quoteMutate();

    setToMint(null);
    setIsMintModalOpen(false);
  };

  if (!wallet || !wallet.publicKey) return null;

  return (
    <>
      <div className="p-3 bg-slate-700 rounded-md space-y-2">
        <h3 className="text-lg text-slate-200">User Details</h3>
        <div className="flex flex-col space-y-2 lg:space-y-0 lg:flex-row lg:space-x-6">
          <div>
            <h3 className="text-sm text-slate-200 font-light">Address</h3>

            <div className="flex items-center space-x-1">
              <p className="">{wallet.publicKey.toString().slice(0, 10)}...</p>
              <a
                href={getExplorerAccountLink(wallet.publicKey, cluster.network)}
                target="_blank"
                rel="noopener noreferrer"
                className="focus-style rounded p-0.5"
              >
                <ArrowTopRightOnSquareIcon className="h-4 w-4 cursor-pointer focus-style" />
              </a>
            </div>
          </div>
          <div className="flex space-x-6">
            <div>
              <h3 className="text-sm text-slate-200 font-light">
                Base Balance
              </h3>
              <div className="flex items-center justify-between space-x-4">
                <p className="text-lg font-medium">
                  {baseMint && baseBalance
                    ? tokenAtomicsToPrettyDecimal(
                        new BN(baseBalance.amount),
                        baseMint.decimals
                      )
                    : 0}
                </p>
                {isWalletBaseAuthority ? (
                  <button
                    type="button"
                    onClick={() => handleMintModalOpen(baseMint)}
                    className="inline-flex items-center rounded bg-slate-600 hover:bg-slate-500 transition-colors px-1.5 py-0.5 text-xs text-slate-300 focus-style"
                  >
                    Mint
                  </button>
                ) : null}
              </div>
            </div>
            <div>
              <h3 className="text-sm text-slate-200 font-light">
                Quote Balance
              </h3>
              <div className="flex items-center justify-between space-x-4">
                <p className="text-lg font-medium">
                  {quoteMint && quoteBalance
                    ? tokenAtomicsToPrettyDecimal(
                        new BN(quoteBalance.amount),
                        quoteMint.decimals
                      )
                    : 0}
                </p>
                {isWalletQuoteAuthority ? (
                  <button
                    type="button"
                    onClick={() => handleMintModalOpen(quoteMint)}
                    className="inline-flex items-center rounded bg-slate-600 hover:bg-slate-500 transition-colors px-1.5 py-0.5 text-xs text-slate-300 focus-style"
                  >
                    Mint
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
      <MintTokenModal
        open={isMintModalOpen}
        onClose={handleMintModalClose}
        mint={toMint}
      />
    </>
  );
};
