import { useConnection } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";

export default function useRentExemption(accountSize?: number) {
  const { connection } = useConnection();

  const [rentExemption, setRentExemption] = useState(0);

  useEffect(() => {
    let active = true;

    calculateRentExemption();
    return () => {
      active = false;
    };

    async function calculateRentExemption() {
      if (!accountSize) {
        setRentExemption(0);
        return;
      }
      // setRentExemption(undefined) // this is optional
      const res = await connection.getMinimumBalanceForRentExemption(
        accountSize
      );
      if (!active) {
        return;
      }
      setRentExemption(res);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountSize, connection.rpcEndpoint]);

  return rentExemption;
}
