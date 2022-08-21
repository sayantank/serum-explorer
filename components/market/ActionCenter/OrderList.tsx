import { useEffect } from "react";
import { useMarket } from "../../../context/market";
import { OrderListItem } from "./OrderListItem";

export const OrderList = () => {
  const { orders } = useMarket();

  if (!orders.data) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-lg">Orders</h3>
      <div className="w-full overflow-x-auto">
        <table className="table-auto w-full bg-cyan-900 rounded-md">
          <thead className="border-b border-b-cyan-800">
            <tr>
              <th className="py-2 px-3 font-light text-sm text-cyan-500">
                Side
              </th>
              <th className="py-2 px-3 font-light text-sm text-cyan-500">
                Size
              </th>
              <th className="py-2 px-3 font-light text-sm text-cyan-500">
                Prize
              </th>
              <th className="py-2 px-3 font-light text-sm text-cyan-500">
                Open Order
              </th>
              <th className="py-2 px-3 font-light text-sm text-cyan-500"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cyan-500">
            {orders.data.map((order) => (
              <OrderListItem key={order.orderId.toString()} order={order} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
