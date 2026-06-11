export function MarketClearingMark() {
  return (
    <svg className="market-clearing-mark" viewBox="0 0 32 32" aria-hidden="true">
      <path className="market-clearing-bar" d="M6 22H11V28H6Z" />
      <path className="market-clearing-bar" d="M14 18H19V28H14Z" />
      <path className="market-clearing-bar" d="M22 13H27V28H22Z" />
      <path className="market-clearing-trend" d="M5 19L10.5 14.5L15.5 17.5L21 12L25.5 8.5" />
      <path className="market-clearing-arrow" d="M24 6.5L29 7.5L27.5 12.5Z" />
    </svg>
  );
}
