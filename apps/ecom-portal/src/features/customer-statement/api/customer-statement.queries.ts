// Modified by Sekar Nagarajan (2026-08-25 12:45)
import { useToast } from '@solverminds/shared-ui/hooks';
import { useMutation, useQuery } from '@tanstack/react-query';

import {
  buildStatementExportFilename,
  type StatementCriteria,
  type StatementExportFormat,
} from '../types/customer-statement.types';
import {
  downloadStatementDocument,
  getStatement,
  getStatementAccounts,
} from './customer-statement.api';
import { statementKeys } from './customer-statement.keys';

export function useStatementAccountsQuery() {
  return useQuery({
    queryKey: statementKeys.accounts(),
    queryFn: async () => {
      const res = await getStatementAccounts();
      if (res.error) {
        throw new Error(res.error.message || 'Failed to fetch statement accounts');
      }
      return res.data ?? [];
    },
  });
}

export function useStatementQuery(criteria: StatementCriteria | null) {
  return useQuery({
    queryKey: statementKeys.statement(
      criteria ?? { accountId: '', currency: '', fromDate: '', toDate: '' }
    ),
    enabled: Boolean(criteria),
    queryFn: async () => {
      if (!criteria) return null;
      const res = await getStatement(criteria);
      if (res.error) {
        throw new Error(res.error.message || 'Failed to fetch customer statement');
      }
      return res.data ?? null;
    },
  });
}

export function useStatementExportMutation() {
  const toast = useToast();

  return useMutation({
    mutationFn: async ({
      criteria,
      format,
    }: {
      criteria: StatementCriteria;
      format: StatementExportFormat;
    }) => {
      const res = await downloadStatementDocument(criteria, format);
      if (res.error) {
        throw new Error(res.error.message || 'Failed to download statement export');
      }
      return { blob: res.data, criteria, format };
    },
    onSuccess: ({ blob, criteria, format }) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = Object.assign(document.createElement('a'), {
        href: url,
        download: buildStatementExportFilename(criteria, format),
      });
      a.click();
      URL.revokeObjectURL(url);
      toast.success(
        format === 'pdf' ? 'Statement PDF downloaded' : 'Statement Excel downloaded'
      );
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
