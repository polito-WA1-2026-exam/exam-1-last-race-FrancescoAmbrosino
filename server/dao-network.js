import db from './db.js';

// query
const Q_STATIONS = `SELECT id, name
  FROM stations
  ORDER BY name`;
const Q_SEGMENTS = `SELECT ls.lineId, s.id AS stationId, s.name AS stationName
  FROM line_stations ls, stations s
  WHERE ls.stationId = s.id
  ORDER BY ls.lineId, ls.position`;
const Q_INTERCHANGES = `SELECT stationId FROM line_stations
  GROUP BY stationId
  HAVING COUNT(DISTINCT lineId) > 1`;
const Q_LINE_STATIONS = `SELECT lineId, stationId, position
  FROM line_stations
  ORDER BY lineId, position`;

export const getStations = async () => { // per etichettare start/dest e gli step
  return db.all(Q_STATIONS);
};

// tutti i segmenti (unici)
export const getSegments = async () => { // per visualizzazione
  const rows = await db.all(Q_SEGMENTS);
  const seen = new Set();
  const segments = [];
  for (let i = 1; i < rows.length; i++) {
    const prev = rows[i - 1], cur = rows[i];
    if (prev.lineId !== cur.lineId) continue; // salto i confini tra linee
    const [a, b] = prev.stationId < cur.stationId ? [prev, cur] : [cur, prev]; // normalizzo
    const key = `${a.stationId}-${b.stationId}`;
    if (seen.has(key)) continue;
    seen.add(key);
    segments.push({ aId: a.stationId, aName: a.stationName, bId: b.stationId, bName: b.stationName }); // senza informazioni sulle linee
  }
  return segments;
};

// id delle stazioni di interscambio
export const getInterchangeIds = async () => { // per controllo su cambio linea
  const rows = await db.all(Q_INTERCHANGES);
  return new Set(rows.map(r => r.stationId));
};

// grafo di adiacenza non orientato
export const getAdjacency = async () => { // per BFS e controllo "segmento esistente"
  const rows = await db.all(Q_LINE_STATIONS);
  const adj = new Map();
  const addEdge = (x, y) => { if (!adj.has(x)) adj.set(x, new Set()); adj.get(x).add(y); };
  for (let i = 1; i < rows.length; i++) {
    const prev = rows[i - 1], cur = rows[i];
    if (prev.lineId === cur.lineId) {
      addEdge(prev.stationId, cur.stationId);
      addEdge(cur.stationId, prev.stationId);
    }
  }
  return adj;
};

// linee che coprono ciascun segmento
export const getLinesPerSegment = async () => { // per cambio linea agli interscambi
  const rows = await db.all(Q_LINE_STATIONS);
  const map = new Map();
  for (let i = 1; i < rows.length; i++) {
    const prev = rows[i - 1], cur = rows[i];
    if (prev.lineId !== cur.lineId) continue;
    const a = Math.min(prev.stationId, cur.stationId);
    const b = Math.max(prev.stationId, cur.stationId);
    const key = `${a}-${b}`;
    if (!map.has(key)) map.set(key, new Set());
    map.get(key).add(cur.lineId); // per ogni segmento salvo tutte le linee che lo coprono
  }
  return map;
};
