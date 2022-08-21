import { MouseEvent, MouseEventHandler } from "react";
import { ExternalLinkIcon } from "@heroicons/react/outline";
import { OpenOrders } from "@project-serum/serum";
import { useSolana } from "../../../context";
import { useMarket } from "../../../context/market";
import {
  getExplorerAccountLink,
  getExplorerLink,
} from "../../../utils/general";
import { tokenAtomicsToPrettyDecimal } from "../../../utils/numerical";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { toast } from "react-toastify";
import { getAssociatedTokenAddress } from "@solana/spl-token-2";

type OpenOrderCardProps = {
  openOrder: OpenOrders;
};
const OpenOrderCard = ({ openOrder }: OpenOrderCardProps) => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { cluster } = useSolana();
  const { baseMetadata, quoteMetadata, baseMint, quoteMint, serumMarket } =
    useMarket();

  const handleSettle: MouseEventHandler<HTMLButtonElement> = async (e) => {
    e.preventDefault();

    if (!wallet || !wallet.publicKey) {
      toast.error("Please connect your wallet.");
      return;
    }

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
    const tx = await serumMarket!.makeSettleFundsTransaction(
      connection,
      openOrder,
      baseWallet,
      quoteWallet
    );

    try {
      const txSig = await wallet.sendTransaction(tx.transaction, connection);

      toast(() => (
        <div className="flex flex-col space-y-1">
          <p>
            Settling funds for OpenOrder account,{" "}
            {openOrder.address.toString().slice(0, 6)}...
          </p>
        </div>
      ));

      await connection.confirmTransaction(txSig);

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
    } catch (e) {
      console.error(e);
      toast.error("Failed to settle funds. See console for details.");
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
      <div>
        <h3 className="text-sm text-cyan-200 font-light"># of orders</h3>
        <p className="text-lg font-bold">
          {openOrder.orders.filter((o) => o.toString() !== "0").length}
        </p>
      </div>
      <button
        className="primary-btn"
        onClick={handleSettle}
        disabled={!serumMarket || !baseMint || !quoteMint}
      >
        Settle
      </button>
    </div>
  );
};

export default OpenOrderCard;
