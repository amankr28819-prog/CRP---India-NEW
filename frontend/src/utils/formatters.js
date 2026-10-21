/**
 * Formats average turnaround duration in hours according to readable rules:
 * - Round duration to the nearest whole hour (half-hour values round up). Never display fractional hours.
 * - If average is less than 24 hours: display in whole hours (e.g. 5.4 -> '5 hours', 5.5 -> '6 hours', 23.7 -> '24 hours').
 * - If 24 hours or more: convert rounded total hours into complete days and remaining hours (e.g. 24 -> '1 day', 30.4 -> '1 day 6 hours', 397.7 -> '16 days 14 hours').
 * - One day equals exactly 24 hours. Does not round total duration up to the next full day.
 * - Handles singular and plural correctly ('1 day', '2 days', '1 hour', '2 hours').
 * - Omits '0 hours' when remaining hours after day conversion is zero.
 * - Returns 'N/A' if hours is null, undefined, invalid, or negative.
 */
export function formatTurnaroundTime(hours) {
  if (hours === null || hours === undefined || typeof hours !== 'number' || isNaN(hours) || hours < 0) {
    return 'N/A';
  }

  // Values below 24 hours: display only whole hours
  if (hours < 24) {
    const roundedHours = Math.round(hours);
    return roundedHours === 1 ? '1 hour' : `${roundedHours} hours`;
  }

  // Values 24 hours and above: round to whole hours, split into complete days and remaining hours
  const totalRoundedHours = Math.round(hours);
  const days = Math.floor(totalRoundedHours / 24);
  const remainingHours = totalRoundedHours % 24;

  const dayLabel = days === 1 ? '1 day' : `${days} days`;

  if (remainingHours === 0) {
    return dayLabel;
  }

  const hourLabel = remainingHours === 1 ? '1 hour' : `${remainingHours} hours`;
  return `${dayLabel} ${hourLabel}`;
}
