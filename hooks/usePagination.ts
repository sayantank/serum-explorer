import { useEffect, useState } from "react";

//crayz hook
export const usePagination = <T>(
  data: Array<T> | undefined,
  pageSize: number
) => {
  const [pageData, setPageData] = useState<Array<T> | undefined>(undefined);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (data) {
      const startIndex = pageNumber * pageSize - pageSize;
      setPageData(data.splice(startIndex, pageSize));
      setTotalPages(Math.ceil(data.length / pageSize));
    }
  }, [data, pageNumber, pageSize]);

  useEffect(() => {
    setPageNumber(1);
  }, [data]);

  const nextPage = () => {
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
