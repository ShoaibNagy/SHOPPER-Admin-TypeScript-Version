import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { hydrateAuth } from '@store/auth.store';
import './index.css';
import '@styles/main.scss';

// ---------------------------------------------------------------------------
// Bootstrap sequence
// ---------------------------------------------------------------------------
// 1. hydrateAuth() fires immediately — it tries to exchange the httpOnly
//    refresh cookie for a fresh access token and populate the auth store.
//    The store starts with isLoading: true, so AdminRoute shows its spinner
//    while this promise is in flight. The React tree is mounted first so
//    StrictMode effects and QueryClient are ready when hydrateAuth resolves.
//
// 2. We do NOT await hydrateAuth before calling createRoot — that would blank
//    the screen for the full network round-trip. Instead the app renders with
//    isLoading: true and the spinner handles the perceived latency.
// ---------------------------------------------------------------------------

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('#root element not found in index.html');

const root = createRoot(rootEl);

root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Fire hydration after the root is mounted
void hydrateAuth();