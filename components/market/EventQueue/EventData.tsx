import { Event } from "@project-serum/serum/lib/queue";
import { useEffect } from "react";
import { useMarket } from "../../../context/market";
import { tokenAtomicsToPrettyDecimal } from "../../../utils/numerical";
import { DataTable, DataTableRow } from "../../common/DataTable";

type EventDataProps = {
  event: Event | undefined;
};

export type EventFlags = {
  fill: boolean;
  out: boolean;
  bid: boolean;
  maker: boolean;
};

export const EventData = ({ event }: EventDataProps) => {
  const { baseMint, quoteMint, baseMetadata, quoteMetadata } = useMarket();

  const getType = (eventFlags: EventFlags) => {
    if (eventFlags.fill) {
      return "Fill";
    } else if (eventFlags.out) {
      return "Out";
    } else if (eventFlags.bid) {
      return "Bid";
    } else if (eventFlags.maker) {
      return "Maker";
    } else {
      return "Unknown";
    }
  };

  // TODO: Loading indicator
  if (!event || !baseMint || !quoteMint) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <DataTable>
        <DataTableRow label="Type" value={getType(event.eventFlags)} />
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
