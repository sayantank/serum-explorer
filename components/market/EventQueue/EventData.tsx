import { Event } from "@project-serum/serum/lib/queue";
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
  const { baseMint, quoteMint, baseMetadata, quoteMetadata, loading } =
    useMarket();

  const getType = (eventFlags: EventFlags) => {
    if (eventFlags.fill) {
      return "Fill";
    } else if (eventFlags.out) {
      return "Out";
    } else {
      return "Unknown";
    }
  };

  const getSide = (eventFlags: EventFlags) => {
    if (eventFlags.bid) {
      return "Bid";
    } else return "Ask";
  };

  // TODO: Loading indicator
  if (loading) {
    return <p>Loading...</p>;
  }

  if (!event || !baseMint || !quoteMint) {
    return (
      <div>
        <p>Oops! Something went wrong :(</p>
      </div>
    );
  }

  return (
    <div>
      <DataTable>
        <DataTableRow label="Type" value={getType(event.eventFlags)} />
        <DataTableRow label="Side" value={getSide(event.eventFlags)} />
        <DataTableRow label="Order ID" value={event.orderId.toString()} />
        <DataTableRow
          label={`Open Orders`}
          value={event.openOrders.toString()}
        />
        <DataTableRow label={`Fee Tier`} value={event.feeTier.toString()} />
        <DataTableRow
          label={`${
            event.eventFlags.bid
              ? quoteMetadata
                ? quoteMetadata.data.data.symbol
                : "Quote Tokens"
              : baseMetadata
              ? baseMetadata.data.data.symbol
              : "Base Tokens"
          } Paid`}
          value={tokenAtomicsToPrettyDecimal(
            event.nativeQuantityPaid,
            event.eventFlags.bid ? quoteMint.decimals : baseMint.decimals
          )}
        />
        <DataTableRow
          label={`${
            event.eventFlags.bid
              ? baseMetadata
                ? baseMetadata.data.data.symbol
                : "Quote Tokens"
              : quoteMetadata
              ? quoteMetadata.data.data.symbol
              : "Base Tokens"
          }  Received`}
          value={tokenAtomicsToPrettyDecimal(
            event.nativeQuantityReleased,
            event.eventFlags.bid ? baseMint.decimals : quoteMint.decimals
          )}
        />
      </DataTable>
    </div>
  );
};
