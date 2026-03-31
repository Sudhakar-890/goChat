import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';

/**
 * Format a date for message timestamps
 */
export function formatMessageTime(dateStr: string): string {
  const date = new Date(dateStr);
  return format(date, 'h:mm a');
}

/**
 * Format a date for chat list (sidebar)
 */
export function formatChatDate(dateStr: string): string {
  const date = new Date(dateStr);

  if (isToday(date)) {
    return format(date, 'h:mm a');
  }

  if (isYesterday(date)) {
    return 'Yesterday';
  }

  return format(date, 'MMM d');
}

/**
 * Format a date as relative time (e.g., "2 minutes ago")
 */
export function formatRelativeTime(dateStr: string): string {
  return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
}
