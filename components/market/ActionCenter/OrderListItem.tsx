import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { Order } from "@project-serum/serum/lib/market";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { MouseEventHandler, useState } from "react";
import { toast } from "react-toastify";
import { useSolana } from "../../../context";
import { useMarket } from "../../../context/market";
import {
  classNames,
  getExplorerAccountLink,
  getExplorerLink,
} from "../../../utils/general";
import { sendWalletTransaction } from "../../../utils/transaction";
import Loader from "../../common/Loader";

export const OrderListItem = ({ order }: { order: Order }) => {
  const { connection } = useConnection();
  const { cluster } = useSolana();
  const wallet = useWallet();
  const { serumMarket, orders, eventQueue, openOrders } = useMarket();

  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancel: MouseEventHandler<HTMLButtonElement> = async (e) => {
    e.preventDefault();

    if (!serumMarket) return;

    if (!wallet || !wallet.publicKey) {
      toast.error("Please connect your wallet.");
      return;
    }

    try {
      setIsCancelling(true);
      const tx = await serumMarket.makeCancelOrderTransaction(
        connection,
        wallet.publicKey,
        order
      );

      const txSig = await sendWalletTransaction(connection, tx, wallet);

      toast(() => (
        <div className="flex flex-col space-y-1">
          <p>Successfully cancelled order.</p>
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

      await Promise.all([
        orders.mutate(),
        eventQueue.mutate(),
        openOrders.mutate(),
      ]);
    } catch (e) {
      console.error(e);
      toast.error("Failed to cancel order. See console for details.");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <tr>
      <td className="p-2">
        <div
          className={classNames(
            "mx-auto flex w-min rounded-md text-xs text-slate-600 items-center justify-center py-1 px-2",
            order.side === "buy" ? "bg-lime-400" : "bg-rose-400"
          )}
        >
          {order.side === "buy" ? "Buy" : "Sell"}
        </div>
      </td>
      <td className="p-2">
        <p className="text-center text-slate-300 text-sm">{order.size}</p>
      </td>
      <td className="p-2">
        <p className="text-center text-slate-300 text-sm">{order.price}</p>
      </td>
      <td className="p-2">
        <div className="flex items-center justify-center space-x-2">
          <p className="text-center text-slate-300 text-sm">
            {order.openOrdersAddress.toString().slice(0, 10)}...
          </p>
          <a
            href={getExplorerAccountLink(
              order.openOrdersAddress,
              cluster.network
            )}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ArrowTopRightOnSquareIcon className="h-4 w-4 cursor-pointer text-cyan-400" />
          </a>
        </div>
      </td>
      <td className="p-2 flex">
        <button
          onClick={handleCancel}
          className="py-1 text-xs px-3 w-min bg-slate-500 hover:bg-slate-400 transition-colors focus-style rounded-md flex items-center justify-center space-x-1"
          disabled={isCancelling || !serumMarket}
        >
          {isCancelling ? (
            <>
              <Loader /> Cancelling
            </>
          ) : (
            <>Cancel</>
          )}
        </button>
      </td>
    </tr>
  );
};
