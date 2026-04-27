import { useQuery } from '@tanstack/react-query';
import { StatCard } from '@components/layout/StatCard';
import { RevenueChart } from '@components/charts/RevenueChart';
import { OrderStatusChart } from '@components/charts/OrderStatusChart';
import { TopProductsChart } from '@components/charts/TopProductsChart';
import { queryKeys } from '@utils/queryKeys';
import { formatCurrency, formatCurrencyCompact } from '@utils/formatCurrency';
import { get } from '@api/client';
import type { OrderStatus } from '@/types/order.types';

// ---------------------------------------------------------------------------
// Dashboard stats shape (matches GET /api/admin/stats)
// ---------------------------------------------------------------------------
interface DashboardStats {
  revenue: {
    total:       number;
    thisMonth:   number;
    lastMonth:   number;
    trend:       number; // % change
  };
  orders: {
    total:       number;
    thisMonth:   number;
    pending:     number;
    trend:       number;
    byStatus:    { status: OrderStatus; count: number }[];
  };
  users: {
    total:       number;
    thisMonth:   number;
    trend:       number;
  };
  products: {
    total:       number;
    lowStock:    number;
    outOfStock:  number;
  };
  revenueChart: { date: string; revenue: number; orders: number }[];
  topProducts:  { productId: string; name: string; image?: string; revenue: number; unitsSold: number }[];
}

function useDashboardStats() {
  return useQuery({
    queryKey: queryKeys.dashboard.stats(),
    queryFn:  () => get<DashboardStats>('/admin/stats'),
    staleTime: 60_000,
  });
}

// ---------------------------------------------------------------------------
// Icon helpers
// ---------------------------------------------------------------------------
function RevenueIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2v12M5 5h4.5a2 2 0 010 4H5" />
      <path d="M5 9h5a2 2 0 010 4H5" />
    </svg>
  );
}

function OrdersIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="12" height="12" rx="1.5" />
      <path d="M5 8h6M5 5h6M5 11h4" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="5" r="3" />
      <path d="M2 14c0-3 2.7-5 6-5s6 2 6 5" />
    </svg>
  );
}

function ProductsIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 2h3l1.5 5h5L13 4H5" />
      <circle cx="6.5" cy="13" r="1" />
      <circle cx="11.5" cy="13" r="1" />
    </svg>
  );
}

function trendStr(pct: number): string {
  return `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}% vs last month`;
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------
export function Dashboard() {
  const { data: stats, isLoading } = useDashboardStats();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── Page heading ─────────────────────────────────────────── */}
      <div>
        <h1 style={pageTitle}>Dashboard</h1>
        <p style={pageSubtitle}>Here's what's happening in your store.</p>
      </div>

      {/* ── Stat cards ───────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        <StatCard
          title="Total Revenue"
          value={formatCurrencyCompact(stats!.revenue.total)}
          trend={trendStr(stats!.revenue.trend)}
          trendUp={stats!.revenue.trend >= 0}
          subtitle={`${formatCurrency(stats!.revenue.thisMonth)} this month`}
          icon={<RevenueIcon />}
          isLoading={isLoading}
        />
        <StatCard
          title="Total Orders"
          value={stats?.orders.total ?? '0'}
          trend={trendStr(stats!.orders.trend)}
          trendUp={stats!.orders.trend >= 0}
          subtitle={`${stats!.orders.pending} pending`}
          icon={<OrdersIcon />}
          isLoading={isLoading}
        />
        <StatCard
          title="Total Customers"
          value={stats!.users.total ?? '—'}
          trend={trendStr(stats!.users.trend)}
          trendUp={stats!.users.trend >= 0}
          subtitle={`${stats!.users.thisMonth} new this month`}
          icon={<UsersIcon />}
          isLoading={isLoading}
        />
        <StatCard
          title="Total Products"
          value={stats!.products.total ?? '—'}
          subtitle={`${stats!.products.lowStock} low stock · ${stats!.products.outOfStock} out`}
          icon={<ProductsIcon />}
          isLoading={isLoading}
        />
      </div>

      {/* ── Revenue chart ─────────────────────────────────────────── */}
      <div style={chartCard}>
        <div style={chartHeader}>
          <h2 style={chartTitle}>Revenue & Orders</h2>
          <p style={chartSubtitle}>Last 30 days</p>
        </div>
        <RevenueChart data={stats?.revenueChart ?? []} isLoading={isLoading} />
      </div>

      {/* ── Bottom row ────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 16 }}>

        {/* Order status breakdown */}
        <div style={chartCard}>
          <div style={chartHeader}>
            <h2 style={chartTitle}>Orders by Status</h2>
            <p style={chartSubtitle}>All time</p>
          </div>
          <OrderStatusChart
            data={stats?.orders.byStatus ?? []}
            isLoading={isLoading}
          />
        </div>

        {/* Top products */}
        <div style={chartCard}>
          <div style={chartHeader}>
            <h2 style={chartTitle}>Top Products</h2>
            <p style={chartSubtitle}>By revenue this month</p>
          </div>
          <TopProductsChart
            data={stats?.topProducts ?? []}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const pageTitle: React.CSSProperties = {
  fontFamily: 'Unbounded, sans-serif',
  fontSize: 22,
  fontWeight: 700,
  color: '#f0f0f0',
  letterSpacing: '-0.03em',
  margin: '0 0 4px',
};

const pageSubtitle: React.CSSProperties = {
  fontSize: 13,
  color: '#9a9a9a',
  margin: 0,
  fontFamily: 'DM Sans, sans-serif',
};

const chartCard: React.CSSProperties = {
  background: '#1c1c1c',
  border: '1px solid #383838',
  borderRadius: 8,
  padding: 20,
};

const chartHeader: React.CSSProperties = {
  marginBottom: 16,
};

const chartTitle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: '#f0f0f0',
  margin: '0 0 2px',
  fontFamily: 'DM Sans, sans-serif',
};

const chartSubtitle: React.CSSProperties = {
  fontSize: 11,
  color: '#9a9a9a',
  margin: 0,
  fontFamily: 'DM Sans, sans-serif',
};