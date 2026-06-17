import { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';

// form di login
function LoginForm({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await onLogin({ username, password });
    } catch (err) {
      setError(err.error || 'Login failed');
    }
  };

  return (
    <Form onSubmit={handleSubmit} style={{ maxWidth: 360 }}>
      <h2>Welcome back! 👋</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form.Group className="mb-3">
        <Form.Label htmlFor="username">Username</Form.Label>
        <Form.Control id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label htmlFor="password">Password</Form.Label>
        <Form.Control id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </Form.Group>
      <Button type="submit">Login</Button>
    </Form>
  );
}

export default LoginForm;
