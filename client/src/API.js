const SERVER_URL = 'http://localhost:3001/api';

// gestione comune della risposta
async function handleResponse(res) {
  if (res.ok) {
    const text = await res.text();
    return text.length ? JSON.parse(text) : {};  // alcune risposte (logout) sono vuote
  }
  // provo a leggere il messaggio di errore dal body, altrimenti ne uso uno generico
  const err = await res.json().catch(() => ({ error: 'Something went wrong' }));
  throw err;
}

export const getCurrentUser = () =>
  fetch(`${SERVER_URL}/sessions/current`, { credentials: 'include' }).then(handleResponse);

// " credentials: 'include' " serve per propagare il cookie di sessione
export const login = (credentials) =>
  fetch(`${SERVER_URL}/sessions`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  }).then(handleResponse);

export const logout = () =>
  fetch(`${SERVER_URL}/sessions/current`, { method: 'DELETE', credentials: 'include' }).then(handleResponse);

export const getSegments = () =>
  fetch(`${SERVER_URL}/segments`, { credentials: 'include' }).then(handleResponse);

export const getRanking = () =>
  fetch(`${SERVER_URL}/ranking`, { credentials: 'include' }).then(handleResponse);

export const newGame = () =>
  fetch(`${SERVER_URL}/games`, { method: 'POST', credentials: 'include' }).then(handleResponse);

export const submitRoute = (gameId, segments) =>
  fetch(`${SERVER_URL}/games/${gameId}/route`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ segments }),
  }).then(handleResponse);
