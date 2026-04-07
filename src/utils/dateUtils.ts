import { format, parse, isValid } from 'date-fns';

/**
 * Formats a date string or Date object to dd-mm-yyyy.
 * Handles both yyyy-mm-dd (input format) and dd-mm-yyyy (saved format).
 */
export const formatDateToDisplay = (dateStr: string | Date): string => {
  if (dateStr instanceof Date) {
    return format(dateStr, 'dd-MM-yyyy');
  }

  if (!dateStr) return 'N/A';

  // Try parsing from yyyy-MM-dd (HTML input format)
  let date = parse(dateStr, 'yyyy-MM-dd', new Date());
  if (isValid(date)) return format(date, 'dd-MM-yyyy');

  // Try parsing from dd-MM-yyyy (Our new saved format)
  date = parse(dateStr, 'dd-MM-yyyy', new Date());
  if (isValid(date)) return format(date, 'dd-MM-yyyy');

  return dateStr; // Return as-is if parsing fails
};

/**
 * Parses a date string into a Date object safely, handling multiple formats.
 */
export const parseInvoiceDate = (dateStr: string): Date => {
  if (!dateStr) return new Date();

  // Try yyyy-MM-dd
  let date = parse(dateStr, 'yyyy-MM-dd', new Date());
  if (isValid(date)) return date;

  // Try dd-MM-yyyy
  date = parse(dateStr, 'dd-MM-yyyy', new Date());
  if (isValid(date)) return date;

  return new Date(dateStr); // Final fallback
};
