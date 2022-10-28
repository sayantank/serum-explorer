import { useRouter } from "next/router";
import useSWR from "swr";

export const useSerumStats = () => {
  const router = useRouter();
  const network = router.query.network as string;

  const {
    data: stats,
    error,
    mutate,
    isValidating,
  } = useSWR(
    // !network because we only want stats on mainnet, where network === undefined
    () => !network && "https://serum-volume-tracker.vercel.app/api",
    (url) =>
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
