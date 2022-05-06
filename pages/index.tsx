import { Market } from "@project-serum/serum";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import type { NextPage } from "next";
import { FormEvent, ReactNode, useState } from "react";
import { getLayout } from "../components/layouts/SiteLayout";

const SERUM_DEX_V3 = "9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin";

const Home = () => {
  const { connection } = useConnection();

  const [programID, setProgramID] = useState("");
  const [marketAddress, setMarketAddress] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const serumMarket = await Market.load(
      connection,
      new PublicKey(marketAddress),
      { commitment: "confirmed" },
      new PublicKey(SERUM_DEX_V3)
    );
    console.log(serumMarket.decoded);
  };

  return (
    <div className="flex flex-col space-y-4 items-stretch">
      <form className="flex flex-col space-y-2" onSubmit={handleSubmit}>
        <input
          type="text"
          value={marketAddress}
          onChange={(e) => setMarketAddress(e.target.value)}
          placeholder="Market Address"
          className="px-4 py-2 w-full rounded bg-transparent border-2 border-cyan-500 focus:outline-none"
        />
        <button
          type="submit"
          className="px-4 py-2 w-full rounded bg-cyan-500 hover:bg-cyan-600 text-white"
        >
          Search
        </button>
      </form>
    </div>
  );
};

Home.getLayout = (page: ReactNode) => getLayout(page, "Home");

export default Home;
