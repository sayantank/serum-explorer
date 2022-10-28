import { FormState, UseFormRegister } from "react-hook-form";
import { CreateMarketFormValues } from "../../pages/market/create";
import { validatePubkey } from "../../utils/pubkey";

type ExistingMintFormProps = {
  register: UseFormRegister<CreateMarketFormValues>;
  formState: FormState<CreateMarketFormValues>;
};
export default function ExistingMintForm({
  register,
  formState: { errors },
}: ExistingMintFormProps) {
  return (
    <div className="space-y-2">
      <div>
        <label className="block text-xs text-slate-400">Base Mint</label>
        <div className="mt-1">
          <input
            type="text"
            className="block w-full rounded-md p-2 bg-slate-700 focus-style sm:text-sm"
            {...register("existingMints.baseMint", {
              required: true,
              validate: validatePubkey,
            })}
          />
          {errors?.existingMints?.baseMint ? (
            <p className="text-xs text-red-400 mt-1">
              {errors?.existingMints?.baseMint?.message}
            </p>
          ) : null}
        </div>
      </div>
      <div>
        <label className="block text-xs text-slate-400">Quote Mint</label>
        <div className="mt-1">
          <input
            type="text"
            className="block w-full rounded-md p-2 bg-slate-700 focus-style sm:text-sm"
            {...register("existingMints.quoteMint", {
              required: true,
              validate: validatePubkey,
            })}
          />
          {errors?.existingMints?.quoteMint ? (
            <p className="text-xs text-red-400 mt-1">
              {errors?.existingMints?.quoteMint?.message}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
