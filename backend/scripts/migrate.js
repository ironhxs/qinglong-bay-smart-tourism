const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3');

// 当 cwd 为 backend/ 时，需要回到上级再定位 database 目录
const rootDir = path.resolve(__dirname, '../../');
const schemaPath = path.join(rootDir, 'database', 'schema.sql');
const dbPath = path.join(rootDir, 'database', 'qlb.db');

if (!fs.existsSync(schemaPath)) {
  console.error('schema.sql not found.');
  process.exit(1);
}

const sql = fs.readFileSync(schemaPath, 'utf-8');

const db = new sqlite3.Database(dbPath);

db.exec(sql, (err) => {
  if (err) {
    console.error('Migration error', err.message);
    process.exit(1);
  }
  console.log('Migration success');
  db.close();
}); 