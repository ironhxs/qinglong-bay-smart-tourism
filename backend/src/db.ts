import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import fs from 'fs';

let db: Database<sqlite3.Database, sqlite3.Statement>;

// 数据库文件路径 - 支持多种可能的路径
const possiblePaths = [
  path.resolve(__dirname, '../../database/qlb.db'),
  path.resolve(__dirname, '../database/qlb.db'),
  path.resolve(process.cwd(), 'database/qlb.db')
];

// 查找有效的数据库文件路径
let dbFilePath = '';
for (const p of possiblePaths) {
  if (fs.existsSync(p)) {
    dbFilePath = p;
    break;
  }
}

// 如果没有找到数据库文件，使用默认路径
if (!dbFilePath) {
  dbFilePath = possiblePaths[0];
  console.warn('未找到数据库文件，将使用默认路径:', dbFilePath);
}

// 确保数据库目录存在
const dbDir = path.dirname(dbFilePath);
if (!fs.existsSync(dbDir)) {
  console.log('创建数据库目录:', dbDir);
  fs.mkdirSync(dbDir, { recursive: true });
}

console.log('数据库文件路径:', dbFilePath);
console.log('数据库文件是否存在:', fs.existsSync(dbFilePath));

export const getDb = async () => {
  if (!db) {
    try {
      db = await open({
        filename: dbFilePath,
        driver: sqlite3.Database,
      });
      console.log('数据库连接成功');
      
      // 验证数据库连接
      try {
        await db.get('SELECT 1');
        console.log('数据库验证成功');
      } catch (error) {
        console.error('数据库验证失败:', error);
        throw new Error('数据库验证失败，可能是数据库文件损坏或格式不正确');
      }
    } catch (error) {
      console.error('数据库连接失败:', error);
      throw error;
    }
  }
  return db;
};

export const all = async <T = any>(sql: string, params: any[] = []) => {
  try {
    const database = await getDb();
    return database.all<T>(sql, params);
  } catch (error) {
    console.error('执行SQL查询失败:', sql, params, error);
    throw error;
  }
};

export const run = async (sql: string, params: any[] = []) => {
  try {
    const database = await getDb();
    return database.run(sql, params);
  } catch (error) {
    console.error('执行SQL命令失败:', sql, params, error);
    throw error;
  }
}; 