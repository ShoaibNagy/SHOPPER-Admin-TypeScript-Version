import { ProductTable } from '@components/product/ProductTable';

export function Products() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={headerStyle}>
        <div>
          <h1 style={titleStyle}>Products</h1>
          <p style={subtitleStyle}>Manage your product catalogue</p>
        </div>
      </div>
      <ProductTable />
    </div>
  );
}

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  flexWrap: 'wrap',
  gap: 12,
};
const titleStyle: React.CSSProperties = {
  fontFamily: 'Unbounded, sans-serif',
  fontSize: 22, fontWeight: 700,
  color: '#f0f0f0',
  letterSpacing: '-0.03em',
  margin: '0 0 4px',
};
const subtitleStyle: React.CSSProperties = {
  fontSize: 13, color: '#9a9a9a', margin: 0,
  fontFamily: 'DM Sans, sans-serif',
};