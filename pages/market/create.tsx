/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { RadioGroup } from "@headlessui/react";
import { DexInstructions, Market } from "@project-serum/serum";
import {
  createInitializeAccountInstruction,
  createInitializeMintInstruction,
  getMinimumBalanceForRentExemptMint,
  getMint,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token-2";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import BN from "bn.js";
import { useRouter } from "next/router";
import { ReactNode, useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import TransactionToast from "../../components/common/Toasts/TransactionToast";
import CreateMintOption from "../../components/createMarket/CreateMintOption";
import ExistingMintForm from "../../components/createMarket/ExistingMintForm";
import NewMintForm from "../../components/createMarket/NewMintForm";
import TickerForm from "../../components/createMarket/TickerForm";
import { getHeaderLayout } from "../../components/layouts/HeaderLayout";
import { useSerum } from "../../context";
import { getVaultOwnerAndNonce } from "../../utils/serum";
import {
  sendSignedTransaction,
  signTransactions,
} from "../../utils/transaction";

const REQUEST_QUEUE_SIZE = 5120 + 12; // https://github.com/mithraiclabs/psyoptions/blob/f0c9f73408a27676e0c7f156f5cae71f73f59c3f/programs/psy_american/src/lib.rs#L1003
const EVENT_QUEUE_SIZE = 262144 + 12; // https://github.com/mithraiclabs/psyoptions-ts/blob/ba1888ea83e634e1c7a8dad820fe67d053cf3f5c/packages/psy-american/src/instructions/initializeSerumMarket.ts#L84
const BIDS_SIZE = 65536 + 12; // Same reference as EVENT_QUEUE_SIZE
const ASKS_SIZE = 65536 + 12; // Same reference as EVENT_QUEUE_SIZE

const TRANSACTION_MESSAGES = [
  {
    sendingMessage: "Creating mints.",
    successMessage: "Created mints successfully.",
  },
  {
    sendingMessage: "Creating vaults.",
    successMessage: "Created vaults successfully.",
  },
  {
    sendingMessage: "Creating market.",
    successMessage: "Created market successfully.",
  },
];

type NewMintFormValues = {
  baseDecimals: number;
  quoteDecimals: number;
  baseAuthority: string;
  quoteAuthority: string;
};

type ExistingMintFormValues = {
  baseMint: string;
  quoteMint: string;
};

export type CreateMarketFormValues = {
  createMint: boolean;
  newMints?: NewMintFormValues;
  existingMints?: ExistingMintFormValues;
  lotSize: number;
  tickSize: number;
};

const CreateMarket = () => {
  const router = useRouter();

  const { connection } = useConnection();
  const wallet = useWallet();

  const { programID } = useSerum();

  const { register, handleSubmit, watch, setValue, formState, clearErrors } =
    useForm<CreateMarketFormValues>({
      defaultValues: {
        createMint: true,
      },
    });

  const createMint = watch("createMint");

  useEffect(() => {
    if (createMint) {
      setValue("existingMints", undefined);
      clearErrors("existingMints");
    } else {
      setValue("newMints", undefined);
      clearErrors("newMints");
    }
  }, [createMint, setValue, clearErrors]);

  // TODO: refactor somewhere else
  const handleCreateMarket: SubmitHandler<CreateMarketFormValues> = async (
    data
  ) => {
    if (!wallet || !wallet.publicKey) {
      toast.error("Wallet not connected");
      return;
    }

    let baseMintKeypair: Keypair | undefined;
    let baseMint: PublicKey;
    let baseMintDecimals: number;

    let quoteMintKeypair: Keypair | undefined;
    let quoteMint: PublicKey;
    let quoteMintDecimals: number;

    const mintInstructions: TransactionInstruction[] = [];
    const mintSigners: Keypair[] = [];

    const vaultInstructions: TransactionInstruction[] = [];
    const vaultSigners: Keypair[] = [];

    const marketInstructions: TransactionInstruction[] = [];
    const marketSigners: Keypair[] = [];

    // validate existing mints
    if (!createMint) {
      try {
        const baseMintInfo = await getMint(
          connection,
          new PublicKey(data.existingMints!.baseMint)
        );
        baseMint = baseMintInfo.address;
        baseMintDecimals = baseMintInfo.decimals;

        const quoteMintInfo = await getMint(
          connection,
          new PublicKey(data.existingMints!.quoteMint)
        );
        quoteMint = quoteMintInfo.address;
        quoteMintDecimals = quoteMintInfo.decimals;
      } catch (e) {
        toast.error("Invalid mints provided.");
        return;
      }
    }
    // create new mints
    else {
      const lamports = await getMinimumBalanceForRentExemptMint(connection);

      baseMintKeypair = Keypair.generate();
      baseMint = baseMintKeypair.publicKey;
      baseMintDecimals = data.newMints!.baseDecimals;

      quoteMintKeypair = Keypair.generate();
      quoteMint = quoteMintKeypair.publicKey;
      quoteMintDecimals = data.newMints!.quoteDecimals;

      mintInstructions.push(
        ...[
          SystemProgram.createAccount({
            fromPubkey: wallet.publicKey,
            newAccountPubkey: baseMintKeypair.publicKey,
            space: MINT_SIZE,
            lamports,
            programId: TOKEN_PROGRAM_ID,
          }),
          SystemProgram.createAccount({
            fromPubkey: wallet.publicKey,
            newAccountPubkey: quoteMintKeypair.publicKey,
            space: MINT_SIZE,
            lamports,
            programId: TOKEN_PROGRAM_ID,
          }),
        ]
      );

      mintInstructions.push(
        ...[
          createInitializeMintInstruction(
            baseMint,
            data.newMints!.baseDecimals,
            new PublicKey(data.newMints!.baseAuthority),
            new PublicKey(data.newMints!.baseAuthority)
          ),
          createInitializeMintInstruction(
            quoteMint,
            data.newMints!.quoteDecimals,
            new PublicKey(data.newMints!.quoteAuthority),
            new PublicKey(data.newMints!.quoteAuthority)
          ),
        ]
      );

      mintSigners.push(baseMintKeypair, quoteMintKeypair);
    }

    const marketAccounts = {
      market: Keypair.generate(),
      requestQueue: Keypair.generate(),
      eventQueue: Keypair.generate(),
      bids: Keypair.generate(),
      asks: Keypair.generate(),
      baseVault: Keypair.generate(),
      quoteVault: Keypair.generate(),
    };

    const [vaultOwner, vaultOwnerNonce] = await getVaultOwnerAndNonce(
      marketAccounts.market.publicKey,
      programID
    );

    // create vaults
    vaultInstructions.push(
      ...[
        SystemProgram.createAccount({
          fromPubkey: wallet.publicKey,
          newAccountPubkey: marketAccounts.baseVault.publicKey,
          lamports: await connection.getMinimumBalanceForRentExemption(165),
          space: 165,
          programId: TOKEN_PROGRAM_ID,
        }),
        SystemProgram.createAccount({
          fromPubkey: wallet.publicKey,
          newAccountPubkey: marketAccounts.quoteVault.publicKey,
          lamports: await connection.getMinimumBalanceForRentExemption(165),
          space: 165,
          programId: TOKEN_PROGRAM_ID,
        }),
        createInitializeAccountInstruction(
          marketAccounts.baseVault.publicKey,
          baseMint,
          vaultOwner
        ),
        createInitializeAccountInstruction(
          marketAccounts.quoteVault.publicKey,
          quoteMint,
          vaultOwner
        ),
      ]
    );

    vaultSigners.push(marketAccounts.baseVault, marketAccounts.quoteVault);

    let baseLotSize: number;
    let quoteLotSize: number;
    if (data.lotSize > 0) {
      baseLotSize = Math.round(
        10 ** baseMintDecimals * Math.pow(10, -1 * data.tickSize)
      );
      quoteLotSize = Math.round(
        10 ** quoteMintDecimals *
          Math.pow(10, -1 * data.lotSize) *
          Math.pow(10, -1 * data.tickSize)
      );
    } else {
      throw new Error("Invalid Lot Size");
    }

    // create market account
    marketInstructions.push(
      SystemProgram.createAccount({
        newAccountPubkey: marketAccounts.market.publicKey,
        fromPubkey: wallet.publicKey,
        space: Market.getLayout(programID).span,
        lamports: await connection.getMinimumBalanceForRentExemption(
          Market.getLayout(programID).span
        ),
        programId: programID,
      })
    );

    // create request queue
    marketInstructions.push(
      SystemProgram.createAccount({
        newAccountPubkey: marketAccounts.requestQueue.publicKey,
        fromPubkey: wallet.publicKey,
        space: REQUEST_QUEUE_SIZE,
        lamports: await connection.getMinimumBalanceForRentExemption(
          REQUEST_QUEUE_SIZE
        ),
        programId: programID,
      })
    );

    // create event queue
    marketInstructions.push(
      SystemProgram.createAccount({
        newAccountPubkey: marketAccounts.eventQueue.publicKey,
        fromPubkey: wallet.publicKey,
        space: EVENT_QUEUE_SIZE,
        lamports: await connection.getMinimumBalanceForRentExemption(
          EVENT_QUEUE_SIZE
        ),
        programId: programID,
      })
    );

    // create bids
    marketInstructions.push(
      SystemProgram.createAccount({
        newAccountPubkey: marketAccounts.bids.publicKey,
        fromPubkey: wallet.publicKey,
        space: BIDS_SIZE,
        lamports: await connection.getMinimumBalanceForRentExemption(BIDS_SIZE),
        programId: programID,
      })
    );

    // create asks
    marketInstructions.push(
      SystemProgram.createAccount({
        newAccountPubkey: marketAccounts.asks.publicKey,
        fromPubkey: wallet.publicKey,
        space: ASKS_SIZE,
        lamports: await connection.getMinimumBalanceForRentExemption(ASKS_SIZE),
        programId: programID,
      })
    );

    marketSigners.push(
      marketAccounts.market,
      marketAccounts.requestQueue,
      marketAccounts.eventQueue,
      marketAccounts.bids,
      marketAccounts.asks
    );

    marketInstructions.push(
      DexInstructions.initializeMarket({
        market: marketAccounts.market.publicKey,
        requestQueue: marketAccounts.requestQueue.publicKey,
        eventQueue: marketAccounts.eventQueue.publicKey,
        bids: marketAccounts.bids.publicKey,
        asks: marketAccounts.asks.publicKey,
        baseVault: marketAccounts.baseVault.publicKey,
        quoteVault: marketAccounts.quoteVault.publicKey,
        baseMint,
        quoteMint,
        baseLotSize: new BN(baseLotSize),
        quoteLotSize: new BN(quoteLotSize),
        feeRateBps: 150, // Unused in v3
        quoteDustThreshold: new BN(500), // Unused in v3
        vaultSignerNonce: vaultOwnerNonce,
        programId: programID,
      })
    );

    try {
      const signedTransactions = await signTransactions({
        transactionsAndSigners: [
          {
            transaction: new Transaction().add(...mintInstructions),
            signers: mintSigners,
          },
          {
            transaction: new Transaction().add(...vaultInstructions),
            signers: vaultSigners,
          },
          {
            transaction: new Transaction().add(...marketInstructions),
            signers: marketSigners,
          },
        ],
        wallet,
        connection,
      });

      // looping creates weird indexing issue with transactionMessages
      await sendSignedTransaction({
        signedTransaction: signedTransactions[0],
        connection,
        skipPreflight: false,
        successCallback: async (txSig) => {
          toast(
            () => (
              <TransactionToast
                txSig={txSig}
                message={TRANSACTION_MESSAGES[0].successMessage}
              />
            ),
            { autoClose: 5000 }
          );
        },
        sendingCallback: async () => {
          toast.info(TRANSACTION_MESSAGES[0].sendingMessage, {
            autoClose: 2000,
          });
        },
      });
      await sendSignedTransaction({
        signedTransaction: signedTransactions[1],
        connection,
        skipPreflight: false,
        successCallback: async (txSig) => {
          toast(
            () => (
              <TransactionToast
                txSig={txSig}
                message={TRANSACTION_MESSAGES[1].successMessage}
              />
            ),
            { autoClose: 5000 }
          );
        },
        sendingCallback: async () => {
          toast.info(TRANSACTION_MESSAGES[1].sendingMessage, {
            autoClose: 2000,
          });
        },
      });
      await sendSignedTransaction({
        signedTransaction: signedTransactions[2],
        connection,
        successCallback: async (txSig) => {
          toast(
            () => (
              <TransactionToast
                txSig={txSig}
                message={TRANSACTION_MESSAGES[2].successMessage}
              />
            ),
            { autoClose: 5000 }
          );
        },
        sendingCallback: async () => {
          toast.info(TRANSACTION_MESSAGES[2].sendingMessage, {
            autoClose: 2000,
          });
        },
      });

      router.push({
        pathname: `${marketAccounts.market.publicKey.toBase58()}`,
        query: router.query,
      });
    } catch (e) {
      console.error("[explorer]: ", e);
      toast.error("Failed to create market.");
    }
  };

  return (
    <div className="space-y-4 mb-6">
      <div>
        <h1 className="text-2xl text-slate-200">Create Market</h1>
      </div>
      <form onSubmit={handleSubmit(handleCreateMarket)}>
        <div className="space-y-4">
          <div className="bg-slate-800 border border-slate-700 px-4 py-5 shadow rounded-lg sm:p-6">
            <div className="md:grid md:grid-cols-3 md:gap-6">
              <div className="md:col-span-1">
                <h3 className="text-lg font-medium leading-6 text-slate-200">
                  Mints
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  Configure the mints for the tokens you want to create a market
                  for.
                </p>
              </div>
              <div className="mt-5 space-y-4 md:col-span-2 md:mt-0">
                <div>
                  <RadioGroup
                    value={createMint}
                    onChange={(value: boolean) => setValue("createMint", value)}
                  >
                    <RadioGroup.Label className="sr-only">
                      Create Mint
                    </RadioGroup.Label>
                    <div className="flex items-center space-x-2">
                      <RadioGroup.Option
                        value={true}
                        className="flex-1 focus-style rounded-md"
                      >
                        {({ active, checked }) => (
                          <CreateMintOption active={active} checked={checked}>
                            <p>New</p>
                          </CreateMintOption>
                        )}
                      </RadioGroup.Option>
                      <RadioGroup.Option
                        value={false}
                        className="flex-1 focus-style rounded-md"
                      >
                        {({ active, checked }) => (
                          <CreateMintOption active={active} checked={checked}>
                            <p>Existing</p>
                          </CreateMintOption>
                        )}
                      </RadioGroup.Option>
                    </div>
                  </RadioGroup>
                </div>
                <div>
                  {createMint ? (
                    <NewMintForm
                      register={register}
                      formState={formState}
                      setValue={setValue}
                    />
                  ) : (
                    <ExistingMintForm
                      register={register}
                      formState={formState}
                    />
                  )}
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
                <TickerForm register={register} />
              </div>
            </div>
          </div>
          <div className="flex justify-end w-full">
            <button className="w-full md:max-w-xs rounded-lg p-2 bg-cyan-500 hover:bg-cyan-600 transition-colors">
              Submit
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

CreateMarket.getLayout = (page: ReactNode) =>
  getHeaderLayout(page, "Create Market");

export default CreateMarket;
