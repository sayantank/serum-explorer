import { MouseEvent, MouseEventHandler, useState } from "react";
import { ExternalLinkIcon } from "@heroicons/react/outline";
import { DexInstructions, OpenOrders } from "@project-serum/serum";
import { useSerum, useSolana } from "../../../context";
import { useMarket } from "../../../context/market";
import {
  getExplorerAccountLink,
  getExplorerLink,
} from "../../../utils/general";
import { tokenAtomicsToPrettyDecimal } from "../../../utils/numerical";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { toast } from "react-toastify";
import { getAssociatedTokenAddress } from "@solana/spl-token-2";
import { sendWalletTransaction } from "../../../utils/transaction";
import Loader from "../../common/Loader";
import BN from "bn.js";
import { Transaction } from "@solana/web3.js";
import { MAX_U128 } from "../../../utils/constants";

type OpenOrderCardProps = {
  openOrder: OpenOrders;
};
const OpenOrderCard = ({ openOrder }: OpenOrderCardProps) => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { cluster } = useSolana();
  const { programID } = useSerum();
  const {
    baseMetadata,
    quoteMetadata,
    baseMint,
    quoteMint,
    serumMarket,
    openOrders,
    orders,
  } = useMarket();

  const canSettle =
    openOrder.baseTokenFree.gt(new BN(0)) ||
    openOrder.quoteTokenFree.gt(new BN(0));
  const [isSettling, setIsSettling] = useState(false);

  const [isClosing, setIsClosing] = useState(false);
  const canClose =
    !canSettle &&
    !orders.data?.filter(
      (o) => o.openOrdersAddress.toBase58() == openOrder.address.toBase58()
    ).length;

  const handleSettle: MouseEventHandler<HTMLButtonElement> = async (e) => {
    e.preventDefault();

    if (!wallet || !wallet.publicKey) {
      toast.error("Please connect your wallet.");
      return;
    }

    if (openOrder.freeSlotBits.toString() !== MAX_U128) {
      toast.error(
        "Funds are still associated with this OpenOrder account. Try cranking."
      );
      return;
    }

    setIsSettling(true);

    const baseWallet = await getAssociatedTokenAddress(
      baseMint!.address,
      wallet.publicKey,
      true
    );
    const quoteWallet = await getAssociatedTokenAddress(
      quoteMint!.address,
      wallet.publicKey,
      true
    );

    try {
      const { transaction } = await serumMarket!.makeSettleFundsTransaction(
        connection,
        openOrder,
        baseWallet,
        quoteWallet
      );

      const txSig = await sendWalletTransaction(
        connection,
        transaction,
        wallet
      );

      toast(() => (
        <div className="flex flex-col space-y-1">
          <p>Successfully settled funds.</p>
          <a
            href={getExplorerLink(txSig, cluster.network)}
            target="_blank"
            rel="noopener noreferrer"
            className="italic font-light text-sm"
          >
            View transaction
          </a>
        </div>
      ));

      await openOrders.mutate();
    } catch (e) {
      console.error(e);
      toast.error("Failed to settle funds. See console for details.");
    } finally {
      setIsSettling(false);
    }
  };

  const handleClose: MouseEventHandler<HTMLButtonElement> = async (e) => {
    e.preventDefault();

    if (!wallet || !wallet.publicKey) {
      toast.error("Please connect your wallet.");
      return;
    }

    try {
      setIsClosing(true);

      const ix = DexInstructions.closeOpenOrders({
        market: serumMarket!.address,
        openOrders: openOrder.address,
        owner: wallet.publicKey,
        solWallet: wallet.publicKey,
        programId: programID,
      });

      const tx = new Transaction().add(ix);
      const txSig = await sendWalletTransaction(connection, tx, wallet);

      toast(() => (
        <div className="flex flex-col space-y-1">
          <p>Successfully closed OpenOrder account.</p>
          <a
            href={getExplorerLink(txSig, cluster.network)}
            target="_blank"
            rel="noopener noreferrer"
            className="italic font-light text-sm"
          >
            View transaction
          </a>
        </div>
      ));

      await openOrders.mutate();
    } catch (e) {
      console.error(e);
      toast.error(
        "Failed to close OpenOrder account. See console for details."
      );
    } finally {
      setIsClosing(false);
    }
  };

  if (!baseMint || !quoteMint) {
    return null;
  }

  return (
    <div className="p-3 rounded-md flex flex-col space-y-2 bg-cyan-900">
      <div>
        <h3 className="text-sm text-cyan-200 font-light">Address</h3>
        <div className="flex items-center space-x-1">
          <p className="">{openOrder.address.toString().slice(0, 10)}...</p>
          <a
            href={getExplorerAccountLink(openOrder.address, cluster.network)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLinkIcon className="h-4 w-4 cursor-pointer" />
          </a>
        </div>
      </div>
      <div className="flex justify-between">
        <div className="flex-1">
          <h3 className="text-sm text-cyan-200 font-light">
            Free {baseMetadata ? baseMetadata.data.data.symbol : "Base Tokens"}
          </h3>
          <p className="text-lg font-bold">
            {tokenAtomicsToPrettyDecimal(
              openOrder.baseTokenFree,
              baseMint.decimals
            )}
          </p>
        </div>
        <div className="flex-1">
          <h3 className="text-sm text-cyan-200 font-light">
            Free{" "}
            {quoteMetadata ? quoteMetadata.data.data.symbol : "Quote Tokens"}
          </h3>
          <p className="text-lg font-bold">
            {tokenAtomicsToPrettyDecimal(
              openOrder.quoteTokenFree,
              quoteMint.decimals
            )}
          </p>
        </div>
      </div>
      <button
        className="primary-btn"
        onClick={handleSettle}
        disabled={
          !canSettle || isSettling || !serumMarket || !baseMint || !quoteMint
        }
      >
        {isSettling ? (
          <>
            <Loader /> Settling
          </>
        ) : (
          <>Settle</>
        )}
      </button>
      <button
        className="critical-btn"
        onClick={handleClose}
        disabled={!canClose || !serumMarket}
      >
        {isClosing ? (
          <>
            <Loader /> Closing
          </>
        ) : (
          <>Close</>
        )}
      </button>
    </div>
  );
};

export default OpenOrderCard;
