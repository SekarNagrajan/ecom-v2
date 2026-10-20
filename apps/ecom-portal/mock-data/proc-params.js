#!/usr/bin/env node
/**
 * Parameter lists of stored procedures (from sys.parameters), to fill `params` in extract.config.js.
 *   node proc-params.js <database> <proc1,proc2,…>
 */
import 'dotenv/config';
import sql from 'mssql';
const base = process.env.DB_ECOMDB;
const [db, names] = process.argv.slice(2);
if (!base || !db || !names) { console.error('usage: node proc-params.js <database> <proc1,proc2>'); process.exit(1); }
const pool = await new sql.ConnectionPool(base.replace(/Database=[^;]+/i, `Database=${db}`) + ';Connection Timeout=10').connect();
const list = names.split(',').map(n => `'${n.replace(/'/g, "''")}'`).join(',');
const rows = (await pool.request().query(`
  select o.name as proc_name, p.parameter_id as pos, p.name as param, t.name as type, p.max_length as len, p.has_default_value as hasDefault, p.is_output as isOutput
    from sys.objects o left join sys.parameters p on p.object_id = o.object_id left join sys.types t on t.user_type_id = p.user_type_id
   where o.type = 'P' and o.name in (${list}) order by o.name, p.parameter_id`)).recordset;
await pool.close();
let cur = '';
for (const r of rows) {
  if (r.proc_name !== cur) { cur = r.proc_name; console.log(`\n${cur}`); }
  if (r.param) console.log(`  ${String(r.pos).padStart(2)}  ${r.param.padEnd(28)} ${r.type}${r.len > 0 && /char/.test(r.type) ? `(${r.len})` : ''}${r.isOutput ? ' OUTPUT' : ''}`);
  else console.log('  (no parameters)');
}
