import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
export const DataTableRow = ({
  label,
  value,
  link,
}: {
  label: string;
  value: string;
  link?: string;
}) => {
  return (
    <tr>
      <td className="text-sm font-medium p-4 md:px-8 whitespace-nowrap">
        {label}
      </td>
      <td className="text-sm font-light p-4 md:px-8 whitespace-nowrap flex justify-end items-center space-x-2">
        <p>{value}</p>
        {link ? (
          <a href={link} target="_blank" rel="noopener noreferrer">
            <ArrowTopRightOnSquareIcon className="h-4 w-4 cursor-pointer" />
          </a>
        ) : null}
      </td>
    </tr>
  );
};
