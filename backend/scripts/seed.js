const fs = require('fs/promises');
const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const run = async () => {
  const rootDir = path.resolve(__dirname, '../../');
  const db = await open({
    filename: path.join(rootDir, 'database', 'qlb.db'),
    driver: sqlite3.Database,
  });
  const jsonPath = path.join(rootDir, 'database', 'seed.json');
  const raw = await fs.readFile(jsonPath, 'utf-8');
  const data = JSON.parse(raw);
  await db.exec('BEGIN');
  for (const a of data) {
    await db.run(
      'INSERT OR IGNORE INTO attractions (id, name, description, latitude, longitude) VALUES (?,?,?,?,?)',
      a.id,
      a.name,
      a.description,
      a.latitude,
      a.longitude,
    );
  }
  await db.exec('COMMIT');
  console.log('Seed completed');
  await db.close();
};
run(); 