import { useMemo, useRef, useState } from 'react';
import { Button, ListGroup, Row, Col } from 'react-bootstrap';
import CountdownTimer from './CountdownTimer.jsx';

// chiave non orientata di un segmento (A-B == B-A)
const segKey = (a, b) => `${Math.min(a, b)}-${Math.max(a, b)}`;

// il giocatore costruisce il percorso scegliendo i segmenti dalla lista completa, in sequenza.
// la validazione vera (in ordine) è lato server: qui solo selezione e un hint NON autoritativo.
function PlanningView({ game, segments, onSubmit }) {
  const [chosen, setChosen] = useState([]); // segmenti scelti in ordine: [{ aId, aName, bId, bName }]
  const submittedRef = useRef(false);        // evita doppio invio (timer + bottone)

  // ogni segmento usabile una sola volta: chiavi già scelte
  const usedKeys = useMemo(() => new Set(chosen.map((s) => segKey(s.aId, s.bId))), [chosen]);

  const addSeg = (s) => setChosen((c) => [...c, s]);
  const undo = () => setChosen((c) => c.slice(0, -1));
  const clear = () => setChosen([]);

  const doSubmit = () => {
    if (submittedRef.current) return; // una sola volta
    submittedRef.current = true;
    onSubmit(chosen.map((s) => [s.aId, s.bId])); // invio i segmenti scelti in ordine
  };

  return (
    <Row>
      {/* sinistra: mappa + segmenti scelti */}
      <Col md={6}>
        <img src="/planning-map.png" alt="Network map: stations only, without lines"
          style={{ maxWidth: '100%', border: '1px solid #ccc' }} className="mb-3" />

        {/* segmenti scelti, in ordine */}
        <p className="mb-1"><b>Your chosen segments</b></p>
        <ListGroup className="mb-2">
          {chosen.map((s, i) => (
            <ListGroup.Item key={i}>{i + 1}. {s.aName} {'↔'} {s.bName}</ListGroup.Item>
          ))}
          {chosen.length === 0 && <ListGroup.Item disabled>No segments selected yet.</ListGroup.Item>}
        </ListGroup>
      </Col>

      {/* destra: titolo, timer, start/dest, lista completa, bottoni */}
      <Col md={6}>
        <h2>Planning</h2>
        <CountdownTimer seconds={90} onExpire={doSubmit} />
        <p className="mt-2"><b>Start:</b> {game.start.name} &nbsp;&nbsp; <b>Destination:</b> {game.dest.name}</p>

        <p className="mb-1"><b>All segments</b></p>
        <ListGroup className="mb-3" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
          {segments
            .filter((s) => !usedKeys.has(segKey(s.aId, s.bId)))
            .map((s) => (
              <ListGroup.Item action key={`${s.aId}-${s.bId}`} onClick={() => addSeg(s)}>
                {s.aName} {'↔'} {s.bName}
              </ListGroup.Item>
            ))}
        </ListGroup>

        <div className="d-flex gap-2">
          <Button variant="secondary" onClick={undo} disabled={chosen.length === 0}>Undo last</Button>
          <Button variant="outline-secondary" onClick={clear} disabled={chosen.length === 0}>Clear</Button>
          <Button variant="primary" onClick={doSubmit}>Submit route</Button>
        </div>
      </Col>
    </Row>
  );
}

export default PlanningView;
