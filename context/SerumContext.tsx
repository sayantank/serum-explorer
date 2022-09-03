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
import { DEX_PROGRAMS, SERUM_DEX_V3 } from "../utils/constants";

const DEX_PROGRAM_STORAGE_KEY = "dexPrograms";

type SerumContextType = {
  programID: PublicKey;
  setProgramID: (programId: string) => void;
  pinnedPrograms: string[];
  pinProgram: (programId: string) => void;
  removePin: (programId: string) => void;
  isPinned: (programId: string) => boolean;
};

type SerumProviderProps = {
  children: ReactNode;
};

const SerumContext = createContext<SerumContextType | null>(null);

export const SerumProvider = ({ children }: SerumProviderProps) => {
  const router = useRouter();

  const [programID, _setProgramID] = useState(new PublicKey(SERUM_DEX_V3));

  const [pinnedPrograms, setPinnedPrograms] = useState<string[]>([]);

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

  const pinProgram = (programId: string) => {
    if (DEX_PROGRAMS[programId]) return;

    const alreadyPinned = JSON.parse(
      localStorage.getItem(DEX_PROGRAM_STORAGE_KEY) || "[]"
    ) as string[];

    if (alreadyPinned.includes(programId)) return;

    const newPinned = [...alreadyPinned, programId];

    localStorage.setItem(DEX_PROGRAM_STORAGE_KEY, JSON.stringify(newPinned));
    setPinnedPrograms(newPinned);

    toast.success(`Pinned programId: ${programId.slice(0, 12)}...`);
  };

  const removePin = (programId: string) => {
    const alreadyPinned = JSON.parse(
      localStorage.getItem(DEX_PROGRAM_STORAGE_KEY) || "[]"
    ) as string[];

    const newPinned = alreadyPinned.filter((p) => p !== programId);

    localStorage.setItem(DEX_PROGRAM_STORAGE_KEY, JSON.stringify(newPinned));
    setPinnedPrograms(newPinned);
  };

  const isPinned = (programId: string): boolean => {
    const alreadyPinned = JSON.parse(
      localStorage.getItem(DEX_PROGRAM_STORAGE_KEY) || "[]"
    ) as string[];

    return alreadyPinned.includes(programId) || !!DEX_PROGRAMS[programId];
  };

  useEffect(() => {
    setPinnedPrograms(
      JSON.parse(localStorage.getItem(DEX_PROGRAM_STORAGE_KEY) || "[]")
    );
  }, []);

  useEffect(() => {
    if (router.query.programID) {
      _setProgramID(new PublicKey(router.query.programID));
    } else _setProgramID(new PublicKey(SERUM_DEX_V3));
  }, [router.query.programID]);

  return (
    <SerumContext.Provider
      value={{
        programID,
        setProgramID,
        pinnedPrograms,
        pinProgram,
        removePin,
        isPinned,
      }}
    >
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
