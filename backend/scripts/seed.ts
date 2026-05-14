import fs from 'fs/promises';
import path from 'path';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const run = async () => {
  const db = await open({
    filename: path.join(process.cwd(), 'database', 'qlb.db'),
    driver: sqlite3.Database,
  });

  const jsonPath = path.join(process.cwd(), 'database', 'seed.json');
  const raw = await fs.readFile(jsonPath, 'utf-8');
  const data: any[] = JSON.parse(raw);

  await db.exec('BEGIN');
  for (const a of data) {
    await db.run(
      'INSERT OR IGNORE INTO attractions (id, name, description, latitude, longitude) VALUES (?,?,?,?,?)',
      a.id,
      a.name,
      a.description,
      a.latitude,
      a.longitude
    );
  }
  await db.exec('COMMIT');
  console.log('Seed completed');
  await db.close();
};

run(); 