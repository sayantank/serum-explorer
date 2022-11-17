import { UseFormRegister } from "react-hook-form";
import { CreateMarketFormValues } from "../../pages/market/create";

type TickerFormProps = {
  register: UseFormRegister<CreateMarketFormValues>;
};
export default function TickerForm({ register }: TickerFormProps) {
  return (
    <div className="space-y-2">
      <div>
        <label className="block text-xs text-slate-400">Min. Order Size</label>
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
  );
}
