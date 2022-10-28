import { useSolana } from "../../../context";
import { useMarket } from "../../../context/market";
import { getExplorerAccountLink } from "../../../utils/general";
import { DataTable, DataTableRow } from "../../common/DataTable";

export const OverviewTable = () => {
  const { cluster } = useSolana();
  const { serumMarket } = useMarket();

  if (!serumMarket) {
    return null;
  }

  return (
    <div className="bg-slate-800 rounded w-full border border-slate-700">
      <div className="w-full p-4 md:px-8 border-b-2 border-b-slate-700">
        <h3 className="font-medium text-lg text-slate-200">Overview</h3>
      </div>
      <DataTable>
        <DataTableRow
          label="Market Address"
          value={serumMarket.address.toString()}
          link={getExplorerAccountLink(serumMarket.address, cluster.network)}
        />
        <DataTableRow
          label="Base Mint"
          value={serumMarket.baseMintAddress.toString()}
          link={getExplorerAccountLink(
            serumMarket.baseMintAddress,
            cluster.network
          )}
        />
        <DataTableRow
          label="Quote Mint"
          value={serumMarket.quoteMintAddress.toString()}
          link={getExplorerAccountLink(
            serumMarket.quoteMintAddress,
            cluster.network
          )}
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
