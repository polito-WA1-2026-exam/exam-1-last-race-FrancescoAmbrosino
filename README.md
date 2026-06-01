# Exam #1: "Last Race"
## Student: s354781 AMBROSINO FRANCESCO 

## React Client Application Routes

- Route `/`: page content and purpose
- Route `/something/:param`: page content and purpose, param specification
- ...

## API Server

- POST `/api/something`
  - request parameters and request body content
  - response body content
- GET `/api/something`
  - request parameters
  - response body content
- POST `/api/something`
  - request parameters and request body content
  - response body content
- ...

## Database Tables

- Table `stations` - the fixed metro stations. Columns: `id`, `name` (unique).
- Table `lines` - the metro lines. Columns: `id`, `name` (unique).
- Table `line_stations` - bridge between `lines` and `stations`, ordered by `position`. Two stations with consecutive `position` on the same line form a *segment*; an *interchange* is a station served by more than one line (derived as `COUNT(DISTINCT lineId) > 1`, not stored). Columns: `lineId`, `stationId`, `position`.
- Table `events` - the random journey events. Each has a `description` and an integer `effect` in [-4, +4] applied to the player's coins, one event per traversed segment during Execution. Columns: `id`, `description`, `effect`.
- Table `users` - the registered users (seeded only, no registration). `username` is used for login and shown in the ranking; the password is stored as a scrypt hash with a per-user random `salt`. Columns: `id`, `username` (unique), `name`, `hashedPassword`, `salt`.
- Table `games` - one row per played game. Stores the player (`userId`) and the server-assigned `startStationId`/`destStationId`. `score` is `NULL` while the game is in progress and `>= 0` once finished (a negative result is stored as 0). The general ranking is `MAX(score)` per user. Columns: `id`, `userId`, `startStationId`, `destStationId`, `score`.

## Main React Components

- `ListOfSomething` (in `List.js`): component purpose and main functionality
- `GreatButton` (in `GreatButton.js`): component purpose and main functionality
- ...

(only _main_ components, minor ones may be skipped)

## Screenshot

![Screenshot](./img/screenshot.jpg)

## Users Credentials

- `alice`, `alice123` (has already played games - appears in the ranking)
- `bob`, `bob123` (has already played games - appears in the ranking)
- `carol`, `carol123` (registered, has not played yet)

## Use of AI Tools
Briefly describe whether you used any AI tools (e.g., ChatGPT, GitHub Copilot, Claude) while working on this project, for which purposes (e.g., clarifying concepts, debugging, generating code), and how you verified or adapted their output.
If you did not use any AI tools, simply state so.
