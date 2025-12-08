/**
 * Time utility functions for Sri Lankan timezone (UTC+5:30)
 */

/**
 * Convert UTC timestamp to Sri Lankan time
 * @param utcTimestamp - UTC timestamp string from database
 * @returns Date object in Sri Lankan timezone
 */
export const convertToSriLankanTime = (utcTimestamp: string | Date): Date => {
  const date = new Date(utcTimestamp);
  // Sri Lankan timezone is UTC+5:30
  const slOffset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds
  return new Date(date.getTime() + slOffset);
};

/**
 * Format date in Sri Lankan timezone
 * @param utcTimestamp - UTC timestamp string from database
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string in Sri Lankan time
 */
export const formatSriLankanDate = (
  utcTimestamp: string | Date,
  options?: Intl.DateTimeFormatOptions
): string => {
  const slDate = convertToSriLankanTime(utcTimestamp);

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    ...options
  };

  return slDate.toLocaleDateString('en-GB', defaultOptions);
};

/**
 * Format time in Sri Lankan timezone
 * @param utcTimestamp - UTC timestamp string from database
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted time string in Sri Lankan time
 */
export const formatSriLankanTime = (
  utcTimestamp: string | Date,
  options?: Intl.DateTimeFormatOptions
): string => {
  const slDate = convertToSriLankanTime(utcTimestamp);

  const defaultOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    ...options
  };

  return slDate.toLocaleTimeString('en-US', defaultOptions);
};

/**
 * Format full date and time in Sri Lankan timezone
 * @param utcTimestamp - UTC timestamp string from database
 * @returns Formatted date and time string
 */
export const formatSriLankanDateTime = (utcTimestamp: string | Date): string => {
  const date = formatSriLankanDate(utcTimestamp);
  const time = formatSriLankanTime(utcTimestamp);
  return `${date} ${time}`;
};

/**
 * Get current Sri Lankan date for date inputs
 * @returns YYYY-MM-DD format in Sri Lankan timezone
 */
export const getCurrentSriLankanDate = (): string => {
  const now = new Date();
  const slOffset = 5.5 * 60 * 60 * 1000;
  const slDate = new Date(now.getTime() + slOffset);

  const year = slDate.getUTCFullYear();
  const month = String(slDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(slDate.getUTCDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};
