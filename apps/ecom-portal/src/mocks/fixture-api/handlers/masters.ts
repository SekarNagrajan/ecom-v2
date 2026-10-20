// Modified by Sekar Nagarajan (2026-10-17 00:20)
import { http } from 'msw';
import { db, eq, type Row, type TableName } from '../db';
import { API, latency, ok, matches, notFound } from '../utils';

/**
 * Generic lookup: GET /api/masters/<name>?q=term&limit=50
 * Each entry says which fixture backs it and which fields the search term is matched against.
 * Column names are the extracted ones: ports portcode/portname/countrycode, equipments Equiptype/equipdesc,
 * vessels VesselCode/VesselName, services servicecode/servicename, charges chargecode/chargename.
 */
const LOOKUPS: Record<string, { table: TableName; search: string[] }> = {
  ports: { table: 'ports', search: ['portcode', 'portname'] },
  countries: { table: 'countries', search: ['countrycode', 'countryname'] },
  commodities: { table: 'commodities', search: ['comdtycode', 'comdtyname'] },
  packages: { table: 'packages', search: ['packagecode', 'description'] },
  services: { table: 'services', search: ['servicecode', 'servicename'] },
  vessels: { table: 'vessels', search: ['VesselCode', 'VesselName'] },
  terminals: { table: 'terminals', search: ['terminalcode', 'terminalname'] },
  equipments: { table: 'equipments', search: ['Equiptype', 'equipdesc'] },
  charges: { table: 'charges', search: ['chargecode', 'chargename', 'chargegrp'] },
  customers: { table: 'customerMaster', search: ['CustCode', 'CustName', 'City'] },
  'transport-services': { table: 'transportServices', search: ['trptsvccode', 'trptsvcname'] },
  depots: { table: 'depots', search: ['depot', 'description'] },
  'intransit-pods': { table: 'inTransitPods', search: ['dmsfinaldest', 'dmsfinaldestdesc'] },
  carriers: { table: 'carriers', search: ['carriercode', 'CARRIERNAME'] },
  'shipment-terms': { table: 'shipmentTerms', search: ['ShipTerms', 'termsDesc'] },
  'hotline-contacts': { table: 'hotlineContacts', search: ['countryname', 'portname', 'ContactName'] },
  'cutoff-config': { table: 'cutoffConfig', search: ['port', 'terminal'] },
  languages: { table: 'languages', search: ['langcode', 'langname'] },
};

/** portcode (lower-case) → countrycode from portCountryMap, for ports whose master row has no country. */
const byPortCountry = () => new Map(db.portCountryMap.map(m => [String(m.portcode).toLowerCase(), m.countrycode]));
const withCountry = (p: Row, byPort: Map<string, unknown>): Row => ({
  ...p,
  countrycode: String(p.countrycode ?? '').trim() || byPort.get(String(p.portcode).toLowerCase()) || null,
});

export const masterHandlers = [
  http.get(`${API}/masters/states`, async ({ request }) => {
    await latency();
    const url = new URL(request.url);
    const country = url.searchParams.get('country');
    const q = url.searchParams.get('q');
    let items = db.states;
    if (country) items = items.filter(s => eq(s.countrycode, country));
    items = items.filter(s => matches(s, ['statecode', 'statedesc'], q));
    return ok(items);
  }),

  /** One port; the country code comes from the ports master itself, else from portCountryMap. */
  http.get(`${API}/masters/ports/:portcode`, async ({ params }) => {
    await latency();
    const port = db.ports.find(p => eq(p.portcode, params.portcode));
    if (!port) return notFound('Port not found');
    return ok(withCountry(port, byPortCountry()));
  }),

  http.get(`${API}/masters/:name`, async ({ request, params }) => {
    await latency();
    const def = LOOKUPS[String(params.name)];
    if (!def) return notFound(`Unknown master '${params.name}'`);
    const url = new URL(request.url);
    const q = url.searchParams.get('q');
    const limit = Number(url.searchParams.get('limit') ?? 0);
    let items: Row[] = db[def.table].filter(r => matches(r, def.search, q));
    if (def.table === 'ports') {
      const byPort = byPortCountry();
      items = items.map(p => withCountry(p, byPort));
    }
    if (limit > 0) items = items.slice(0, limit);
    return ok(items);
  }),

  http.get(`${API}/config`, async () => {
    await latency();
    const flags = Object.fromEntries(db.globalConfig.map(c => [c.pathname, c.pathvalue]));
    return ok({ flags, fieldConfig: db.fieldConfig });
  }),
];
