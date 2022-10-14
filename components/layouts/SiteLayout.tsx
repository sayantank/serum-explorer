import Head from "next/head";
import Image from "next/image";
import { FC, ReactNode } from "react";
import Header from "../common/Header";

type SiteLayoutProps = {
  title?: string;
  children: ReactNode;
};

export const SiteLayout: FC<SiteLayoutProps> = ({
  title,
  children,
}: SiteLayoutProps) => {
  return (
    <>
      <Head>
        <title>{title ? `${title} - Serum Explorer` : `Serum Explorer`}</title>
      </Head>
      <div className="w-full h-screen overflow-y-auto flex flex-col space-y-4 justify-between">
        <div className="md:px-4 px-2 w-full mx-auto">
          <Header />
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
