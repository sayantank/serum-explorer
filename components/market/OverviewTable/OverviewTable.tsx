import { useMarket } from "../../../context/market";
import { EXPLORER_ADDRESS_BASE } from "../../../utils/constants";
import { DataTable, DataTableRow } from "../../common/DataTable";

export const OverviewTable = () => {
  const { serumMarket } = useMarket();

  if (!serumMarket) {
    return null;
  }

  return (
    <div className="bg-cyan-800 rounded w-full">
      <div className="w-full p-4 md:px-8 border-b-2 border-b-cyan-600">
        <h3 className="font-medium text-lg">Overview</h3>
      </div>
      <DataTable>
        <DataTableRow
          label="Market Address"
          value={serumMarket.address.toString()}
          link={`${EXPLORER_ADDRESS_BASE}${serumMarket.address.toString()}`}
        />
        <DataTableRow
          label="Base Mint"
          value={serumMarket.baseMintAddress.toString()}
          link={`${EXPLORER_ADDRESS_BASE}${serumMarket.baseMintAddress.toString()}`}
        />
        <DataTableRow
          label="Quote Mint"
          value={serumMarket.quoteMintAddress.toString()}
          link={`${EXPLORER_ADDRESS_BASE}${serumMarket.quoteMintAddress.toString()}`}
        />
        <DataTableRow
          label="Tick Size"
          value={serumMarket.tickSize.toString()}
        />
        <DataTableRow
          label="Min. Order Size"
          value={serumMarket.minOrderSize.toString()}
        />
      </DataTable>
    </div>
  );
};
