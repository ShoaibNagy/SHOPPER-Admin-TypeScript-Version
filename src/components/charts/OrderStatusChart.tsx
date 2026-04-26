import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, type TooltipContentProps } from 'recharts';
import type { OrderStatus } from '@/types/order.types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface OrderStatusDataPoint {
  status: OrderStatus;
  count:  number;
}

interface OrderStatusChartProps {
  data:       OrderStatusDataPoint[];
  isLoading?: boolean;
}

// ---------------------------------------------------------------------------
// Colour map — matches Badge colours exactly
// ---------------------------------------------------------------------------
const STATUS_COLORS: Record<OrderStatus, string> = {
  pending:    '#f59e0b',
  processing: '#3b82f6',
  shipped:    '#f97316',
  delivered:  '#22c55e',
  cancelled:  '#ef4444',
  refunded:   '#9a9a9a',
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending:    'Pending',
  processing: 'Processing',
  shipped:    'Shipped',
  delivered:  'Delivered',
  cancelled:  'Cancelled',
  refunded:   'Refunded',
};

// ---------------------------------------------------------------------------
// Custom Tooltip
// ---------------------------------------------------------------------------
function CustomTooltip({ active, payload }: TooltipContentProps) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  const status = typeof name === 'string' ? (name as OrderStatus) : undefined;
  const color = status ? STATUS_COLORS[status] : '#9a9a9a';
  return (
    <div style={{
      background: '#242424', border: '1px solid #383838', borderRadius: 8,
      padding: '8px 12px', fontFamily: 'DM Sans, sans-serif',
      boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
    }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
        <span style={{ color: '#f0f0f0', fontSize: 13, fontWeight: 500 }}>
          {status ? STATUS_LABELS[status] : String(name ?? '')}
        </span>
        <span style={{ color: '#9a9a9a', fontSize: 13, marginLeft: 4 }}>
          {value}
        </span>
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// OrderStatusChart
// ---------------------------------------------------------------------------
export function OrderStatusChart({ data, isLoading = false }: OrderStatusChartProps) {
  const total = data.reduce((s, d) => s + d.count, 0);

  if (isLoading) {
    return (
      <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          width: 160, height: 160, borderRadius: '50%',
          background: 'linear-gradient(90deg, #242424 25%, #2e2e2e 50%, #242424 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.8s linear infinite',
        }} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
      {/* Donut */}
      <div style={{ width: 160, height: 160, position: 'relative', flexShrink: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="status"
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={72}
              strokeWidth={2}
              stroke="#1c1c1c"
              paddingAngle={2}
            >
              {data.map(entry => (
                <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? '#9a9a9a'} />
              ))}
            </Pie>
            <Tooltip content={CustomTooltip} />
          </PieChart>
        </ResponsiveContainer>

        {/* Centre total */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <span style={{ fontFamily: 'Unbounded, sans-serif', fontSize: 22, fontWeight: 700, color: '#f0f0f0', letterSpacing: '-0.03em', lineHeight: 1 }}>
            {total}
          </span>
          <span style={{ fontSize: 10, color: '#9a9a9a', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Total
          </span>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, minWidth: 120 }}>
        {data.map(entry => {
          const pct = total > 0 ? Math.round((entry.count / total) * 100) : 0;
          return (
            <div key={entry.status} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                background: STATUS_COLORS[entry.status] ?? '#9a9a9a',
              }} />
              <span style={{ flex: 1, fontSize: 12, color: '#9a9a9a', fontFamily: 'DM Sans, sans-serif' }}>
                {STATUS_LABELS[entry.status]}
              </span>
              <span style={{ fontSize: 12, color: '#f0f0f0', fontWeight: 600, fontFamily: 'DM Sans, sans-serif' }}>
                {entry.count}
              </span>
              <span style={{ fontSize: 11, color: '#4a4a4a', minWidth: 30, textAlign: 'right' }}>
                {pct}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}