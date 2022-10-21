import { PublicKey } from "@solana/web3.js";
import { useRouter } from "next/router";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "react-toastify";
import { SERUM_DEX_V3 } from "../utils/constants";

type ProgramContextType = {
  programID: PublicKey;
  setProgramID: (programId: string) => void;
};

type ProgramProviderProps = {
  children: ReactNode;
};

const ProgramContext = createContext<ProgramContextType | null>(null);

export const SerumProvider = ({ children }: ProgramProviderProps) => {
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
    <ProgramContext.Provider value={{ programID, setProgramID }}>
      {children}
    </ProgramContext.Provider>
  );
};

export const useSerum = () => {
  const serum = useContext(ProgramContext);

  if (!serum) {
    throw new Error("Make sure to wrap your component with SerumProvider");
  }

  return serum;
};
