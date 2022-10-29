/* eslint-disable react-hooks/exhaustive-deps */
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";
import {
  calculateAccountLength,
  EVENT_QUEUE_HEADER_SIZE,
  EVENT_SIZE,
  ORDERBOOK_HEADER_SIZE,
  ORDERBOOK_NODE_SIZE,
  REQUEST_QUEUE_HEADER_SIZE,
  REQUEST_SIZE,
} from "../utils/serum";

type useSerumMarketAccountLengthsProps = {
  eventQueueAddress?: PublicKey;
  requestQueueAddress?: PublicKey;
  bidsAddress?: PublicKey;
  asksAddress?: PublicKey;
};
export default function useSerumMarketAccountLengths({
  eventQueueAddress,
  requestQueueAddress,
  bidsAddress,
  asksAddress,
}: useSerumMarketAccountLengthsProps) {
  const { connection } = useConnection();

  const [eventQueueLength, setEventQueueLength] = useState(0);
  const [requestQueueLength, setRequestQueueLength] = useState(0);
  const [bidsLength, setBidsLength] = useState(0);
  const [asksLength, setAsksLength] = useState(0);

  useEffect(() => {
    let active = true;
    calculateRentExemption();
    return () => {
      active = false;
    };

    async function calculateRentExemption() {
      if (
        !eventQueueAddress ||
        !requestQueueAddress ||
        !bidsAddress ||
        !asksAddress
      )
        return;

      // setRentExemption(undefined) // this is optional
      const res = await Promise.all([
        connection.getAccountInfo(eventQueueAddress, "recent"),
        connection.getAccountInfo(requestQueueAddress, "recent"),
        connection.getAccountInfo(bidsAddress, "recent"),
        connection.getAccountInfo(asksAddress, "recent"),
      ]);
      if (!active) {
        return;
      }

      res[0] &&
        setEventQueueLength(
          calculateAccountLength(
            res[0].data.length,
            EVENT_QUEUE_HEADER_SIZE,
            EVENT_SIZE
          )
        );

      res[1] &&
        setRequestQueueLength(
          calculateAccountLength(
            res[1].data.length,
            REQUEST_QUEUE_HEADER_SIZE,
            REQUEST_SIZE
          )
        );

      res[2] &&
        setBidsLength(
          calculateAccountLength(
            res[2].data.length,
            ORDERBOOK_HEADER_SIZE,
            ORDERBOOK_NODE_SIZE
          )
        );

      res[3] &&
        setAsksLength(
          calculateAccountLength(
            res[3].data.length,
            ORDERBOOK_HEADER_SIZE,
            ORDERBOOK_NODE_SIZE
          )
        );
    }
  }, [
    eventQueueAddress?.toString(),
    requestQueueAddress?.toBase58(),
    bidsAddress?.toBase58(),
    asksAddress?.toBase58(),
    connection.rpcEndpoint,
  ]);

  return {
    eventQueueLength,
    requestQueueLength,
    bidsLength,
    asksLength,
  };
}
