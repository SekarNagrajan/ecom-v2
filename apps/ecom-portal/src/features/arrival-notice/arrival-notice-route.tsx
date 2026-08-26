// Modified by Sekar Nagarajan (2026-08-25 12:20)
import { Card } from 'antd';

import { FeaturePageShell } from '../../components/shared/feature-page-shell';
import { ArrivalNoticeDetails } from './components/ArrivalNoticeDetails';
import { ArrivalNoticeListing } from './components/ArrivalNoticeListing';
import { ArrivalNoticeModuleStyles } from './components/arrival-notice-module-styles';
import { useArrivalNoticeController } from './hooks/use-arrival-notice-controller';

export function ArrivalNoticeRoute() {
  const {
    selectedAnNo,
    fromDate,
    toDate,
    activeFilters,
    setFromDate,
    setToDate,
    handleSearch,
    openDetails,
    closeDetails,
  } = useArrivalNoticeController();

  return (
    <FeaturePageShell>
      <ArrivalNoticeModuleStyles />
      <Card className="feature-page-card arn-page-card" bordered={false}>
        <ArrivalNoticeListing
          fromDate={fromDate}
          toDate={toDate}
          activeFromDate={activeFilters.fromDate}
          activeToDate={activeFilters.toDate}
          onFromDateChange={setFromDate}
          onToDateChange={setToDate}
          onSearch={handleSearch}
          onView={openDetails}
        />
        {selectedAnNo ? (
          <ArrivalNoticeDetails anNo={selectedAnNo} onClose={closeDetails} />
        ) : null}
      </Card>
    </FeaturePageShell>
  );
}
