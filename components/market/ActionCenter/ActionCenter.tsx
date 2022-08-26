import { useWallet } from "@solana/wallet-adapter-react";
import { useMarket } from "../../../context/market";
import { useTokenBalance } from "../../../hooks";
import OpenOrdersGrid from "./OpenOrdersGrid";
import { OrderList } from "./OrderList";
import { PlaceOrder } from "./PlaceOrder";
import { UserDetails } from "./UserDetails";

export const ActionCenter = () => {
  const wallet = useWallet();

  if (!wallet || !wallet.publicKey) return null;

  return (
    <div className="bg-cyan-800 p-4 rounded-md flex flex-col space-y-4">
      <h2 className="card-header">Action Center</h2>
      <UserDetails />
      <PlaceOrder />
      <OrderList />
      <OpenOrdersGrid />
    </div>
  );
};
