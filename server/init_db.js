import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import crypto from 'crypto';

const db = await open({ filename: 'lastrace.db', driver: sqlite3.Database });
await db.run('PRAGMA foreign_keys = ON');


// 1) SCHEMA
// DROP (in ordine INVERSO) e CREATE delle tables
await db.exec(`
  DROP TABLE IF EXISTS games;
  DROP TABLE IF EXISTS line_stations;
  DROP TABLE IF EXISTS events;
  DROP TABLE IF EXISTS users;
  DROP TABLE IF EXISTS lines;
  DROP TABLE IF EXISTS stations;
`);

await db.exec(`
  CREATE TABLE stations (
    id   INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  );

  CREATE TABLE lines (
    id   INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  );

  CREATE TABLE line_stations (
    lineId    INTEGER NOT NULL REFERENCES lines(id),
    stationId INTEGER NOT NULL REFERENCES stations(id),
    position  INTEGER NOT NULL,            -- ordine lungo la linea (0,1,2,...)
    PRIMARY KEY (lineId, position),        -- una sola stazione per ogni posizione di una linea
    UNIQUE (lineId, stationId)             -- una stazione compare al massimo una volta per linea
  );
  -- nota: due stazioni con position consecutiva sulla stessa linea formano un segmento

  CREATE TABLE events (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    description TEXT NOT NULL,
    effect      INTEGER NOT NULL
  );

  CREATE TABLE users (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    username       TEXT NOT NULL UNIQUE,
    name           TEXT NOT NULL,
    hashedPassword TEXT NOT NULL,
    salt           TEXT NOT NULL
  );

  CREATE TABLE games (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    userId         INTEGER NOT NULL REFERENCES users(id),
    startStationId INTEGER NOT NULL REFERENCES stations(id),
    destStationId  INTEGER NOT NULL REFERENCES stations(id),
    score          INTEGER                 -- NULL finché non conclusa, poi >= 0
  );
`);

// 2) DATI DELLA RETE
const network = {
  'Red Line': ['Centrale', 'Porta Velaria', 'Crocevia del Falco', 'Piazza delle Lanterne', 'Giardini Pensili', 'Belvedere'],
  'Blue Line': ['Arco Trionfale', 'Centrale', 'Fontana Oscura', 'Borgo Sereno', 'Viale dei Mosaici'],
  'Green Line': ['Porta Velaria', 'Fontana Oscura', 'Torre Cinerea', "Campo dell'Eco", 'Molo Antico'],
  'Yellow Line': ['Ponte delle Vele', 'Piazza delle Lanterne', 'Torre Cinerea', 'Viale dei Mosaici', "Campo dell'Eco"],
};

const events = [
  ['Just walking, nothing to see here', 0],
  ['Stonks! Free coin', 1],
  ['Free ticket? Is this real life?', 2],
  ['Epic sax guy mood (+tips)', 3],
  ['I am speed!', 4],
  ['Bruh, service delay', -1],
  ['Wrong way, go back', -2],
  ['Call an ambulance! Stolen wallet', -3],
  ['Emotional damage! Lost coins', -4],
];

const users = [
  { username: 'alice', name: 'Alice Rossi', password: 'alice123' },
  { username: 'bob', name: 'Bob Bianchi', password: 'bob123' },
  { username: 'carol', name: 'Carol Verdi', password: 'carol123' },
];

// 3) INSERIMENTO
const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hashedPassword = crypto.scryptSync(password, salt, 32).toString('hex');
  return { salt, hashedPassword };
};

await db.run('BEGIN TRANSACTION');
try {
  // stations
  const stationId = new Map();
  for (const stations of Object.values(network)) {
    for (const name of stations) {
      if (!stationId.has(name)) {
        const res = await db.run('INSERT INTO stations (name) VALUES (?)', [name]);
        stationId.set(name, res.lastID);
      }
    }
  }

  // lines + line_stations
  for (const [lineName, stations] of Object.entries(network)) {
    const res = await db.run('INSERT INTO lines (name) VALUES (?)', [lineName]);
    const lineId = res.lastID;
    for (let position = 0; position < stations.length; position++) {
      await db.run(
        'INSERT INTO line_stations (lineId, stationId, position) VALUES (?, ?, ?)',
        [lineId, stationId.get(stations[position]), position]
      );
    }
  }

  // events
  for (const [description, effect] of events) {
    await db.run('INSERT INTO events (description, effect) VALUES (?, ?)', [description, effect]);
  }

  // users
  const userId = new Map();
  for (const u of users) {
    const { salt, hashedPassword } = hashPassword(u.password);
    const res = await db.run(
      'INSERT INTO users (username, name, hashedPassword, salt) VALUES (?, ?, ?, ?)',
      [u.username, u.name, hashedPassword, salt]
    );
    userId.set(u.username, res.lastID);
  }

  // partite già giocate
  const sid = (name) => stationId.get(name);
  const seededGames = [
    { user: 'alice', start: 'Arco Trionfale', dest: 'Molo Antico', score: 23 },
    { user: 'alice', start: 'Crocevia del Falco', dest: 'Borgo Sereno', score: 18 },
    { user: 'bob', start: 'Ponte delle Vele', dest: 'Giardini Pensili', score: 27 },
    { user: 'bob', start: 'Arco Trionfale', dest: "Campo dell'Eco", score: 0 },
  ];
  for (const g of seededGames) {
    await db.run(
      'INSERT INTO games (userId, startStationId, destStationId, score) VALUES (?, ?, ?, ?)',
      [userId.get(g.user), sid(g.start), sid(g.dest), g.score]
    );
  }

  await db.run('COMMIT');
} catch (err) {
  await db.run('ROLLBACK');
  console.error('Seed fallito, rollback eseguito:', err);
  await db.close();
  process.exit(1);
}

// 4) VERIFICA FINALE
const summary = await db.get(`SELECT
  (SELECT COUNT(*) FROM lines)    AS linee,
  (SELECT COUNT(*) FROM stations) AS stazioni,
  (SELECT COUNT(*) FROM (SELECT stationId FROM line_stations GROUP BY stationId HAVING COUNT(DISTINCT lineId) > 1)) AS interscambi,
  (SELECT COUNT(*) FROM events)   AS eventi,
  (SELECT COUNT(*) FROM users)    AS utenti,
  (SELECT COUNT(DISTINCT userId) FROM games WHERE score IS NOT NULL) AS utentiConPartite`);
console.log('Seed completato. Minimi:', summary);

await db.close();
