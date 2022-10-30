import { Market } from "@project-serum/serum";
import { useMemo } from "react";
import { useSerum } from "../context";
import {
  calculateTotalAccountSize,
  EVENT_QUEUE_HEADER_SIZE,
  EVENT_SIZE,
  ORDERBOOK_HEADER_SIZE,
  ORDERBOOK_NODE_SIZE,
  REQUEST_QUEUE_HEADER_SIZE,
  REQUEST_SIZE,
} from "../utils/serum";
import useRentExemption from "./useRentExemption";

type useSerumMarketAccountSizesProps = {
  eventQueueLength: number;
  requestQueueLength: number;
  orderbookLength: number;
};
export default function useSerumMarketAccountSizes({
  eventQueueLength,
  requestQueueLength,
  orderbookLength,
}: useSerumMarketAccountSizesProps) {
  const { programID } = useSerum();

  const totalEventQueueSize = useMemo(
    () =>
      calculateTotalAccountSize(
        eventQueueLength,
        EVENT_QUEUE_HEADER_SIZE,
        EVENT_SIZE
      ),
    [eventQueueLength]
  );

  const totalRequestQueueSize = useMemo(
    () =>
      calculateTotalAccountSize(
        requestQueueLength,
        REQUEST_QUEUE_HEADER_SIZE,
        REQUEST_SIZE
      ),
    [requestQueueLength]
  );

  const totalOrderbookSize = useMemo(
    () =>
      calculateTotalAccountSize(
        orderbookLength,
        ORDERBOOK_HEADER_SIZE,
        ORDERBOOK_NODE_SIZE
      ),
    [orderbookLength]
  );

  const marketAccountRent = useRentExemption(Market.getLayout(programID).span);
  const eventQueueRent = useRentExemption(totalEventQueueSize);
  const requestQueueRent = useRentExemption(totalRequestQueueSize);
  const orderbookRent = useRentExemption(totalOrderbookSize);

  return {
    marketRent:
      marketAccountRent + eventQueueRent + requestQueueRent + 2 * orderbookRent,
    totalEventQueueSize,
    totalRequestQueueSize,
    totalOrderbookSize,
  };
}
