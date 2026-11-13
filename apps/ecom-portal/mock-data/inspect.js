#!/usr/bin/env node
/**
 * Lists every user table in the DB_ECOMDB database with its row count (and columns with --columns).
 *   node inspect.js            → table list with row counts
 *   node inspect.js --columns  → also prints column names / types
 * Connection string comes from .env (DB_ECOMDB), never from the command line.
 */
import 'dotenv/config';
import sql from 'mssql';

const connStr = process.env.DB_ECOMDB;
if (!connStr) { console.error('DB_ECOMDB is not set in .env'); process.exit(1); }
const withColumns = process.argv.includes('--columns');

const pool = await new sql.ConnectionPool(connStr).connect();
const tables = (await pool.request().query(`
  select s.name as [schema], t.name as [table], max(p.rows) as [rows]
    from sys.tables t
    join sys.schemas s on s.schema_id = t.schema_id
    join sys.partitions p on p.object_id = t.object_id and p.index_id in (0, 1)
   group by s.name, t.name
   order by s.name, t.name`)).recordset;

console.log(`${tables.length} tables in ${/Database=([^;]+)/i.exec(connStr)?.[1] ?? '?'}`);
for (const t of tables) console.log(`${String(t.rows).padStart(9)}  ${t.schema}.${t.table}`);

if (withColumns) {
  const cols = (await pool.request().query(`
    select table_schema, table_name, column_name, data_type
      from information_schema.columns
     order by table_schema, table_name, ordinal_position`)).recordset;
  const byTable = new Map();
  for (const c of cols) {
    const key = `${c.table_schema}.${c.table_name}`;
    if (!byTable.has(key)) byTable.set(key, []);
    byTable.get(key).push(`${c.column_name}:${c.data_type}`);
  }
  console.log('\n--- columns ---');
  for (const [key, list] of byTable) console.log(`${key}: ${list.join(', ')}`);
}
await pool.close();
