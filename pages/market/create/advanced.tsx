import { DexInstructions } from "@project-serum/serum";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction } from "@solana/web3.js";
import BN from "bn.js";
import { ReactNode } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import TransactionToast from "../../../components/common/Toasts/TransactionToast";
import { getHeaderLayout } from "../../../components/layouts/HeaderLayout";
import { useSerum } from "../../../context";
import { validatePubkey } from "../../../utils/pubkey";
import { getVaultOwnerAndNonce } from "../../../utils/serum";
import { validateMint, validateTokenAccount } from "../../../utils/token";
import {
  sendSignedTransaction,
  signTransaction,
} from "../../../utils/transaction";

export type CreateMarketAdvancedFormValues = {
  baseMint: string;
  quoteMint: string;
  baseVault: string;
  quoteVault: string;
  tickSize: number;
  lotSize: number;
  marketAccount: string;
  eventQueueAccount: string;
  requestQueueAccount: string;
  bidsAccount: string;
  asksAccount: string;
};

const CreateMarketAdvanced = () => {
  const wallet = useWallet();
  const { connection } = useConnection();

  const { programID } = useSerum();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateMarketAdvancedFormValues>({});

  const handleCreateAdvanced: SubmitHandler<
    CreateMarketAdvancedFormValues
  > = async (data) => {
    if (!wallet || !wallet.publicKey) {
      toast.error("Wallet not connected.");
      return;
    }

    try {
      const [vaultOwner, vaultOwnerNonce] = await getVaultOwnerAndNonce(
        new PublicKey(data.marketAccount),
        programID
      );

      const quoteMint = await validateMint(connection, data.quoteMint);
      const baseMint = await validateMint(connection, data.baseMint);
      await validateTokenAccount(
        connection,
        data.quoteVault,
        data.quoteMint,
        vaultOwner.toBase58()
      );
      await validateTokenAccount(
        connection,
        data.baseVault,
        data.baseMint,
        vaultOwner.toBase58()
      );

      // tickSize and lotSize here are the 1e^(-x) values, so no check for ><= 0
      const baseLotSize = Math.round(
        10 ** baseMint.decimals * Math.pow(10, -1 * data.lotSize)
      );
      const quoteLotSize = Math.round(
        10 ** quoteMint.decimals *
          Math.pow(10, -1 * data.lotSize) *
          Math.pow(10, -1 * data.tickSize)
      );

      const ix = DexInstructions.initializeMarket({
        market: new PublicKey(data.marketAccount),
        requestQueue: new PublicKey(data.requestQueueAccount),
        eventQueue: new PublicKey(data.eventQueueAccount),
        bids: new PublicKey(data.bidsAccount),
        asks: new PublicKey(data.asksAccount),
        baseVault: new PublicKey(data.baseVault),
        quoteVault: new PublicKey(data.quoteVault),
        baseMint,
        quoteMint,
        baseLotSize: new BN(baseLotSize),
        quoteLotSize: new BN(quoteLotSize),
        feeRateBps: 150, // Unused in v3
        quoteDustThreshold: new BN(500), // Unused in v3
        vaultSignerNonce: vaultOwnerNonce,
        programId: programID,
      });

      const tx = new Transaction().add(ix);
      const signedTx = await signTransaction({
        transaction: tx,
        wallet,
        signers: [],
        connection,
      });

      await sendSignedTransaction({
        signedTransaction: signedTx,
        connection,
        skipPreflight: false,
        successCallback: async (txSig) => {
          toast(
            () => (
              <TransactionToast
                txSig={txSig}
                message="Created market successfully."
              />
            ),
            { autoClose: 5000 }
          );
        },
        sendingCallback: async () => {
          toast.info("Creating market...", {
            autoClose: 2000,
          });
        },
      });
    } catch (e) {
      console.error("[serum_explorer]: ", e);
      toast.error("Failed to create market. Check console for details.");
    }
  };

  return (
    <div className="space-y-4 mb-6">
      <div>
        <h1 className="text-2xl text-slate-200">Advanced Create Market</h1>
      </div>
      <form onSubmit={handleSubmit(handleCreateAdvanced)}>
        <div className="space-y-4">
          <div className="bg-slate-800 border border-slate-700 px-4 py-5 shadow rounded-lg sm:p-6">
            <div className="md:grid md:grid-cols-3 md:gap-6">
              <div className="md:col-span-1">
                <h3 className="text-lg font-medium leading-6 text-slate-200">
                  Mints and Vaults
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  Specify the mints and vaults for the tokens you want to create
                  a market for.
                </p>
              </div>
              <div className="mt-5 space-y-4 md:col-span-2 md:mt-0">
                <div>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs text-slate-400">
                        Base Mint
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          className="block w-full rounded-md p-2 bg-slate-700 focus-style sm:text-sm"
                          {...register("baseMint", {
                            required: true,
                            validate: validatePubkey,
                          })}
                        />
                        {errors?.baseMint ? (
                          <p className="text-xs text-red-400 mt-1">
                            {errors?.baseMint?.message}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400">
                        Quote Mint
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          className="block w-full rounded-md p-2 bg-slate-700 focus-style sm:text-sm"
                          {...register("quoteMint", {
                            required: true,
                            validate: validatePubkey,
                          })}
                        />
                        {errors?.quoteMint ? (
                          <p className="text-xs text-red-400 mt-1">
                            {errors?.quoteMint?.message}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400">
                        Base Vault
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          className="block w-full rounded-md p-2 bg-slate-700 focus-style sm:text-sm"
                          {...register("baseVault", {
                            required: true,
                            validate: validatePubkey,
                          })}
                        />
                        {errors?.quoteMint ? (
                          <p className="text-xs text-red-400 mt-1">
                            {errors?.baseVault?.message}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400">
                        Quote Vault
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          className="block w-full rounded-md p-2 bg-slate-700 focus-style sm:text-sm"
                          {...register("quoteVault", {
                            required: true,
                            validate: validatePubkey,
                          })}
                        />
                        {errors?.quoteMint ? (
                          <p className="text-xs text-red-400 mt-1">
                            {errors?.quoteVault?.message}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-slate-800 border border-slate-700 px-4 py-5 shadow rounded-lg sm:p-6">
            <div className="md:grid md:grid-cols-3 md:gap-6">
              <div className="md:col-span-1">
                <h3 className="text-lg font-medium leading-6 text-slate-200">
                  Tickers
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  Configure the tick sizes, or lowest representable quantities
                  of base and quote tokens.
                </p>
              </div>
              <div className="mt-5 space-y-4 md:col-span-2 md:mt-0">
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs text-slate-400">
                      Min. Order Size
                    </label>
                    <div className="relative mt-1 rounded-md shadow-sm">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-slate-400 sm:text-sm">
                          1e<sup>-x</sup>
                        </span>
                      </div>
                      <input
                        type="number"
                        className="block w-full p-2 rounded-md text-slate-200 bg-slate-700 focus-style pl-16 sm:pl-14 sm:text-sm"
                        {...register("lotSize", {
                          required: true,
                        })}
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      data-tooltip-target="tooltip-default"
                      className="block text-xs text-slate-400"
                    >
                      Price Tick
                    </label>
                    <div
                      id="tooltip-default"
                      role="tooltip"
                      className="inline-block absolute invisible z-10 py-2 px-3 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm opacity-0 transition-opacity duration-300 tooltip dark:bg-gray-700"
                    >
                      Tooltip content
                      <div className="tooltip-arrow" data-popper-arrow></div>
                    </div>
                    <div className="relative mt-1 rounded-md shadow-sm">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-slate-400 sm:text-sm">
                          1e<sup>-x</sup>
                        </span>
                      </div>
                      <input
                        type="number"
                        className="block w-full p-2 rounded-md text-slate-200 bg-slate-700 focus-style pl-16 sm:pl-14 sm:text-sm"
                        {...register("tickSize", {
                          required: true,
                        })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-slate-800 border border-slate-700 px-4 py-5 shadow rounded-lg sm:p-6">
            <div className="md:grid md:grid-cols-3 md:gap-6">
              <div className="md:col-span-1">
                <h3 className="text-lg font-medium leading-6 text-slate-200">
                  Market Accounts
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  Specify the various accounts required to initialize market.
                </p>
              </div>
              <div className="mt-5 space-y-4 md:col-span-2 md:mt-0">
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs text-slate-400">
                      Market Account
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        className="block w-full rounded-md p-2 bg-slate-700 focus-style sm:text-sm"
                        {...register("marketAccount", {
                          required: true,
                          validate: validatePubkey,
                        })}
                      />
                      {errors?.marketAccount ? (
                        <p className="text-xs text-red-400 mt-1">
                          {errors?.marketAccount?.message}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400">
                      Event Queue Account
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        className="block w-full rounded-md p-2 bg-slate-700 focus-style sm:text-sm"
                        {...register("eventQueueAccount", {
                          required: true,
                          validate: validatePubkey,
                        })}
                      />
                      {errors?.eventQueueAccount ? (
                        <p className="text-xs text-red-400 mt-1">
                          {errors?.eventQueueAccount?.message}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400">
                      Request Queue Account
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        className="block w-full rounded-md p-2 bg-slate-700 focus-style sm:text-sm"
                        {...register("requestQueueAccount", {
                          required: true,
                          validate: validatePubkey,
                        })}
                      />
                      {errors?.requestQueueAccount ? (
                        <p className="text-xs text-red-400 mt-1">
                          {errors?.requestQueueAccount?.message}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400">
                      Bids Account
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        className="block w-full rounded-md p-2 bg-slate-700 focus-style sm:text-sm"
                        {...register("bidsAccount", {
                          required: true,
                          validate: validatePubkey,
                        })}
                      />
                      {errors?.bidsAccount ? (
                        <p className="text-xs text-red-400 mt-1">
                          {errors?.bidsAccount?.message}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400">
                      Asks Account
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        className="block w-full rounded-md p-2 bg-slate-700 focus-style sm:text-sm"
                        {...register("asksAccount", {
                          required: true,
                          validate: validatePubkey,
                        })}
                      />
                      {errors?.asksAccount ? (
                        <p className="text-xs text-red-400 mt-1">
                          {errors?.asksAccount?.message}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

CreateMarketAdvanced.getLayout = (page: ReactNode) =>
  getHeaderLayout(page, "Create Market");

export default CreateMarketAdvanced;
