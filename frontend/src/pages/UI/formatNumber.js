export default function formatNumber(value, decimals) {
  const num = Number(value);
  if (isNaN(num)) return "0".padEnd(decimals + 2, "0");
  return num.toFixed(decimals);
}