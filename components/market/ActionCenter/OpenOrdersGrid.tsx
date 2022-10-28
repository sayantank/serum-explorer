import { useMarket } from "../../../context/market";
import OpenOrderCard from "./OpenOrderCard";

const OpenOrdersGrid = () => {
  const { openOrders } = useMarket();

  if (!openOrders.data) return null;

  return (
    <div className="space-y-3 p-3 rounded-md bg-slate-700">
      <h3 className="text-lg text-slate-200">Open Order Accounts</h3>
      {openOrders.data?.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {openOrders.data &&
            openOrders.data.map((oo) => (
              <OpenOrderCard key={oo.address.toBase58()} openOrder={oo} />
            ))}
        </div>
      ) : (
        <div className="w-full flex items-center justify-center p-2 rounded-md text-sm text-slate-500">
          No OpenOrder accounts found
        </div>
      )}
    </div>
  );
};

export default OpenOrdersGrid;
