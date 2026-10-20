# Fixtures (generated — do not hand-edit casually)

JSON tables produced by `apps/ecom-portal/mock-data`:

- `npm run dump` — top 50 rows of every e-commerce table (`Ecomm_JSF`), children following their sampled
  parents, credential columns removed, people and companies anonymised, dates shifted so the newest booking is
  "today".
- `npm run extract:masters` — master data, vessels, sailing schedules, LRP booking / B/L / container moves,
  routing, tariffs, invoices, receipts and arrival notices for the sampled shipments and customers, from the
  other databases on the same server, with the same date shift.

`_manifest.json` records the source database/table, row count and sampling strategy of every file.
`src/mocks/fixture-api/db.ts` loads every `*.json` here into an in-memory store at startup (property access on
rows is case-insensitive); the MSW handlers in `src/mocks/` derive their responses from it through the mappers in
`src/mocks/fixture-api/bridges/`. Re-run the two scripts to refresh the sample; a small hand edit for a demo is
fine but will be overwritten by the next run.
