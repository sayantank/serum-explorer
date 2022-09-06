import create from "zustand";
import { persist } from "zustand/middleware";
import { DEX_PROGRAMS } from "../utils/constants";

export interface ProgramStore {
  pinnedPrograms: string[];
  pinProgram: (programId: string) => void;
  unpinProgram: (programId: string) => void;
  isPinned: (programId: string) => boolean;
}

const useProgramStore = create<ProgramStore>()(
  persist(
    (set, get) => ({
      pinnedPrograms: [],

      pinProgram: (programId: string) => {
        if (DEX_PROGRAMS[programId]) return;

        if (get().pinnedPrograms.includes(programId)) return;

        set((state) => ({
          pinnedPrograms: [...state.pinnedPrograms, programId],
        }));
      },
      unpinProgram: (programId: string) => {
        set((state) => ({
          pinnedPrograms: state.pinnedPrograms.filter(
            (pinnedProgramId) => pinnedProgramId !== programId
          ),
        }));
      },
      isPinned: (programId: string) => {
        return (
          get().pinnedPrograms.includes(programId) || !!DEX_PROGRAMS[programId]
        );
      },
    }),
    {
      name: "program-store",
    }
  )
);

export default useProgramStore;
