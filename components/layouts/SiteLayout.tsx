import { Combobox, Transition } from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/24/outline";
import Head from "next/head";
import Image from "next/image";
import {
  ChangeEvent,
  FC,
  Fragment,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";
import { SerumMarketInfo, useSerumMarkets } from "../../hooks/useSerumMarkets";
import { serumMarketFilter } from "../../utils/filters";
import { prettifyPubkey } from "../../utils/pubkey";
import Header from "../common/Header";
import debounce from "lodash.debounce";
import { useRouter } from "next/router";

type SiteLayoutProps = {
  title?: string;
  children: ReactNode;
};

export const SiteLayout: FC<SiteLayoutProps> = ({
  title,
  children,
}: SiteLayoutProps) => {
  const router = useRouter();
  const { serumMarkets } = useSerumMarkets();

  const [selected, setSelected] = useState<SerumMarketInfo | undefined>(
    serumMarkets && serumMarkets[0]
  );
  const [marketQuery, setMarketQuery] = useState("");

  const [filteredMarkets, setFilteredMarkets] = useState(
    serumMarkets ? serumMarkets : []
  );

  const queryChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setMarketQuery(e.target.value);
  };

  const debouncedChangeHandler = useMemo(
    () => debounce(queryChangeHandler, 500),
    []
  );

  const handleSelect = (value: SerumMarketInfo | undefined) => {
    if (value) {
      setSelected(value);
      router.push(`/market/${value.address.toString()}`);
    }
  };

  useEffect(() => {
    if (serumMarkets) {
      if (marketQuery !== "") {
        const q = new RegExp(marketQuery, "i");
        setFilteredMarkets(
          serumMarkets.filter((row) => serumMarketFilter(q, row)).slice(0, 5)
        );
      } else setFilteredMarkets(serumMarkets.slice(0, 5));
    } else setFilteredMarkets([]);
  }, [marketQuery, serumMarkets]);

  return (
    <>
      <Head>
        <title>{title ? `${title} - Serum Explorer` : `Serum Explorer`}</title>
      </Head>
      <div className="w-full h-screen overflow-y-auto flex flex-col space-y-4 justify-between">
        <div className="w-full mx-auto">
          <Header />
          <div className="p-4 sm:px-0 sm:py-10 max-w-4xl mx-auto space-y-6">
            <div>
              <Combobox
                value={selected}
                onChange={(value) => handleSelect(value)}
              >
                <div className="relative mt-1">
                  <div className="relative w-full cursor-default overflow-hidden rounded-md  bg-slate-800 text-left border border-slate-700 focus-visible:border-0 focus-visible:outline-none focus-visible:ring-0">
                    <Combobox.Input
                      placeholder="Search markets"
                      className="w-full border-none py-3 pl-3 pr-10 text-sm leading-5 text-slate-200 bg-slate-800 focus-visible:border-0 focus-visible:outline-none focus-visible:ring-0 placeholder:text-slate-400"
                      onChange={debouncedChangeHandler}
                    />
                    <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                      <ChevronUpDownIcon
                        className="h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    </Combobox.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                    afterLeave={() => setMarketQuery("")}
                  >
                    <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-slate-800 py-1 text-base shadow-lgsm:text-sm">
                      {filteredMarkets.length === 0 && marketQuery !== "" ? (
                        <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                          Nothing found.
                        </div>
                      ) : (
                        filteredMarkets.map((market) => (
                          <Combobox.Option
                            key={market.address.toBase58()}
                            className={({ active }) =>
                              `relative cursor-default select-none py-2 px-4 flex items-center justify-between ${
                                active
                                  ? "bg-cyan-600 text-slate-200"
                                  : "text-slate-400"
                              }`
                            }
                            value={market}
                          >
                            <div className="flex items-center space-x-2">
                              <span
                                className={`block truncate text-sm font-normal`}
                              >
                                {prettifyPubkey(market.address)}
                              </span>
                            </div>
                            {market.baseSymbol && market.quoteSymbol ? (
                              <div>
                                <p>
                                  {market.baseSymbol}/{market.quoteSymbol}
                                </p>
                              </div>
                            ) : null}
                          </Combobox.Option>
                        ))
                      )}
                    </Combobox.Options>
                  </Transition>
                </div>
              </Combobox>
            </div>
            {children}
          </div>
        </div>
        <div className="pb-4 flex items-center justify-center">
          <a
            href="https://github.com/sayantank/serum-explorer"
            target="_blank"
            rel="noopener noreferrer"
            className="no-underline text-sm font-light flex items-center space-x-2 hover:font-medium"
          >
            <Image
              src="/github.svg"
              width={24}
              height={24}
              alt="Github"
              className="cursor-pointer"
            />
            <p>Source Code</p>
          </a>
        </div>
      </div>
    </>
  );
};

export const getLayout = (page: React.ReactNode, title?: string) => (
  <SiteLayout title={title}>{page}</SiteLayout>
);
