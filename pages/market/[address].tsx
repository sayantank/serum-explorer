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

  // TODO: handle loading
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

  const TableRow = ({ label, value }: { label: string; value: string }) => {
    return (
      <tr>
        <td className="text-sm font-medium p-4 whitespace-nowrap">{label}</td>
        <td className="text-sm font-light p-4 whitespace-nowrap">{value}</td>
      </tr>
    );
  };

  if (serumMarket) {
    return (
      <div className="flex flex-col items-stretch space-y-4">
        <div>
          <h3 className="text-sm font-light text-cyan-500">Tokens</h3>
          <div className="text-2xl font-bold">
            {baseMetadata && quoteMetadata ? (
              <p>
                {baseMetadata.data.data.symbol} /{" "}
                {quoteMetadata.data.data.symbol}
              </p>
            ) : null}
          </div>
        </div>
        <div className="bg-cyan-800 rounded w-full">
          <div className="w-full p-4 border-b-2 border-b-cyan-600">
            <h3 className="font-medium text-lg">Overview</h3>
          </div>
          <div className="w-full overflow-x-auto">
            <table className="table-auto">
              <tbody className="divide-y divide-cyan-600">
                <TableRow
                  label="Market Address"
                  value={serumMarket.address.toString()}
                />
                <TableRow
                  label="Base Mint"
                  value={serumMarket.baseMintAddress.toString()}
                />
                <TableRow
                  label="Quote Mint"
                  value={serumMarket.quoteMintAddress.toString()}
                />
                <TableRow
                  label="Tick Size"
                  value={serumMarket.tickSize.toString()}
                />
                <TableRow
                  label="Min. Order Size"
                  value={serumMarket.minOrderSize.toString()}
                />
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  } else return <h1>hello</h1>;
};

MarketPage.getLayout = (page: ReactNode) => getLayout(page, "Market");

export default MarketPage;
