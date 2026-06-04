import { useMemo, useRef, useState } from 'react';
import { Button, ListGroup, Alert } from 'react-bootstrap';
import CountdownTimer from './CountdownTimer.jsx';

// seleziono segmenti in sequenza partendo dalla stazione di start
function PlanningView({ game, segments, onSubmit }) {
  const [route, setRoute] = useState([game.start.id]); // sequenza di stationId
  const submittedRef = useRef(false); // evita doppio invio (timer + bottone)

  // mappa id -> name
  const nameOf = useMemo(() => {
    const m = new Map([[game.start.id, game.start.name], [game.dest.id, game.dest.name]]);
    for (const s of segments) { m.set(s.aId, s.aName); m.set(s.bId, s.bName); }
    return m;
  }, [segments, game]);
  const last = route[route.length - 1];

  // segmenti selezionabili: quelli con un estremo uguale all'ultima stazione raggiunta.
  const options = segments
    .map((s) => (s.aId === last ? { id: s.bId, name: s.bName }
      : s.bId === last ? { id: s.aId, name: s.aName }
        : null))
    .filter(Boolean);

  const addStop = (id) => setRoute((r) => [...r, id]);
  const undo = () => setRoute((r) => (r.length > 1 ? r.slice(0, -1) : r));

  const doSubmit = () => {
    if (submittedRef.current) return; // una sola volta
    submittedRef.current = true;
    onSubmit(route);
  };

  return (
    <div>
      <h2>Planning</h2>
      <CountdownTimer seconds={90} onExpire={doSubmit} />
      <p className="mt-2"><b>Start:</b> {game.start.name} &nbsp;&nbsp; <b>Destination:</b> {game.dest.name}</p>

      <p><b>Your route:</b> {route.map((id) => nameOf.get(id)).join(' → ')}</p>
      {last === game.dest.id && <Alert variant="success" className="py-1">Destination reached: you can submit.</Alert>}

      <p className="mb-1"><b>Next segment</b> (from {nameOf.get(last)}):</p>
      <ListGroup className="mb-3">
        {options.map((o) => (
          <ListGroup.Item action key={o.id} onClick={() => addStop(o.id)}>
            {nameOf.get(last)} {'→'} {o.name}
          </ListGroup.Item>
        ))}
        {options.length === 0 && <ListGroup.Item disabled>No segments from here.</ListGroup.Item>}
      </ListGroup>

      <div className="d-flex gap-2">
        <Button variant="secondary" onClick={undo} disabled={route.length <= 1}>Undo last</Button>
        <Button variant="primary" onClick={doSubmit}>Submit route</Button>
      </div>
    </div>
  );
}

export default PlanningView;
