# mock-data – fixtures from the existing SQL Server databases

Standalone Node scripts (not part of the Vite build). They connect with **read-only**
credentials, sample records, anonymise people and companies, and write JSON fixtures into
`../src/mocks/fixtures/`. The portal's MSW layer (`src/mocks/fixture-api/` and the module
handlers in `src/mocks/*.handlers.ts`) serves those fixtures in the browser, so the demo shows
real port codes, booking numbers, vessels and workflows without a backend.

Two steps, run in this order:

| Step | Script | What it does |
| --- | --- | --- |
| 1 | `npm run dump` (`dump-all.js`, database `DB_ECOMDB`) | Top `DUMP_TOP` (50) rows of **every** e-commerce table; booking / SI / payment / user children follow their sampled parents and are topped up with recent rows; credential tables and columns skipped; PII anonymised; dates shifted so the newest booking is today. |
| 2 | `npm run extract:masters` (`extract.js --config ./extract.masters.config.js`) | Everything that is **not** in the e-commerce database, scoped to the shipments and customers dumped in step 1: master data (Masters), vessels / services / sailing schedules / port calls (VSS), LRP booking, B/L, parties and container moves for the sampled shipments (Documentation), routing and tariffs (Commercial), invoices, receipts and allocations (Accounts), arrival notices and delivery-order versions (Imports). Uses the same date shift as step 1 (read from `_manifest.json`). |

`extract.js` with the default `extract.config.js` is the original multi-database catalogue for an environment
where master data lives in LRPV1; keep it as reference. Discovery helpers: `npm run inspect` (tables + row
counts of `DB_ECOMDB`; `inspect:columns` adds columns), `node databases.js [db] [filter|=exact,names] [--columns]`
(databases visible to the login, or the objects of one database), `node match-lrp.js` (which LRP database
holds the sampled booking and B/L numbers), `node probe.js` (which databases contain the tables / procedures
the EJB layer uses), `node proc-params.js <db> <proc,…>` (stored-procedure parameter lists).

### Where the data lives on the LRP V2 test server (192.168.11.153)

| EJB datasource | Database | Used for |
| --- | --- | --- |
| ECOMDB | `Ecomm_JSF` | portal tables: bookings, SIs, VGM, payments, users, config |
| MASTERDB | `Masters` | ports, countries, states, commodities, packages, equipment, terminals, depots, carriers, charges, customer master |
| LRPV1 (documentation) | `Documentation` | `booking`, `bl`, `booking_leg`, `booking_cargo`, `bl_cargo`, `*_cust`, `operationDetail` (container moves), `bltelexrelease` |
| VSSDB | `VSS` | `Vesselmaster`, `service`, `allschedules_ecom` (sailing schedule view), `arrival_master` (actual port calls) |
| COMDB | `Commercial` | `Routedetail`, `bookingrates_tariff` / `bookingrates_lcltariff` views, surcharge tables, `usp_svcGlobalSurchargeMain` |
| ReportDB | `ReportDB` | `usp_getecombookingsummary`, `usp_ecomSISummaryNew`, `usp_CustomerStatement` (23 parameters) |
| ACCDB | `Accounts` | `invoicemaster`, `invoicedetail`, `invoicedbls`, `receiptmaster`, `receiptdetail`, `CUSTOMEROUTSTANDINGDETAILS` |
| — | `Imports` | `reportcargoarrival` (arrival notices), `deliveryorderversion` |

Not available anywhere: the SVM named-query (`@VDS`) SQL for CRO / DO / arrival-notice detail screens (the
`VDS` database only holds server details), a CRO master table, surcharge amounts per lane, quotations, and
carbon data. Those parts of the UI are derived from related fixtures (marked `TODO(fixtures)` in code) or stay
hand-written (carbon).

## Run it

```bash
cd apps/ecom-portal/mock-data
npm install                 # standalone project; pnpm workspace does not manage it
cp .env.example .env        # fill in the connection string(s) (a read-only login is enough)
npm run inspect             # tables + row counts: confirms connectivity and what the DB holds
npm run dump:dry            # plan + row counts, writes nothing
npm run dump                # writes ../src/mocks/fixtures/*.json + _manifest.json (replaces the previous *.json)
```

Settings in `.env`: `DUMP_TOP` (rows per table, default 50), `DUMP_CHILD_CAP` (max child rows per
table, default 400), `ANONYMIZE=false` to keep real names/e-mails (never do this for a public demo
build), `SHIFT_DATES_TO_NOW=false` to keep original dates, `OUT_DIR`.

### What `dump` protects

- Tables that only hold credentials, tokens or webhook payloads are skipped (`SKIP_TABLES`).
- Password, hash, token, OTP, tax-ID and bank columns are never selected (`DROP_COLUMNS`).
- Config tables (`globalconfigproduct`, `EcomConfiguration`, `EcomSetting`) lose every row whose key
  looks like a credential, mailbox, URL or server path.
- Person and company columns are replaced by deterministic Faker values; any e-mail-shaped string in
  **any** column or inside free text is replaced too; internal host names are stripped from URLs.
  Port, booking, container, vessel and commodity codes are kept, so screens look like the client's business.

The committed fixtures were produced from the LRP V2 Testing server on 2026-10-16/17 (`npm run dump` + `npm run extract:masters`).


## Curated multi-database extraction (`npm run extract`)

Missing a connection string? Leave that line out of `.env`; every dataset on that
database is skipped and the log says which ones. A line marked `FAIL` is almost always
a column name that differs in your schema: fix it in `extract.config.js` and re-run.

What it extracts (see `extract.config.js`):

1. **Master data** from LRPV1 (`ports`, `country`, `commodity`, `package`, `service`,
   `vesselmaster`, `equipments`, …) using the queries from
   `EcomV1MasterBean.getEcomV1MasterCache`, plus `Statesmaster`, `shipmentTerms` and
   105 days of `allschedules`.
2. **Portal config/content** from ECOMDB: menus, UI messages, advisories, login images,
   hotline contacts, cut-off config, notices, notifications. `globalconfigproduct` is
   filtered so URLs, mail IDs and anything credential-like are dropped.
3. **Customers**: the `SAMPLE_CUSTOMERS` customers with the most recent bookings, then
   their `ecom_reg_details`, `ecomuserdetails`, `customermaster` and menu privileges.
   Password, token and tax-ID columns are never selected.
4. **Bookings**: `SAMPLE_BOOKINGS` most recent bookings for those customers and every
   child table by `ebookno` (parties, cargo, commodities, DG, OOG, reefer, legs, haulage,
   cut-offs, files, ENS, insurance).
5. **Shipping instructions / B/L drafts**: `SAMPLE_SI` recent `ecomSI` rows and all child
   tables by `eSINo`. Rows with `editbl=1` are B/L amendments.
6. **VGM** submissions for the sampled bookings; **online payments** with references.
7. Optional **summary stored procedures** (`usp_getecombookingsummary`,
   `usp_ecomSISummaryNew`, `usp_GetBLNumbersEcomOn`), disabled until their parameter
   order is confirmed with `sp_helptext`.

`_manifest.json` records the source database of every dataset, so ECOMDB rows and
LRPV1 rows are never silently mixed.

### Anonymisation

`anonymize: { column: kind }` replaces values with Faker output. The mapping is
**deterministic**: the same real email becomes the same fake email in `users`,
`userDetails`, `bookings.usercr`, `shippingInstructions.CrUser`, … so logins and audit
columns stay consistent. Company, vessel, port and commodity codes are kept as-is.

### Dates

With `SHIFT_DATES_TO_NOW=true` (default) every date column is shifted by the same
offset so the newest booking lands on today.

### Adjusting the sample

Tweak `SAMPLE_*` in `.env`, or hand-edit the JSON. Fixtures are plain, readable JSON
(1-space indent). Re-run the extractor whenever you want a fresh sample.

## How the portal uses the fixtures

- `src/mocks/fixture-api/db.ts` loads `src/mocks/fixtures/*.json` into an in-memory
  store (stateful for the browser session; `POST /api/_mock/reset` restores it). Rows are
  case-insensitive on property access because the real column casing (`agencyRefNo`, `Datecr`,
  `eSINo`) differs from the EJB report.
- The module handlers (`src/mocks/booking.handlers.ts`, `si.handlers.ts`, `bl.handlers.ts`,
  `vgm.handlers.ts`, `admin.handlers.ts`, `auth.handlers.ts`, `user-modules.handlers.ts`, …) and the
  dashboard derive their responses from the store through pure mappers in
  `src/mocks/fixture-api/bridges/*.bridge.ts`. Modules without a table in the e-commerce DB
  (schedules, rates, tracking, delivery order, arrival notice, CRO, customer statement, carbon,
  master ports/countries) keep their hand-written mocks until a master-data extraction runs.
- `src/mocks/fixture-api/handlers/*` serve a REST contract over that store
  (`/api/bookings`, `/api/shipping-instructions`, `/api/bills-of-lading`, `/api/vgm`,
  `/api/schedules/*`, `/api/masters/*`, `/api/dashboard`, `/api/payments`, …).
  They are registered after the hand-written handlers in `src/mocks/browser.ts`.
- `src/api/client.ts` is a typed client for the fixture-api contract.

Verify in the browser (mock mode) with `/api/_mock/status` (row counts per table) and
`/api/auth/demo-users` (login names that exist in the fixtures).
