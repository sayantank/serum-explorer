import { SerumMarketInfo } from "../hooks/useSerumMarkets";

export const serumMarketFilter = (
  regexp: RegExp,
  row: SerumMarketInfo
): boolean => {
  const addressMatches = row.address.toString().match(regexp);
  const symbolMatches =
    row.baseSymbol &&
    row.quoteSymbol &&
    `${row.baseSymbol}/${row.quoteSymbol}`.match(regexp);

  return (
    (!!addressMatches && addressMatches.length > 0) ||
    (!!symbolMatches && symbolMatches.length > 0)
  );
};
