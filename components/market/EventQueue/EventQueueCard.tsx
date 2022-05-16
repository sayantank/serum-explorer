import { Market } from "@project-serum/serum";
import { Event } from "@project-serum/serum/lib/queue";
import { useEffect, useState } from "react";
import { useMarket } from "../../../context/market";
import { useEventQueue } from "../../../hooks/useEventQueue";
import { EventData } from "./EventData";
import { EventList } from "./EventList";

type EventQueueCardProps = {
  serumMarket: Market | undefined;
};

export const EventQueueCard = () => {
  const { serumMarket } = useMarket();

  const { eventQueue } = useEventQueue(serumMarket);

  const [displayEvents, setDisplayEvents] = useState<Event[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | undefined>(
    undefined
  );

  useEffect(() => {
    if (eventQueue) {
      console.log(eventQueue.length);
      setDisplayEvents(eventQueue.slice(0, 10));
    }
  }, [eventQueue]);

  useEffect(() => {
    if (displayEvents.length > 0) setSelectedIndex(0);
    else setSelectedIndex(undefined);
  }, [displayEvents]);

  if (selectedIndex === undefined) return null;

  return (
    <div className="bg-cyan-800 flex flex-col space-y-4 rounded">
      <h3 className="card-header px-4 pt-4">Event Queue</h3>
      <EventList
        displayEvents={displayEvents}
        onSelect={setSelectedIndex}
        selectedIndex={selectedIndex}
      />
      <EventData event={displayEvents[selectedIndex]} />
    </div>
  );
};
