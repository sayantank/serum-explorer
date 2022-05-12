import Link from "next/link";
import { useRouter } from "next/router";
import { ReactNode } from "react";
import { getLayout } from "../components/layouts/SiteLayout";
import { useSerumMarkets } from "../hooks/useSerumMarkets";

const Home = () => {
  const router = useRouter();
  const { serumMarkets } = useSerumMarkets();

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
                  href={{
                    pathname: `/market/${market.address.toString()}`,
                    query: router.query,
                  }}
                >
                  <div className="bg-cyan-800 hover:bg-cyan-700 transition-colors py-2 md:py-4 px-4 rounded flex items-center">
                    <div className="flex flex-col">
                      <h3 className="text-xs text-cyan-400">Address</h3>
                      <p className="font-medium">
                        {market.address.toString().slice(0, 12)}...
                      </p>
                    </div>
                  </div>
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
