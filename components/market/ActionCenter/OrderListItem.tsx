import { ExternalLinkIcon } from "@heroicons/react/outline";
import { Order } from "@project-serum/serum/lib/market";
import { useSolana } from "../../../context";
import { classNames, getExplorerAccountLink } from "../../../utils/general";

export const OrderListItem = ({ order }: { order: Order }) => {
  const { cluster } = useSolana();
  return (
    <tr>
      <td className="p-2">
        <div
          className={classNames(
            "mx-auto flex w-min rounded-md text-sm items-center justify-center py-1 px-2",
            order.side === "buy" ? "bg-green-500" : "bg-red-500"
          )}
        >
          {order.side === "buy" ? "Buy" : "Sell"}
        </div>
      </td>
      <td className="p-2">
        <p className="text-center">{order.size}</p>
      </td>
      <td className="p-2">
        <p className="text-center">{order.price}</p>
      </td>
      <td className="p-2">
        <div className="flex items-center justify-center space-x-2">
          <p className="text-center">
            {order.openOrdersAddress.toString().slice(0, 10)}...
          </p>
          <a
            href={getExplorerAccountLink(
              order.openOrdersAddress,
              cluster.network
            )}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLinkIcon className="h-4 w-4 cursor-pointer" />
          </a>
        </div>
      </td>
      <td className="p-2 flex">
        <button className="py-1 text-sm px-4 w-min bg-cyan-700 hover:bg-cyan-800 transition-colors rounded-md">
          Cancel
        </button>
      </td>
    </tr>
  );
  return (
    <div className="w-full flex p-3">
      <div className="flex-1">
        <div
          className={classNames(
            "flex w-min rounded-md text-sm items-center justify-center py-1 px-2",
            order.side === "buy" ? "bg-green-500" : "bg-red-500"
          )}
        >
          {order.side === "buy" ? "Buy" : "Sell"}
        </div>
      </div>
      <div className="flex-1"></div>
    </div>
  );
};
