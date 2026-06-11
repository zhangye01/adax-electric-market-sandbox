import { formatCurrency, formatNumber } from "../../utils/formatters";

export function compactRecordCurrency(value: number) {
  const abs = Math.abs(value);
  if (abs >= 100000000) return `${formatNumber(value / 100000000, 2)}亿`;
  if (abs >= 10000) return `${formatNumber(value / 10000, 1)}万`;
  return formatCurrency(value);
}
