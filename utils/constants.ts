export const EXPLORER_ADDRESS_BASE = "https://explorer.solana.com/address/";

export const DEX_PROGRAMS: { [key: string]: string } = {
  "9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin": "Serum Dex V3",
};

export const SERUM_DEX_V3 = "9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin";

// const b = Buffer.alloc(8);
// accountFlagsLayout().encode(
//   {
//     initialized: true,
//     market: true,
//     openOrders: false,
//     requestQueue: false,
//     eventQueue: false,
//     bids: false,
//     asks: false,
//   },
//   b
// );
// console.log(bs58.encode(b));
export const MARKET_ACCOUNT_FLAGS_B58_ENCODED = "W723RTUpoZ";
