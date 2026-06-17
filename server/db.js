import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const db = await open({
  filename: 'lastrace.db',
  driver: sqlite3.Database,
});

await db.run('PRAGMA foreign_keys = ON');

export default db;
