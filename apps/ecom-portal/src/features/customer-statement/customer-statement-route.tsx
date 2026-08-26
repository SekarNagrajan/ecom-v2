// Modified by Sekar Nagarajan (2026-08-25 12:45)
import { Card } from 'antd';

import { FeaturePageShell } from '../../components/shared/feature-page-shell';
import { StatementCriteriaBar } from './components/StatementCriteriaBar';
import { StatementView } from './components/StatementView';
import { CustomerStatementModuleStyles } from './components/customer-statement-module-styles';
import { useStatementController } from './hooks/use-statement-controller';

export function CustomerStatementRoute() {
  const {
    accountId,
    currency,
    fromDate,
    toDate,
    activeCriteria,
    criteriaError,
    setFromDate,
    setToDate,
    setCurrency,
    handleAccountChange,
    handleSearch,
  } = useStatementController();

  return (
    <FeaturePageShell>
      <CustomerStatementModuleStyles />
      <Card className="feature-page-card stmt-page-card" bordered={false}>
        <div className="stmt-page-layout">
          <StatementCriteriaBar
            accountId={accountId}
            currency={currency}
            fromDate={fromDate}
            toDate={toDate}
            criteriaError={criteriaError}
            onAccountChange={handleAccountChange}
            onCurrencyChange={setCurrency}
            onFromDateChange={setFromDate}
            onToDateChange={setToDate}
            onSearch={handleSearch}
          />
          {activeCriteria ? <StatementView criteria={activeCriteria} /> : null}
        </div>
      </Card>
    </FeaturePageShell>
  );
}
