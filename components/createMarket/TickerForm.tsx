import { UseFormRegister } from "react-hook-form";
import { CreateMarketFormValues } from "../../pages/market/create";

type TickerFormProps = {
  register: UseFormRegister<CreateMarketFormValues>;
  watch: UseFormRegister<CreateMarketFormValues>;
  price?: number | null;
  unitprice?: number | null;
};

export default function TickerForm({ register, price, unitprice, watch }: TickerFormProps) {
   
  //this is the calculation for the tick size, it 0.0001 the value of the price
  const tick: number = price! * (1/10000)

  const tickSizeInput = watch("tickSize");

  const tickSizeValue = price ? tick : tickSizeInput

  // this is the calculation of the lot size, it is 1 dollar's quantity of the token
  const minLotsize: number = 1 / unitprice!

  const lotSizeInput = watch("lotSize");

  const lotSizeValue =  unitprice ? minLotsize : lotSizeInput

  
  
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
            value={`${lotSizeValue}`}
            placeholder={`${lotSizeValue}`}
           //
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
            value={`${tickSizeValue}`}
            placeholder={`${tickSizeValue}`}
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
