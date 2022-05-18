import { useRouter } from "next/router";
import { ReactNode, useState } from "react";
import { getLayout } from "../../components/layouts/SiteLayout";
import { useSerumMarket } from "../../hooks/useSerumMarket";

import { EventQueueCard } from "../../components/market/EventQueue";
import { MarketProvider } from "../../context/market";
import { TokenDisplay } from "../../components/market/TokenDisplay";
import { OverviewTable } from "../../components/market/OverviewTable";
import { VaultDisplay } from "../../components/market/Vault";

const MarketPage = () => {
  const router = useRouter();
  const { address } = router.query;

  // TODO: handle loading
  const [pageLoading, setPageLoading] = useState(true);

  const { serumMarket } = useSerumMarket(address as string);

  if (!serumMarket) return <p>loading...</p>;

  return (
    <MarketProvider serumMarket={serumMarket}>
      <div className="flex flex-col items-stretch space-y-4 my-8">
        <TokenDisplay />
        <OverviewTable />
        <VaultDisplay />
        <EventQueueCard />
      </div>
    </MarketProvider>
  );
};

MarketPage.getLayout = (page: ReactNode) => getLayout(page, "Market");

export default MarketPage;
