import { useEffect, useState } from 'react';
import { ListGroup, Button } from 'react-bootstrap';

// rivelo gli step uno alla volta (un evento per segmento), aggiornando il totale coin
function ExecutionView({ steps, onDone }) {
  const [visible, setVisible] = useState(0); // numero di step mostrati

  useEffect(() => {
    if (visible >= steps.length) return;
    const id = setInterval(() => setVisible((v) => Math.min(v + 1, steps.length)), 1200); // ogni 1200ms
    return () => clearInterval(id);
  }, [visible, steps.length]);

  const shown = steps.slice(0, visible);
  const done = visible >= steps.length; // quando tutti visibili mostra 'See result'

  return (
    <div>
      <h2>Execution 🚇</h2>
      <ListGroup className="mb-3">
        {shown.map((s, i) => (
          <ListGroup.Item key={i}>
            {s.from.name} {'→'} {s.to.name}:{' '}
            <b>{s.event.description} ({s.event.effect >= 0 ? '+' : ''}{s.event.effect})</b> | coins: {s.coins}
          </ListGroup.Item>
        ))}
      </ListGroup>
      {done && <Button onClick={onDone}>See result 🏁</Button>}
    </div>
  );
}

export default ExecutionView;
