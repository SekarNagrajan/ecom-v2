// Modified by Sekar Nagarajan (2026-08-25 12:45)
import { delay, http, HttpResponse } from 'msw';

import {
  statementCriteriaSchema,
  type StatementCriteria,
} from '../features/customer-statement/types/customer-statement.types';
import {
  getMockStatement,
  mockStatementAccounts,
} from './customer-statement.mock-data';

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

/**
 * Specific paths before the bare `/statement` list endpoint
 * so document/export/accounts are never swallowed incorrectly.
 */
export const customerStatementHandlers = [
  http.get('*/api/ecom/fin/statement/accounts', async () => {
    await delay(150);
    return HttpResponse.json({ data: mockStatementAccounts });
  }),

  http.get('*/api/ecom/fin/statement/document', async ({ request }) => {
    await delay(400);
    const url = new URL(request.url);
    const criteria = readCriteria(url);
    const parsed = validateCriteria(criteria);
    if (!parsed.success) {
      return HttpResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: parsed.error.issues[0]?.message ?? 'Invalid criteria',
          },
        },
        { status: 400 }
      );
    }
    const statement = getMockStatement(parsed.data);
    if (!statement) {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Account not found' } },
        { status: 404 }
      );
    }
    const filename = `Statement_${criteria.accountId}_${criteria.fromDate}_${criteria.toDate}.pdf`;
    const content = `%PDF-1.4 Mock Customer Statement for ${statement.accountName}`;
    return new HttpResponse(new Blob([content], { type: 'application/pdf' }), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  }),

  http.get('*/api/ecom/fin/statement/export', async ({ request }) => {
    await delay(400);
    const url = new URL(request.url);
    const criteria = readCriteria(url);
    const parsed = validateCriteria(criteria);
    if (!parsed.success) {
      return HttpResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: parsed.error.issues[0]?.message ?? 'Invalid criteria',
          },
        },
        { status: 400 }
      );
    }
    const statement = getMockStatement(parsed.data);
    if (!statement) {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Account not found' } },
        { status: 404 }
      );
    }
    const filename = `Statement_${criteria.accountId}_${criteria.fromDate}_${criteria.toDate}.xlsx`;
    const content = `Mock Customer Statement XLSX for ${statement.accountName}`;
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
    const url = new URL(request.url);
    const criteria = readCriteria(url);
    const parsed = validateCriteria(criteria);
    if (!parsed.success) {
      return HttpResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: parsed.error.issues[0]?.message ?? 'Invalid criteria',
          },
        },
        { status: 400 }
      );
    }
    const data = getMockStatement(parsed.data);
    if (!data) {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Account not found' } },
        { status: 404 }
      );
    }
    return HttpResponse.json({ data });
  }),
];
