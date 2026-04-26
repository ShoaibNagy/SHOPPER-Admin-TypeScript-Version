import { useState, createContext, useContext, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import s from './AdminLayout.module.scss';

// ---------------------------------------------------------------------------
// Layout context — shared between AdminLayout, Sidebar, Topbar
// ---------------------------------------------------------------------------
interface LayoutContextValue {
  collapsed:     boolean;
  toggleCollapse: () => void;
  mobileOpen:    boolean;
  toggleMobile:  () => void;
  closeMobile:   () => void;
}

const LayoutContext = createContext<LayoutContextValue | null>(null);

export function useLayout(): LayoutContextValue {
  const ctx = useContext(LayoutContext);
  if (!ctx) throw new Error('useLayout must be used inside <AdminLayout>');
  return ctx;
}

// ---------------------------------------------------------------------------
// AdminLayout
// ---------------------------------------------------------------------------
export function AdminLayout() {
  const location = useLocation();

  // Desktop: sidebar collapsed (icon-only) vs expanded
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('admin_sidebar_collapsed') === 'true';
  });

  // Mobile: sidebar open/closed overlay
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleCollapse = useCallback(() => {
    setCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('admin_sidebar_collapsed', String(next));
      return next;
    });
  }, []);

  const toggleMobile = useCallback(() => setMobileOpen(prev => !prev), []);
  const closeMobile  = useCallback(() => setMobileOpen(false), []);

  // Close mobile sidebar on route change
  // (location is a stable dep — effect fires on navigation)
  useState(() => { closeMobile(); });

  return (
    <LayoutContext.Provider
      value={{ collapsed, toggleCollapse, mobileOpen, toggleMobile, closeMobile }}
    >
      <div
        className={clsx(
          s.shell,
          collapsed   && s.collapsed,
          mobileOpen  && s.sidebarOpen,
        )}
      >
        {/* ── Sidebar ──────────────────────────────────────────────── */}
        <div className={s.sidebarArea}>
          <Sidebar />
        </div>

        {/* ── Mobile backdrop ──────────────────────────────────────── */}
        {mobileOpen && (
          <div
            className={s.mobileOverlay}
            onClick={closeMobile}
            aria-hidden="true"
          />
        )}

        {/* ── Topbar ───────────────────────────────────────────────── */}
        <div className={s.topbarArea}>
          <Topbar />
        </div>

        {/* ── Page content ─────────────────────────────────────────── */}
        <main className={s.main}>
          {/* key re-mounts inner on route change → triggers fade-up animation */}
          <div key={location.pathname} className={s.inner}>
            <Outlet />
          </div>
        </main>
      </div>
    </LayoutContext.Provider>
  );
}