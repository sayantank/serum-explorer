import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { programs } from "@metaplex/js";
import { Mint } from "@solana/spl-token-2";
import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import { EXPLORER_ADDRESS_BASE } from "../../../utils/constants";
import { tokenAtomicsToPrettyDecimal } from "../../../utils/numerical";

type VaultCardProps = {
  title: string;
  mint: Mint;
  depositAtomics: BN;
  vaultAddress: PublicKey;
  metadata: programs.metadata.Metadata | undefined;
};
export const VaultCard = ({
  title,
  mint,
  depositAtomics,
  vaultAddress,
  metadata,
}: VaultCardProps) => {
  return (
    <div className="bg-cyan-800 rounded p-4 flex flex-col space-y-4">
      <h2 className="card-header">{title}</h2>
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
            <ArrowTopRightOnSquareIcon className="h-4 w-4 cursor-pointer" />
          </a>
        </div>
      </div>
    </div>
  );
};
