import { createContext, useContext } from 'react';

export interface LayoutContextValue {
  collapsed: boolean;
  toggleCollapse: () => void;
  mobileOpen: boolean;
  toggleMobile: () => void;
  closeMobile: () => void;
}

export const LayoutContext = createContext<LayoutContextValue | null>(null);

export function useLayout(): LayoutContextValue {
  const ctx = useContext(LayoutContext);
  if (!ctx) throw new Error('useLayout must be used inside <AdminLayout>');
  return ctx;
}
