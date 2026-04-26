import { clsx } from 'clsx';
import type { OrderStatus } from '@/types/order.types';
import type { ReviewStatus } from '@/types/review.types';
import type { UserStatus } from '@/types/user.types';
import type { ProductStatus } from '@/types/product.types';

// ---------------------------------------------------------------------------
// Generic Badge
// ---------------------------------------------------------------------------
export type BadgeVariant =
  | 'default'
  | 'brand'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'muted';

export type BadgeSize = 'sm' | 'md';

export interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;        // show a status dot before the label
  children: React.ReactNode;
  className?: string;
}

// Base + variant styles written as plain Tailwind classes.
// Since Badge is tiny with no complex hover states, Tailwind is more
// maintainable here than a full SCSS module.
const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-surface-3 text-ink border border-surface-5',
  brand:   'bg-[rgba(249,115,22,0.12)] text-brand-500 border border-[rgba(249,115,22,0.25)]',
  success: 'bg-[rgba(34,197,94,0.12)]  text-success   border border-[rgba(34,197,94,0.25)]',
  warning: 'bg-[rgba(245,158,11,0.12)] text-warning   border border-[rgba(245,158,11,0.25)]',
  danger:  'bg-[rgba(239,68,68,0.12)]  text-danger    border border-[rgba(239,68,68,0.25)]',
  info:    'bg-[rgba(59,130,246,0.12)] text-info      border border-[rgba(59,130,246,0.25)]',
  muted:   'bg-[rgba(154,154,154,0.1)] text-ink-muted border border-[rgba(154,154,154,0.2)]',
};

const dotClasses: Record<BadgeVariant, string> = {
  default: 'bg-ink-muted',
  brand:   'bg-brand-500',
  success: 'bg-success',
  warning: 'bg-warning',
  danger:  'bg-danger',
  info:    'bg-info',
  muted:   'bg-ink-muted',
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'text-[11px] px-1.5 py-0.5 gap-1',
  md: 'text-xs    px-2   py-0.5 gap-1.5',
};

export function Badge({
  variant = 'default',
  size    = 'md',
  dot     = false,
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded font-medium leading-none',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
    >
      {dot && (
        <span
          className={clsx('inline-block rounded-full shrink-0', dotClasses[variant])}
          style={{ width: 6, height: 6 }}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}

// ---------------------------------------------------------------------------
// OrderStatusBadge — maps OrderStatus → Badge variant automatically
// ---------------------------------------------------------------------------
const orderStatusMap: Record<OrderStatus, { variant: BadgeVariant; label: string }> = {
  pending:    { variant: 'warning', label: 'Pending' },
  processing: { variant: 'info',    label: 'Processing' },
  shipped:    { variant: 'brand',   label: 'Shipped' },
  delivered:  { variant: 'success', label: 'Delivered' },
  cancelled:  { variant: 'danger',  label: 'Cancelled' },
  refunded:   { variant: 'muted',   label: 'Refunded' },
};

export function OrderStatusBadge({
  status,
  size = 'md',
}: {
  status: OrderStatus;
  size?: BadgeSize;
}) {
  const { variant, label } = orderStatusMap[status];
  return <Badge variant={variant} size={size} dot>{label}</Badge>;
}

// ---------------------------------------------------------------------------
// ReviewStatusBadge
// ---------------------------------------------------------------------------
const reviewStatusMap: Record<ReviewStatus, { variant: BadgeVariant; label: string }> = {
  pending:  { variant: 'warning', label: 'Pending' },
  approved: { variant: 'success', label: 'Approved' },
  rejected: { variant: 'danger',  label: 'Rejected' },
};

export function ReviewStatusBadge({
  status,
  size = 'md',
}: {
  status: ReviewStatus;
  size?: BadgeSize;
}) {
  const { variant, label } = reviewStatusMap[status];
  return <Badge variant={variant} size={size} dot>{label}</Badge>;
}

// ---------------------------------------------------------------------------
// UserStatusBadge
// ---------------------------------------------------------------------------
const userStatusMap: Record<UserStatus, { variant: BadgeVariant; label: string }> = {
  active:    { variant: 'success', label: 'Active' },
  suspended: { variant: 'danger',  label: 'Suspended' },
  deleted:   { variant: 'muted',   label: 'Deleted' },
};

export function UserStatusBadge({
  status,
  size = 'md',
}: {
  status: UserStatus;
  size?: BadgeSize;
}) {
  const { variant, label } = userStatusMap[status];
  return <Badge variant={variant} size={size} dot>{label}</Badge>;
}

// ---------------------------------------------------------------------------
// ProductStatusBadge
// ---------------------------------------------------------------------------
const productStatusMap: Record<ProductStatus, { variant: BadgeVariant; label: string }> = {
  active:   { variant: 'success', label: 'Active' },
  draft:    { variant: 'warning', label: 'Draft' },
  archived: { variant: 'muted',   label: 'Archived' },
};

export function ProductStatusBadge({
  status,
  size = 'md',
}: {
  status: ProductStatus;
  size?: BadgeSize;
}) {
  const { variant, label } = productStatusMap[status];
  return <Badge variant={variant} size={size} dot>{label}</Badge>;
}