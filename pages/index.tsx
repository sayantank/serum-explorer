import Link from "next/link";
import { useRouter } from "next/router";
import { ReactNode, useEffect, useState } from "react";
import { PaginationButton } from "../components/common/Pagination/PaginationButton";
import { SkeletonBox } from "../components/common/Skeleton";
import { getLayout } from "../components/layouts/SiteLayout";
import { usePagination } from "../hooks/usePagination";
import { SerumMarketInfo, useSerumMarkets } from "../hooks/useSerumMarkets";

const Home = () => {
  const router = useRouter();
  const { serumMarkets, loading } = useSerumMarkets();

  const [filterString, setFilterString] = useState("");

  const {
    pageData: pageMarkets,
    totalPages,
    pageNumber,
    prevPage,
    nextPage,
  } = usePagination(serumMarkets, 5, filterString);

  const MarketListItem = ({ market }: { market: SerumMarketInfo }) => {
    return (
      <div className="bg-cyan-800 hover:bg-cyan-600 transition-colors py-2 px-4 rounded flex items-center justify-between">
        <div className="flex flex-col">
          <h3 className="text-xs text-cyan-400">Address</h3>
          <p className="font-medium text-sm ">
            {market.address.toString().slice(0, 12)}...
          </p>
        </div>
        {market.baseSymbol && market.quoteSymbol ? (
          <div className="flex flex-col items-end">
            <h3 className="text-xs text-cyan-400">Tokens</h3>
            <p className="font-medium text-sm">
              {market.baseSymbol}/{market.quoteSymbol}
            </p>
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <div className="flex flex-col space-y-4 items-stretch">
      {/* serumMarkets is truthy only on devnet/localnet */}
      <div className="flex flex-col space-y-2">
        <div className="bg-cyan-700 p-4 rounded flex flex-col space-y-4">
          <h2 className="text-2xl font-semibold">Markets</h2>

          {loading ? (
            <div className="flex flex-col space-y-2">
              <SkeletonBox />
              <SkeletonBox />
              <SkeletonBox />
              <SkeletonBox />
              <SkeletonBox />
              <SkeletonBox />
              <SkeletonBox />
            </div>
          ) : pageMarkets ? (
            <>
              <input
                type="text"
                value={filterString}
                onChange={(e) => setFilterString(e.target.value)}
                placeholder="Search by address or token symbols"
                className="w-full p-2 rounded border border-cyan-300 bg-transparent focus:outline-none text-sm"
              />
              <ul className="flex flex-col space-y-3">
                {pageMarkets.map((market) => (
                  <li
                    key={market.address.toString()}
                    className="cursor-pointer"
                  >
                    <Link
                      passHref
                      href={{
                        pathname: `/market/${market.address.toString()}`,
                        query: router.query,
                      }}
                    >
                      <a>
                        <MarketListItem market={market} />
                      </a>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between">
                <PaginationButton type="prev" onClick={prevPage} />
                <p className="text-medium">{`${pageNumber}/${totalPages}`}</p>
                <PaginationButton type="next" onClick={nextPage} />
              </div>
            </>
          ) : (
            <div className="text-sm font-light text-center">
              Currently, Markets are only displayed for{" "}
              <span className="font-medium">localnet</span> and{" "}
              <span className="font-medium">Serum Dex V3</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

Home.getLayout = (page: ReactNode) => getLayout(page, "Home");

export default Home;
