import { DateTime } from 'luxon';

export function parseStoredDateTime(value: string): DateTime {
  const hasExplicitZone = /(?:Z|[+-]\d{2}(?::?\d{2})?)$/i.test(value);

  if (hasExplicitZone) {
    return DateTime.fromISO(value, { setZone: true });
  }

  // Backend datetimes are stored in UTC even when the payload omits a zone.
  return DateTime.fromISO(value, { zone: 'utc' });
}

export function parseStoredDateTimeToZone(
  value: string,
  timezone: string
): DateTime {
  return parseStoredDateTime(value).setZone(timezone);
}

export function parseStoredCalendarDate(
  value: string,
  timezone: string
): DateTime {
  return DateTime.fromISO(value, { zone: timezone });
}

export function toUtcIsoString(
  value: DateTime | null | undefined
): string | null {
  if (!value) {
    return null;
  }

  return value.toUTC().toISO();
}

export function toCalendarDateString(
  value: DateTime | null | undefined
): string | null {
  if (!value) {
    return null;
  }

  return value.toISODate();
}
