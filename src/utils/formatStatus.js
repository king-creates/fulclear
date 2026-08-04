import { STATUS_LABELS, STATUS_BADGE_VARIANT } from '@constants/clearanceStatus';

export const getStatusLabel   = (status) => STATUS_LABELS[status]        || status;
export const getStatusVariant = (status) => STATUS_BADGE_VARIANT[status] || 'gray';