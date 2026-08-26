// Modified by Sekar Nagarajan (2026-08-25 12:10)
import { DateTime } from 'luxon';
import { useState } from 'react';

export function useCROController() {
  const [selectedCroNo, setSelectedCroNo] = useState<string | null>(null);
  const [fromDate, setFromDate] = useState<string | undefined>(
    DateTime.now().minus({ days: 60 }).toISODate() ?? undefined
  );
  const [toDate, setToDate] = useState<string | undefined>(
    DateTime.now().toISODate() ?? undefined
  );
  const [activeFilters, setActiveFilters] = useState({ fromDate, toDate });

  const handleSearch = () => {
    setActiveFilters({ fromDate, toDate });
  };

  const openDetails = (croNo: string) => setSelectedCroNo(croNo);
  const closeDetails = () => setSelectedCroNo(null);

  return {
    selectedCroNo,
    fromDate,
    toDate,
    activeFilters,
    setFromDate,
    setToDate,
    handleSearch,
    openDetails,
    closeDetails,
  };
}
