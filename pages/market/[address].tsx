import { useRouter } from "next/router";
import { ReactNode, useState } from "react";
import { getLayout } from "../../components/layouts/SiteLayout";
import { useSerumMarket } from "../../hooks/useSerumMarket";

import { EventQueueCard } from "../../components/market/EventQueue";
import { MarketProvider } from "../../context/market";
import { TokenDisplay } from "../../components/market/TokenDisplay";
import { OverviewTable } from "../../components/market/OverviewTable";
import { VaultDisplay } from "../../components/market/Vault";
import { useWallet } from "@solana/wallet-adapter-react";
import { ActionCenter } from "../../components/market/ActionCenter";
import { useSolana } from "../../context";

const MarketPage = () => {
  const router = useRouter();
  const wallet = useWallet();
  const { address } = router.query;

  const { cluster } = useSolana();

  // TODO: handle loading
  const [pageLoading, setPageLoading] = useState(true);

  const { serumMarket } = useSerumMarket(address as string);

  if (!serumMarket) return <p>loading...</p>;

  return (
    <MarketProvider serumMarket={serumMarket} walletAddress={wallet.publicKey}>
      <div className="flex flex-col items-stretch space-y-4 my-8">
        <TokenDisplay />
        <OverviewTable />
        <VaultDisplay />
        <EventQueueCard />
        {cluster.network !== "mainnet-beta" && <ActionCenter />}
      </div>
    </MarketProvider>
  );
};

MarketPage.getLayout = (page: ReactNode) => getLayout(page, "Market");

export default MarketPage;
