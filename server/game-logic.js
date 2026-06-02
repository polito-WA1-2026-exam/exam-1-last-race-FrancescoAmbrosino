import { getAdjacency } from './dao-network.js';

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
