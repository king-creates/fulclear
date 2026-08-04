import { Link } from 'react-router-dom';
import { Button } from '../component/common';
import { ROUTES } from '../constants/routes';

const NotFound = () => (
  <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-4)', textAlign: 'center', padding: 'var(--space-8)' }}>
    <p style={{ fontSize: '6rem', fontWeight: 'var(--font-extrabold)', color: 'var(--color-primary-700)', lineHeight: 1 }}>404</p>
    <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-gray-900)' }}>Page not found</h2>
    <p style={{ color: 'var(--color-gray-500)', maxWidth: 360 }}>The page you are looking for does not exist or you do not have permission to view it.</p>
    <Link to={ROUTES.HOME}>
      <Button variant="primary">Go back home</Button>
    </Link>
  </div>
);

export default NotFound;