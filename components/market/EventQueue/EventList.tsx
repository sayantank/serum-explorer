import { Event } from "@project-serum/serum/lib/queue";
import { Dispatch, SetStateAction } from "react";

type EventListProps = {
  displayEvents: Event[];
  selectedIndex: number | undefined;
  onSelect: Dispatch<SetStateAction<number | undefined>>;
};

export const EventList = ({
  displayEvents,
  onSelect,
  selectedIndex,
}: EventListProps) => {
  if (selectedIndex === undefined) {
    return null;
  }

  return (
    <div className="w-full px-4 flex space-between space-x-2">
      {displayEvents.map((event, i) => (
        <div
          key={`${event.orderId.toString()} - ${i}`}
          className={`h-10 flex-1 rounded bg-cyan-600 ${
            selectedIndex === i ? "border-2 border-cyan-400" : null
          }`}
          onClick={() => onSelect(i)}
        />
      ))}
    </div>
  );
};
