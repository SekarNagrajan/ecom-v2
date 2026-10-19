# Rates module — LRP V2 Testing (Commercial) showcase

**Server:** `192.168.11.153,1111\V2` (read-only `read_acc`)  
**Source DB:** `Commercial` → `bookingrates_tariff`, `Routedetail`, `corporateMaster` + children  
**Last extract:** see `src/mocks/fixtures/_manifest.json`

## 10 demo port pairs

| # | POL → POD | Typical use |
| --- | --- | --- |
| 1 | **INNSA → AEJEA** | Default search (Nhava Sheva → Jebel Ali) |
| 2 | INNSA → SADMM | India → Dammam |
| 3 | INNSA → SGSIN | India → Singapore |
| 4 | INMUN → SGSIN | Mundra → Singapore |
| 5 | INMAA → SGSIN | Chennai → Singapore |
| 6 | INMAA → SADMM | Chennai → Dammam |
| 7 | USILG → GTPBR | Wilmington → Puerto Barrios |
| 8 | SGSIN → MYPKG | Singapore → Port Klang |
| 9 | INMUN → AEJEA | Mundra → Jebel Ali |
| 10 | AEJEA → INNSA | Return / reverse lane |

## Tabs → fixtures

| Tab | Fixtures |
| --- | --- |
| **Tariff** | `tariffs.json` (800 rows, showcase lanes first) |
| **Surcharge** | `charges` + `contractSurcharges` / placeholder via `rates.bridge` |
| **Service Contract** | `contracts`, `contractLines`, `contractSurcharges`, `contractRouting`, … |
| **Request for Quote** | Derived from `ecomRouteSearchLog` + **session creates** via `POST /api/v1/rates/quotes` |

## Booking Master Details (origin / delivery)

When the user picks a POL→POD on **New Booking → Master Details**:

| Data | Source |
| --- | --- |
| **Rates** picker | Commercial `tariffs` (merged with booking-derived rates) |
| **Vessel / route** popup | VSS `allschedules_ecom` via `searchSchedules`, else `ecombooking_leg` |

Lanes with tariffs **and** sailings in VSS show both. Lanes with tariffs only (e.g. INNSA→SADMM, USILG→GTPBR — almost no VSS sailings on UAT) still show rates; route stays empty until a sailing exists.

## Create quote (drawer)

1. Open **Request for Quote** → fill drawer → submit.  
2. Quote is stored in the mock **session** (`sessionQuotes` in `rates.bridge.ts`) and persisted under `mock-data/runtime/user/session.json` via `PUT /api/_mock/user-db` (same sidecar as My Account quote requests).  
3. UI switches to **Spot Quotes** for that POL/POD so the new row appears at the top.  
4. Session quotes survive refresh while the user overlay is present; clear with `DELETE /api/_mock/user-db` or `POST /api/_mock/reset` (fixtures re-seeded, overlay removed).

## Re-extract

```bash
cd apps/ecom-portal/mock-data
# .env must point at LRP V2 Testing (read-only)
npm run dump
npm run extract:masters
```

Showcase lanes are defined in `extract.masters.config.js` as `RATES_SHOWCASE_LANES`.
