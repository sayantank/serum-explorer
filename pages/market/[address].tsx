import { Market } from "@project-serum/serum";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useRouter } from "next/router";
import { ReactNode, useEffect, useState } from "react";
import { getLayout } from "../../components/layouts/SiteLayout";
import { useSerum } from "../../context/SerumContext";

const MarketPage = () => {
  const router = useRouter();
  const { address } = router.query;

  const { connection } = useConnection();
  const { programID } = useSerum();

  const [pageLoading, setPageLoading] = useState(true);
  const [serumMarket, setSerumMarket] = useState<Market | null>(null);

  useEffect(() => {
    const loadPage = async () => {
      try {
        const _serumMarket = await Market.load(
          connection,
          new PublicKey(address as string),
          { commitment: "confirmed" },
          programID
        );
        setSerumMarket(_serumMarket);
      } catch (e) {
        console.error(e);
        setSerumMarket(null);
      } finally {
        setPageLoading(false);
      }
    };
    loadPage();
  }, [address, connection, programID]);

  return (
    <h1>{pageLoading ? "loading" : serumMarket?.baseMintAddress.toString()}</h1>
  );
};

MarketPage.getLayout = (page: ReactNode) => getLayout(page, "Market");

export default MarketPage;
