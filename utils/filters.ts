export const serumMarketFilter = (regexp: RegExp, row: any) =>
  row.address.toString().match(regexp) ||
  (row.baseSymbol &&
    row.quoteSymbol &&
    `${row.baseSymbol}/${row.quoteSymbol}`.match(regexp));
