import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  getAssociatedTokenAddress,
  Mint,
} from "@solana/spl-token-2";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Transaction, TransactionInstruction } from "@solana/web3.js";
import { Fragment, useMemo } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { tokenDecimalsToAtomics } from "../../../utils/numerical";
import { prettifyPubkey } from "../../../utils/pubkey";
import {
  sendSignedTransaction,
  signTransaction,
} from "../../../utils/transaction";
import TransactionToast from "../Toasts/TransactionToast";

type MintTokenFormValues = {
  amount: number;
};

type MintTokenModalProps = {
  open: boolean;
  onClose: () => Promise<void>;
  mint: Mint | null;
};
export default function MintTokenModal({
  open,
  onClose,
  mint,
}: MintTokenModalProps) {
  const { connection } = useConnection();
  const wallet = useWallet();

  const { register, handleSubmit } = useForm<MintTokenFormValues>();

  const isWalletAuthority = useMemo(() => {
    if (!mint?.mintAuthority || !wallet.publicKey) return false;

    return wallet.publicKey.toBase58() === mint.mintAuthority.toBase58();
  }, [wallet.publicKey, mint?.mintAuthority]);

  const handleMint: SubmitHandler<MintTokenFormValues> = async (data) => {
    if (!mint || !wallet.publicKey || !isWalletAuthority) return;

    const mintAmountAtomics = tokenDecimalsToAtomics(
      data.amount,
      mint.decimals
    );

    const instructions: TransactionInstruction[] = [];

    const ata = await getAssociatedTokenAddress(
      mint.address,
      wallet.publicKey,
      true
    );
    try {
      await connection.getTokenAccountBalance(ata);
    } catch {
      instructions.push(
        createAssociatedTokenAccountInstruction(
          wallet.publicKey,
          ata,
          wallet.publicKey,
          mint.address
        )
      );
    }

    instructions.push(
      createMintToInstruction(
        mint.address,
        ata,
        wallet.publicKey,
        BigInt(mintAmountAtomics.toString())
      )
    );

    const signedTx = await signTransaction({
      transaction: new Transaction().add(...instructions),
      wallet,
      signers: [],
      connection,
    });

    await sendSignedTransaction({
      signedTransaction: signedTx,
      connection,
      skipPreflight: false,
      sendingCallback: async () => {
        toast.info(`Minting ${data.amount} tokens...`, { autoClose: 2000 });
      },
      successCallback: async (txSig) => {
        toast(() => (
          <TransactionToast
            txSig={txSig}
            message={`Successfully minted ${data.amount} tokens.`}
          />
        ));
        await onClose();
      },
    });

    console.log(data);
  };

  if (!mint) return null;

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-900 bg-opacity-90 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="transform overflow-hidden rounded-lg bg-slate-800 border border-slate-700 px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 w-full sm:max-w-sm sm:p-6">
                <div className="w-full flex items-center justify-between">
                  <h2 className="text-slate-300 font-medium">
                    Mint {prettifyPubkey(mint.address, 6)}
                  </h2>
                  <button onClick={onClose} className="focus-style rounded-md">
                    <XMarkIcon className="h-5 w-5 text-cyan-400 focus-style" />
                  </button>
                </div>
                <form onSubmit={handleSubmit(handleMint)}>
                  <div className="mt-3 space-y-1">
                    <label className="block text-xs text-slate-400">
                      Amount
                    </label>
                    <input
                      className="input w-full "
                      type="number"
                      {...register("amount", { required: true })}
                    />
                  </div>
                  <div className="mt-5 sm:mt-5">
                    <button
                      type="submit"
                      className="inline-flex w-full justify-center rounded-md border border-transparent bg-slate-600 px-4 py-2 text-base font-medium text-slate-200 shadow-sm hover:bg-slate-500 focus-style sm:text-sm"
                    >
                      Mint
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
