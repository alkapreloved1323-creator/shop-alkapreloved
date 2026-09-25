// ============================================================
// Formatting Utilities
// ============================================================

/**
 * Format a number as Indonesian Rupiah currency.
 * Example: 150000 → "Rp 150.000"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a date string to Indonesian locale.
 * Example: "2026-09-25T00:00:00Z" → "25 September 2026"
 */
export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(dateString));
}

/**
 * Format a date string to Indonesian locale with time.
 * Example: "2026-09-25T14:30:00Z" → "25 Sep 2026, 21.30 WIB"
 */
export function formatDateTime(dateString: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
    timeZoneName: "short",
  }).format(new Date(dateString));
}

/**
 * Format weight in grams to a human-readable string.
 * Example: 1500 → "1.5 kg"
 *          500  → "500 g"
 */
export function formatWeight(grams: number): string {
  if (grams >= 1000) {
    const kg = grams / 1000;
    return `${kg % 1 === 0 ? kg : kg.toFixed(1)} kg`;
  }
  return `${grams} g`;
}

/**
 * Truncate a string to a maximum length, appending "...".
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + "...";
}

/**
 * Generate a URL-safe slug from a string.
 * Example: "Sepatu Nike Air Max" → "sepatu-nike-air-max"
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}
