import db from './db.js';
import crypto from 'crypto';

// Query
const Q_USER_BY_NAME = `SELECT *
  FROM users
  WHERE username = ?`;
const Q_USER_BY_ID   = `SELECT id, username, name
  FROM users
  WHERE id = ?`;

export const getUser = async (username, password) => {
  const user = await db.get(Q_USER_BY_NAME, [username]);
  if (!user) return false;
  const hash = crypto.scryptSync(password, user.salt, 32).toString('hex');
  const valid = crypto.timingSafeEqual(
    Buffer.from(user.hashedPassword, 'hex'),
    Buffer.from(hash, 'hex')
  );
  if (!valid) return false;
  return { id: user.id, username: user.username, name: user.name };
};

export const getUserById = async (id) => {
  return db.get(Q_USER_BY_ID, [id]); // undefined se non esiste
};
