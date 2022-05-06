import { PublicKey } from "@solana/web3.js";
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";

const SERUM_DEX_V3 = "9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin";

type SerumContextType = {
  programID: PublicKey;
  setProgramID: Dispatch<SetStateAction<PublicKey>>;
};

type SerumProviderProps = {
  children: ReactNode;
};

const SerumContext = createContext<SerumContextType | null>(null);

export const SerumProvider = ({ children }: SerumProviderProps) => {
  const [programID, setProgramID] = useState(new PublicKey(SERUM_DEX_V3));
  return (
    <SerumContext.Provider value={{ programID, setProgramID }}>
      {children}
    </SerumContext.Provider>
  );
};

export const useSerum = () => {
  const serum = useContext(SerumContext);

  if (!serum) {
    throw new Error("Make sure to wrap your component with SerumProvider");
  }

  return serum;
};
