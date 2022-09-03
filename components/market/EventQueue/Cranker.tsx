import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { PublicKey, Transaction } from "@solana/web3.js";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useSolana } from "../../../context";
import { useMarket } from "../../../context/market";
import { getExplorerLink } from "../../../utils/general";
import { sendWalletTransaction } from "../../../utils/transaction";

type CrankInputs = {
  numEvents: number;
};

export const Cranker = () => {
  const { cluster } = useSolana();
  const { connection } = useConnection();
  const wallet = useWallet();
  const { setVisible } = useWalletModal();

  const [isCranking, setIsCranking] = useState(false);

  const { eventQueue, serumMarket, openOrders } = useMarket();

  const { register, handleSubmit } = useForm<CrankInputs>();

  const onSubmit: SubmitHandler<CrankInputs> = async (data) => {
    const eq = await eventQueue.mutate();

    if (!serumMarket) {
      toast.error("No market selected.");
      return;
    }

    if (!eq || eq.length === 0) {
      toast.error("No events to crank.");
      return;
    }

    setIsCranking(true);

    const orderedAccounts: PublicKey[] = eq
      .slice(0, data.numEvents)
      .map((e) => e.openOrders)
      .sort((a, b) => a.toBuffer().swap64().compare(b.toBuffer().swap64()));

    try {
      const tx = new Transaction();
      tx.add(serumMarket.makeConsumeEventsInstruction(orderedAccounts, 65535));

      const txSig = await sendWalletTransaction(connection, tx, wallet);

      toast(() => (
        <div className="flex flex-col space-y-1">
          <p>Successfully cranked {orderedAccounts.length} events</p>
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

      await Promise.all([eventQueue.mutate(), openOrders.mutate()]);
    } catch (e) {
      console.error(e);
      toast.error("Failed to crank. See console for details.");
    } finally {
      setIsCranking(false);
    }
  };

  return (
    <div className="px-4 pb-4 flex justify-between items-center w-full ">
      {!wallet.connected ? (
        <div className="w-full flex justify-center">
          <button
            onClick={() => setVisible(true)}
            className="w-full p-2 bg-cyan-600 hover:bg-cyan-700 transition-all rounded-md"
          >
            Connect Wallet
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full flex flex-col items-center space-y-4"
        >
          <div className="w-full flex flex-col space-y-1">
            <label>
              <span className="text-sm text-cyan-200 font-light">
                Max no. of Events
              </span>
            </label>
            <input
              defaultValue={10}
              {...register("numEvents", { required: true })}
              className="px-4 py-2 w-full rounded bg-transparent border-2 border-cyan-600 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isCranking || eventQueue.data?.length === 0}
            className="w-full p-2 bg-cyan-600 hover:bg-cyan-700 transition-all font-semibold rounded-md disabled:opacity-50 disabled:hover:bg-cyan-600"
          >
            Crank
          </button>
        </form>
      )}
    </div>
  );
};
