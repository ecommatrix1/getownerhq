import { Member, MemberStatus } from '../types';

/**
 * Parses a date string (e.g. YYYY-MM-DD or ISO string) into a local midnight Date object
 * to prevent UTC timezone shifts.
 */
export const parseDateOnly = (dateStr: string): Date => {
  if (!dateStr) return new Date();
  const dateOnlyPart = dateStr.split('T')[0];
  const dateParts = dateOnlyPart.split('-');
  if (dateParts.length === 3) {
    const year = Number(dateParts[0]);
    const month = Number(dateParts[1]) - 1;
    const day = Number(dateParts[2]);
    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      return new Date(year, month, day);
    }
  }
  const parsed = new Date(dateStr);
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
};

/**
 * Calculates calendar days between today (or a reference date) and expiry date.
 */
export const getDaysUntilExpiry = (expiryDateStr: string, referenceDate?: Date): number => {
  const ref = referenceDate || new Date();
  const today = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate());
  const expiryDate = parseDateOnly(expiryDateStr);

  const diffTime = expiryDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getEffectiveStatus = (member: Member, referenceDate?: Date): MemberStatus => {
  if (member.status === 'pending') {
    return 'pending';
  }

  if (!member.expiry_date) {
    return member.status;
  }

  const diffDays = getDaysUntilExpiry(member.expiry_date, referenceDate);

  if (diffDays < 0) {
    return 'expired';
  } else if (diffDays <= 3) {
    return 'expiring';
  } else {
    return 'active';
  }
};

