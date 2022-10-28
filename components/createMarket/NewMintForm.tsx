/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useWallet } from "@solana/wallet-adapter-react";
import { FormState, UseFormRegister, UseFormSetValue } from "react-hook-form";
import { CreateMarketFormValues } from "../../pages/market/create";
import { validatePubkey } from "../../utils/pubkey";

type NewMintFormProps = {
  register: UseFormRegister<CreateMarketFormValues>;
  formState: FormState<CreateMarketFormValues>;
  setValue: UseFormSetValue<CreateMarketFormValues>;
};

export default function NewMintForm({
  register,
  formState: { errors },
  setValue,
}: NewMintFormProps) {
  const wallet = useWallet();

  return (
    <div className="divide-y divide-slate-700">
      <div className="pb-4 space-y-2">
        <div>
          <label className="block text-xs text-slate-400">Base Decimals</label>
          <div className="mt-1">
            <input
              type="number"
              className="block w-full rounded-md p-2 bg-slate-700 border-gray-300 focus-style sm:text-sm"
              {...register("newMints.baseDecimals", {
                min: 0,
                required: true,
              })}
            />
          </div>
        </div>
        <div>
          <label className="block text-xs text-slate-400">Base Authority</label>
          <div className="mt-1">
            <div className="relative flex items-center">
              <input
                type="text"
                className="block w-full rounded-md p-2 bg-slate-700 border-gray-300 focus-style sm:text-sm"
                {...register("newMints.baseAuthority", {
                  required: true,
                  validate: validatePubkey,
                })}
              />
              <button
                type="button"
                disabled={!wallet || !wallet.publicKey}
                onClick={() =>
                  setValue(
                    "newMints.baseAuthority",
                    wallet.publicKey!.toBase58()
                  )
                }
                className="absolute right-0 mr-1.5 py-1 px-2 rounded bg-slate-600 hover:bg-slate-500 text-xs transition-colors disabled:opacity-20 focus-style"
              >
                Wallet
              </button>
            </div>
            {errors?.newMints?.baseAuthority ? (
              <p className="text-xs text-red-400 mt-1">
                {errors?.newMints?.baseAuthority?.message}
              </p>
            ) : null}
          </div>
        </div>
      </div>
      <div className="pt-2 space-y-2">
        <div>
          <label className="block text-xs text-slate-400">Quote Decimals</label>
          <div className="mt-1">
            <input
              type="number"
              className="block w-full rounded-md p-2 bg-slate-700 border-gray-300 focus-style sm:text-sm"
              {...register("newMints.quoteDecimals", {
                min: 0,
                required: true,
              })}
            />
          </div>
        </div>
        <div>
          <label className="block text-xs text-slate-400">
            Quote Authority
          </label>
          <div className="mt-1">
            <div className="relative flex items-center">
              <input
                type="text"
                className="block w-full rounded-md p-2 bg-slate-700 border-gray-300 focus-style sm:text-sm"
                {...register("newMints.quoteAuthority", {
                  required: true,
                  validate: validatePubkey,
                })}
              />
              <button
                type="button"
                disabled={!wallet || !wallet.publicKey}
                onClick={() =>
                  setValue(
                    "newMints.quoteAuthority",
                    wallet.publicKey!.toBase58(),
                    {
                      shouldTouch: false,
                    }
                  )
                }
                className="absolute right-0 mr-1.5 py-1 px-2 rounded bg-slate-600 hover:bg-slate-500 text-xs transition-colors disabled:opacity-20 focus-style"
              >
                Wallet
              </button>
            </div>
            {errors?.newMints?.quoteAuthority ? (
              <p className="text-xs text-red-400 mt-1">
                {errors?.newMints?.quoteAuthority?.message}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
