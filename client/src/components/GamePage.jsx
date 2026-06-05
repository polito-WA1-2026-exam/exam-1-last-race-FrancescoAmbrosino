import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Alert, Spinner } from 'react-bootstrap';
import * as API from '../API.js';
import PlanningView from './PlanningView.jsx';
import ExecutionView from './ExecutionView.jsx';

// Setup, Planning, Execution e Result vivono come STATO dentro questa pagina
function GamePage() {
  const [phase, setPhase] = useState('loading'); // loading | setup | planning | execution | result | error
  const [game, setGame] = useState(null);        // { gameId, start, dest, coins }
  const [segments, setSegments] = useState([]);
  const [result, setResult] = useState(null);    // { valid, steps, finalScore }
  const [error, setError] = useState('');
  const initRef = useRef(false);

  // crea una nuova partita e carica i segmenti
  const startGame = useCallback(async () => {
    setPhase('loading');
    setError('');
    setResult(null);
    try {
      const g = await API.newGame();
      const segs = await API.getSegments();
      setGame(g);
      setSegments(segs);
      setPhase('setup');
    } catch (err) {
      setError(err.error || 'Error starting game');
      setPhase('error');
    }
  }, []);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    startGame();
  }, [startGame]);

  const handleSubmit = async (segments) => {
    setPhase('loading');
    try {
      const res = await API.submitRoute(game.gameId, segments);
      setResult(res);
      // valido -> Execution; invalido/incompleto -> dritto al risultato (score 0)
      setPhase(res.valid && res.steps.length > 0 ? 'execution' : 'result');
    } catch (err) {
      setError(err.error || 'Error submitting route');
      setPhase('error');
    }
  };

  if (phase === 'loading') return <Spinner animation="border" />;
  if (phase === 'error') return <Alert variant="danger">{error}</Alert>;

  if (phase === 'setup') {
    return (
      <div>
        <h2>Setup 🗺️</h2>
        <p>Study it, then start planning!</p>
        <img src="/setup-map.png" alt="Full network map (with lines)"
          style={{ maxWidth: '100%', maxHeight: '45vh', border: '1px solid #ccc' }} />
        <div className="mt-3"><Button onClick={() => setPhase('planning')}>I am ready!</Button></div>
      </div>
    );
  }

  if (phase === 'planning') {
    return <PlanningView game={game} segments={segments} onSubmit={handleSubmit} />;
  }

  if (phase === 'execution') {
    return <ExecutionView steps={result.steps} onDone={() => setPhase('result')} />;
  }

  // result
  return (
    <div>
      <h2>Result 🏁</h2>
      {result.valid
        ? <Alert variant="info">Final score: <b>{result.finalScore}</b> coins. Nice ride!</Alert>
        : <Alert variant="warning">Ouch! Invalid or incomplete route: you lost all coins. Score: <b>0</b>.</Alert>}
      <div className="d-flex gap-2">
        <Button onClick={startGame}>New game 🚇</Button>
        <Link to="/ranking" className="btn btn-outline-secondary">Ranking</Link>
      </div>
    </div>
  );
}

export default GamePage;
