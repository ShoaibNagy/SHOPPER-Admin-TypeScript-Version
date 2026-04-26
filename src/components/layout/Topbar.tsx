import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import { useLayout } from './AdminLayoutContext';
import { useAdminAuth } from '@hooks/useAdminAuth';
import s from './Topbar.module.scss';

// ---------------------------------------------------------------------------
// Route → page title map
// ---------------------------------------------------------------------------
const PAGE_TITLES: Record<string, string> = {
  '/dashboard':   'Dashboard',
  '/products':    'Products',
  '/orders':      'Orders',
  '/users':       'Users',
  '/reviews':     'Reviews',
};

function getPageTitle(pathname: string): string {
  // Exact match first
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  // Prefix match: /products/new → "Products"
  const prefix = Object.keys(PAGE_TITLES).find(k => k !== '/' && pathname.startsWith(k));
  return prefix ? PAGE_TITLES[prefix] : 'Admin';
}

// ---------------------------------------------------------------------------
// Topbar
// ---------------------------------------------------------------------------
export function Topbar() {
  const { toggleMobile }                 = useLayout();
  const { admin, logout, isLoggingOut }  = useAdminAuth();
  const location                         = useLocation();
  const [openMenuPath, setOpenMenuPath] = useState<string | null>(null);
  const menuRef                          = useRef<HTMLDivElement>(null);
  const menuOpen                         = openMenuPath === location.pathname;

  const pageTitle = getPageTitle(location.pathname);

  // Close dropdown on outside click
  useEffect(() => {
    if (!menuOpen) return;
    function onOutside(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setOpenMenuPath(null);
    }
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [menuOpen]);

  const initials = admin?.name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() ?? '?';

  return (
    <header className={s.topbar}>
      {/* ── Left ─────────────────────────────────────────────────────── */}
      <div className={s.left}>
        {/* Mobile hamburger */}
        <button
          className={s.menuBtn}
          onClick={toggleMobile}
          aria-label="Open navigation"
          type="button"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M2 4h12M2 8h12M2 12h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        {/* Page title */}
        <h1 className={s.pageTitle}>{pageTitle}</h1>
      </div>

      {/* ── Right ────────────────────────────────────────────────────── */}
      <div className={s.right}>
        {/* Notifications (placeholder — wire to real data later) */}
        <button
          className={s.iconBtn}
          aria-label="Notifications"
          type="button"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M8 1a5 5 0 00-5 5v3l-1.5 2h13L13 9V6a5 5 0 00-5-5z" />
            <path d="M6.5 13a1.5 1.5 0 003 0" />
          </svg>
          {/* Uncomment when you have unread count: */}
          {/* <span className={s.dot} aria-hidden="true" /> */}
        </button>

        {/* User menu */}
        <div className={s.menuWrapper} ref={menuRef}>
          <button
            className={s.avatarBtn}
            onClick={() => setOpenMenuPath(p => (p === location.pathname ? null : location.pathname))}
            aria-label="User menu"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            type="button"
          >
            {admin?.avatar
              ? <img src={admin.avatar} alt={admin.name} />
              : initials
            }
          </button>

          {menuOpen && (
            <div className={s.menu} role="menu" aria-label="User menu">
              {/* Header */}
              {admin && (
                <div className={s.menuHeader}>
                  <div className={s.menuName}>{admin.name}</div>
                  <div className={s.menuEmail}>{admin.email}</div>
                  <span className={s.menuRole}>{admin.role.replace('_', ' ')}</span>
                </div>
              )}

              <div className={s.menuItems}>
                <Link
                  to="/profile"
                  className={s.menuItem}
                  role="menuitem"
                  onClick={() => setOpenMenuPath(null)}
                >
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="8" cy="5" r="3" />
                    <path d="M2 14c0-3 2.7-5 6-5s6 2 6 5" />
                  </svg>
                  Profile
                </Link>

                <div className={s.menuDivider} role="separator" />

                <button
                  className={clsx(s.menuItem, s.menuItemDanger)}
                  onClick={() => { setOpenMenuPath(null); void logout(); }}
                  disabled={isLoggingOut}
                  role="menuitem"
                  type="button"
                >
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3" />
                    <path d="M11 11l3-3-3-3M14 8H6" />
                  </svg>
                  {isLoggingOut ? 'Signing out…' : 'Sign out'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}