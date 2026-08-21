import { type CustomDateProps, useGridDate } from 'ag-grid-react';
import { DateTime } from 'luxon';
import { useState } from 'react';

import { AppDatePicker } from '../../../ui/date-picker';
import { FloatingFilterShell } from './floating-filter-shell';

function toDateTime(date: Date | null): DateTime | null {
  if (!date) return null;

  // Preserve calendar day semantics and avoid timezone shifts.
  return DateTime.fromObject({
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  });
}

function toNativeDate(date: DateTime | null): Date | null {
  if (!date || !date.isValid) return null;

  // AG Grid Date Filter expects a native Date representing the chosen day.
  return new Date(date.year, date.month - 1, date.day);
}

export function AgGridDateComponent({
  date,
  onDateChange,
  location,
}: CustomDateProps) {
  const [disabled, setDisabled] = useState(false);
  const isFloatingFilter = location === 'floatingFilter';

  useGridDate({
    setDisabled,
  });

  const picker = (
    <AppDatePicker
      value={toDateTime(date)}
      onChange={(value) => {
        const nextValue = Array.isArray(value) ? value[0] ?? null : value;
        onDateChange(toNativeDate(nextValue));
      }}
      allowClear
      disabled={disabled}
      placeholder=""
      picker="date"
      size={isFloatingFilter ? 'small' : undefined}
      style={{ width: '100%' }}
    />
  );

  return isFloatingFilter ? (
    <FloatingFilterShell>{picker}</FloatingFilterShell>
  ) : (
    picker
  );
}
