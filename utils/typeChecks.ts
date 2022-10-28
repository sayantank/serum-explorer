/* eslint-disable @typescript-eslint/no-explicit-any */
import { SerumMarketInfo } from "../hooks/useSerumMarkets";

export enum AccountTypes {
  SerumMarketInfo = "serum_market_info",
}

export function isSerumMarketInfo(obj: any): obj is SerumMarketInfo {
  return (obj as SerumMarketInfo).type === AccountTypes.SerumMarketInfo;
}
