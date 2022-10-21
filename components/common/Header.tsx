import { Popover, Transition } from "@headlessui/react";
import Image from "next/image";
import { useRouter } from "next/router";
import { ParsedUrlQuery } from "querystring";
import { FC, Fragment } from "react";
import WalletButton from "./WalletButton";
import { Bars3Icon, Cog6ToothIcon } from "@heroicons/react/24/outline";
import SettingsPanel from "./SettingsPanel";

const Header: FC = () => {
  const router = useRouter();
  // const { serumMarkets, loading } = useSerumMarkets();

  const sanitizeQuery = (query: ParsedUrlQuery) => {
    if (query.address) {
      delete query.address;
    }
    return { ...query };
  };

  return (
    <Popover className="relative z-50">
      <div className="flex items-center justify-between p-4 sm:px-6 md:space-x-6 space-x-2 bg-slate-800 border-b border-slate-700">
        <div className="flex justify-start">
          <button
            className="text-lg  text-white no-underline text-left flex space-x-2 items-center"
            onClick={() =>
              router.push({ pathname: "/", query: sanitizeQuery(router.query) })
            }
          >
            <div className="h-7 w-7">
              <Image
                src="/serum-srm-logo.png"
                width={1.4}
                height={1.43}
                layout="responsive"
                alt="Serum Explorer"
              />
            </div>
            <p>Explorer</p>
          </button>
        </div>
        <div className="md:hidden">
          <Popover.Button className="inline-flex items-center justify-center rounded-md p-1 md:p-2 text-cyan-400 hover:bg-slate-800 hover:text-cyan-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-cyan-500">
            <span className="sr-only">Open menu</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </Popover.Button>
        </div>
        <div className="hidden items-center justify-end md:flex space-x-4">
          <Popover className="relative">
            {({ open }) => (
              <>
                <Popover.Button
                  className={`
                ${open ? "" : "text-opacity-90"}
                group inline-flex items-center rounded-md bg-slate-700 hover:bg-slate-600 px-3 py-2 text-sm text-cyan-400 hover:text-cyan-500 hover:text-opacity-100 focus:outline-none focus-visible:ring-1 focus-visible:ring-cyan-500 focus-visible:ring-opacity-75 transition-colors`}
                >
                  {/* <span>Settings</span> */}
                  <Cog6ToothIcon
                    className={`${open ? "" : "text-opacity-70"}
                  h-5 w-5 text-cyan-400 group-hover:text-cyan-500 transition duration-150 ease-in-out group-hover:text-opacity-80`}
                    aria-hidden="true"
                  />
                </Popover.Button>
                <Popover.Panel className="bg-slate-800 rounded-md shadow-md border border-slate-700 p-3 absolute right-0 z-10 mt-2 w-96 transform ">
                  <SettingsPanel />
                </Popover.Panel>
              </>
            )}
          </Popover>
          <WalletButton />
        </div>
      </div>
      <Transition
        as={Fragment}
        enter="duration-200 ease-out"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="duration-100 ease-in"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
      >
        <Popover.Panel
          focus
          className="absolute w-full top-full origin-top transform transition md:hidden mt-2"
        >
          <div className="rounded-lg bg-slate-800 border border-slate-700 px-2 py-4 shadow-lg mx-2">
            <SettingsPanel />
          </div>
        </Popover.Panel>
      </Transition>
    </Popover>
  );
};

export default Header;
