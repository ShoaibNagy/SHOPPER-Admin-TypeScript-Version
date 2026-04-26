import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],

  theme: {
    extend: {
      /* ── Brand Colors (inherited from storefront) ──────────── */
      colors: {
        brand: {
          50:  '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316', // Primary orange — same as storefront
          600: '#ea6e10',
          700: '#c2540a',
          800: '#9a3c05',
          900: '#7c2d05',
          950: '#431407',
        },

        /* ── Admin Surfaces (darker & denser than storefront) ── */
        surface: {
          DEFAULT: '#0d0d0d', // Page/canvas background
          1:       '#141414', // Sidebar background
          2:       '#1c1c1c', // Card / panel background
          3:       '#242424', // Table row / input background
          4:       '#2e2e2e', // Hover states, active rows
          5:       '#383838', // Borders, dividers
        },

        /* ── Ink (text) ─────────────────────────────────────── */
        ink: {
          DEFAULT: '#f0f0f0', // Primary text
          muted:   '#9a9a9a', // Secondary / placeholder text
          faint:   '#4a4a4a', // Disabled / very muted
        },

        /* ── Semantic Status Colors ─────────────────────────── */
        success: {
          DEFAULT: '#22c55e',
          subtle:  'rgba(34, 197, 94, 0.12)',
        },
        warning: {
          DEFAULT: '#f59e0b',
          subtle:  'rgba(245, 158, 11, 0.12)',
        },
        danger: {
          DEFAULT: '#ef4444',
          subtle:  'rgba(239, 68, 68, 0.12)',
        },
        info: {
          DEFAULT: '#3b82f6',
          subtle:  'rgba(59, 130, 246, 0.12)',
        },
      },

      /* ── Typography (same fonts as storefront) ─────────────── */
      fontFamily: {
        display: ['Unbounded', 'sans-serif'],
        body:    ['DM Sans', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },

      /* ── Admin Layout Tokens ──────────────────────────────── */
      spacing: {
        /* sidebar widths */
        'sidebar':          '16rem',   // 256px — expanded
        'sidebar-collapsed':'4.5rem',  // 72px  — icon-only
        /* topbar */
        'topbar':           '3.5rem',  // 56px
        /* card / section rhythm */
        '18':  '4.5rem',
        '22':  '5.5rem',
        '30':  '7.5rem',
        '128': '32rem',
      },

      /* ── Border Radius ────────────────────────────────────── */
      borderRadius: {
        'xs':  '0.25rem',
        'sm':  '0.375rem',
        DEFAULT: '0.5rem',
        'md':  '0.625rem',
        'lg':  '0.75rem',
        'xl':  '1rem',
        '2xl': '1.25rem',
      },

      /* ── Box Shadows ──────────────────────────────────────── */
      boxShadow: {
        'card':        '0 1px 2px rgba(0,0,0,0.6), 0 4px 16px rgba(0,0,0,0.4)',
        'card-hover':  '0 4px 6px rgba(0,0,0,0.6), 0 12px 32px rgba(0,0,0,0.5)',
        'glow-brand':  '0 0 24px -4px rgba(249, 115, 22, 0.45)',
        'glow-sm':     '0 0 12px -2px rgba(249, 115, 22, 0.3)',
        'topbar':      '0 1px 0 rgba(255,255,255,0.04)',
        'dropdown':    '0 8px 32px rgba(0,0,0,0.7), 0 2px 8px rgba(0,0,0,0.5)',
        'modal':       '0 24px 80px rgba(0,0,0,0.8)',
      },

      /* ── Keyframes ────────────────────────────────────────── */
      keyframes: {
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-left': {
          '0%':   { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-out-left': {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-brand': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.5' },
        },
      },

      animation: {
        'fade-in':       'fade-in 0.2s ease-out forwards',
        'fade-up':       'fade-up 0.3s ease-out forwards',
        'slide-in-left': 'slide-in-left 0.25s cubic-bezier(0.32, 0.72, 0, 1)',
        'slide-out-left':'slide-out-left 0.2s cubic-bezier(0.32, 0.72, 0, 1)',
        'shimmer':       'shimmer 1.8s linear infinite',
        'pulse-brand':   'pulse-brand 2s ease-in-out infinite',
      },

      /* ── Transition Timing ────────────────────────────────── */
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
        'out-back': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },

      /* ── Screens ──────────────────────────────────────────── */
      screens: {
        'xs':  '480px',
        'sm':  '640px',
        'md':  '768px',
        'lg':  '1024px',
        'xl':  '1280px',
        '2xl': '1536px',
      },
    },
  },

  plugins: [],
};

export default config;