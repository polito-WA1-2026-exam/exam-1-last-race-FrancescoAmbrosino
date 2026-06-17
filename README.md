# Exam #1: "Last Race"
## Student: s354781 AMBROSINO FRANCESCO

## React Client Application Routes

- Route `/`: home page
  - Anonymous user: shows only the game instructions (no map)
  - Logged-in user: instructions plus the "New game" and "Ranking" buttons
- Route `/login`: login page
  - Shows `LoginForm`; redirects to `/` if the user is already logged in
- Route `/play`: the game, as a state machine (Setup, Planning, Execution, Result)
  - Requires login (redirects to `/login` if not authenticated)
- Route `/ranking`: the general ranking page
  - Requires login (redirects to `/login` if not authenticated)
- Route `*`: catch-all for unknown URLs, shows a "Page not found" message

## API Server

### Authentication

- `POST /api/sessions`
  - Body: `{ username, password }`
  - Response: the logged-in user `{ id, username, name }`, or 401 on invalid credentials
- `GET /api/sessions/current`
  - Response: the logged-in user `{ id, username, name }`, or `null` (200) if not authenticated
- `DELETE /api/sessions/current` (requires login)
  - Response: empty (logout)

### Game

- `GET /api/segments` (requires login)
  - Response: array of `{ aId, aName, bId, bName }` - all unique adjacent station pairs, without line info
- `POST /api/games` (requires login)
  - Starts a new game: the server assigns a random start/dest at distance >= 3
  - Response: `{ gameId, start: { id, name }, dest: { id, name }, coins: 20 }`
- `POST /api/games/:gameId/route` (requires login)
  - Body: `{ segments: [[aId, bId], ...] }` (the chosen segments, in order, possibly incomplete)
  - Reconstructs the path from the chosen segments and validates it server-side, in order (valid start/dest, adjacent segments, line changes only at interchanges, each segment used at most once), then runs the execution (one random event per segment)
  - Response (valid): `{ valid: true, steps: [{ from: {id,name}, to: {id,name}, event: {id,description,effect}, coins }], finalScore }`
  - Response (invalid/incomplete): `{ valid: false, steps: [], finalScore: 0 }`
  - 404 if the game is not the user's / does not exist, 409 if already finished

### Ranking

- `GET /api/ranking` (requires login)
  - Response: array of `{ username, name, bestScore }` - best score per user, descending

## Data Models

- `dao-users.js`
  - `getUser(username, password)`: verifies credentials (scrypt + `timingSafeEqual`), returns the public user object or false
  - `getUserById(id)`: re-hydrates the user from the session

- `dao-network.js`
  - `getStations()`: stations (id, name) - used server-side to label start/dest and execution steps with names (no public endpoint; the map itself is a static image)
  - `getLinesPerSegment()`: map "minId-maxId" -> set of lines covering each segment (used by route validation)
  - `getSegments()`: unique adjacent station pairs, without line info
  - `getInterchangeIds()`: set of stations served by more than one line
  - `getAdjacency()`: undirected station graph (stationId -> neighbours)

- `dao-games.js`
  - `createGame(userId, startId, destId)`: inserts an in-progress game (score NULL), returns its id
  - `getGame(gameId)`: reads a game row
  - `finishGame(gameId, score)`: stores the final score
  - `getRanking()`: best score (MAX) per user, descending
  - `getRandomEvent()`: one random event

## Database Tables

- Table `stations` - the fixed metro stations: id (PK), name (unique)
- Table `lines` - the metro lines: id (PK), name (unique)
- Table `line_stations` - pivot ordering stations along each line: lineId (FK to lines), stationId (FK to stations), position (composite PK lineId+position). Adjacent positions form a segment; interchanges are derived (a station on more than one line)
- Table `events` - the random journey events: id (PK), description, effect (integer in [-4, +4])
- Table `users` - the registered users (seeded only, no registration): id (PK), username (unique), name, hashedPassword, salt
- Table `games` - one game per row: id (PK), userId (FK to users), startStationId (FK to stations), destStationId (FK to stations), score (NULL while in progress, >= 0 once finished, a negative result stored as 0). The ranking is MAX(score) per user

## Main React Components

- `GamePage`
  - The game as a state machine: Setup, Planning, Execution, Result
  - Starts a game (`POST /api/games`), submits the route and shows the final score
- `PlanningView`
  - Shows the full list of all segments; the player picks segments in sequence (the server reconstructs and validates them in order)
  - Hosts the 90s countdown and auto-submits on expiry
- `ExecutionView`
  - Reveals the journey steps one at a time, with the random event and the running coin total
- `RankingTable`
  - General ranking: best score per user
- `LoginForm`
  - Username/password form, shows the error on invalid credentials

## Screenshots

During a game:

![During a game](./img/gameplay.png)

During an execution:

![During an execution](./img/execution.png)

Ranking page:

![Ranking page](./img/ranking.png)

## Users Credentials

- `alice`, `alice123` (has already played games - appears in the ranking)
- `bob`, `bob123` (has already played games - appears in the ranking)
- `carol`, `carol123` (registered, has not played yet)

## Use of AI Tools
I used an AI coding assistant (Claude Code by Anthropic) as a support tool to: clarify the track requirements, discuss design trade-offs, speed up some boilerplate, and review my code.
I also used the same AI tool to generate the network maps [planning-map.png](./client/public/planning-map.png) and [setup-map.png](./client/public/setup-map.png).
I am able to explain and justify each part of the project.
