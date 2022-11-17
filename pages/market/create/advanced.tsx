import { ReactNode } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { getHeaderLayout } from "../../../components/layouts/HeaderLayout";
import { validatePubkey } from "../../../utils/pubkey";

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
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateMarketAdvancedFormValues>({});

  const handleCreateAdvanced: SubmitHandler<
    CreateMarketAdvancedFormValues
  > = async (data) => {
    console.log(data);
  };

  return (
    <div className="space-y-4 mb-6">
      <div>
        <h1 className="text-2xl text-slate-200">Create Market</h1>
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
                      Lot Size
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
                          min: 0,
                        })}
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      data-tooltip-target="tooltip-default"
                      className="block text-xs text-slate-400"
                    >
                      Tick Size
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
                          min: 0,
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
