// Utility function to fix floating-point precision errors
// Use this for all monetary calculations to avoid .01 cent errors

/**
 * Rounds a number to 2 decimal places to fix floating-point precision errors
 * Example: roundMoney(76800.00999999) => 76800.01 => 76800.00 (after proper rounding)
 */
export function roundMoney(amount: number): number {
  return Math.round(amount * 100) / 100;
}

/**
 * Adds two monetary amounts with proper rounding
 */
export function addMoney(a: number, b: number): number {
  return roundMoney(a + b);
}

/**
 * Multiplies monetary amount with proper rounding
 */
export function multiplyMoney(price: number, quantity: number): number {
  return roundMoney(price * quantity);
}

/**
 * Sums an array of monetary amounts with proper rounding
 */
export function sumMoney(amounts: number[]): number {
  const sum = amounts.reduce((total, amount) => total + amount, 0);
  return roundMoney(sum);
}

// Usage examples:
// const itemTotal = multiplyMoney(price, quantity);
// const subtotal = sumMoney(cartItems.map(item => item.price * item.quantity));
// const grandTotal = addMoney(subtotal, deliveryCharge);
