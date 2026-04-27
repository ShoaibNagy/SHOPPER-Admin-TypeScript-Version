import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrencyCompact, formatCurrency } from '@utils/formatCurrency';
import { formatDate } from '@utils/formatDate';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface RevenueDataPoint {
  date:    string; // ISO date string
  revenue: number;
  orders:  number;
}

interface RevenueChartProps {
  data:      RevenueDataPoint[];
  isLoading?: boolean;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string }>;
  label?: string | number;
}

// ---------------------------------------------------------------------------
// Custom Tooltip
// ---------------------------------------------------------------------------
function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const revenue = payload[0]?.value ?? 0;
  const orders  = payload[1]?.value ?? 0;
  return (
    <div style={{
      background: '#242424',
      border: '1px solid #383838',
      borderRadius: 8,
      padding: '10px 14px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
      fontFamily: 'DM Sans, sans-serif',
      minWidth: 160,
    }}>
      <p style={{ color: '#9a9a9a', fontSize: 11, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label != null ? formatDate(label) : '—'}
      </p>
      <p style={{ color: '#f0f0f0', fontSize: 15, fontWeight: 700, fontFamily: 'Unbounded, sans-serif', letterSpacing: '-0.02em', marginBottom: 4 }}>
        {formatCurrency(revenue)}
      </p>
      <p style={{ color: '#9a9a9a', fontSize: 12 }}>
        {orders} {orders === 1 ? 'order' : 'orders'}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// RevenueChart
// ---------------------------------------------------------------------------
export function RevenueChart({ data, isLoading = false }: RevenueChartProps) {
  if (isLoading) {
    return (
      <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          width: '100%', height: '100%',
          background: 'linear-gradient(90deg, #242424 25%, #2e2e2e 50%, #242424 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.8s linear infinite',
          borderRadius: 8,
        }} />
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
        <defs>
          {/* Brand-orange gradient fill */}
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#f97316" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#f97316" stopOpacity={0}    />
          </linearGradient>
          <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#3b82f6" stopOpacity={0.15} />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0}    />
          </linearGradient>
        </defs>

        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#2e2e2e"
          vertical={false}
        />

        <XAxis
          dataKey="date"
          tickFormatter={d => {
            const dt = new Date(d);
            return dt.toLocaleDateString('en-EG', { month: 'short', day: 'numeric' });
          }}
          tick={{ fill: '#9a9a9a', fontSize: 11, fontFamily: 'DM Sans, sans-serif' }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />

        <YAxis
          yAxisId="revenue"
          tickFormatter={v => formatCurrencyCompact(v)}
          tick={{ fill: '#9a9a9a', fontSize: 11, fontFamily: 'DM Sans, sans-serif' }}
          axisLine={false}
          tickLine={false}
          width={64}
        />

        <YAxis
          yAxisId="orders"
          orientation="right"
          tick={{ fill: '#9a9a9a', fontSize: 11, fontFamily: 'DM Sans, sans-serif' }}
          axisLine={false}
          tickLine={false}
          width={32}
        />

        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#383838', strokeWidth: 1 }} />

        <Area
          yAxisId="revenue"
          type="monotone"
          dataKey="revenue"
          stroke="#f97316"
          strokeWidth={2}
          fill="url(#revenueGradient)"
          dot={false}
          activeDot={{ r: 4, fill: '#f97316', stroke: '#1c1c1c', strokeWidth: 2 }}
        />

        <Area
          yAxisId="orders"
          type="monotone"
          dataKey="orders"
          stroke="#3b82f6"
          strokeWidth={1.5}
          strokeDasharray="4 3"
          fill="url(#ordersGradient)"
          dot={false}
          activeDot={{ r: 3, fill: '#3b82f6', stroke: '#1c1c1c', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}