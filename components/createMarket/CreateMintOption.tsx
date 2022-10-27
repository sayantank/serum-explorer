import { ReactNode } from "react";
import { classNames } from "../../utils/general";

export default function CreateMintOption({
  active,
  checked,
  children,
}: {
  active: boolean;
  checked: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={classNames(
        "p-2 flex-1 border border-slate-600 rounded-md flex items-center justify-center text-sm",
        active
          ? "bg-slate-600 border-slate-500"
          : "bg-slate-700 border-slate-600",
        checked ? "border-cyan-500 text-cyan-400" : "text-slate-200"
      )}
    >
      {children}
    </div>
  );
}
