import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate, Link } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import NavHeader from './components/NavHeader.jsx';
import Instructions from './components/Instructions.jsx';
import LoginForm from './components/LoginForm.jsx';
import RankingTable from './components/RankingTable.jsx';
import GamePage from './components/GamePage.jsx';
import * as API from './API.js';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // all'avvio controllo se c'è già una sessione valida
  useEffect(() => {
    API.getCurrentUser()
      .then((u) => setUser(u))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  // aggiorno user e navigo a '/'
  const handleLogin = async (credentials) => {
    const u = await API.login(credentials);
    setUser(u);
    navigate('/');
  };

  // aggiorno user e navigo a '/'
  const handleLogout = async () => {
    await API.logout();
    setUser(null);
    navigate('/');
  };

  if (loading) return null; // evito il flicker finché non so se c'è l'utente

  return (
    <>
      <NavHeader user={user} onLogout={handleLogout} />
      <Container className="my-4">
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/login" element={user ? <Navigate to="/" /> : <LoginForm onLogin={handleLogin} />} />
          <Route path="/play" element={user ? <GamePage /> : <Navigate to="/login" />} />
          <Route path="/ranking" element={user ? <RankingTable /> : <Navigate to="/login" />} />
          <Route path="*" element={<p>Page not found. 🤷</p>} />
        </Routes>
      </Container>
    </>
  );
}

// home: l'anonimo vede solo le istruzioni mentre il loggato vede anche i pulsanti
function Home({ user }) {
  return (
    <>
      <Instructions />
      {user && (
        <div className="d-flex gap-2 mt-3">
          <Link to="/play" className="btn btn-primary">New game 🚇</Link>
          <Link to="/ranking" className="btn btn-outline-secondary">Ranking 🏆</Link>
        </div>
      )}
    </>
  );
}

export default App;
