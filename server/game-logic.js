import { getAdjacency, getInterchangeIds, getLinesPerSegment } from './dao-network.js';
import { getRandomEvent } from './dao-games.js';

// BFS su grafo non orientato (algoritmo standard)
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
  for (let tries = 0; tries < 50; tries++) { // scelgo 50 come numero di tentativi
    const start = ids[Math.floor(Math.random() * ids.length)];
    const dist = bfsDistances(adj, start);
    const far = [...dist].filter(([, d]) => d >= 3).map(([id]) => id);
    if (far.length) return { startId: start, destId: far[Math.floor(Math.random() * far.length)] }; // scelgo una destinazione casuale
                                          // tra le destinazioni a distanza >= 3 dalla partenza (start), anch'essa scelta casualmente
  }
  throw new Error('Network too small for distance >= 3');
};

const segKey = (a, b) => `${Math.min(a, b)}-${Math.max(a, b)}`; // segmento non orientato

// ricostruisce la sequenza di stazioni dai segmenti non orientati scelti in ordine
export const buildRoute = (segments, startId) => { // non valida ancora
  const route = [startId];
  let cur = startId;
  for (const seg of segments) {
    const [a, b] = seg; // segmento non orientato -> devo controllare sia a che b
    if (a !== cur && b !== cur) return null; // catena rotta
    cur = a === cur ? b : a;
    route.push(cur);
  }
  return route;
};

// validazione del percorso
export const isRouteValid = async (route, startId, destId) => {
  if (!Array.isArray(route) || route.length < 2) return false; // percorso incompleto
  if (route[0] !== startId || route[route.length - 1] !== destId) return false; // start o dest errati
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
      if (!interchanges.has(a)) return false; // cambio linea fuori da un interscambio (impossibile con dati consistenti)
      prevLines = new Set(segLines); // cambio linea corretto
    }
  }
  return true; // tutti i controlli sono passati -> route valida
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
