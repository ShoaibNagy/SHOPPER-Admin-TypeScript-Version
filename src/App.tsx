import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { router } from '@router/index';

// ---------------------------------------------------------------------------
// QueryClient — singleton, configured once at the app root
// ---------------------------------------------------------------------------
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Keep data fresh for 30s by default; individual hooks override this
      staleTime: 30_000,
      // Retry failed requests once before surfacing the error
      retry: 1,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10_000),
      // Don't refetch when the window regains focus in the admin —
      // admins often switch windows; silent refetches cause jarring re-renders
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />

      {/* ── Toast notifications ─────────────────────────────────────────── */}
      <Toaster
        position="bottom-right"
        gutter={8}
        containerStyle={{ bottom: 24, right: 24 }}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1c1c1c',
            color: '#f0f0f0',
            border: '1px solid #383838',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            fontFamily: 'DM Sans, sans-serif',
            padding: '10px 14px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
            maxWidth: '360px',
          },
          success: {
            iconTheme: { primary: '#22c55e', secondary: '#1c1c1c' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#1c1c1c' },
            duration: 6000,
          },
        }}
      />

      {/* ── TanStack Query Devtools (dev only, tree-shaken in production) ── */}
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
    </QueryClientProvider>
  );
}