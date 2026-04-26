import { Select } from '@components/ui/Select';
import type { OrderStatus } from '@/types/order.types';

// ---------------------------------------------------------------------------
// Valid next-state transitions (prevents nonsensical moves, e.g. delivered → pending)
// ---------------------------------------------------------------------------
const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending:    ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped:    ['delivered', 'cancelled'],
  delivered:  ['refunded'],
  cancelled:  [],
  refunded:   [],
};

interface OrderStatusSelectProps {
  current:   OrderStatus;
  value:     OrderStatus | null;
  onChange:  (status: OrderStatus) => void;
  disabled?: boolean;
}

export function OrderStatusSelect({ current, value, onChange, disabled }: OrderStatusSelectProps) {
  const validNext = TRANSITIONS[current];
  const hintText = validNext.length === 0 ? 'No further status changes available.' : null;

  const options = [
    { value: current, label: `Current: ${capitalise(current)}`, disabled: true },
    ...validNext.map(s => ({ value: s, label: capitalise(s) })),
  ];

  return (
    <Select
      value={value ?? current}
      onChange={v => v && v !== current && onChange(v as OrderStatus)}
      options={options}
      disabled={disabled || validNext.length === 0}
      {...(hintText ? { hint: hintText } : {})}
    />
  );
}

function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}