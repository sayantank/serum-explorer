import { useEffect } from "react";
import { useMarket } from "../../../context/market";
import OpenOrderCard from "./OpenOrderCard";

const OpenOrdersGrid = () => {
  const { openOrders } = useMarket();

  return (
    <div className="space-y-2">
      <h3 className="text-lg">Open Order Accounts</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {openOrders.data &&
          openOrders.data.map((oo) => (
            <OpenOrderCard key={oo.address.toBase58()} openOrder={oo} />
          ))}
      </div>
    </div>
  );
};

export default OpenOrdersGrid;
