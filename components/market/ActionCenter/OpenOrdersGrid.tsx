import { useEffect } from "react";
import { useMarket } from "../../../context/market";
import OpenOrderCard from "./OpenOrderCard";

const OpenOrdersGrid = () => {
  const { openOrders } = useMarket();

  if (!openOrders.data) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-lg">Open Order Accounts</h3>
      {openOrders.data?.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {openOrders.data &&
            openOrders.data.map((oo) => (
              <OpenOrderCard key={oo.address.toBase58()} openOrder={oo} />
            ))}
        </div>
      ) : (
        <div className="w-full flex items-center justify-center bg-cyan-900 p-2 rounded-md text-sm text-cyan-600">
          No OpenOrder accounts found
        </div>
      )}
    </div>
  );
};

export default OpenOrdersGrid;
