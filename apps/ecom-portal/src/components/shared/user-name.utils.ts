export const getUserInitials = (fullName?: string): string => {
  if (!fullName) {
    return '';
  }

  const parts = fullName.trim().split(/\s+/).filter(Boolean).slice(0, 2);

  return parts.map((part) => part.charAt(0).toUpperCase()).join('');
};

export const getUserFullName = (
  firstName?: string | null,
  lastName?: string | null,
  fallback = 'User'
): string => {
  const composed = [firstName, lastName]
    .filter(
      (part) =>
        part != null &&
        String(part).trim() !== '' &&
        String(part).toLowerCase() !== 'null'
    )
    .join(' ')
    .trim();
  return composed.length > 0 ? composed : fallback;
};
