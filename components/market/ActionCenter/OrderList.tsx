import { useMarket } from "../../../context/market";
import { OrderListItem } from "./OrderListItem";

export const OrderList = () => {
  const { orders } = useMarket();

  if (!orders.data) return null;

  return (
    <div className="space-y-2 bg-slate-700 p-3 rounded-md">
      <h3 className="text-lg text-slate-200">Orders</h3>
      {orders.data.length > 0 ? (
        <div className="w-full overflow-x-auto">
          <table className="table-auto w-full bg-slate-600 rounded-md">
            <thead className="border-b border-b-slate-700">
              <tr>
                <th className="input-label font-normal py-2 px-3">Side</th>
                <th className="input-label font-normal py-2 px-3">Size</th>
                <th className="input-label font-normal py-2 px-3">Prize</th>
                <th className="input-label font-normal py-2 px-3">
                  Open Order
                </th>
                <th className="input-label font-normal py-2 px-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {orders.data.map((order) => (
                <OrderListItem key={order.orderId.toString()} order={order} />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="w-full flex items-center justify-center p-2 rounded-md text-sm text-slate-500">
          No Orders found
        </div>
      )}
    </div>
  );
};
