import { useEffect, useState } from 'react';
import { Table, Alert } from 'react-bootstrap';
import * as API from '../API.js';

// ranking generale
function RankingTable() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    API.getRanking()
      .then(setRows)
      .catch((err) => setError(err.error || 'Error loading ranking'));
  }, []);

  return (
    <div>
      <h2>Ranking 🏆</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Table striped bordered>
        <thead>
          <tr><th>#</th><th>User</th><th>Name</th><th>Best score</th></tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.username}>
              <td>{i + 1}</td>
              <td>{r.username}</td>
              <td>{r.name}</td>
              <td>{r.bestScore}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      {rows.length === 0 && !error && <p>No games played yet. Be the first! 🚀</p>}
    </div>
  );
}

export default RankingTable;
