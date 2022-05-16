import { Event } from "@project-serum/serum/lib/queue";
import { Dispatch, SetStateAction } from "react";
import { EventFlags } from "./EventData";

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
  const getColor = (eventFlags: EventFlags) => {
    if (eventFlags.fill) {
      return "bg-emerald-500";
    } else if (eventFlags.out) {
      return "bg-orange-500";
    } else if (eventFlags.bid) {
      return "bg-indigo-500";
    } else if (eventFlags.maker) {
      return "bg-yellow-500";
    } else {
      return "bg-gray-500";
    }
  };

  if (selectedIndex === undefined) {
    return null;
  }

  return (
    <div className="w-full px-4 flex space-between space-x-2">
      {displayEvents.map((event, i) => (
        <div
          key={`${event.orderId.toString()} - ${i}`}
          className={`h-10 flex-1 rounded bg-cyan-600 cursor-pointer ${
            selectedIndex === i ? "border-2 border-cyan-400" : null
          } ${getColor(event.eventFlags)}`}
          onClick={() => onSelect(i)}
        />
      ))}
    </div>
  );
};
