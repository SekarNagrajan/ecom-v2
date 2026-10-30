#!/usr/bin/env node
/**
 * Lists the databases visible to the DB_ECOMDB login on its server, with the number of user tables
 * the login can read in each. Helps point DB_LRPV1DS / DB_MASTERDB / DB_REPORTDB at the right names.
 *   node databases.js            → database list
 *   node databases.js <db> [filter]  → tables (+row counts) of that database, optionally name-filtered
 */
import 'dotenv/config';
import sql from 'mssql';

const base = process.env.DB_ECOMDB;
if (!base) { console.error('DB_ECOMDB is not set in .env'); process.exit(1); }
const [dbArg, filter] = process.argv.slice(2);
const forDb = name => base.replace(/Database=[^;]+/i, `Database=${name}`);

if (!dbArg) {
  const pool = await new sql.ConnectionPool(forDb('master')).connect();
  const dbs = (await pool.request().query(`select name, state_desc from sys.databases where database_id > 4 order by name`)).recordset;
  await pool.close();
  console.log(`${dbs.length} databases visible on the server`);
  for (const d of dbs) {
    let info = '';
    try {
      const p = await new sql.ConnectionPool(forDb(d.name)).connect();
      const r = (await p.request().query(`select count(*) as n from sys.tables`)).recordset[0];
      info = `${r.n} tables`;
      await p.close();
    } catch (e) { info = `no access (${e.message.split('\n')[0].slice(0, 60)})`; }
    console.log(`  ${d.name.padEnd(30)} ${d.state_desc.padEnd(8)} ${info}`);
  }
} else {
  const withColumns = process.argv.includes('--columns');
  const pool = await new sql.ConnectionPool(forDb(dbArg)).connect();
  const rows = (await pool.request().query(`
    select o.name, o.type_desc, s.name as [schema], isnull(p.rows, -1) as [rows], sy.base_object_name
      from sys.objects o
      join sys.schemas s on s.schema_id = o.schema_id
      left join (select object_id, max(rows) as rows from sys.partitions where index_id in (0,1) group by object_id) p on p.object_id = o.object_id
      left join sys.synonyms sy on sy.object_id = o.object_id
     where o.type in ('U','V','IF','TF','FN','SN')
     order by o.name`)).recordset;
  // filter: substring match, or exact names with '=a,b,c'
  const match = r => !filter || filter === '--columns' ? true
    : filter.startsWith('=') ? filter.slice(1).toLowerCase().split(',').includes(r.name.toLowerCase())
    : r.name.toLowerCase().includes(filter.toLowerCase());
  const list = rows.filter(match);
  console.log(`${list.length} objects in ${dbArg}${filter && filter !== '--columns' ? ` matching '${filter}'` : ''}`);
  for (const r of list) console.log(`${String(r.rows >= 0 ? r.rows : '').padStart(10)}  ${r.schema}.${r.name}  [${r.type_desc}${r.base_object_name ? ' → ' + r.base_object_name : ''}]`);
  if (withColumns) {
    const names = list.map(r => `'${r.name.replace(/'/g, "''")}'`).join(',') || "''";
    const cols = (await pool.request().query(`
      select object_name(c.object_id) as obj, c.name, t.name as type, c.max_length
        from sys.columns c join sys.types t on t.user_type_id = c.user_type_id
       where object_name(c.object_id) in (${names}) order by obj, c.column_id`)).recordset;
    const by = new Map();
    for (const c of cols) { if (!by.has(c.obj)) by.set(c.obj, []); by.get(c.obj).push(`${c.name}:${c.type}`); }
    console.log('--- columns ---');
    for (const [k, v] of by) console.log(`${k}: ${v.join(', ')}`);
  }
  await pool.close();
}
