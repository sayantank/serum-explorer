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
import BN from "bn.js";
import { Mint } from "@solana/spl-token-2";

const MarketPage = () => {
  const router = useRouter();
  const { address } = router.query;

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

  const VaultCard = ({
    title,
    mint,
    depositAtomics,
    vaultAddress,
  }: {
    title: string;
    mint: Mint;
    depositAtomics: BN;
    vaultAddress: PublicKey;
  }) => {
    return (
      <div className="bg-cyan-800 rounded p-4 flex flex-col space-y-4">
        <h2 className="text-xl font-bold w-full">{title}</h2>
        <div className="flex flex-col">
          <h3 className="text-cyan-200 font-light text-sm">Balance</h3>
          <div className="flex space-x-2 items-end">
            <p className="text-4xl font-bold">
              {tokenAtomicsToDecimal(depositAtomics, mint.decimals).toString()}{" "}
            </p>
            <p>{baseMetadata ? baseMetadata.data.data.symbol : "tokens"}</p>
          </div>
        </div>
        <div className="flex flex-col">
          <h3 className="text-cyan-200 font-light text-sm">Address</h3>
          {/* TODO: Add copy to clipboard feature */}
          <p>{vaultAddress.toString().slice(0, 24)}...</p>
        </div>
      </div>
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
              </tbody>
            </table>
          </div>
        </div>
        {baseMint && quoteMint ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <VaultCard
              title="Base Vault"
              mint={baseMint}
              depositAtomics={serumMarket.decoded.baseDepositsTotal}
              vaultAddress={serumMarket.decoded.baseVault}
            />
            <VaultCard
              title="Quote Vault"
              mint={quoteMint}
              depositAtomics={serumMarket.decoded.quoteDepositsTotal}
              vaultAddress={serumMarket.decoded.quoteVault}
            />
          </div>
        ) : null}
      </div>
    );
  } else return <h1>hello</h1>;
};

MarketPage.getLayout = (page: ReactNode) => getLayout(page, "Market");

export default MarketPage;
