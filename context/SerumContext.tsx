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
import { OPENBOOK_DEX } from "../utils/constants";

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

  const [programID, _setProgramID] = useState(new PublicKey(OPENBOOK_DEX));

  const setProgramID = (programID: string) => {
    const newQuery: {
      programID?: string;
    } = {
      ...router.query,
      programID,
    };

    if (programID === OPENBOOK_DEX) delete newQuery.programID;

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
    } else _setProgramID(new PublicKey(OPENBOOK_DEX));
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
