import {
    useEffect,
    useRef,
    useCallback,
    createContext,
    useContext,
    type ReactNode,
    type KeyboardEvent,
  } from 'react';
  import { createPortal } from 'react-dom';
  import { clsx } from 'clsx';
  import s from './Modal.module.scss';
  
  // ---------------------------------------------------------------------------
  // Types
  // ---------------------------------------------------------------------------
  export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';
  
  export interface ModalProps {
    isOpen:       boolean;
    onClose:      () => void;
    size?:        ModalSize;
    /** Adds a red top-border accent — use for destructive confirmation dialogs */
    danger?:      boolean;
    /** Prevent closing on overlay click (e.g. forms with unsaved data) */
    disableClose?: boolean;
    children:     ReactNode;
    /** aria-labelledby target — should match Modal.Title's id */
    'aria-labelledby'?: string;
  }
  
  // Context for sub-components to access onClose
  const ModalContext = createContext<{ onClose: () => void } | null>(null);
  function useModalContext() {
    const ctx = useContext(ModalContext);
    if (!ctx) throw new Error('Modal sub-components must be used inside <Modal>');
    return ctx;
  }
  
  // ---------------------------------------------------------------------------
  // Root Modal
  // ---------------------------------------------------------------------------
  export function Modal({
    isOpen,
    onClose,
    size = 'md',
    danger = false,
    disableClose = false,
    children,
    'aria-labelledby': labelledBy,
  }: ModalProps) {
    const panelRef = useRef<HTMLDivElement>(null);
  
    // ── Scroll lock ────────────────────────────────────────────────────────
    useEffect(() => {
      if (!isOpen) return;
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }, [isOpen]);
  
    // ── Focus trap ─────────────────────────────────────────────────────────
    useEffect(() => {
      if (!isOpen || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
      );
      const first = focusable[0];
      const last  = focusable[focusable.length - 1];
      first?.focus();
  
      function trap(e: globalThis.KeyboardEvent) {
        if (e.key !== 'Tab') return;
        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
        } else {
          if (document.activeElement === last)  { e.preventDefault(); first?.focus(); }
        }
      }
      document.addEventListener('keydown', trap);
      return () => document.removeEventListener('keydown', trap);
    }, [isOpen]);
  
    // ── Escape key ─────────────────────────────────────────────────────────
    const handleKeyDown = useCallback(
      (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Escape' && !disableClose) onClose();
      },
      [onClose, disableClose],
    );
  
    if (!isOpen) return null;
  
    return createPortal(
      <ModalContext.Provider value={{ onClose }}>
        {/* Overlay */}
        <div
          className={s.overlay}
          onClick={disableClose ? undefined : onClose}
          onKeyDown={handleKeyDown}
          role="presentation"
        >
          {/* Panel — stop click propagation so overlay click doesn't fire */}
          <div
            ref={panelRef}
            className={clsx(s.panel, s[size], danger && s.danger)}
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            onClick={e => e.stopPropagation()}
            tabIndex={-1}
          >
            {children}
          </div>
        </div>
      </ModalContext.Provider>,
      document.body,
    );
  }
  
  // ---------------------------------------------------------------------------
  // Sub-components (compound pattern)
  // ---------------------------------------------------------------------------
  
  // ── Modal.Header ──────────────────────────────────────────────────────────────
  Modal.Header = function ModalHeader({
    children,
    showClose = true,
  }: {
    children: ReactNode;
    showClose?: boolean;
  }) {
    const { onClose } = useModalContext();
    return (
      <div className={s.header}>
        <div className={s.titleGroup}>{children}</div>
        {showClose && (
          <button
            className={s.closeBtn}
            onClick={onClose}
            aria-label="Close modal"
            type="button"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path
                d="M1 1L13 13M13 1L1 13"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}
      </div>
    );
  };
  
  // ── Modal.Title ───────────────────────────────────────────────────────────────
  Modal.Title = function ModalTitle({
    id,
    children,
  }: {
    id?: string;
    children: ReactNode;
  }) {
    return <h2 id={id} className={s.title}>{children}</h2>;
  };
  
  // ── Modal.Subtitle ────────────────────────────────────────────────────────────
  Modal.Subtitle = function ModalSubtitle({ children }: { children: ReactNode }) {
    return <p className={s.subtitle}>{children}</p>;
  };
  
  // ── Modal.Body ────────────────────────────────────────────────────────────────
  Modal.Body = function ModalBody({
    children,
    flush = false,
  }: {
    children: ReactNode;
    flush?: boolean;
  }) {
    return <div className={clsx(s.body, flush && s.bodyFlush)}>{children}</div>;
  };
  
  // ── Modal.Footer ──────────────────────────────────────────────────────────────
  Modal.Footer = function ModalFooter({
    children,
    actions,
  }: {
    children?: ReactNode;
    actions?: ReactNode;
  }) {
    return (
      <div className={s.footer}>
        {children}
        {actions && <div className={s.footerActions}>{actions}</div>}
      </div>
    );
  };