/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ReactNode } from "react";
import { getLayout } from "../components/layouts/SiteLayout";
import { useSerumMarkets } from "../hooks/useSerumMarkets";
import { useSerumStats } from "../hooks/useSerumStats";
import { classNames } from "../utils/general";
import { prettifyDecimal } from "../utils/numerical";

const Home = () => {
  const { serumMarkets, loading: serumMarketsLoading } = useSerumMarkets();

  const { stats, loading } = useSerumStats();

  // const [filterString, setFilterString] = useState("");

  // const {
  //   pageData: pageMarkets,
  //   totalPages,
  //   pageNumber,
  //   prevPage,
  //   nextPage,
  // } = usePagination(serumMarkets, 5, filterString, serumMarketFilter);

  // const MarketListItem = ({ market }: { market: SerumMarketInfo }) => {
  //   return (
  //     <div className="bg-cyan-800 hover:bg-cyan-600 transition-colors py-2 px-4 rounded flex items-center justify-between">
  //       <div className="flex flex-col">
  //         <h3 className="text-xs text-cyan-400">Address</h3>
  //         <p className="font-medium text-sm ">
  //           {market.address.toString().slice(0, 12)}...
  //         </p>
  //       </div>
  //       {market.baseSymbol && market.quoteSymbol ? (
  //         <div className="flex flex-col items-end">
  //           <h3 className="text-xs text-cyan-400">Tokens</h3>
  //           <p className="font-medium text-sm">
  //             {market.baseSymbol}/{market.quoteSymbol}
  //           </p>
  //         </div>
  //       ) : null}
  //     </div>
  //   );
  // };

  const StatBlock = ({
    children,
    loading,
    height,
  }: {
    children: React.ReactNode;
    loading: boolean;
    height?: number;
  }) => {
    return !loading ? (
      <div
        className={classNames(
          "bg-slate-800 py-2 px-3 rounded-md space-y-1 border border-slate-700"
        )}
      >
        {children}
      </div>
    ) : (
      <div
        className={classNames(
          "animate-pulse bg-slate-800 py-2 px-3 rounded-md space-y-1 border border-slate-700",
          height ? `h-${height}` : "h-20"
        )}
      />
    );
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
        <StatBlock loading={loading}>
          <div>
            <p className="text-slate-300 text-sm">TVL</p>
          </div>
          <div>
            <p className="text-2xl font-medium text-slate-200">
              {prettifyDecimal(stats?.tvl, 2)}
            </p>
          </div>
        </StatBlock>
        <StatBlock loading={loading}>
          <div>
            <p className="text-slate-300 text-sm">Total Vol. 1d</p>
          </div>
          <div>
            <p className="text-2xl font-medium text-slate-200">
              {prettifyDecimal(stats?.totalVol1d, 2)}
            </p>
          </div>
        </StatBlock>
        <StatBlock loading={serumMarketsLoading}>
          <div>
            <p className="text-slate-300 text-sm"># of markets</p>
          </div>
          {serumMarkets ? (
            <div>
              <p className="text-2xl font-medium text-slate-200">
                {prettifyDecimal(serumMarkets!.length, 2)}
              </p>
            </div>
          ) : null}
        </StatBlock>
      </div>
    </div>
  );
};

Home.getLayout = (page: ReactNode) => getLayout(page, "Home");

export default Home;
