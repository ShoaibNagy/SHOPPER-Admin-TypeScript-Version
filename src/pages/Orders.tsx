// Orders list page
import { OrderTable } from '@components/order/OrderTable';

export function Orders() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={titleStyle}>Orders</h1>
        <p style={subtitleStyle}>Track and manage customer orders</p>
      </div>
      <OrderTable />
    </div>
  );
}

const titleStyle: React.CSSProperties = {
  fontFamily: 'Unbounded, sans-serif',
  fontSize: 22, fontWeight: 700,
  color: '#f0f0f0', letterSpacing: '-0.03em',
  margin: '0 0 4px',
};
const subtitleStyle: React.CSSProperties = {
  fontSize: 13, color: '#9a9a9a', margin: 0,
  fontFamily: 'DM Sans, sans-serif',
};