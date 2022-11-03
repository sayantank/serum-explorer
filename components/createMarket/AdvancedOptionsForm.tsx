import { Switch } from "@headlessui/react";
import { FormState, UseFormRegister, UseFormSetValue } from "react-hook-form";
import { CreateMarketFormValues } from "../../pages/market/create";
import { classNames } from "../../utils/general";

type AdvancedOptionsFormProps = {
  useAdvancedOptions: boolean;
  register: UseFormRegister<CreateMarketFormValues>;
  formState: FormState<CreateMarketFormValues>;
  setValue: UseFormSetValue<CreateMarketFormValues>;
  totalMarketAccountSizes: {
    totalEventQueueSize: number;
    totalRequestQueueSize: number;
    totalOrderbookSize: number;
  };
};
export default function AdvancedOptionsForm({
  useAdvancedOptions,
  register,
  setValue,
  formState: { errors },
  totalMarketAccountSizes,
}: AdvancedOptionsFormProps) {
  return (
    <div className="space-y-3">
      <div>
        <Switch.Group as="div" className="flex items-center justify-between">
          <span className="flex flex-grow flex-col space-y-0.5">
            <Switch.Label as="span" className="input-label" passive>
              Use Advanced Options
            </Switch.Label>
            <Switch.Description as="span" className="text-sm text-slate-500">
              Set custom sizes for market accounts.
            </Switch.Description>
          </span>
          <Switch
            checked={useAdvancedOptions}
            onChange={(value: boolean) => setValue("useAdvancedOptions", value)}
            className={classNames(
              useAdvancedOptions ? "bg-cyan-500" : "bg-slate-400",
              "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-style"
            )}
          >
            <span
              aria-hidden="true"
              className={classNames(
                useAdvancedOptions ? "translate-x-5" : "translate-x-0",
                "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
              )}
            />
          </Switch>
        </Switch.Group>
      </div>
      <div
        className={classNames(
          !useAdvancedOptions ? "opacity-30" : "opacity-100"
        )}
      >
        <label className="block text-xs text-slate-400">
          Event Queue Length
        </label>
        <div className="mt-1">
          <div className="relative flex items-center">
            <input
              type="number"
              disabled={!useAdvancedOptions}
              className="block w-full rounded-md p-2 bg-slate-700 border-gray-300 focus-style sm:text-sm"
              {...register("eventQueueLength", {
                min: {
                  value: 128,
                  message: "Must be at least 128",
                },
                max: 2978,
                required: true,
              })}
            />
            <p className="absolute right-0 mr-2 text-sm text-slate-400">
              {totalMarketAccountSizes.totalEventQueueSize} bytes
            </p>
          </div>
          {errors?.eventQueueLength ? (
            <p className="text-xs text-red-400 mt-1">
              {errors?.eventQueueLength?.message}
            </p>
          ) : null}
        </div>
      </div>
      <div
        className={classNames(
          !useAdvancedOptions ? "opacity-30" : "opacity-100"
        )}
      >
        <label className="block text-xs text-slate-400">
          Request Queue Length
        </label>
        <div className="mt-1">
          <div className="relative flex items-center">
            <input
              type="number"
              disabled={!useAdvancedOptions}
              className="block w-full rounded-md p-2 bg-slate-700 border-gray-300 focus-style sm:text-sm"
              {...register("requestQueueLength", {
                min: 1,
                max: 100,
                required: true,
              })}
            />
            <p className="absolute right-0 mr-2 text-sm text-slate-400">
              {totalMarketAccountSizes.totalRequestQueueSize} bytes
            </p>
          </div>
        </div>
      </div>
      <div
        className={classNames(
          !useAdvancedOptions ? "opacity-30" : "opacity-100"
        )}
      >
        <label className="block text-xs text-slate-400">Orderbook Length</label>
        <div className="mt-1">
          <div className="relative flex items-center">
            <input
              type="number"
              disabled={!useAdvancedOptions}
              className="block w-full rounded-md p-2 bg-slate-700 border-gray-300 focus-style sm:text-sm"
              {...register("orderbookLength", {
                min: {
                  value: 201,
                  message: "Must be at least 201",
                },
                max: 1000,
                required: true,
              })}
            />
            <p className="absolute right-0 mr-2 text-sm text-slate-400">
              {totalMarketAccountSizes.totalEventQueueSize} bytes
            </p>
          </div>
          {errors?.orderbookLength ? (
            <p className="text-xs text-red-400 mt-1">
              {errors?.orderbookLength?.message}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
