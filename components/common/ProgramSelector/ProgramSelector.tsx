import { TrashIcon } from "@heroicons/react/outline";
import { FormEventHandler, useEffect, useState } from "react";
import { useProgram } from "../../../context/SerumContext";
import useProgramStore from "../../../stores/programStore";
import { DEX_PROGRAMS } from "../../../utils/constants";

export const ProgramSelector = () => {
  const { programID, setProgramID } = useProgram();

  const { pinProgram, pinnedPrograms, unpinProgram, isPinned } =
    useProgramStore((s) => ({
      pinnedPrograms: s.pinnedPrograms,
      pinProgram: s.pinProgram,
      unpinProgram: s.unpinProgram,
      isPinned: s.isPinned,
    }));

  const [isChanging, setIsChanging] = useState(false);
  const [customProgramID, setCustomProgramID] = useState(programID.toString());

  const [showPin, setShowPin] = useState(false);

  const handleProgramChange: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    setProgramID(customProgramID);
    setIsChanging(false);
  };

  useEffect(() => {
    setShowPin(!isPinned(programID.toString()));
  }, [programID, isPinned, pinnedPrograms]);

  useEffect(() => {
    setCustomProgramID(programID.toString());
  }, [programID, setCustomProgramID]);

  return (
    <div className="w-full p-4 bg-cyan-700 rounded">
      <h2 className="text-md font-bold mb-0.5">Program Address</h2>
      {!isChanging ? (
        <div className="flex items-center justify-between space-x-2">
          <p className="text-sm">
            {DEX_PROGRAMS[programID.toString()]
              ? DEX_PROGRAMS[programID.toString()]
              : `${programID.toString().slice(0, 18)}...`}
          </p>
          <div className="flex space-x-2 items-center">
            {showPin ? (
              <button
                className="text-sm py-0.5 px-1.5 bg-cyan-500 hover:bg-cyan-600 rounded-md transition-all"
                onClick={() => pinProgram(programID.toString())}
              >
                Pin
              </button>
            ) : null}
            <button
              className="text-sm py-0.5 px-1.5 bg-cyan-500 hover:bg-cyan-600 rounded-md transition-all"
              onClick={() => setIsChanging(true)}
            >
              Change
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleProgramChange} className="mt-2 space-y-3">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={customProgramID}
              onChange={(e) => setCustomProgramID(e.target.value)}
              placeholder="Market Address"
              className="flex-1 px-4 py-2 w-full rounded bg-transparent border-2 border-cyan-500 focus:outline-none"
            />
          </div>
          {Object.entries(DEX_PROGRAMS).map(([programID, programLabel]) => (
            <button
              type="submit"
              key={programID}
              className="w-full bg-cyan-800 hover:bg-cyan-900 transition-colors py-2 px-4 rounded flex items-center justify-between cursor-pointer"
              onClick={() => setCustomProgramID(programID)}
            >
              <p className="text-sm font-medium">{programLabel}</p>
              <p className="text-sm font-light">{programID.slice(0, 16)}...</p>
            </button>
          ))}
          {pinnedPrograms.length > 0 ? (
            <div>
              <h3 className="text-sm bg-cyan-700 text-cyan-200 font-light mb-1">
                Pinned Programs
              </h3>
              {pinnedPrograms.map((programId) => (
                <button
                  key={programId}
                  type="submit"
                  className="w-full bg-cyan-800 hover:bg-cyan-900 transition-colors py-2 px-4 rounded flex items-center justify-between text-left cursor-pointer"
                  onClick={() => setCustomProgramID(programId)}
                >
                  <p className="text-sm font-medium">
                    {programId.slice(0, 12)}...
                  </p>
                  <div onClick={() => unpinProgram(programId)}>
                    <TrashIcon className="h-5 w-5 text-cyan-500 cursor-pointer hover:text-cyan-400 transition-all" />
                  </div>
                </button>
              ))}
            </div>
          ) : null}
          <button
            type="submit"
            className="px-4 py-2 w-full rounded bg-cyan-500 hover:bg-cyan-600 text-white"
          >
            Confirm
          </button>
        </form>
      )}
    </div>
  );
};
