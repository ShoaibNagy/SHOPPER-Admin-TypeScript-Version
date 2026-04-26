import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  type TooltipContentProps,
} from 'recharts';
import { formatCurrencyCompact, formatCurrency } from '@utils/formatCurrency';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface TopProductDataPoint {
  productId:  string;
  name:       string;
  image?:     string;
  revenue:    number;
  unitsSold:  number;
}

interface TopProductsChartProps {
  data:       TopProductDataPoint[];
  isLoading?: boolean;
}

type Metric = 'revenue' | 'units';

// ---------------------------------------------------------------------------
// Custom Tooltip
// ---------------------------------------------------------------------------
function CustomTooltip({ active, payload }: TooltipContentProps) {
  if (!active || !payload?.length) return null;
  const { name, value, dataKey } = payload[0];
  const isRevenue = dataKey === 'revenue';
  const numericValue = typeof value === 'number' ? value : Number(value ?? 0);
  return (
    <div style={{
      background: '#242424', border: '1px solid #383838', borderRadius: 8,
      padding: '8px 12px', fontFamily: 'DM Sans, sans-serif',
      boxShadow: '0 8px 32px rgba(0,0,0,0.7)', maxWidth: 200,
    }}>
      <p style={{ color: '#9a9a9a', fontSize: 11, marginBottom: 4 }}>{name}</p>
      <p style={{ color: '#f0f0f0', fontSize: 14, fontWeight: 600 }}>
        {isRevenue ? formatCurrency(numericValue) : `${numericValue} units`}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// TopProductsChart
// ---------------------------------------------------------------------------
export function TopProductsChart({ data, isLoading = false }: TopProductsChartProps) {
  const [metric, setMetric] = useState<Metric>('revenue');

  const sorted = [...data]
    .sort((a, b) => (metric === 'revenue' ? b.revenue - a.revenue : b.unitsSold - a.unitsSold))
    .slice(0, 8);

  if (isLoading) {
    return (
      <div style={{ height: 280 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} style={{
            height: 28, marginBottom: 12,
            background: 'linear-gradient(90deg, #242424 25%, #2e2e2e 50%, #242424 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.8s linear infinite',
            borderRadius: 4,
            width: `${[90, 75, 60, 50, 40][i]}%`,
          }} />
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Metric toggle */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, justifyContent: 'flex-end' }}>
        {(['revenue', 'units'] as Metric[]).map(m => (
          <button
            key={m}
            type="button"
            onClick={() => setMetric(m)}
            style={{
              padding: '3px 10px',
              borderRadius: 4,
              border: 'none',
              cursor: 'pointer',
              fontSize: 11,
              fontFamily: 'DM Sans, sans-serif',
              fontWeight: 500,
              transition: 'all 0.15s',
              background: metric === m ? 'rgba(249,115,22,0.12)' : '#242424',
              color: metric === m ? '#f97316' : '#9a9a9a',
            }}
          >
            {m === 'revenue' ? 'Revenue' : 'Units Sold'}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <BarChart
          data={sorted}
          layout="vertical"
          margin={{ top: 0, right: 8, left: 0, bottom: 0 }}
          barSize={14}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#2e2e2e" horizontal={false} />

          <XAxis
            type="number"
            tickFormatter={v => metric === 'revenue' ? formatCurrencyCompact(v) : String(v)}
            tick={{ fill: '#9a9a9a', fontSize: 10, fontFamily: 'DM Sans, sans-serif' }}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            type="category"
            dataKey="name"
            width={110}
            tick={{ fill: '#9a9a9a', fontSize: 11, fontFamily: 'DM Sans, sans-serif' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => v.length > 14 ? v.slice(0, 13) + '…' : v}
          />

          <Tooltip content={CustomTooltip} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />

          <Bar
            dataKey={metric === 'revenue' ? 'revenue' : 'unitsSold'}
            radius={[0, 4, 4, 0]}
          >
            {sorted.map((_, index) => (
              <Cell
                key={index}
                fill={index === 0 ? '#f97316' : `rgba(249,115,22,${Math.max(0.25, 0.9 - index * 0.1)})`}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}