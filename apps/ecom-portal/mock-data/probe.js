#!/usr/bin/env node
/**
 * Finds which databases on the DB_ECOMDB server contain the tables / procedures the EJB layer uses.
 *   node probe.js                → matrix of table → databases (with row counts) and procedure → databases
 *   node probe.js name1,name2    → probe only these object names
 */
import 'dotenv/config';
import sql from 'mssql';

const base = process.env.DB_ECOMDB;
if (!base) { console.error('DB_ECOMDB is not set in .env'); process.exit(1); }
const forDb = name => base.replace(/Database=[^;]+/i, `Database=${name}`) + ';Connection Timeout=8;Request Timeout=15000';

const DEFAULT_TABLES = ['ports', 'vesselmaster', 'country', 'commodity', 'package', 'equipments', 'service', 'terminalanddepot',
  'transportservice', 'DepotCode', 'DMSInTransit', 'Statesmaster', 'CARRIER', 'customermaster', 'CITYMASTER', 'shipmentTerms',
  'allschedules', 'Routedetail', 'operationdetail', 'booking_leg', 'bl', 'booking', 'charges', 'cratmpSurcharge', 'cracomsureqp',
  'cracomsurcomd', 'bkgconfig', 'feederscheduleVendors', 'VendorDetails', 'invoice', 'invoicecustomerstatementview'];
const DEFAULT_PROCS = ['usp_CustomerStatement', 'usp_getecombookingsummary', 'usp_ecomSISummaryNew', 'usp_GetBLNumbersEcomOn',
  'usp_svcGlobalSurchargeMain', 'getecomroutinginformation', 'getecomcrodetails', 'getecomdosummarydetails', 'getecomarnsummarydetails'];
const wanted = process.argv[2] ? process.argv[2].split(',') : [...DEFAULT_TABLES, ...DEFAULT_PROCS];
const lower = wanted.map(w => w.toLowerCase());
const list = '(' + lower.map(w => `'${w.replace(/'/g, "''")}'`).join(',') + ')';

const master = await new sql.ConnectionPool(forDb('master')).connect();
const dbs = (await master.request().query(`select name from sys.databases where database_id > 4 and state_desc = 'ONLINE' order by name`)).recordset.map(r => r.name);
await master.close();

const found = new Map(); // object → [{db, rows}]
for (const db of dbs) {
  let pool;
  try {
    pool = await new sql.ConnectionPool(forDb(db)).connect();
    const t = (await pool.request().query(`
      select t.name, max(p.rows) as [rows] from sys.tables t join sys.partitions p on p.object_id = t.object_id and p.index_id in (0,1)
       where lower(t.name) in ${list} group by t.name
      union all
      select v.name, -1 from sys.views v where lower(v.name) in ${list}
      union all
      select o.name, -2 from sys.objects o where o.type in ('P','FN','IF','TF') and lower(o.name) in ${list}`)).recordset;
    for (const r of t) { const k = r.name; if (!found.has(k)) found.set(k, []); found.get(k).push({ db, rows: r.rows }); }
    process.stdout.write(t.length ? `${db}:${t.length} ` : '');
  } catch (e) { process.stdout.write(`[${db}: ${e.message.split('\n')[0].slice(0, 40)}] `); }
  finally { await pool?.close().catch(() => {}); }
}
console.log('\n');
for (const w of wanted) {
  const hits = [...found.entries()].filter(([k]) => k.toLowerCase() === w.toLowerCase()).flatMap(([, v]) => v);
  const fmt = h => `${h.db}${h.rows >= 0 ? `(${h.rows})` : h.rows === -1 ? '(view)' : '(proc)'}`;
  console.log(`${w.padEnd(30)} ${hits.length ? hits.map(fmt).join(', ') : '—'}`);
}
