import { Market } from "@project-serum/serum";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { FormEvent, ReactNode, useState } from "react";
import { ProgramSelector } from "../components/common/ProgramSelector";
import { getLayout } from "../components/layouts/SiteLayout";
import { useSerum } from "../context/SerumContext";

const Home = () => {
  const router = useRouter();

  const [marketAddress, setMarketAddress] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    router.push(`/market/${marketAddress}`);
  };

  return (
    <div className="flex flex-col space-y-4 items-stretch">
      <ProgramSelector />
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
