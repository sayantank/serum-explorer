import { PublicKey } from "@solana/web3.js";
import {
  ChangeEvent,
  MutableRefObject,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  CLUSTERS,
  CUSTOM_RPC_CLUSTER,
  useSerum,
  useSolana,
} from "../../context";
import { DEX_PROGRAMS } from "../../utils/constants";
import { BookmarkIcon as BookmarkIconSolid } from "@heroicons/react/24/solid";
import {
  BookmarkIcon,
  TrashIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";
import useProgramStore from "../../stores/programStore";
import { toast } from "react-toastify";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { prettifyPubkey } from "../../utils/pubkey";
import debounce from "lodash.debounce";
import { useRouter } from "next/router";

type SettingPanelProps = {
  close: (
    focusableElement?:
      | HTMLElement
      | MutableRefObject<HTMLElement | null>
      | undefined
  ) => void;
};

const SettingsPanel = ({ close }: SettingPanelProps) => {
  const router = useRouter();
  const { network } = router.query;

  const wallet = useWallet();
  const { programID, setProgramID } = useSerum();
  const { setCluster, isActiveCluster, setCustomEndpoint, cluster } =
    useSolana();
  const { setVisible } = useWalletModal();

  const [isProgramChanging, setIsProgramChanging] = useState(false);
  const [customProgramID, setCustomProgramID] = useState(programID.toBase58());
  const [endpoint, setEndpoint] = useState(CUSTOM_RPC_CLUSTER.endpoint);

  const { pinProgram, pinnedPrograms, unpinProgram, isPinned } =
    useProgramStore((s) => ({
      pinnedPrograms: s.pinnedPrograms,
      pinProgram: s.pinProgram,
      unpinProgram: s.unpinProgram,
      isPinned: s.isPinned,
    }));

  const handleProgramChange = (programId: string) => {
    setProgramID(programId);
    setIsProgramChanging(false);
  };

  const handlePin = (programID: PublicKey) => {
    if (DEX_PROGRAMS[programID.toString()]) return;

    if (isPinned(programID.toString())) {
      unpinProgram(programID.toString());
    } else pinProgram(programID.toString());
  };

  const customEndpointChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setEndpoint(e.target.value);
  };

  const debouncedEndpointChangeHandler = useMemo(
    () => debounce(customEndpointChangeHandler, 1000),
    []
  );

  useEffect(() => {
    if (cluster.network === "custom") {
      try {
        const endpointURL = new URL(endpoint);
        if (endpointURL.toString() !== cluster.endpoint) {
          setCustomEndpoint(endpointURL.toString());
          toast.success("RPC endpoint updated!", {
            pauseOnHover: false,
            autoClose: 1000,
          });
        }
      } catch (e) {
        console.error(e);
        toast.error("Invalid RPC endpoint");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cluster, endpoint]);

  return (
    <div>
      <div className="border-b border-slate-700">
        {network ? (
          <button
            onClick={() => {
              router.push({
                pathname: `/market/create`,
                query: router.query,
              });
              close();
            }}
          >
            <p className="mb-4 text-slate-200 hover:underline focus-visible:outline-none rounded-sm focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:border-none">
              Create Market
            </p>
          </button>
        ) : null}
      </div>
      <div className="space-y-1 my-4">
        <h3 className="text-slate-300 text-xs">Program ID</h3>
        {!isProgramChanging ? (
          <div className="w-full flex items-center space-x-2 ">
            <p className="text-cyan-400">
              {DEX_PROGRAMS[programID.toString()]
                ? DEX_PROGRAMS[programID.toString()]
                : `${programID.toString().slice(0, 18)}...`}
            </p>
            <button
              onClick={() => handlePin(programID)}
              className="focus-visible:outline-none rounded-sm focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:border-none focus:outline-none"
            >
              {isPinned(programID.toString()) ? (
                <BookmarkIconSolid className="text-cyan-500 h-5 w-5 " />
              ) : (
                <BookmarkIcon className="text-cyan-500 h-5 w-5 focus-visible:outline-none focus-visible:border-none" />
              )}
            </button>
            <button
              onClick={() => setIsProgramChanging(true)}
              className="focus-visible:outline-none rounded-sm focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:border-none"
            >
              <PencilIcon className="text-cyan-500 h-5 w-5" />
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <form
              onSubmit={() => {
                handleProgramChange(customProgramID);
              }}
              className="space-y-2"
            >
              <input
                type="text"
                value={customProgramID}
                onChange={(e) => setCustomProgramID(e.target.value)}
                placeholder="Market Address"
                className="flex-1 px-4 py-2 w-full border-cyan-600 border-b bg-transparent focus:outline-none"
              />
              <button type="submit" className="hidden" />
            </form>

            {Object.entries(DEX_PROGRAMS).map(([programID, programLabel]) => (
              <button
                type="submit"
                key={programID}
                className="w-full bg-slate-700 hover:bg-slate-600 transition-colors py-2 px-4 rounded flex items-center justify-between cursor-pointer"
                onClick={() => {
                  setCustomProgramID(programID);
                  handleProgramChange(programID);
                }}
              >
                <p className="text-sm font-medium">{programLabel}</p>
                <p className="text-sm font-light">
                  {programID.slice(0, 16)}...
                </p>
              </button>
            ))}
            {pinnedPrograms.length > 0 ? (
              <div>
                {pinnedPrograms.map((programId) => (
                  <div
                    key={programId}
                    className="w-full bg-slate-700 hover:bg-slate-600 transition-colors py-2 px-4 rounded flex items-center justify-between text-left cursor-pointer"
                  >
                    <button
                      onClick={() => {
                        setCustomProgramID(programId);
                        handleProgramChange(programId);
                      }}
                    >
                      <p className="text-sm font-medium">
                        {programId.slice(0, 12)}...
                      </p>
                    </button>
                    <div onClick={() => unpinProgram(programId)}>
                      <TrashIcon className="h-5 w-5 text-slate-300 cursor-pointer hover:text-cyan-400 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        )}
      </div>
      <div className="mb-4">
        <div className="space-y-1.5">
          <h3 className="text-slate-300 text-xs">Connection</h3>
          <ul className="space-y-1.5">
            {CLUSTERS.map((cluster) => {
              if (cluster.label !== "Custom RPC")
                return (
                  <li
                    key={cluster.endpoint}
                    onClick={() => setCluster(cluster)}
                    className={`${
                      isActiveCluster(cluster) ? "bg-slate-600" : "bg-slate-700"
                    } hover:bg-slate-600 p-2 cursor-pointer rounded-md `}
                  >
                    <div>
                      <h2 className="text-sm font-medium text-cyan-400">
                        {cluster.label}
                      </h2>
                      <p className="text-xs font-light text-cyan-500">
                        {cluster.endpoint}
                      </p>
                    </div>
                  </li>
                );
            })}
            <li
              className={`${
                isActiveCluster(CUSTOM_RPC_CLUSTER)
                  ? "bg-slate-600"
                  : "bg-slate-700 py-3"
              } hover:bg-slate-600 p-2 cursor-pointer rounded-md`}
              onClick={() => setCluster(CUSTOM_RPC_CLUSTER)}
            >
              <div>
                <h2 className="font-medium text-sm text-cyan-400">
                  Custom RPC
                </h2>
                {cluster.label === "Custom RPC" && (
                  <input
                    type="text"
                    defaultValue={CUSTOM_RPC_CLUSTER.endpoint}
                    onChange={debouncedEndpointChangeHandler}
                    className="border border-cyan-600 p-2 text-cyan-500 text-sm rounded mt-1 w-full bg-slate-700 focus:outline-none"
                  />
                )}
              </div>
            </li>
          </ul>
        </div>
      </div>
      <div className="md:hidden">
        {wallet.connected ? (
          <div>
            <p className="text-xs text-slate-300">
              Connected to{" "}
              <span className="font-medium">
                {/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */}
                {prettifyPubkey(wallet.publicKey!, 6)}
              </span>
            </p>
            <p className="text-sm mb-1"></p>
          </div>
        ) : null}
        <button
          onClick={() =>
            wallet.connected ? wallet.disconnect() : setVisible(true)
          }
          className="bg-slate-700 hover:bg-slate-600 transition-colors text-cyan-400 rounded-md w-full py-2 px-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:border-none"
        >
          {wallet.connected ? "Disconnect Wallet" : "Connect"}
        </button>
      </div>
    </div>
  );
};

export default SettingsPanel;
