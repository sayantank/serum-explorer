import BigNumber from "bignumber.js";
import BN from "bn.js";

// fuck this stupid fucking language and stupid fucking libraries
// https://github.com/indutny/bn.js/issues/209
export function toPlainString(num: string) {
  return `${num}`.replace(/(-?)(\d*)\.?(\d+)e([+-]\d+)/, (a, b, c, d, e) =>
    e < 0
      ? `${b}0.${Array(1 - e - c.length).join("0")}${c}${d}`
      : b + c + d + Array(e - d.length + 1).join("0")
  );
}

export function bigNumberToBNFloor(bigNumber: BigNumber): BN {
  return new BN(toPlainString(bigNumber.integerValue().toString()));
}

// TODO: Do not export until Intl NumberFormat is supported
function tokenAtomicsToDecimalString(
  tokenAtomics: BN,
  decimals: number
): string {
  const s = tokenAtomics.toString().padStart(decimals + 1, "0");
  const decIndex = s.length - decimals;
  return `${s.substring(0, decIndex)}.${s.substring(decIndex)}`;
}

export function tokenAtomicsToDecimal(
  tokenAtomics: BN,
  decimals: number
): number {
  return Number(tokenAtomicsToDecimalString(tokenAtomics, decimals));
}

// TODO: Do not export until Intl NumberFormat is supported
function tokenDecimalStringToAtomics(
  tokenDecimalString: string,
  decimals: number
): BN {
  const [integer, fractional = ""] = tokenDecimalString.split(".");
  return new BN(`${integer}${"0".repeat(decimals)}`).add(
    new BN(fractional.padEnd(decimals, "0"))
  );
}

export function tokenDecimalsToAtomics(
  tokenDecimals: number,
  decimals: number
): BN {
  return tokenDecimalStringToAtomics(
    toPlainString(tokenDecimals.toString()),
    decimals
  );
}

function roundDown(num: number, decimalPlaces: number): number {
  return Math.floor(num * 10 ** decimalPlaces) / 10 ** decimalPlaces;
}

export function prettifyDecimal(num: number, decimalPlaces: number): string {
  if (num === 0) {
    return decimalPlaces === 0 ? "0" : `0.${"0".repeat(decimalPlaces)}`;
  }

  if (num < 0.01) return "<0.01";

  if (num >= 1e9) return `${roundDown(num / 1e9, decimalPlaces)}B`;

  if (num >= 1e6) return `${roundDown(num / 1e6, decimalPlaces)}M`;

  // https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
  return `${roundDown(num, decimalPlaces)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

/**
 * Always returns with 2 decimal places
 */
export function tokenAtomicsToPrettyDecimal(
  tokenAtomics: BN,
  decimals: number
) {
  const decimalNum = tokenAtomicsToDecimal(tokenAtomics, decimals);
  return prettifyDecimal(decimalNum, 2);
}

// From https://stackoverflow.com/a/58136480/5060334
/**
 * Format number with thousands and decimal separator
 * @param num
 * @param thousand
 * @param decimal
 * @param universal
 */
export function formatNumber(
  num: number | string,
  thousand = ",",
  decimal = ".",
  universal = "\\d"
) {
  const number =
    decimal === "." ? num.toString() : num.toString().replace(".", decimal);

  return number.replace(
    RegExp(
      `\\${
        decimal || "."
      }${universal}+|${universal}(?=(?:${universal}{3})+(?!${universal}))`,
      "g"
    ),
    (a) => (a.length === 1 ? a + thousand : a)
  );
}
