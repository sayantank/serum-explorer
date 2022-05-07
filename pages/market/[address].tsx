import { Market } from "@project-serum/serum";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useRouter } from "next/router";
import { ReactNode, useEffect, useState } from "react";
import { getLayout } from "../../components/layouts/SiteLayout";
import { useSerum } from "../../context/SerumContext";
import { useMetaplexMetadata } from "../../hooks";

const MarketPage = () => {
  const router = useRouter();
  const { address } = router.query;

  const { connection } = useConnection();
  const { programID } = useSerum();

  const [pageLoading, setPageLoading] = useState(true);
  const [serumMarket, setSerumMarket] = useState<Market | null>(null);

  const baseMetadata = useMetaplexMetadata(
    serumMarket?.baseMintAddress.toString()
  );
  const quoteMetadata = useMetaplexMetadata(
    serumMarket?.quoteMintAddress.toString()
  );

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
    <div>
      <div>
        <h3 className="text-sm font-light text-cyan-500">Tokens</h3>
        <div className="token-icons flex flex-col text-2xl font-bold">
          {baseMetadata ? <p>{baseMetadata.data.data.name}</p> : null}
          {quoteMetadata ? <p>{quoteMetadata.data.data.name}</p> : null}
        </div>
      </div>
    </div>
  );
};

MarketPage.getLayout = (page: ReactNode) => getLayout(page, "Market");

export default MarketPage;
