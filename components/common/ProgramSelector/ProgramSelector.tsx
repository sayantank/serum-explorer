import { PublicKey } from "@solana/web3.js";
import { FormEvent, useEffect, useState } from "react";
import { useSerum } from "../../../context/SerumContext";
import { DEX_PROGRAMS } from "../../../utils/constants";

export const ProgramSelector = () => {
  const { programID, setProgramID } = useSerum();

  const [isChanging, setIsChanging] = useState(false);
  const [customProgramID, setCustomProgramID] = useState(programID.toString());

  const handleProgramChange = (e: FormEvent) => {
    e.preventDefault();
    setProgramID(customProgramID);
    setIsChanging(false);
  };

  useEffect(() => {
    setCustomProgramID(programID.toString());
  }, [programID, setCustomProgramID]);

  return (
    <div className="w-full p-4 bg-cyan-700 rounded">
      <h2 className="text-md font-bold">Program Address</h2>
      {!isChanging ? (
        <div className="flex items-center space-x-4">
          <p className="text-sm">
            {DEX_PROGRAMS[programID.toString()]
              ? DEX_PROGRAMS[programID.toString()]
              : `${programID.toString().slice(0, 18)}...`}
          </p>
          <button
            className="text-sm underline"
            onClick={() => setIsChanging(true)}
          >
            Change
          </button>
        </div>
      ) : (
        <form onSubmit={handleProgramChange} className="mt-2 space-y-2">
          <input
            type="text"
            value={customProgramID}
            onChange={(e) => setCustomProgramID(e.target.value)}
            placeholder="Market Address"
            className="px-4 py-2 w-full rounded bg-transparent border-2 border-cyan-500 focus:outline-none"
          />
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
