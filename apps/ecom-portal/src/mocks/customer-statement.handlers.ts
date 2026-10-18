// Modified by Sekar Nagarajan (2026-10-17 00:25)
import { delay, http, HttpResponse } from 'msw';

import {
  statementCriteriaSchema,
  type StatementCriteria,
} from '../features/customer-statement/types/customer-statement.types';
import {
  buildStatementDocument,
  buildStatementExport,
  fixtureStatement,
  fixtureStatementAccounts,
} from './fixture-api/bridges/statement.bridge';

function readCriteria(url: URL): StatementCriteria {
  return {
    accountId: url.searchParams.get('accountId') ?? '',
    currency: url.searchParams.get('currency') ?? '',
    fromDate: url.searchParams.get('fromDate') ?? '',
    toDate: url.searchParams.get('toDate') ?? '',
  };
}

function validateCriteria(criteria: StatementCriteria) {
  return statementCriteriaSchema.safeParse(criteria);
}

const validationError = (message: string | undefined) =>
  HttpResponse.json(
    { error: { code: 'VALIDATION_ERROR', message: message ?? 'Invalid criteria' } },
    { status: 400 }
  );

const notFound = () =>
  HttpResponse.json({ error: { code: 'NOT_FOUND', message: 'Account not found' } }, { status: 404 });

/**
 * Specific paths before the bare `/statement` list endpoint
 * so document/export/accounts are never swallowed incorrectly.
 * Figures come from the Accounts fixtures (invoicemaster / receiptmaster …) via statement.bridge.
 */
export const customerStatementHandlers = [
  http.get('*/api/ecom/fin/statement/accounts', async () => {
    await delay(150);
    return HttpResponse.json({ data: fixtureStatementAccounts() });
  }),

  http.get('*/api/ecom/fin/statement/document', async ({ request }) => {
    await delay(400);
    const criteria = readCriteria(new URL(request.url));
    const parsed = validateCriteria(criteria);
    if (!parsed.success) return validationError(parsed.error.issues[0]?.message);
    const result = fixtureStatement(parsed.data);
    if (!result) return notFound();
    const filename = `Statement_${criteria.accountId}_${criteria.fromDate}_${criteria.toDate}.pdf`;
    const content = buildStatementDocument(result.statement, result.ageing, result.documents);
    return new HttpResponse(new Blob([content], { type: 'application/pdf' }), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  }),

  http.get('*/api/ecom/fin/statement/export', async ({ request }) => {
    await delay(400);
    const criteria = readCriteria(new URL(request.url));
    const parsed = validateCriteria(criteria);
    if (!parsed.success) return validationError(parsed.error.issues[0]?.message);
    const result = fixtureStatement(parsed.data);
    if (!result) return notFound();
    const filename = `Statement_${criteria.accountId}_${criteria.fromDate}_${criteria.toDate}.xlsx`;
    const content = buildStatementExport(result.statement, result.ageing);
    return new HttpResponse(
      new Blob([content], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }),
      {
        headers: {
          'Content-Type':
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      }
    );
  }),

  http.get('*/api/ecom/fin/statement', async ({ request }) => {
    await delay(250);
    const criteria = readCriteria(new URL(request.url));
    const parsed = validateCriteria(criteria);
    if (!parsed.success) return validationError(parsed.error.issues[0]?.message);
    const result = fixtureStatement(parsed.data);
    if (!result) return notFound();
    return HttpResponse.json({ data: result.statement });
  }),
];
