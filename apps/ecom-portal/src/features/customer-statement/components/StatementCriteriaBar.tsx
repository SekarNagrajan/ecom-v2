// Modified by Sekar Nagarajan (2026-08-25 13:00)
import { AppButton } from '@solverminds/shared-ui';
import { Col, DatePicker, Row, Select } from 'antd';
import dayjs from 'dayjs';

import { AppIcon, Icons, NavIcons } from '../../../components/icons';
import { ModuleScreenHeader } from '../../../components/shared/module-screen-header';
import { MODULE_TITLES } from '../../../constants/module-titles';
import { useStatementAccountsQuery } from '../api/customer-statement.queries';

/** Five fields in one row on md+ (spans sum to 24). Stack on mobile. */
const CRITERIA_COL = {
  account: { xs: 24, sm: 12, md: 6 },
  currency: { xs: 24, sm: 12, md: 3 },
  date: { xs: 24, sm: 12, md: 5 },
  action: { xs: 24, sm: 12, md: 5 },
} as const;

interface StatementCriteriaBarProps {
  accountId: string;
  currency: string;
  fromDate: string;
  toDate: string;
  criteriaError: string | null;
  onAccountChange: (accountId: string, currency: string) => void;
  onCurrencyChange: (currency: string) => void;
  onFromDateChange: (value: string) => void;
  onToDateChange: (value: string) => void;
  onSearch: (override?: {
    accountId?: string;
    currency?: string;
  }) => void;
}

export function StatementCriteriaBar({
  accountId,
  currency,
  fromDate,
  toDate,
  criteriaError,
  onAccountChange,
  onCurrencyChange,
  onFromDateChange,
  onToDateChange,
  onSearch,
}: StatementCriteriaBarProps) {
  const { data: accounts = [], isLoading } = useStatementAccountsQuery();

  const currencyOptions = Array.from(
    new Set(accounts.map((a) => a.currency).filter(Boolean))
  ).map((code) => ({ value: code, label: code }));

  const resolvedAccountId = accountId || accounts[0]?.accountId;
  const resolvedCurrency =
    currency ||
    accounts.find((a) => a.accountId === resolvedAccountId)?.currency ||
    accounts[0]?.currency;

  return (
    <>
      <div className="stmt-page-header">
        <ModuleScreenHeader
          icon={NavIcons.customerStatement}
          title={MODULE_TITLES.customerStatement}
          subtitle="Select account, currency, and period to view and export your statement."
          marginBottom={0}
        />
      </div>

      <div className="stmt-search-panel">
        <div className="stmt-search-panel__body">
          <Row gutter={[16, 16]} align="bottom" className="stmt-criteria-row">
            <Col {...CRITERIA_COL.account}>
              <div className="stmt-search-field">
                <span className="form-field-label">Account</span>
                <Select
                  size="large"
                  loading={isLoading}
                  value={resolvedAccountId}
                  placeholder="Select account"
                  options={accounts.map((a) => ({
                    value: a.accountId,
                    label: `${a.name} (${a.currency})`,
                  }))}
                  onChange={(value) => {
                    const match = accounts.find((a) => a.accountId === value);
                    onAccountChange(value, match?.currency ?? currency);
                  }}
                />
              </div>
            </Col>
            <Col {...CRITERIA_COL.currency}>
              <div className="stmt-search-field">
                <span className="form-field-label">Currency</span>
                <Select
                  size="large"
                  value={resolvedCurrency}
                  placeholder="Currency"
                  options={currencyOptions}
                  onChange={onCurrencyChange}
                />
              </div>
            </Col>
            <Col {...CRITERIA_COL.date}>
              <div className="stmt-search-field">
                <span className="form-field-label">From Date</span>
                <DatePicker
                  size="large"
                  value={fromDate ? dayjs(fromDate) : null}
                  onChange={(d) => onFromDateChange(d ? d.format('YYYY-MM-DD') : '')}
                  allowClear={false}
                />
              </div>
            </Col>
            <Col {...CRITERIA_COL.date}>
              <div className="stmt-search-field">
                <span className="form-field-label">To Date</span>
                <DatePicker
                  size="large"
                  value={toDate ? dayjs(toDate) : null}
                  onChange={(d) => onToDateChange(d ? d.format('YYYY-MM-DD') : '')}
                  allowClear={false}
                />
              </div>
            </Col>
            <Col {...CRITERIA_COL.action}>
              <div className="stmt-search-actions-field">
                <span className="stmt-search-actions-field__spacer form-field-label">Show</span>
                <div className="stmt-search-actions">
                  <AppButton
                    type="primary"
                    size="large"
                    icon={<AppIcon icon={Icons.search} size={16} />}
                    onClick={() =>
                      onSearch({
                        accountId: resolvedAccountId,
                        currency: resolvedCurrency,
                      })
                    }
                  >
                    Show
                  </AppButton>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </div>

      {criteriaError ? <p className="stmt-criteria-error">{criteriaError}</p> : null}
    </>
  );
}
