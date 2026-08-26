// Modified by Sekar Nagarajan (2026-08-25 12:10)
import { Card } from 'antd';

import { FeaturePageShell } from '../../components/shared/feature-page-shell';
import { CRODetails } from './components/CRODetails';
import { CROListing } from './components/CROListing';
import { CroModuleStyles } from './components/cro-module-styles';
import { useCROController } from './hooks/use-cro-controller';

export function ContainerReleaseOrderRoute() {
  const {
    selectedCroNo,
    fromDate,
    toDate,
    activeFilters,
    setFromDate,
    setToDate,
    handleSearch,
    openDetails,
    closeDetails,
  } = useCROController();

  return (
    <FeaturePageShell>
      <CroModuleStyles />
      <Card className="feature-page-card cro-page-card" bordered={false}>
        <CROListing
          fromDate={fromDate}
          toDate={toDate}
          activeFromDate={activeFilters.fromDate}
          activeToDate={activeFilters.toDate}
          onFromDateChange={setFromDate}
          onToDateChange={setToDate}
          onSearch={handleSearch}
          onView={openDetails}
        />
        {selectedCroNo ? (
          <CRODetails croNo={selectedCroNo} onClose={closeDetails} />
        ) : null}
      </Card>
    </FeaturePageShell>
  );
}
