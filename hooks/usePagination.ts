import { useEffect, useState } from "react";
import { isSerumMarketInfo } from "../utils/typeChecks";

//crayz hook
export const usePagination = <T>(
  data: Array<T> | undefined,
  pageSize: number,
  filterString: string,
  filterMethod: (regexp: RegExp, row: T) => boolean
) => {
  const [filteredData, setFilteredData] = useState<Array<T>>([]);
  const [pageData, setPageData] = useState<Array<T> | undefined>(undefined);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (data) {
      if (isSerumMarketInfo(data[0])) {
        const q = new RegExp(filterString, "i");
        setFilteredData(data.filter((row) => filterMethod(q, row)));
      }
    }
  }, [filterString, data, filterMethod]);

  useEffect(() => {
    if (filteredData) {
      const startIndex = pageNumber * pageSize - pageSize;

      setPageData(filteredData.slice(startIndex, startIndex + pageSize));
      setTotalPages(Math.ceil(filteredData.length / pageSize));
    }
  }, [pageNumber, pageSize, filteredData]);

  useEffect(() => {
    setPageNumber(1);
  }, [filteredData]);

  const nextPage = () => {
    if (pageNumber >= totalPages) return;
    setPageNumber(pageNumber + 1);
  };

  const prevPage = () => {
    if (pageNumber === 1) return;
    setPageNumber(pageNumber - 1);
  };

  if (!data) {
    return {
      pageData: undefined,
      pageNumber: 0,
      totalPages: 0,
      nextPage: undefined,
      prevPage: undefined,
    };
  }

  return {
    pageData,
    pageNumber,
    totalPages,
    nextPage,
    prevPage,
  };
};
