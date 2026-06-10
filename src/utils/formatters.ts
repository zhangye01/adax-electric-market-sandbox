export function formatCurrency(value: number) {
  return `${Math.round(value).toLocaleString("zh-CN")} 元`;
}

export function formatEnergy(value: number) {
  return `${Math.round(value).toLocaleString("zh-CN")} MWh`;
}

export function formatNumber(value: number, digits = 0) {
  return round(value, digits).toLocaleString("zh-CN");
}

export function formatPercent(value: number, digits = 1) {
  return `${round(value * 100, digits)}%`;
}

export function round(value: number, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}
