interface PaginationButtonProps
  extends React.HTMLAttributes<HTMLButtonElement> {
  type: "prev" | "next";
}

export const PaginationButton = ({ type, ...props }: PaginationButtonProps) => {
  return (
    <button className="py-2 px-4 bg-cyan-500 rounded" {...props}>
      {type === "prev" ? "Prev" : "Next"}
    </button>
  );
};
