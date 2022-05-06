import Head from "next/head";
import { FC, ReactNode } from "react";
import Header from "../common/Header";

type SiteLayoutProps = {
    title?: string;
    children: ReactNode;
}

export const SiteLayout: FC<SiteLayoutProps> = ({title, children}: SiteLayoutProps) => {
    return (
        <>
        <Head>
            <title>{title ? `${title} - Serum Explorer` : `Serum Explorer`}</title>
        </Head>
        <div>
            <Header />
        </div>
        </>
    )
}

export const getLayout = (page: React.ReactNode, title?: string) => (
    <SiteLayout title={title}>{page}</SiteLayout>
  );

