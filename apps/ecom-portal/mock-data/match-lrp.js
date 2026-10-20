#!/usr/bin/env node
/**
 * Which LRP database belongs to the e-commerce fixtures? Counts how many of the sampled agency
 * booking numbers (bookings.extBookNo / SI bookno) and B/L numbers (shippingInstructions.blno) exist
 * in the `booking` / `bl` tables of each candidate database on the DB_ECOMDB server.
 *   node match-lrp.js [db1,db2,…]
 */
import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import sql from 'mssql';

const base = process.env.DB_ECOMDB;
if (!base) { console.error('DB_ECOMDB is not set in .env'); process.exit(1); }
const forDb = name => base.replace(/Database=[^;]+/i, `Database=${name}`) + ';Connection Timeout=10;Request Timeout=90000';
const FIX = path.resolve(process.env.OUT_DIR ?? '../src/mocks/fixtures');
const load = async n => JSON.parse(await fs.readFile(path.join(FIX, `${n}.json`), 'utf8'));
const uniq = a => [...new Set(a.filter(v => v != null && String(v).trim() !== ''))];
const quote = vals => '(' + vals.map(v => `'${String(v).replace(/'/g, "''")}'`).join(',') + ')';

const sis = await load('shippingInstructions');
const bookNos = uniq([...(await load('bookings')).map(b => b.extBookNo), ...sis.map(s => s.bookno)]);
const blNos = uniq(sis.map(s => s.blno));
const candidates = (process.argv[2] ?? 'Documentation,MARPTRN,TMRM,jsf_release,PRODDevold,MMR_New').split(',');
console.log(`${bookNos.length} booking numbers, ${blNos.length} B/L numbers from the fixtures\n`);

for (const db of candidates) {
  let pool;
  try {
    pool = await new sql.ConnectionPool(forDb(db)).connect();
    const cols = (await pool.request().query(`
      select table_name, column_name from information_schema.columns
       where table_name in ('booking','bl') and lower(column_name) in ('bookno','blno','book_no','bl_no')`)).recordset;
    const bookCol = cols.find(c => c.table_name.toLowerCase() === 'booking')?.column_name;
    const blCol = cols.find(c => c.table_name.toLowerCase() === 'bl')?.column_name;
    const parts = [];
    if (bookCol) parts.push(`select 'booking' as t, count(distinct [${bookCol}]) as n from booking(nolock) where [${bookCol}] in ${quote(bookNos)}`);
    if (blCol) parts.push(`select 'bl', count(distinct [${blCol}]) from bl(nolock) where [${blCol}] in ${quote(blNos)}`);
    if (!parts.length) { console.log(`  ${db.padEnd(16)} no booking/bl key columns`); continue; }
    const r = (await pool.request().query(parts.join(' union all '))).recordset;
    console.log(`  ${db.padEnd(16)} ${r.map(x => `${x.t}: ${x.n}`).join('   ')}`);
  } catch (e) { console.log(`  ${db.padEnd(16)} error: ${e.message.split('\n')[0].slice(0, 80)}`); }
  finally { await pool?.close().catch(() => {}); }
}
