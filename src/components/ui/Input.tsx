import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { clsx } from 'clsx';
import s from './Input.module.scss';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type InputSize = 'md' | 'lg';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?:       string;
  hint?:        string;
  error?:       string;
  size?:        InputSize;
  leftAdornment?:  ReactNode;
  rightAdornment?: ReactNode;
  /** Make rightAdornment interactive (pointer-events: auto) */
  rightAdornmentInteractive?: boolean;
  /** Show character count: requires maxLength on the element */
  showCharCount?: boolean;
  required?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      hint,
      error,
      size = 'md',
      leftAdornment,
      rightAdornment,
      rightAdornmentInteractive = false,
      showCharCount = false,
      required,
      className,
      id: externalId,
      value,
      maxLength,
      ...rest
    },
    ref,
  ) => {
    // Stable ID for label↔input association even without an explicit id
    const generatedId = useId();
    const id = externalId ?? generatedId;

    const hasLeft  = Boolean(leftAdornment);
    const hasRight = Boolean(rightAdornment);

    const charCount   = typeof value === 'string' ? value.length : undefined;
    const nearLimit   = maxLength && charCount !== undefined && charCount >= maxLength * 0.85;
    const overLimit   = maxLength && charCount !== undefined && charCount >= maxLength;

    return (
      <div className={clsx(s.field, size === 'lg' && s.lg, error && s.error, className)}>
        {/* Label */}
        {label && (
          <label
            htmlFor={id}
            className={clsx(s.label, required && s.required)}
          >
            {label}
          </label>
        )}

        {/* Input wrapper */}
        <div className={clsx(s.wrapper, hasLeft && s.hasLeft, hasRight && s.hasRight)}>
          {hasLeft && (
            <span className={clsx(s.adornment, s.adornmentLeft)} aria-hidden="true">
              {leftAdornment}
            </span>
          )}

          <input
            ref={ref}
            id={id}
            className={s.input}
            aria-invalid={Boolean(error)}
            aria-describedby={
              [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(' ') || undefined
            }
            required={required}
            value={value}
            maxLength={maxLength}
            {...rest}
          />

          {hasRight && (
            <span
              className={clsx(
                s.adornment,
                s.adornmentRight,
                rightAdornmentInteractive && s.interactive,
              )}
              aria-hidden={!rightAdornmentInteractive}
            >
              {rightAdornment}
            </span>
          )}
        </div>

        {/* Character count */}
        {showCharCount && maxLength && charCount !== undefined && (
          <span
            className={clsx(s.charCount, nearLimit && s.near, overLimit && s.over)}
            aria-live="polite"
          >
            {charCount} / {maxLength}
          </span>
        )}

        {/* Error */}
        {error && (
          <span id={`${id}-error`} className={s.errorMsg} role="alert">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <circle cx="6" cy="6" r="5.5" stroke="currentColor" />
              <path d="M6 3.5V6.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              <circle cx="6" cy="8.5" r="0.6" fill="currentColor" />
            </svg>
            {error}
          </span>
        )}

        {/* Hint (only when no error) */}
        {hint && !error && (
          <span id={`${id}-hint`} className={s.hint}>
            {hint}
          </span>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';