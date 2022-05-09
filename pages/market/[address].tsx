import { PublicKey } from "@solana/web3.js";
import { useRouter } from "next/router";
import { ReactNode, useEffect, useState } from "react";
import { getLayout } from "../../components/layouts/SiteLayout";
import { programs } from "@metaplex/js";
import { useMetaplexMetadata, useSPLToken } from "../../hooks";
import { useSerumMarket } from "../../hooks/useSerumMarket";
import { tokenAtomicsToPrettyDecimal } from "../../utils/numerical";
import BN from "bn.js";
import { Mint } from "@solana/spl-token-2";
import { ExternalLinkIcon } from "@heroicons/react/outline";
import { EXPLORER_ADDRESS_BASE } from "../../utils/constants";

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

  const TableRow = ({
    label,
    value,
    link,
  }: {
    label: string;
    value: string;
    link?: string;
  }) => {
    return (
      <tr>
        <td className="text-sm font-medium p-4 md:px-8 whitespace-nowrap">
          {label}
        </td>
        <td className="text-sm font-light p-4 md:px-8 whitespace-nowrap flex justify-end items-center space-x-2">
          <p>{value}</p>
          {link ? (
            <a href={link} target="_blank" rel="noopener noreferrer">
              <ExternalLinkIcon className="h-4 w-4 cursor-pointer" />
            </a>
          ) : null}
        </td>
      </tr>
    );
  };

  const VaultCard = ({
    title,
    mint,
    depositAtomics,
    vaultAddress,
    metadata,
  }: {
    title: string;
    mint: Mint;
    depositAtomics: BN;
    vaultAddress: PublicKey;
    metadata: programs.metadata.Metadata | null;
  }) => {
    return (
      <div className="bg-cyan-800 rounded p-4 flex flex-col space-y-4">
        <h2 className="text-xl font-bold w-full">{title}</h2>
        <div className="flex flex-col">
          <h3 className="text-cyan-200 font-light text-sm">Balance</h3>
          <div className="flex space-x-2 items-end">
            <p className="text-4xl font-bold">
              {tokenAtomicsToPrettyDecimal(
                depositAtomics,
                mint.decimals
              ).toString()}{" "}
            </p>
            <p>{metadata ? metadata.data.data.symbol : "tokens"}</p>
          </div>
        </div>
        <div className="flex flex-col">
          <h3 className="text-cyan-200 font-light text-sm">Address</h3>
          {/* TODO: Add copy to clipboard feature */}
          <div className="flex items-center space-x-2">
            <p>{vaultAddress.toString().slice(0, 24)}...</p>
            <a
              href={`${EXPLORER_ADDRESS_BASE}/${vaultAddress.toString()}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLinkIcon className="h-4 w-4 cursor-pointer" />
            </a>
          </div>
        </div>
      </div>
    );
  };

  if (serumMarket) {
    return (
      <div className="flex flex-col items-stretch space-y-4 my-8">
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
                  link={`${EXPLORER_ADDRESS_BASE}${serumMarket.address.toString()}`}
                />
                <TableRow
                  label="Base Mint"
                  value={serumMarket.baseMintAddress.toString()}
                  link={`${EXPLORER_ADDRESS_BASE}${serumMarket.baseMintAddress.toString()}`}
                />
                <TableRow
                  label="Quote Mint"
                  value={serumMarket.quoteMintAddress.toString()}
                  link={`${EXPLORER_ADDRESS_BASE}${serumMarket.quoteMintAddress.toString()}`}
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
              metadata={baseMetadata}
            />
            <VaultCard
              title="Quote Vault"
              mint={quoteMint}
              depositAtomics={serumMarket.decoded.quoteDepositsTotal}
              vaultAddress={serumMarket.decoded.quoteVault}
              metadata={quoteMetadata}
            />
          </div>
        ) : null}
      </div>
    );
  }

  return <p>loading</p>;
};

MarketPage.getLayout = (page: ReactNode) => getLayout(page, "Market");

export default MarketPage;
