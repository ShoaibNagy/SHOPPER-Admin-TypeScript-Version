import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@store/auth.store';
import type { AdminRole } from '@/types/auth.types';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface AdminRouteProps {
  /**
   * Optional whitelist of roles that may access this route.
   * If omitted, any authenticated admin role is allowed.
   */
  allowedRoles?: AdminRole[];
}

// ---------------------------------------------------------------------------
// AdminRoute
// ---------------------------------------------------------------------------
// Wraps protected pages. Renders:
//   - A full-screen spinner while the store is still hydrating (isLoading).
//   - A redirect to /login if the user is not authenticated.
//   - A redirect to /unauthorized if the user's role is not in allowedRoles.
//   - The child <Outlet /> when all checks pass.
//
// Usage in router/index.tsx:
//   <Route element={<AdminRoute />}>
//     <Route path="dashboard" element={<Dashboard />} />
//   </Route>
//
//   <Route element={<AdminRoute allowedRoles={['super_admin']} />}>
//     <Route path="settings" element={<Settings />} />
//   </Route>
// ---------------------------------------------------------------------------
export function AdminRoute({ allowedRoles }: AdminRouteProps) {
  const { admin, isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  // ── 1. Hydrating — wait before making any routing decision ──────────
  if (isLoading) {
    return <HydrationSpinner />;
  }

  // ── 2. Not authenticated — redirect to login, preserve intended path ─
  if (!isAuthenticated || !admin) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ── 3. Role check ────────────────────────────────────────────────────
  if (allowedRoles && !allowedRoles.includes(admin.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // ── 4. All checks pass ───────────────────────────────────────────────
  return <Outlet />;
}

// ---------------------------------------------------------------------------
// Full-screen hydration spinner
// Inline styles only — no SCSS import, so it works before the CSS bundle loads.
// ---------------------------------------------------------------------------
function HydrationSpinner() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0d0d0d',
        zIndex: 9999,
      }}
    >
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          animation: 'spin 0.9s linear infinite',
        }}
      >
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <circle cx="20" cy="20" r="17" stroke="#383838" strokeWidth="3" />
        <path
          d="M 20 3 A 17 17 0 0 1 37 20"
          stroke="#f97316"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}