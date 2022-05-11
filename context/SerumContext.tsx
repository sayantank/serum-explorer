import { PublicKey } from "@solana/web3.js";
import { useRouter } from "next/router";
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "react-toastify";

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
  const router = useRouter();

  const [programID, _setProgramID] = useState(new PublicKey(SERUM_DEX_V3));

  const setProgramID = (programID: string) => {
    const newQuery: {
      programID?: string;
    } = {
      ...router.query,
      programID,
    };

    if (programID === SERUM_DEX_V3) delete newQuery.programID;

    try {
      new PublicKey(programID);
    } catch (e) {
      console.error(e);
      toast.error("Invalid program ID");
      return;
    }

    router.replace({
      query: newQuery,
    });
  };

  useEffect(() => {
    if (router.query.programID) {
      _setProgramID(new PublicKey(router.query.programID));
    } else _setProgramID(new PublicKey(SERUM_DEX_V3));
  }, [router.query.programID]);

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
