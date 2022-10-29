import { useMemo } from "react";
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

  const eventQueueRent = useRentExemption(totalEventQueueSize);
  const requestQueueRent = useRentExemption(totalRequestQueueSize);
  const orderbookRent = useRentExemption(totalOrderbookSize);

  return {
    marketRent: eventQueueRent + requestQueueRent + 2 * orderbookRent,
    totalEventQueueSize,
    totalRequestQueueSize,
    totalOrderbookSize,
  };
}
