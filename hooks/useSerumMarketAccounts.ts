import { useConnection } from "@solana/wallet-adapter-react";
import { useEffect, useMemo, useState } from "react";
import {
  calculateTotalAccountSize,
  EVENT_QUEUE_HEADER_SIZE,
  EVENT_SIZE,
  ORDERBOOK_HEADER_SIZE,
  ORDERBOOK_NODE_SIZE,
  REQUEST_QUEUE_HEADER_SIZE,
  REQUEST_SIZE,
} from "../utils/serum";

type useSerumMarketAccountsProps = {
  eventQueueLength: number;
  requestQueueLength: number;
  orderbookLength: number;
};
export default function useSerumMarketAccounts({
  eventQueueLength,
  requestQueueLength,
  orderbookLength,
}: useSerumMarketAccountsProps) {
  const { connection } = useConnection();

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

  const [rentExemption, setRentExemption] = useState(0);
  useEffect(() => {
    let active = true;
    calculateRentExemption();
    return () => {
      active = false;
    };

    async function calculateRentExemption() {
      // setRentExemption(undefined) // this is optional
      const res = await Promise.all([
        connection.getMinimumBalanceForRentExemption(totalEventQueueSize),
        connection.getMinimumBalanceForRentExemption(totalRequestQueueSize),
        connection.getMinimumBalanceForRentExemption(totalOrderbookSize),
      ]);
      if (!active) {
        return;
      }
      setRentExemption(res[0] + res[1] + 2 * res[2]); // eq + rq + 2 * ob
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    totalEventQueueSize,
    totalRequestQueueSize,
    totalOrderbookSize,
    connection.rpcEndpoint,
  ]);

  return {
    rentExemption,
    totalEventQueueSize,
    totalRequestQueueSize,
    totalOrderbookSize,
  };
}
