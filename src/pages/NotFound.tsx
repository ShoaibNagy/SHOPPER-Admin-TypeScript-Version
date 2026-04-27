import { Link } from 'react-router-dom';
import { Button } from '@components/ui/Button';

export function NotFound() {
  return (
    <div style={pageStyle}>
      <div style={bgStyle} aria-hidden="true" />
      <div style={contentStyle}>
        <div style={codeStyle}>404</div>
        <h1 style={titleStyle}>Page not found</h1>
        <p style={subtitleStyle}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button variant="primary" size="md" href="/dashboard">
          <Link to={"/dashboard"}>Back to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: '60vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  overflow: 'hidden',
};

const bgStyle: React.CSSProperties = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '40vw',
  height: '40vw',
  background: 'radial-gradient(circle, rgba(249,115,22,0.05) 0%, transparent 65%)',
  pointerEvents: 'none',
};

const contentStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 16,
  textAlign: 'center',
  padding: '48px 24px',
  position: 'relative',
};

const codeStyle: React.CSSProperties = {
  fontFamily: 'Unbounded, sans-serif',
  fontSize: 96,
  fontWeight: 800,
  color: '#2e2e2e',
  lineHeight: 1,
  letterSpacing: '-0.05em',
  marginBottom: -8,
};

const titleStyle: React.CSSProperties = {
  fontFamily: 'Unbounded, sans-serif',
  fontSize: 22,
  fontWeight: 700,
  color: '#f0f0f0',
  letterSpacing: '-0.03em',
  margin: 0,
};

const subtitleStyle: React.CSSProperties = {
  fontSize: 14,
  color: '#9a9a9a',
  margin: 0,
  maxWidth: 320,
  lineHeight: 1.6,
  fontFamily: 'DM Sans, sans-serif',
};