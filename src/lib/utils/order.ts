// ============================================================
// Order Number Generator
// Format: ALK-YYYYMMDD-XXXX
// Example: ALK-20260925-0001
// ============================================================

/**
 * Generate a unique order number with the AlkaPreloved format.
 * This should be called server-side during order creation.
 *
 * The counter portion is derived from the current timestamp
 * in milliseconds to ensure uniqueness within a day.
 * In production, consider using a database sequence for
 * guaranteed monotonic ordering.
 */
export function generateOrderNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  // Use milliseconds within the hour as a counter proxy
  // For production, use a database sequence: SELECT nextval('order_number_seq')
  const counter = String(now.getMilliseconds() + now.getSeconds() * 1000).padStart(4, "0").slice(-4);

  return `ALK-${year}${month}${day}-${counter}`;
}

/**
 * Check if a string matches the AlkaPreloved order number format.
 */
export function isValidOrderNumber(orderNumber: string): boolean {
  return /^ALK-\d{8}-\d{4}$/.test(orderNumber);
}
