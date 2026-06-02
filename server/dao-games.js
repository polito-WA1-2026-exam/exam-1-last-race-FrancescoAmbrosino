import db from './db.js';

// Query
const Q_CREATE_GAME  = `INSERT INTO games (userId, startStationId, destStationId)
  VALUES (?, ?, ?)`;
const Q_GAME_BY_ID   = `SELECT *
  FROM games
  WHERE id = ?`;
const Q_FINISH_GAME  = `UPDATE games
  SET score = ?
  WHERE id = ?`;
const Q_RANDOM_EVENT = `SELECT id, description, effect
  FROM events
  ORDER BY RANDOM()
  LIMIT 1`;
const Q_RANKING = `SELECT u.username, u.name, MAX(g.score) AS bestScore
  FROM games g, users u
  WHERE u.id = g.userId AND g.score IS NOT NULL
  GROUP BY g.userId
  ORDER BY bestScore DESC, u.username ASC`;

export const createGame = async (userId, startId, destId) => {
  const res = await db.run(Q_CREATE_GAME, [userId, startId, destId]);
  return res.lastID;
};

export const getGame = async (gameId) => {
  return db.get(Q_GAME_BY_ID, [gameId]);
};

export const finishGame = async (gameId, score) => {
  await db.run(Q_FINISH_GAME, [score, gameId]);
};

export const getRanking = async () => {
  return db.all(Q_RANKING);
};

export const getRandomEvent = async () => {
  return db.get(Q_RANDOM_EVENT);
};
