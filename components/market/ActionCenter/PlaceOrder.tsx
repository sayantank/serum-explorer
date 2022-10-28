import { SubmitHandler, useForm } from "react-hook-form";
import { Listbox, RadioGroup, Transition } from "@headlessui/react";
import { classNames, getExplorerLink } from "../../../utils/general";
import React, { Fragment } from "react";
import { toast } from "react-toastify";
import { useMarket } from "../../../context/market";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useSolana } from "../../../context";
import { useTokenBalance } from "../../../hooks";
import { getAssociatedTokenAddress } from "@solana/spl-token-2";
import { sendWalletTransaction } from "../../../utils/transaction";
import Loader from "../../common/Loader";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

type LabelValue<T> = {
  label: string;
  value: T;
};

const orderTypes: LabelValue<"limit" | "ioc" | "postOnly">[] = [
  { label: "Limit", value: "limit" },
  { label: "Immediate or Cancel", value: "ioc" },
  { label: "Post Only", value: "postOnly" },
];
const selfTradeBehaviours: LabelValue<
  "decrementTake" | "cancelProvide" | "abortTransaction"
>[] = [
  { label: "Decrement Take", value: "decrementTake" },
  { label: "Cancel Provide", value: "cancelProvide" },
  { label: "Abort Transaction", value: "abortTransaction" },
];

type PlaceOrderInputs = {
  side: "buy" | "sell";
  price: string;
  size: string;
  orderType: LabelValue<"limit" | "ioc" | "postOnly">;
  selfTradeBehaviour: LabelValue<
    "decrementTake" | "cancelProvide" | "abortTransaction"
  >;
};

export const PlaceOrder = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { cluster } = useSolana();
  const { quoteMint, baseMint, serumMarket, orders, openOrders, eventQueue } =
    useMarket();

  const { tokenAmount: baseBalance } = useTokenBalance(
    wallet.publicKey,
    baseMint?.address
  );
  const { tokenAmount: quoteBalance } = useTokenBalance(
    wallet.publicKey,
    quoteMint?.address
  );

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const { register, handleSubmit, watch, setValue } = useForm<PlaceOrderInputs>(
    {
      defaultValues: {
        side: "buy",
        orderType: orderTypes[0],
        selfTradeBehaviour: selfTradeBehaviours[0],
      },
    }
  );

  const watchSide = watch("side");
  const setSide = (value: "buy" | "sell") => {
    setValue("side", value);
  };

  const watchOrderType = watch("orderType");
  const setOrderType = (value: LabelValue<"limit" | "ioc" | "postOnly">) => {
    setValue("orderType", value);
  };

  const watchSelfTradeBehaviour = watch("selfTradeBehaviour");
  const setSelfTradeBehaviour = (
    value: LabelValue<"decrementTake" | "cancelProvide" | "abortTransaction">
  ) => {
    setValue("selfTradeBehaviour", value);
  };

  const handlePlaceOrder: SubmitHandler<PlaceOrderInputs> = async (data) => {
    if (!baseMint || !quoteMint || !serumMarket) return;

    if (!wallet || !wallet.publicKey) {
      toast.error("No wallet selected.");
      return;
    }

    setIsSubmitting(true);

    const payer =
      data.side === "sell"
        ? await getAssociatedTokenAddress(baseMint.address, wallet.publicKey)
        : await getAssociatedTokenAddress(quoteMint.address, wallet.publicKey);
    if (!payer) {
      throw new Error("Need an SPL token account for cost currency as payer");
    }

    try {
      const { transaction, signers } =
        await serumMarket.makePlaceOrderTransaction(
          connection,
          {
            owner: wallet.publicKey,
            payer,
            side: data.side,
            price: parseFloat(data.price),
            size: parseFloat(data.size),
            orderType: data.orderType.value,
            selfTradeBehavior: data.selfTradeBehaviour.value,
            feeDiscountPubkey: null,
          },
          120_000,
          120_000
        );

      const txSig = await sendWalletTransaction(
        connection,
        transaction,
        wallet,
        signers
      );

      toast(() => (
        <div className="flex flex-col space-y-1">
          <p>Successfully placed order.</p>
          <a
            href={getExplorerLink(txSig, cluster.network)}
            target="_blank"
            rel="noopener noreferrer"
            className="italic font-light text-sm"
          >
            View transaction
          </a>
        </div>
      ));

      await Promise.all([
        orders.mutate(),
        eventQueue.mutate(),
        openOrders.mutate(),
      ]);
    } catch (e) {
      console.error(e);
      toast.error("Error placing order. See console for details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const RadioOption = ({
    checked,
    children,
  }: {
    checked: boolean;
    children: React.ReactNode;
  }) => {
    return (
      <div
        className={classNames(
          "py-2 px-4 cursor-pointer text-sm",
          checked
            ? "bg-slate-600 text-slate-200"
            : "bg-slate-800 text-slate-600"
        )}
      >
        {children}
      </div>
    );
  };

  const ListOption = ({
    selected,
    children,
  }: {
    selected: boolean;
    children: React.ReactNode;
  }) => {
    return (
      <span
        className={`block truncate ${selected ? "font-medium" : "font-normal"}`}
      >
        {children}
      </span>
    );
  };

  return (
    <div className="p-3 bg-slate-700 rounded-md">
      <h3 className="text-lg text-slate-200">Place Order</h3>
      <form onSubmit={handleSubmit(handlePlaceOrder)}>
        <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:space-x-4 mb-2">
          <RadioGroup
            value={watchSide}
            onChange={setSide}
            className="space-y-1"
          >
            <RadioGroup.Label className="input-label">Side</RadioGroup.Label>
            <div className="flex rounded-md overflow-hidden w-min">
              <RadioGroup.Option value="buy">
                {({ checked }) => (
                  <RadioOption checked={checked}>Buy</RadioOption>
                )}
              </RadioGroup.Option>
              <RadioGroup.Option value="sell">
                {({ checked }) => (
                  <RadioOption checked={checked}>Sell</RadioOption>
                )}
              </RadioGroup.Option>
            </div>
          </RadioGroup>
          <div className="space-y-1">
            <label className="input-label">Order Type</label>
            <Listbox value={watchOrderType} onChange={setOrderType}>
              <div className="relative">
                <Listbox.Button className="relative px-4 text-sm py-2 rounded-md bg-slate-600 text-slate-200 sm:w-64 min-w-full flex items-center justify-between">
                  {watchOrderType.label}
                  <ChevronDownIcon className="h-5 w-5 text-slate-200" />
                </Listbox.Button>
                <Transition
                  as={Fragment}
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Listbox.Options className="absolute mt-1 rounded-md py-1 text-base shadow-2xl sm:text-sm bg-slate-600 w-full z-50">
                    {orderTypes.map((orderType) => (
                      <Listbox.Option
                        key={orderType.value}
                        className={({ active }) =>
                          `relative cursor-pointer select-none py-2 px-4 ${
                            active
                              ? "bg-slate-500 text-slate-100"
                              : "text-slate-400"
                          }`
                        }
                        value={orderType}
                      >
                        {({ selected }) => (
                          <ListOption selected={selected}>
                            {orderType.label}
                          </ListOption>
                        )}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </Transition>
              </div>
            </Listbox>
          </div>

          <div className="space-y-1">
            <label className="input-label">Self-Trade Behaviour</label>
            <Listbox
              value={watchSelfTradeBehaviour}
              onChange={setSelfTradeBehaviour}
            >
              <div className="relative">
                <Listbox.Button className="relative px-4 py-2 text-sm rounded-md bg-slate-600 text-slate-200 sm:w-48 min-w-full flex items-center justify-between">
                  {watchSelfTradeBehaviour.label}
                  <ChevronDownIcon className="h-5 w-5 text-slate-200" />
                </Listbox.Button>
                <Transition
                  as={Fragment}
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Listbox.Options className="absolute mt-1 rounded-md py-1 text-base shadow-2xl sm:text-sm bg-slate-600 w-full z-10 ">
                    {selfTradeBehaviours.map((behaviour) => (
                      <Listbox.Option
                        key={behaviour.value}
                        className={({ active }) =>
                          `relative cursor-pointer select-none py-2 px-4 ${
                            active
                              ? "bg-slate-500 text-slate-100"
                              : "text-slate-400"
                          }`
                        }
                        value={behaviour}
                      >
                        {({ selected }) => (
                          <ListOption selected={selected}>
                            {behaviour.label}
                          </ListOption>
                        )}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </Transition>
              </div>
            </Listbox>
          </div>
        </div>
        <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:space-x-4 mb-6">
          <div className="w-full flex flex-col space-y-1">
            <label>
              <span className="input-label">Size</span>
            </label>
            <input
              {...register("size", {
                required: true,
                pattern: /^[1-9]\d*(\.\d+)?$/,
              })}
              className="px-4 py-2 w-full rounded input-2 focus-style"
            />
          </div>
          <div className="w-full flex flex-col space-y-1">
            <label>
              <span className="input-label">Price</span>
            </label>
            <input
              {...register("price", {
                required: true,
                pattern: /^[1-9]\d*(\.\d+)?$/,
              })}
              className="px-4 py-2 w-full rounded input-2 focus-style"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={
            isSubmitting ||
            !quoteMint ||
            !baseMint ||
            !serumMarket ||
            !baseBalance ||
            !quoteBalance ||
            baseBalance?.uiAmount === 0 ||
            quoteBalance?.uiAmount === 0
          }
          className="primary-btn focus-style"
        >
          {isSubmitting ? (
            <>
              <Loader /> Placing Order
            </>
          ) : (
            <>Place Order</>
          )}
        </button>
      </form>
    </div>
  );
};
