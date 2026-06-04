import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function NavHeader({ user, onLogout }) {
  return (
    <Navbar bg="dark" variant="dark">
      <Container>
        <Navbar.Brand as={Link} to="/">Last Race</Navbar.Brand>
        <Nav className="ms-auto align-items-center gap-2">
          <Nav.Link as={Link} to="/">Home</Nav.Link>
          {user ? (
            <>
              <Nav.Link as={Link} to="/play">Play</Nav.Link>
              <Nav.Link as={Link} to="/ranking">Ranking</Nav.Link>
              <span className="text-light">Hi, {user.name}</span>
              <Button size="sm" variant="outline-light" onClick={onLogout}>Logout</Button>
            </>
          ) : (
            <Nav.Link as={Link} to="/login">Login</Nav.Link>
          )}
        </Nav>
      </Container>
    </Navbar>
  );
}

export default NavHeader;
