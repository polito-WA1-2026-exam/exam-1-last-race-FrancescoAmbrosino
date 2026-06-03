// imports
import express from "express";
import morgan from 'morgan';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';

import { getUser, getUserById } from './dao-users.js';
import { getSegments } from './dao-network.js';
import { getRanking } from './dao-games.js';

passport.use(new LocalStrategy({ usernameField: 'username' }, async (username, password, done) => {
  const user = await getUser(username, password); // false se credenziali errate
  if (!user) return done(null, false, { message: 'Invalid credentials.' });
  return done(null, user);
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await getUserById(id);
  return user ? done(null, user) : done(null, false);
});

// init express
const app = new express();
const port = 3001;

app.use(morgan('dev'));
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(session({
  secret: 'last-race-dev-secret',
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

const isLoggedIn = (req, res, next) =>
  req.isAuthenticated() ? next() : res.status(401).json({ error: 'Not authenticated' });

// GET

// sessione corrente
app.get('/api/sessions/current', (req, res) => {
  if (req.isAuthenticated()) return res.json(req.user);
  return res.status(401).json({ error: 'Not authenticated' });
});

// lista dei segmenti
app.get('/api/segments', isLoggedIn, async (req, res) => {
  try {
    res.json(await getSegments());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ranking generale
app.get('/api/ranking', isLoggedIn, async (req, res) => {
  try {
    res.json(await getRanking());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});