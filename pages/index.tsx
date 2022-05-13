import Link from "next/link";
import { useRouter } from "next/router";
import { ReactNode, useEffect } from "react";
import { getLayout } from "../components/layouts/SiteLayout";
import { SerumMarketInfo, useSerumMarkets } from "../hooks/useSerumMarkets";

const Home = () => {
  const router = useRouter();
  const { serumMarkets, loading } = useSerumMarkets();

  useEffect(() => {
    console.log(router.query);
  }, [router.query]);

  const MarketListItem = ({ market }: { market: SerumMarketInfo }) => {
    return (
      <div className="bg-cyan-800 hover:bg-cyan-700 transition-colors p-4 rounded flex items-center justify-between">
        <div className="flex flex-col">
          <h3 className="text-xs text-cyan-400">Address</h3>
          <p className="font-medium">
            {market.address.toString().slice(0, 12)}...
          </p>
        </div>
        {market.baseSymbol && market.quoteSymbol ? (
          <div className="flex flex-col items-end">
            <h3 className="text-xs text-cyan-400">Tokens</h3>
            <p className="font-medium">
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
      {serumMarkets ? (
        <div className="flex flex-col space-y-2">
          <h2 className="text-2xl font-semibold">Markets</h2>
          <ul className="flex flex-col space-y-3">
            {serumMarkets?.map((market) => (
              <li key={market.address.toString()} className="cursor-pointer">
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
        </div>
      ) : null}
    </div>
  );
};

Home.getLayout = (page: ReactNode) => getLayout(page, "Home");

export default Home;
