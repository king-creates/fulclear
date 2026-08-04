import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';

export const formatDate = (date, pattern = 'dd MMM yyyy') => {
  if (!date) return '—';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return isValid(d) ? format(d, pattern) : '—';
};

export const formatDateTime = (date) =>
  formatDate(date, 'dd MMM yyyy, hh:mm a');

export const timeAgo = (date) => {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return isValid(d) ? formatDistanceToNow(d, { addSuffix: true }) : '';
};