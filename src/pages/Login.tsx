import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { useAdminAuth } from '@hooks/useAdminAuth';

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
const schema = z.object({
  email:    z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});
type FormValues = z.infer<typeof schema>;

// ---------------------------------------------------------------------------
// Login page
// ---------------------------------------------------------------------------
export function Login() {
  const { login, isLoginPending, isAuthenticated } = useAdminAuth();
  const navigate = useNavigate();

  // Redirect already-authenticated admins
  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  function onSubmit(values: FormValues) {
    login(values);
  }

  return (
    <div style={pageStyle}>
      {/* Background gradient */}
      <div style={bgGradientStyle} aria-hidden="true" />

      <div style={cardStyle}>
        {/* Logo */}
        <div style={logoStyle}>
          <div style={logoMarkStyle}>S</div>
          <span style={logoTextStyle}>
            SHOPPER <span style={{ color: '#f97316' }}>ADMIN</span>
          </span>
        </div>

        <div style={{ marginBottom: 28 }}>
          <h1 style={headingStyle}>Welcome back</h1>
          <p style={subheadingStyle}>Sign in to your admin account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            autoFocus
            placeholder="admin@shopper.com"
            error={errors.email!.message!}
            required
            {...register('email')}
          />

          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            error={errors.password!.message!}
            required
            {...register('password')}
          />

          <Button
            variant="primary"
            size="lg"
            type="submit"
            fullWidth
            isLoading={isLoginPending}
            style={{ marginTop: 8 } as React.CSSProperties}
          >
            Sign in
          </Button>
        </form>

        <p style={footerTextStyle}>
          SHOPPER Admin Portal · Authorised personnel only
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const pageStyle: React.CSSProperties = {
  minHeight: '100dvh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#0d0d0d',
  padding: '24px 16px',
  position: 'relative',
  overflow: 'hidden',
};

const bgGradientStyle: React.CSSProperties = {
  position: 'absolute',
  top: '-30%',
  left: '50%',
  transform: 'translateX(-50%)',
  width: '60vw',
  height: '60vw',
  background: 'radial-gradient(circle, rgba(249,115,22,0.07) 0%, transparent 65%)',
  pointerEvents: 'none',
};

const cardStyle: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  maxWidth: 400,
  background: '#141414',
  border: '1px solid #2e2e2e',
  borderRadius: 12,
  padding: '36px 32px',
  boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
  animation: 'fade-up 0.4s cubic-bezier(0,0,0.2,1) both',
};

const logoStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  marginBottom: 32,
};

const logoMarkStyle: React.CSSProperties = {
  width: 32,
  height: 32,
  background: '#f97316',
  borderRadius: 6,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'Unbounded, sans-serif',
  fontSize: 14,
  fontWeight: 800,
  color: '#0d0d0d',
  letterSpacing: '-0.04em',
};

const logoTextStyle: React.CSSProperties = {
  fontFamily: 'Unbounded, sans-serif',
  fontSize: 13,
  fontWeight: 700,
  color: '#f0f0f0',
  letterSpacing: '-0.03em',
};

const headingStyle: React.CSSProperties = {
  fontFamily: 'Unbounded, sans-serif',
  fontSize: 22,
  fontWeight: 700,
  color: '#f0f0f0',
  margin: '0 0 6px',
  letterSpacing: '-0.03em',
};

const subheadingStyle: React.CSSProperties = {
  fontSize: 14,
  color: '#9a9a9a',
  margin: 0,
  fontFamily: 'DM Sans, sans-serif',
};

const footerTextStyle: React.CSSProperties = {
  marginTop: 24,
  fontSize: 11,
  color: '#4a4a4a',
  textAlign: 'center',
  fontFamily: 'DM Sans, sans-serif',
};