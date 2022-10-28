import { useWallet } from "@solana/wallet-adapter-react";
import OpenOrdersGrid from "./OpenOrdersGrid";
import { OrderList } from "./OrderList";
import { PlaceOrder } from "./PlaceOrder";
import { UserDetails } from "./UserDetails";

export const ActionCenter = () => {
  const wallet = useWallet();

  if (!wallet || !wallet.publicKey) return null;

  return (
    <div className="bg-slate-800 border border-slate-700 p-4 rounded-md flex flex-col space-y-4">
      <h2 className="card-header text-slate-200">Action Center</h2>
      <UserDetails />
      <PlaceOrder />
      <OrderList />
      <OpenOrdersGrid />
    </div>
  );
};
