// imports
import express from "express";
import morgan from 'morgan';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';

import { body, param, validationResult } from 'express-validator';

import { getUser, getUserById } from './dao-users.js';
import { getSegments, getStations } from './dao-network.js';
import { getRanking, createGame, getGame, finishGame } from './dao-games.js';
import { assignStartDest, isRouteValid, runExecution } from './game-logic.js';

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

// POST 

// login
app.post('/api/sessions',
  [body('username').notEmpty(), body('password').notEmpty()],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    passport.authenticate('local', (err, user, info) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ error: info?.message || 'Invalid credentials' });
      req.login(user, (err) => err ? next(err) : res.json(req.user));
    })(req, res, next);
  });

// nuova partita
app.post('/api/games', isLoggedIn, async (req, res) => {
  try {
    const { startId, destId } = await assignStartDest();
    const gameId = await createGame(req.user.id, startId, destId);
    const nameOf = new Map((await getStations()).map(s => [s.id, s.name])); // id -> name per le etichette
    res.json({
      gameId,
      start: { id: startId, name: nameOf.get(startId) },
      dest: { id: destId, name: nameOf.get(destId) },
      coins: 20,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// invio percorso
app.post('/api/games/:gameId/route', isLoggedIn,
  [param('gameId').isInt(), body('route').isArray(), body('route.*').isInt()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const game = await getGame(req.params.gameId);
      if (!game || game.userId !== req.user.id) return res.status(404).json({ error: 'Game not found' });
      if (game.score !== null) return res.status(409).json({ error: 'Game already finished' });

      const route = req.body.route.map(Number);
      const valid = await isRouteValid(route, game.startStationId, game.destStationId);
      if (!valid) {
        await finishGame(game.id, 0); // percorso invalido/incompleto -> 0
        return res.json({ valid: false, steps: [], finalScore: 0 });
      }

      const { steps, finalScore } = await runExecution(route);
      await finishGame(game.id, finalScore);
      const nameOf = new Map((await getStations()).map(s => [s.id, s.name]));
      const named = steps.map(s => ({
        from: { id: s.from, name: nameOf.get(s.from) },
        to: { id: s.to, name: nameOf.get(s.to) },
        event: s.event,
        coins: s.coins,
      }));
      res.json({ valid: true, steps: named, finalScore });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });


// DELETE

// logout
app.delete('/api/sessions/current', isLoggedIn, (req, res, next) => {
  req.logout((err) => err ? next(err) : res.status(200).json({}));
});

// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});