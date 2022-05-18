import { SearchIcon } from "@heroicons/react/outline";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { FC, FormEvent, ReactNode, useState } from "react";
import Header from "../common/Header";
import { ProgramSelector } from "../common/ProgramSelector";

type SiteLayoutProps = {
  title?: string;
  children: ReactNode;
};

export const SiteLayout: FC<SiteLayoutProps> = ({
  title,
  children,
}: SiteLayoutProps) => {
  const router = useRouter();

  const [marketAddress, setMarketAddress] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // NOTE: If not deleted, extra ?address=xyz is added
    delete router.query.address;

    router.push({ pathname: `/market/${marketAddress}`, query: router.query });
  };
  return (
    <>
      <Head>
        <title>{title ? `${title} - Serum Explorer` : `Serum Explorer`}</title>
      </Head>
      <div className="w-full h-screen overflow-y-auto flex flex-col space-y-4 justify-between">
        <div className="max-w-4xl w-full mx-auto">
          <Header />
          <div className="flex flex-col space-y-4 items-stretch mb-4 px-4 md:px-0">
            <ProgramSelector />
            <form
              className="flex items-center space-x-4 rounded border-2 border-cyan-500"
              onSubmit={handleSubmit}
            >
              <input
                type="text"
                value={marketAddress}
                onChange={(e) => setMarketAddress(e.target.value)}
                placeholder="Market Address"
                className="px-4 py-2 w-full bg-transparent focus:outline-none flex-1"
              />
              <button type="submit" className="px-4 py-2">
                <SearchIcon className="h-5 w-5 text-cyan-500" />
              </button>
            </form>
          </div>
          <div className="px-4 md:px-0">{children}</div>
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
