import { RefObject, useEffect } from "react";

export const useOutsideAlerter = (
  ref: RefObject<any>,
  condition: boolean,
  handler: () => void
) => {
  useEffect(() => {
    /**
     * Alert if clicked on outside of element
     */
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target) && condition) {
        handler();
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, condition, handler]);
};
