// Modified by Sekar Nagarajan (2026-08-25 12:20)
import { DateTime } from 'luxon';
import { useState } from 'react';

export function useArrivalNoticeController() {
  const [selectedAnNo, setSelectedAnNo] = useState<string | null>(null);
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

  const openDetails = (anNo: string) => setSelectedAnNo(anNo);
  const closeDetails = () => setSelectedAnNo(null);

  return {
    selectedAnNo,
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
