import { getAdjacency, getInterchangeIds, getLinesPerSegment } from './dao-network.js';
import { getRandomEvent } from './dao-games.js';

// BFS su grafo non orientato
const bfsDistances = (adj, start) => {
  const dist = new Map([[start, 0]]);
  const queue = [start];
  while (queue.length) {
    const u = queue.shift();
    for (const v of adj.get(u) ?? []) {
      if (!dist.has(v)) { dist.set(v, dist.get(u) + 1); queue.push(v); }
    }
  }
  return dist; // stationId = distanza dal start
};

// start casuale e dest casuale a distanza >= 3 stop
export const assignStartDest = async () => {
  const adj = await getAdjacency();
  const ids = [...adj.keys()];
  for (let tries = 0; tries < 50; tries++) {
    const start = ids[Math.floor(Math.random() * ids.length)];
    const dist = bfsDistances(adj, start);
    const far = [...dist].filter(([, d]) => d >= 3).map(([id]) => id);
    if (far.length) return { startId: start, destId: far[Math.floor(Math.random() * far.length)] };
  }
  throw new Error('Network too small for distance >= 3');
};

const segKey = (a, b) => `${Math.min(a, b)}-${Math.max(a, b)}`;

// validazione del percorso
export const isRouteValid = async (route, startId, destId) => {
  if (!Array.isArray(route) || route.length < 2) return false;
  if (route[0] !== startId || route[route.length - 1] !== destId) return false;
  const adj = await getAdjacency();
  const interchanges = await getInterchangeIds();
  const linesOf = await getLinesPerSegment();
  const usedSegs = new Set(); // ogni segmento usabile una sola volta
  let prevLines = null; // linee compatibili col tratto percorso finora sulla stessa linea
  for (let i = 1; i < route.length; i++) {
    const a = route[i - 1], b = route[i];
    if (!adj.get(a)?.has(b)) return false; // segmento inesistente
    const k = segKey(a, b);
    if (usedSegs.has(k)) return false; // segmento riutilizzato
    usedSegs.add(k);
    const segLines = linesOf.get(segKey(a, b));
    if (!segLines || segLines.size === 0) return false;
    if (prevLines === null) { prevLines = new Set(segLines); continue; }
    const sameLine = [...prevLines].filter(l => segLines.has(l));
    if (sameLine.length > 0) {
      prevLines = new Set(sameLine); // resto sulla stessa linea: nessun cambio
    } else {
      if (!interchanges.has(a)) return false; // cambio linea fuori da un interscambio
      prevLines = new Set(segLines);
    }
  }
  return true;
};

// applica gli effetti
export const runExecution = async (route) => {
  let coins = 20; // valore iniziale
  const steps = [];
  for (let i = 1; i < route.length; i++) {
    const event = await getRandomEvent();
    coins += event.effect;
    steps.push({ from: route[i - 1], to: route[i], event, coins });
  }
  return { steps, finalScore: Math.max(coins, 0) }; // punteggio finale normalizzato a >= 0 con Math.max
};
