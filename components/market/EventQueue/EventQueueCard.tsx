import { RefreshIcon } from "@heroicons/react/outline";
import { Event } from "@project-serum/serum/lib/queue";
import { useEffect, useState } from "react";
import { useMarket } from "../../../context/market";
import { useEventQueue } from "../../../hooks/useEventQueue";
import { EventData } from "./EventData";
import { EventList } from "./EventList";

export const EventQueueCard = () => {
  const { serumMarket } = useMarket();

  const { eventQueue, mutate, isValidating } = useEventQueue(serumMarket);

  const [displayEvents, setDisplayEvents] = useState<Event[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | undefined>(
    undefined
  );

  useEffect(() => {
    if (eventQueue) {
      setDisplayEvents(eventQueue.slice(0, 10));
    }
  }, [eventQueue]);

  useEffect(() => {
    if (displayEvents.length > 0) setSelectedIndex(0);
    else setSelectedIndex(undefined);
  }, [displayEvents]);

  return (
    <div className="bg-cyan-800 flex flex-col space-y-4 rounded">
      <div className="flex items-center justify-between px-4 pt-4">
        <h3 className="card-header ">Event Queue</h3>
        <RefreshIcon
          className={`h-5 w-5 cursor-pointer ${
            isValidating ? "animate-spin" : null
          }`}
          onClick={() => mutate()}
        />
      </div>
      {selectedIndex !== undefined ? (
        <>
          <EventList
            displayEvents={displayEvents}
            onSelect={setSelectedIndex}
            selectedIndex={selectedIndex}
          />
          <EventData event={displayEvents[selectedIndex]} />
        </>
      ) : (
        <div className="px-4 pb-4">
          <p className="text-sm font-light">No events to show</p>
        </div>
      )}
    </div>
  );
};
