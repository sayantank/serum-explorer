import { Market } from "@project-serum/serum";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useRouter } from "next/router";
import { ReactNode, useEffect, useState } from "react";
import { getLayout } from "../../components/layouts/SiteLayout";
import { useSerum } from "../../context/SerumContext";
import { useMetaplexMetadata, useSPLToken } from "../../hooks";
import { useSerumMarket } from "../../hooks/useSerumMarket";
import { tokenAtomicsToDecimal } from "../../utils/numerical";

const MarketPage = () => {
  const router = useRouter();
  const { address } = router.query;

  const { connection } = useConnection();
  const { programID } = useSerum();

  // TODO: handle loading
  const [pageLoading, setPageLoading] = useState(true);

  const { serumMarket } = useSerumMarket(address as string);

  const baseMetadata = useMetaplexMetadata(
    serumMarket?.baseMintAddress.toString()
  );
  const quoteMetadata = useMetaplexMetadata(
    serumMarket?.quoteMintAddress.toString()
  );

  const { mint: baseMint } = useSPLToken(serumMarket?.baseMintAddress);
  const { mint: quoteMint } = useSPLToken(serumMarket?.quoteMintAddress);

  useEffect(() => {
    if (serumMarket) console.log(serumMarket.decoded);
  }, [serumMarket]);

  const TableRow = ({ label, value }: { label: string; value: string }) => {
    return (
      <tr>
        <td className="text-sm font-medium p-4 md:px-8 whitespace-nowrap">
          {label}
        </td>
        <td className="text-sm font-light p-4 md:px-8 whitespace-nowrap flex justify-end">
          <p>{value}</p>
        </td>
      </tr>
    );
  };

  if (serumMarket) {
    return (
      <div className="flex flex-col items-stretch space-y-4">
        {baseMetadata && quoteMetadata ? (
          <div>
            <h3 className="text-sm font-light text-cyan-500">Tokens</h3>
            <div className="text-2xl font-bold">
              <p>
                {baseMetadata.data.data.symbol} /{" "}
                {quoteMetadata.data.data.symbol}
              </p>
            </div>
          </div>
        ) : null}
        <div className="bg-cyan-800 rounded w-full">
          <div className="w-full p-4 md:px-8 border-b-2 border-b-cyan-600">
            <h3 className="font-medium text-lg">Overview</h3>
          </div>
          <div className="w-full overflow-x-auto">
            <table className="table-auto w-full">
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
                {/* TODO: Refactor into separate UI */}
                {baseMint && quoteMint ? (
                  <>
                    <TableRow
                      label="Base Deposits"
                      value={tokenAtomicsToDecimal(
                        serumMarket.decoded.baseDepositsTotal,
                        baseMint.decimals
                      ).toString()}
                    />
                    <TableRow
                      label="Quote Deposits"
                      value={tokenAtomicsToDecimal(
                        serumMarket.decoded.quoteDepositsTotal,
                        quoteMint.decimals
                      ).toString()}
                    />
                  </>
                ) : null}
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
