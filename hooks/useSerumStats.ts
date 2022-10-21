import useSWR from "swr";

export const useSerumStats = () => {
  const {
    data: stats,
    error,
    mutate,
    isValidating,
  } = useSWR("https://serum-volume-tracker.vercel.app/api", (url) =>
    fetch(url)
      .then((r) => r.json())
      .then((r) => ({ tvl: r.tvl, totalVol1d: r.total_vol_1d }))
  );

  const loading = !stats && !error;

  return {
    stats,
    loading,
    error,
    mutate,
    isValidating,
  };
};
