import { useMarket } from "../../../context/market";
import { VaultCard } from "./VaultCard";

export const VaultDisplay = () => {
  const { baseMint, quoteMint, serumMarket, baseMetadata, quoteMetadata } =
    useMarket();

  if (!baseMint || !quoteMint || !serumMarket) {
    return null;
  }

  return (
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
  );
};
