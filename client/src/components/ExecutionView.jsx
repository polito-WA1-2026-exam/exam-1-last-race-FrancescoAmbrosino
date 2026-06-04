import { useEffect, useState } from 'react';
import { ListGroup, Button } from 'react-bootstrap';

// rivela gli step uno alla volta (un evento per segmento), aggiornando il totale coin
function ExecutionView({ steps, onDone }) {
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    if (visible >= steps.length) return;
    const id = setInterval(() => setVisible((v) => Math.min(v + 1, steps.length)), 1200);
    return () => clearInterval(id);
  }, [visible, steps.length]);

  const shown = steps.slice(0, visible);
  const done = visible >= steps.length;

  return (
    <div>
      <h2>Execution</h2>
      <ListGroup className="mb-3">
        {shown.map((s, i) => (
          <ListGroup.Item key={i}>
            {s.from.name} {'→'} {s.to.name}: {s.event.description}{' '}
            ({s.event.effect >= 0 ? '+' : ''}{s.event.effect}) | coins: {s.coins}
          </ListGroup.Item>
        ))}
      </ListGroup>
      {done && <Button onClick={onDone}>See result</Button>}
    </div>
  );
}

export default ExecutionView;
