import { WalletContextState } from "@solana/wallet-adapter-react";
import {
  Connection,
  Keypair,
  Signer,
  Transaction,
  TransactionSignature,
} from "@solana/web3.js";
import { sleep } from "./general";

export async function sendWalletTransaction(
  connection: Connection,
  tx: Transaction,
  wallet: WalletContextState,
  signers?: Signer[]
) {
  if (!wallet.publicKey) throw new Error("Wallet is not initialized");

  if (!wallet.signTransaction)
    throw new Error("Wallet does not support signing");

  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash("confirmed");

  tx.recentBlockhash = blockhash;
  tx.lastValidBlockHeight = lastValidBlockHeight;
  tx.feePayer = wallet.publicKey;

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  tx = await wallet.signTransaction!(tx);

  if (signers && signers.length > 0) tx.partialSign(...signers);

  const txSig = await connection.sendRawTransaction(await tx.serialize());

  await connection.confirmTransaction({
    signature: txSig,
    blockhash,
    lastValidBlockHeight,
  });

  return txSig;
}

export async function sendWalletAllTransactions(
  connection: Connection,
  wallet: WalletContextState,
  transactionSets: {
    tx: Transaction;
    signers?: Signer[];
  }[]
) {
  if (!wallet.publicKey) throw new Error("Wallet is not initialized");

  if (!wallet.signAllTransactions)
    throw new Error("Wallet does not support signing");

  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash("confirmed");

  transactionSets.forEach(async (t, i) => {
    if (!wallet.publicKey) throw new Error("Wallet is not initialized");

    t.tx.recentBlockhash = blockhash;
    t.tx.lastValidBlockHeight = lastValidBlockHeight;
    t.tx.feePayer = wallet.publicKey;

    if (t.signers && t.signers.length > 0) t.tx.partialSign(...t.signers);

    const sim = await connection.simulateTransaction(t.tx);
    if (sim.value.err) {
      console.log(`TRANSACTION ${i}: `, sim.value.logs);
    }
  });

  const finalTxs = await wallet.signAllTransactions(
    transactionSets.map((t) => t.tx)
  );

  const txSigs = await Promise.all(
    finalTxs.map(async (tx) =>
      connection.sendRawTransaction(await tx.serialize(), {
        skipPreflight: true,
      })
    )
  );

  return txSigs;
}

// ------------- MANGO MARKETS (https://github.com/blockworks-foundation/mango-ui/blob/b6abfc6c13b71fc17ebbe766f50b8215fa1ec54f/src/utils/send.tsx) -------------

export const getUnixTs = () => {
  return new Date().getTime() / 1000;
};

const DEFAULT_TIMEOUT = 30000;

export async function sendTransaction({
  transaction,
  wallet,
  signers = [],
  connection,
  successCallback,
  sendingCallback,
  // sentCallback,
  timeout = DEFAULT_TIMEOUT,
}: {
  transaction: Transaction;
  wallet: WalletContextState;
  signers?: Array<Keypair>;
  connection: Connection;
  successCallback?: (txSig: string) => Promise<void>;
  sendingCallback?: () => Promise<void>;
  // sentCallback?: (txSig: string) => Promise<void>;
  timeout?: number;
}) {
  const signedTransaction = await signTransaction({
    transaction,
    wallet,
    signers,
    connection,
  });
  return await sendSignedTransaction({
    signedTransaction,
    connection,
    successCallback,
    sendingCallback,
    // sentCallback,
    timeout,
  });
}

export async function signTransaction({
  transaction,
  wallet,
  signers = [],
  connection,
}: {
  transaction: Transaction;
  wallet: WalletContextState;
  signers?: Array<Keypair>;
  connection: Connection;
}) {
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error("Wallet not connected");
  }

  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash("max");
  transaction.feePayer = wallet.publicKey;
  transaction.recentBlockhash = blockhash;
  transaction.lastValidBlockHeight = lastValidBlockHeight;

  if (signers.length > 0) {
    transaction.partialSign(...signers);
  }
  return await wallet.signTransaction(transaction);
}

export async function signTransactions({
  transactionsAndSigners,
  wallet,
  connection,
}: {
  transactionsAndSigners: {
    transaction: Transaction;
    signers?: Array<Keypair>;
  }[];
  wallet: WalletContextState;
  connection: Connection;
}) {
  if (!wallet.signAllTransactions) {
    throw new Error("Wallet not connected");
  }
  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash("max");
  transactionsAndSigners.forEach(({ transaction, signers = [] }) => {
    if (!wallet.publicKey) {
      throw new Error("Wallet not connected");
    }

    transaction.feePayer = wallet.publicKey;
    transaction.recentBlockhash = blockhash;
    transaction.lastValidBlockHeight = lastValidBlockHeight;
    transaction.setSigners(
      wallet.publicKey,
      ...signers.map((s) => s.publicKey)
    );
    if (signers?.length > 0) {
      transaction.partialSign(...signers);
    }
  });

  return await wallet.signAllTransactions(
    transactionsAndSigners.map(({ transaction }) => transaction)
  );
}

export async function sendSignedTransaction({
  signedTransaction,
  connection,
  successCallback,
  sendingCallback,
  timeout = DEFAULT_TIMEOUT,
  skipPreflight = true,
}: {
  signedTransaction: Transaction;
  connection: Connection;
  successCallback?: (txSig: string) => Promise<void>;
  sendingCallback?: () => Promise<void>;
  // sentCallback?: (txSig: string) => void;
  timeout?: number;
  skipPreflight?: boolean;
}): Promise<string> {
  const rawTransaction = signedTransaction.serialize();
  const startTime = getUnixTs();

  sendingCallback && sendingCallback();

  const txid: TransactionSignature = await connection.sendRawTransaction(
    rawTransaction,
    {
      skipPreflight,
    }
  );

  console.log("Started awaiting confirmation for", txid);

  let done = false;
  (async () => {
    while (!done && getUnixTs() - startTime < timeout) {
      connection.sendRawTransaction(rawTransaction, {
        skipPreflight: true,
      });
      await sleep(300);
    }
  })();
  try {
    await awaitTransactionSignatureConfirmation(txid, timeout, connection);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    if (err.timeout) {
      throw new Error("Timed out awaiting confirmation on transaction");
    }
    const simulateResult = await connection.simulateTransaction(
      signedTransaction
    );
    if (simulateResult && simulateResult.value.err) {
      if (simulateResult.value.logs) {
        for (let i = simulateResult.value.logs.length - 1; i >= 0; --i) {
          const line = simulateResult.value.logs[i];
          if (line.startsWith("Program log: ")) {
            throw new Error(
              "Transaction failed: " + line.slice("Program log: ".length)
            );
          }
        }
      }
      throw new Error(JSON.stringify(simulateResult.value.err));
    }
    throw new Error("Transaction failed");
  } finally {
    done = true;
  }

  successCallback && successCallback(txid);

  console.log("Latency", txid, getUnixTs() - startTime);
  return txid;
}

async function awaitTransactionSignatureConfirmation(
  txid: TransactionSignature,
  timeout: number,
  connection: Connection
) {
  let done = false;
  const result = await new Promise((resolve, reject) => {
    (async () => {
      setTimeout(() => {
        if (done) {
          return;
        }
        done = true;
        console.log("Timed out for txid", txid);
        reject({ timeout: true });
      }, timeout);
      try {
        connection.onSignature(
          txid,
          (result) => {
            console.log("WS confirmed", txid, result);
            done = true;
            if (result.err) {
              reject(result.err);
            } else {
              resolve(result);
            }
          },
          connection.commitment
        );
        console.log("Set up WS connection", txid);
      } catch (e) {
        done = true;
        console.log("WS error in setup", txid, e);
      }
      while (!done) {
        // eslint-disable-next-line no-loop-func
        (async () => {
          try {
            const signatureStatuses = await connection.getSignatureStatuses([
              txid,
            ]);
            const result = signatureStatuses && signatureStatuses.value[0];
            if (!done) {
              if (!result) {
                // console.log('REST null result for', txid, result);
              } else if (result.err) {
                console.log("REST error for", txid, result);
                done = true;
                reject(result.err);
              } else if (
                !(
                  result.confirmations ||
                  result.confirmationStatus === "confirmed" ||
                  result.confirmationStatus === "finalized"
                )
              ) {
                console.log("REST not confirmed", txid, result);
              } else {
                console.log("REST confirmed", txid, result);
                done = true;
                resolve(result);
              }
            }
          } catch (e) {
            if (!done) {
              console.log("REST connection error: txid", txid, e);
            }
          }
        })();
        await sleep(300);
      }
    })();
  });
  done = true;
  return result;
}
