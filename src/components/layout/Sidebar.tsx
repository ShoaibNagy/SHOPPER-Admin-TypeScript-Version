import { NavLink, useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { useLayout } from './AdminLayoutContext';
import { useAdminAuth } from '@hooks/useAdminAuth';
import s from './Sidebar.module.scss';

// ---------------------------------------------------------------------------
// Nav items config
// ---------------------------------------------------------------------------
interface NavItem {
  path:  string;
  label: string;
  icon:  React.ReactNode;
  badge?: number;
}

interface NavSection {
  title?: string;
  items:  NavItem[];
}

function navSections(): NavSection[] {
  return [
    {
      items: [
        {
          path: '/dashboard',
          label: 'Dashboard',
          icon: (
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <rect x="1" y="1" width="6" height="6" rx="1" />
              <rect x="9" y="1" width="6" height="6" rx="1" />
              <rect x="1" y="9" width="6" height="6" rx="1" />
              <rect x="9" y="9" width="6" height="6" rx="1" />
            </svg>
          ),
        },
      ],
    },
    {
      title: 'Catalogue',
      items: [
        {
          path: '/products',
          label: 'Products',
          icon: (
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 2h3l1.5 5h5L13 4H5" />
              <circle cx="6.5" cy="13" r="1" />
              <circle cx="11.5" cy="13" r="1" />
            </svg>
          ),
        },
      ],
    },
    {
      title: 'Sales',
      items: [
        {
          path: '/orders',
          label: 'Orders',
          icon: (
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="12" height="12" rx="1.5" />
              <path d="M5 8h6M5 5h6M5 11h4" />
            </svg>
          ),
        },
        {
          path: '/reviews',
          label: 'Reviews',
          icon: (
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 1l1.8 3.6L14 5.3l-3 2.9.7 4.1L8 10.4l-3.7 1.9.7-4.1-3-2.9 4.2-.7z" />
            </svg>
          ),
        },
      ],
    },
    {
      title: 'Customers',
      items: [
        {
          path: '/users',
          label: 'Users',
          icon: (
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="8" cy="5" r="3" />
              <path d="M2 14c0-3 2.7-5 6-5s6 2 6 5" />
            </svg>
          ),
        },
      ],
    },
  ];
}

// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------
export function Sidebar() {
  const { collapsed, toggleCollapse, closeMobile } = useLayout();
  const { admin } = useAdminAuth();
  const navigate = useNavigate();

  // Initials for avatar fallback
  const initials = admin?.name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() ?? '?';

  return (
    <nav
      className={clsx(s.sidebar, collapsed && s.collapsed)}
      aria-label="Admin navigation"
    >
      {/* ── Logo ─────────────────────────────────────────────────────── */}
      <NavLink to="/dashboard" className={s.logo} onClick={closeMobile} aria-label="Shopper Admin home">
        <span className={s.logoMark}>S</span>
        <span className={s.logoText}>
          SHOPPER <span>ADMIN</span>
        </span>
      </NavLink>

      {/* ── Navigation sections ───────────────────────────────────────── */}
      <div className={s.nav}>
        {navSections().map((section, si) => (
          <div key={si}>
            {section.title && (
              <div className={s.sectionLabel} aria-hidden={collapsed}>
                {section.title}
              </div>
            )}
            {section.items.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => clsx(s.link, isActive && s.active)}
                onClick={closeMobile}
                title={collapsed ? item.label : undefined}
                aria-label={collapsed ? item.label : undefined}
              >
                <span className={s.linkIcon} aria-hidden="true">{item.icon}</span>
                <span className={s.linkLabel}>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={s.linkBadge} aria-label={`${item.badge} new`}>
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </div>

      {/* ── Bottom ───────────────────────────────────────────────────── */}
      <div className={s.bottom}>
        {/* Collapse toggle */}
        <button
          className={s.collapseBtn}
          onClick={toggleCollapse}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          type="button"
        >
          <span className={s.collapseIcon} aria-hidden="true">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M10 4L6 8l4 4" />
              <path d="M2 2v12" />
            </svg>
          </span>
          <span className={s.collapseBtnLabel}>Collapse</span>
        </button>

        {/* User row */}
        {admin && (
          <div
            className={s.user}
            role="button"
            tabIndex={0}
            title={collapsed ? admin.name : undefined}
            onClick={() => navigate('/profile')}
            onKeyDown={e => e.key === 'Enter' && navigate('/profile')}
          >
            <span className={s.avatar}>
              {admin.avatar
                ? <img src={admin.avatar} alt={admin.name} />
                : initials
              }
            </span>
            <span className={s.userInfo}>
              <span className={s.userName}>{admin.name}</span>
              <span className={s.userRole}>{admin.role.replace('_', ' ')}</span>
            </span>
          </div>
        )}
      </div>
    </nav>
  );
}