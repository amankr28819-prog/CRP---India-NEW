/**
 * Formats average turnaround duration in hours according to readable rules:
 * - If less than 24 hours: display in hours (e.g. '1 hour', '5 hours', '23 hours')
 * - If 24 hours or more: display in days and remaining hours (e.g. '1 day', '1 day 6 hours', '2 days', '16 days 13 hours')
 * - One day equals exactly 24 hours. Does not round total duration up to the next full day.
 * - Handles singular and plural correctly ('1 day', '2 days', '1 hour', '2 hours').
 * - Omits '0 hours' when remaining hours after day conversion is zero.
 * - Preserves fractional hours if present and formats consistently.
 * - Returns 'N/A' if hours is null, undefined, invalid, or negative.
 */
export function formatTurnaroundTime(hours) {
  if (hours === null || hours === undefined || typeof hours !== 'number' || isNaN(hours) || hours < 0) {
    return 'N/A';
  }

  const roundedTotalHours = Number(hours.toFixed(1));

  if (roundedTotalHours < 24) {
    return roundedTotalHours === 1 ? '1 hour' : `${roundedTotalHours} hours`;
  }

  let days = Math.floor(roundedTotalHours / 24);
  let remainingHours = Number((roundedTotalHours - days * 24).toFixed(1));

  if (remainingHours >= 24) {
    days += Math.floor(remainingHours / 24);
    remainingHours = Number((remainingHours % 24).toFixed(1));
  }

  const dayLabel = days === 1 ? '1 day' : `${days} days`;

  if (remainingHours <= 0) {
    return dayLabel;
  }

  const hourLabel = remainingHours === 1 ? '1 hour' : `${remainingHours} hours`;
  return `${dayLabel} ${hourLabel}`;
}
