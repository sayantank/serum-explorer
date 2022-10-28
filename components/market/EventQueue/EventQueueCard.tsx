import { Tab } from "@headlessui/react";
import { Event } from "@project-serum/serum/lib/queue";
import { Fragment, useEffect, useState } from "react";
import { useMarket } from "../../../context/market";
import { EventData } from "./EventData";
import { EventList } from "./EventList";
import { classNames } from "../../../utils/general";
import { Cranker } from "./Cranker";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

export const EventQueueCard = () => {
  const { eventQueue } = useMarket();

  const [displayEvents, setDisplayEvents] = useState<Event[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | undefined>(
    undefined
  );

  useEffect(() => {
    if (eventQueue.data) {
      setDisplayEvents(eventQueue.data.slice(0, 10));
    }
  }, [eventQueue]);

  useEffect(() => {
    if (displayEvents.length > 0) setSelectedIndex(0);
    else setSelectedIndex(undefined);
  }, [displayEvents]);

  const EventQueueCardTab = ({ title }: { title: string }) => {
    return (
      <Tab as={Fragment}>
        {({ selected }) => (
          <button
            type="button"
            className={classNames(
              "rounded-full flex items-center justify-center py-3 px-4 flex-1 focus:outline-none border-slate-600 border-2 text-slate-200 focus-style",
              selected ? "bg-slate-700 font-medium" : "bg-transparent"
            )}
          >
            {title}
          </button>
        )}
      </Tab>
    );
  };

  return (
    <div className="bg-slate-800 flex flex-col space-y-4 rounded border border-slate-700">
      <Tab.Group>
        {({ selectedIndex: tabIndex }) => (
          <>
            <Tab.List className="flex items-center justify-between space-x-4 px-4 pt-4">
              <EventQueueCardTab title="Event Queue" />
              <EventQueueCardTab title="Cranker" />
            </Tab.List>
            {selectedIndex !== undefined ? (
              <>
                <div className="flex space-x-4 items-center px-4">
                  <EventList
                    displayEvents={displayEvents}
                    onSelect={setSelectedIndex}
                    selectedIndex={selectedIndex}
                    tabIndex={tabIndex}
                  />
                  <ArrowPathIcon
                    className={`h-5 w-5 cursor-pointer ${
                      eventQueue.isValidating ? "animate-spin" : null
                    }`}
                    onClick={() => eventQueue.mutate()}
                  />
                </div>
              </>
            ) : (
              <div className="px-4 flex justify-between items-center w-full ">
                <p className="text-sm font-light text-slate-400">
                  No events to crank.
                </p>
                <ArrowPathIcon
                  className={`h-5 w-5 cursor-pointer text-cyan-400 ${
                    eventQueue.isValidating ? "animate-spin" : null
                  }`}
                  onClick={() => eventQueue.mutate()}
                />
              </div>
            )}
            <Tab.Panels>
              <Tab.Panel>
                {selectedIndex !== undefined ? (
                  <EventData event={displayEvents[selectedIndex]} />
                ) : null}
              </Tab.Panel>
              <Tab.Panel>
                <Cranker />
              </Tab.Panel>
            </Tab.Panels>
          </>
        )}
      </Tab.Group>
    </div>
  );
};
