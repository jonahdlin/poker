import numeral from "numeral";

export const formatNumber = (n: number, format: string = "0,0"): string => {
  return numeral(n).format(format);
};
