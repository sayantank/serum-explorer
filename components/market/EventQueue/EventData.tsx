import { Event } from "@project-serum/serum/lib/queue";
import { useEffect } from "react";
import { useMarket } from "../../../context/market";
import { tokenAtomicsToPrettyDecimal } from "../../../utils/numerical";
import { DataTable, DataTableRow } from "../../common/DataTable";

type EventDataProps = {
  event: Event | undefined;
};

export const EventData = ({ event }: EventDataProps) => {
  const { baseMint, quoteMint, baseMetadata, quoteMetadata } = useMarket();

  // TODO: Loading indicator
  if (!event || !baseMint || !quoteMint) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <DataTable>
        <DataTableRow label="Order ID" value={event.orderId.toString()} />
        <DataTableRow label={`Fee Tier`} value={event.feeTier.toString()} />
        <DataTableRow
          label={`${
            quoteMetadata ? quoteMetadata.data.data.symbol : "Quote Tokens"
          } Paid`}
          value={tokenAtomicsToPrettyDecimal(
            event.nativeQuantityPaid,
            quoteMint.decimals
          )}
        />
        <DataTableRow
          label={`${
            baseMetadata ? baseMetadata.data.data.symbol : "Base Tokens"
          } Received`}
          value={tokenAtomicsToPrettyDecimal(
            event.nativeQuantityReleased,
            baseMint.decimals
          )}
        />
      </DataTable>
    </div>
  );
};
