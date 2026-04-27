/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AdminRoute } from './AdminRoute';

// ---------------------------------------------------------------------------
// Layouts (not lazy — they're the shell, always needed)
// ---------------------------------------------------------------------------
import { AdminLayout } from '@components/layout/AdminLayout';

// ---------------------------------------------------------------------------
// Pages — all lazy-loaded for optimal chunk splitting.
// Vite groups each import into its own chunk so the initial bundle stays small.
// ---------------------------------------------------------------------------
const Login        = lazy(() => import('@pages/Login').then(m => ({ default: m.Login })));
const Dashboard    = lazy(() => import('@pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Products     = lazy(() => import('@pages/Products').then(m => ({ default: m.Products })));
const ProductEdit  = lazy(() => import('@pages/ProductEdit').then(m => ({ default: m.ProductEdit })));
const Orders       = lazy(() => import('@pages/Orders').then(m => ({ default: m.Orders })));
const OrderDetail  = lazy(() => import('@pages/OrderDetails').then(m => ({ default: m.OrderDetails })));
const Users        = lazy(() => import('@pages/Users').then(m => ({ default: m.Users })));
const UserDetail   = lazy(() => import('@pages/UserDetails').then(m => ({ default: m.UserDetails })));
const Reviews      = lazy(() => import('@pages/Reviews').then(m => ({ default: m.Reviews })));
const NotFound     = lazy(() => import('@pages/NotFound').then(m => ({ default: m.NotFound })));

// ---------------------------------------------------------------------------
// Page-level suspense fallback
// Minimal — the AdminLayout skeleton handles perceived loading for inner pages.
// ---------------------------------------------------------------------------
function PageFallback() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
        color: '#9a9a9a',
        fontSize: '0.875rem',
      }}
    />
  );
}

function withSuspense(element: React.ReactElement) {
  return <Suspense fallback={<PageFallback />}>{element}</Suspense>;
}

// ---------------------------------------------------------------------------
// Router tree
// ---------------------------------------------------------------------------
export const router = createBrowserRouter([
  // ── Public routes ──────────────────────────────────────────────────────
  {
    path: '/login',
    element: withSuspense(<Login />),
  },

  // ── Protected routes — all admin roles ────────────────────────────────
  {
    element: <AdminRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          // Default redirect: / → /dashboard
          {
            index: true,
            element: <Navigate to="/dashboard" replace />,
          },

          // Dashboard
          {
            path: 'dashboard',
            element: withSuspense(<Dashboard />),
          },

          // Products
          {
            path: 'products',
            children: [
              {
                index: true,
                element: withSuspense(<Products />),
              },
              {
                path: 'new',
                element: withSuspense(<ProductEdit />),
              },
              {
                path: ':id/edit',
                element: withSuspense(<ProductEdit />),
              },
            ],
          },

          // Orders
          {
            path: 'orders',
            children: [
              {
                index: true,
                element: withSuspense(<Orders />),
              },
              {
                path: ':id',
                element: withSuspense(<OrderDetail />),
              },
            ],
          },

          // Users
          {
            path: 'users',
            children: [
              {
                index: true,
                element: withSuspense(<Users />),
              },
              {
                path: ':id',
                element: withSuspense(<UserDetail />),
              },
            ],
          },

          // Reviews
          {
            path: 'reviews',
            element: withSuspense(<Reviews />),
          },
        ],
      },
    ],
  },

  // ── Super-admin only routes (future expansion) ─────────────────────────
  {
    element: <AdminRoute allowedRoles={['super_admin']} />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          // e.g. settings, admin user management, etc.
          // Add here when needed.
        ],
      },
    ],
  },

  // ── Unauthorized ────────────────────────────────────────────────────────
  {
    path: '/unauthorized',
    element: (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100dvh',
          background: '#0d0d0d',
          color: '#f0f0f0',
          gap: '1rem',
          fontFamily: 'DM Sans, sans-serif',
        }}
      >
        <span style={{ fontSize: '3rem' }}>🔒</span>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>Access Denied</h1>
        <p style={{ color: '#9a9a9a', margin: 0 }}>
          You don&apos;t have permission to view this page.
        </p>
      </div>
    ),
  },

  // ── 404 ─────────────────────────────────────────────────────────────────
  {
    path: '*',
    element: withSuspense(<NotFound />),
  },
]);