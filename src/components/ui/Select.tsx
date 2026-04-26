import {
    useState,
    useRef,
    useEffect,
    useCallback,
    useId,
    type KeyboardEvent,
    type CSSProperties,
    type ReactNode,
  } from 'react';
  import { createPortal } from 'react-dom';
  import { clsx } from 'clsx';
  import s from './Select.module.scss';
  
  // ---------------------------------------------------------------------------
  // Types
  // ---------------------------------------------------------------------------
  export interface SelectOption<V extends string = string> {
    value:     V;
    label:     string;
    disabled?: boolean;
  }
  
  export interface SelectGroup<V extends string = string> {
    label:   string;
    options: SelectOption<V>[];
  }
  
  export type SelectItem<V extends string = string> = SelectOption<V> | SelectGroup<V>;
  
  function isGroup<V extends string>(item: SelectItem<V>): item is SelectGroup<V> {
    return 'options' in item;
  }
  
  // Flatten items → options for keyboard nav and search
  function flatOptions<V extends string>(items: SelectItem<V>[]): SelectOption<V>[] {
    return items.flatMap(item => (isGroup(item) ? item.options : [item]));
  }
  
  export interface SelectProps<V extends string = string> {
    value?:        V | V[] | null;
    onChange?:     (value: V | V[] | null) => void;
    options:       SelectItem<V>[];
    placeholder?:  string;
    label?:        string;
    hint?:         string;
    error?:        string;
    size?:         'md' | 'lg';
    searchable?:   boolean;
    clearable?:    boolean;
    multiple?:     boolean;
    disabled?:     boolean;
    required?:     boolean;
    className?:    string;
    /** Render a custom label for the trigger (e.g. with a colour dot) */
    renderTriggerLabel?: (option: SelectOption<V>) => ReactNode;
    /** Render a custom option row */
    renderOption?: (option: SelectOption<V>, selected: boolean) => ReactNode;
  }
  
  // ---------------------------------------------------------------------------
  // Component
  // ---------------------------------------------------------------------------
  export function Select<V extends string = string>({
    value,
    onChange,
    options,
    placeholder = 'Select…',
    label,
    hint,
    error,
    size     = 'md',
    searchable = false,
    clearable  = false,
    multiple   = false,
    disabled   = false,
    required   = false,
    className,
    renderTriggerLabel,
    renderOption,
  }: SelectProps<V>) {
    const [open,        setOpen]        = useState(false);
    const [query,       setQuery]       = useState('');
    const [focusedIdx,  setFocusedIdx]  = useState(0);
    const [dropdownStyle, setDropdownStyle] = useState<CSSProperties>({
      position: 'fixed',
      top: 0,
      left: 0,
      width: 200,
    });
  
    const containerRef = useRef<HTMLDivElement>(null);
    const triggerRef   = useRef<HTMLButtonElement>(null);
    const searchRef    = useRef<HTMLInputElement>(null);
    const listRef      = useRef<HTMLDivElement>(null);
  
    const generatedId = useId();
    const fieldId     = `select-${generatedId}`;
  
    // ── Derived values ─────────────────────────────────────────────────────
    const allOptions = flatOptions(options);
  
    const filtered = query
      ? allOptions.filter(o => o.label.toLowerCase().includes(query.toLowerCase()))
      : allOptions;
  
    const selectedValues: V[] = Array.isArray(value)
      ? value
      : value != null ? [value] : [];
  
    function isSelected(v: V) { return selectedValues.includes(v); }
  
    // Trigger label
    function getTriggerContent(): ReactNode {
      if (selectedValues.length === 0) {
        return <span className={s.triggerPlaceholder}>{placeholder}</span>;
      }
      if (multiple) {
        return (
          <span className={s.triggerValue}>
            {selectedValues.length} selected
          </span>
        );
      }
      const opt = allOptions.find(o => o.value === selectedValues[0]);
      if (!opt) return <span className={s.triggerPlaceholder}>{placeholder}</span>;
      return (
        <span className={s.triggerValue}>
          {renderTriggerLabel ? renderTriggerLabel(opt) : opt.label}
        </span>
      );
    }
  
    // ── Open / close ────────────────────────────────────────────────────────
    const close = useCallback(() => {
      setOpen(false);
      setQuery('');
      setFocusedIdx(0);
    }, []);
  
    useEffect(() => {
      if (!open) return;
      // Auto-focus search on open
      if (searchable) { setTimeout(() => searchRef.current?.focus(), 30); }
  
      function onOutside(e: MouseEvent) {
        if (!containerRef.current?.contains(e.target as Node)) close();
      }
      document.addEventListener('mousedown', onOutside);
      return () => document.removeEventListener('mousedown', onOutside);
    }, [open, searchable, close]);

    useEffect(() => {
      if (!open) return;

      function updateDropdownPosition() {
        const rect = containerRef.current?.getBoundingClientRect();
        setDropdownStyle({
          position: 'fixed',
          top: (rect?.bottom ?? 0) + 4,
          left: rect?.left ?? 0,
          width: rect?.width ?? 200,
        });
      }

      updateDropdownPosition();
      window.addEventListener('resize', updateDropdownPosition);
      window.addEventListener('scroll', updateDropdownPosition, true);
      return () => {
        window.removeEventListener('resize', updateDropdownPosition);
        window.removeEventListener('scroll', updateDropdownPosition, true);
      };
    }, [open]);

    useEffect(() => {
      if (!open) {
        triggerRef.current?.focus();
      }
    }, [open]);
  
    // ── Selection ───────────────────────────────────────────────────────────
    function selectOption(opt: SelectOption<V>) {
      if (opt.disabled) return;
      if (multiple) {
        const next = isSelected(opt.value)
          ? selectedValues.filter(v => v !== opt.value)
          : [...selectedValues, opt.value];
        onChange?.(next as V[]);
      } else {
        onChange?.(opt.value);
        close();
      }
    }
  
    function clear(e: React.MouseEvent) {
      e.stopPropagation();
      onChange?.(multiple ? ([] as V[]) : null);
    }
  
    // ── Keyboard navigation ─────────────────────────────────────────────────
    function handleTriggerKey(e: KeyboardEvent<HTMLButtonElement>) {
      if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
        e.preventDefault();
        setOpen(true);
      }
    }
  
    function handleListKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { close(); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); setFocusedIdx(i => Math.min(i + 1, filtered.length - 1)); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setFocusedIdx(i => Math.max(i - 1, 0)); }
      if (e.key === 'Enter') {
        e.preventDefault();
        const opt = filtered[focusedIdx];
        if (opt) selectOption(opt);
      }
    }
  
    // Scroll focused option into view
    useEffect(() => {
      const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${focusedIdx}"]`);
      el?.scrollIntoView({ block: 'nearest' });
    }, [focusedIdx]);
  
    // ── Render items ────────────────────────────────────────────────────────
    let flatIdx = 0;
  
    function renderItems() {
      const sourceItems = query ? [{ options: filtered } as SelectGroup<V>] : options;
  
      return sourceItems.map((item, gi) => {
        if (isGroup(item)) {
          const groupOpts = query ? filtered : item.options;
          return (
            <div key={gi} className={s.group}>
              {!query && <div className={s.groupLabel}>{item.label}</div>}
              {groupOpts.map(opt => {
                const idx      = flatIdx++;
                const selected = isSelected(opt.value);
                const focused  = focusedIdx === idx;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    data-idx={idx}
                    className={clsx(s.option, selected && s.selected, focused && s.focused, opt.disabled && s.disabled)}
                    onClick={() => selectOption(opt)}
                    aria-selected={selected}
                    disabled={opt.disabled}
                  >
                    {renderOption ? renderOption(opt, selected) : opt.label}
                    <span className={s.optionCheck} aria-hidden="true">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </button>
                );
              })}
            </div>
          );
        }
  
        // Flat option (not in a group)
        const idx      = flatIdx++;
        const selected = isSelected(item.value);
        const focused  = focusedIdx === idx;
        return (
          <button
            key={item.value}
            type="button"
            data-idx={idx}
            className={clsx(s.option, selected && s.selected, focused && s.focused, item.disabled && s.disabled)}
            onClick={() => selectOption(item)}
            aria-selected={selected}
            disabled={item.disabled}
          >
            {renderOption ? renderOption(item, selected) : item.label}
            <span className={s.optionCheck} aria-hidden="true">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </button>
        );
      });
    }
  
    const hasValue = selectedValues.length > 0;
  
    return (
      <div className={clsx(s.field, size === 'lg' && s.lg, className)}>
        {label && (
          <label htmlFor={fieldId} className={clsx(s.label, required && s.required)}>
            {label}
          </label>
        )}
  
        <div ref={containerRef} className={s.container}>
          {/* Trigger */}
          <button
            ref={triggerRef}
            id={fieldId}
            type="button"
            className={clsx(s.trigger, open && s.open, error && s.error)}
            onClick={() => !disabled && setOpen(o => !o)}
            onKeyDown={handleTriggerKey}
            disabled={disabled}
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-invalid={Boolean(error)}
            aria-required={required}
          >
            {getTriggerContent()}
  
            {/* Clear button */}
            {clearable && hasValue && !disabled && (
              <span
                role="button"
                tabIndex={0}
                onClick={clear}
                onKeyDown={e => e.key === 'Enter' && clear(e as unknown as React.MouseEvent)}
                aria-label="Clear selection"
                style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M2 2L10 10M10 2L2 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </span>
            )}
  
            {/* Chevron */}
            <span className={s.triggerChevron} aria-hidden="true">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </span>
          </button>
  
          {/* Dropdown */}
          {open && createPortal(
            <div
              className={s.dropdown}
              role="listbox"
              aria-multiselectable={multiple}
              onKeyDown={handleListKey}
              style={dropdownStyle}
            >
              {searchable && (
                <div className={s.search}>
                  <input
                    ref={searchRef}
                    type="text"
                    value={query}
                    onChange={e => { setQuery(e.target.value); setFocusedIdx(0); }}
                    placeholder="Search…"
                    aria-label="Search options"
                  />
                </div>
              )}
              <div ref={listRef} className={s.list}>
                {filtered.length === 0
                  ? <div className={s.empty}>No options found</div>
                  : renderItems()
                }
              </div>
            </div>,
            document.body,
          )}
        </div>
  
        {/* Error */}
        {error && (
          <span className={s.errorMsg} role="alert">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <circle cx="6" cy="6" r="5.5" stroke="currentColor" />
              <path d="M6 3.5V6.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              <circle cx="6" cy="8.5" r="0.6" fill="currentColor" />
            </svg>
            {error}
          </span>
        )}
        {hint && !error && <span className={s.hint}>{hint}</span>}
      </div>
    );
  }