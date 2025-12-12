/**
 * Parse a payment amount and round to 2 decimal places to avoid floating-point precision errors
 * @param value - The value to parse (string or number)
 * @returns The parsed and rounded number
 */
export const parsePaymentAmount = (value: string | number): number => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return 0;
  // Round to 2 decimal places to fix precision errors like 2000.01
  return Math.round(num * 100) / 100;
};

/**
 * Format a payment amount for display
 * @param value - The value to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string
 */
export const formatPaymentAmount = (value: string | number, decimals: number = 2): string => {
  const num = parsePaymentAmount(value);
  return num.toFixed(decimals);
};
