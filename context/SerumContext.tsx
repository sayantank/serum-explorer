import { PublicKey } from "@solana/web3.js";
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";

const PROGRAM_LOCAL_STORAGE_KEY = "program-serum-explorer";

const SERUM_DEX_V3 = "9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin";

type SerumContextType = {
  programID: PublicKey;
  setProgramID: (programID: string) => void;
};

type SerumProviderProps = {
  children: ReactNode;
};

const SerumContext = createContext<SerumContextType | null>(null);

export const SerumProvider = ({ children }: SerumProviderProps) => {
  const [programID, _setProgramID] = useState(new PublicKey(SERUM_DEX_V3));

  const setProgramID = (programID: string) => {
    window.localStorage.setItem(PROGRAM_LOCAL_STORAGE_KEY, programID);
    _setProgramID(new PublicKey(programID));
  };

  useEffect(() => {
    if (window.localStorage.getItem(PROGRAM_LOCAL_STORAGE_KEY)) {
      _setProgramID(
        new PublicKey(
          window.localStorage.getItem(PROGRAM_LOCAL_STORAGE_KEY) as string
        )
      );
    } else setProgramID(SERUM_DEX_V3);
  }, []);

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
