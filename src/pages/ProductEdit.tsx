import { useParams, useNavigate, Link } from 'react-router-dom';
import { ProductForm } from '@components/product/ProductForm';
import { ProductImageUpload } from '@components/product/ProductImageUpload';

export function ProductEdit() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew    = !id;

  function handleSuccess(productId: string) {
    navigate(`/products/${productId}/edit`);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div>
        <Link to="/products" style={{ color: '#9a9a9a', fontSize: 12, textDecoration: 'none' }}>
          ← Products
        </Link>
        <h1 style={titleStyle}>{isNew ? 'New Product' : 'Edit Product'}</h1>
      </div>

      {/* Two-column layout on wide screens */}
      <div style={{ display: 'grid', gridTemplateColumns: id ? '1fr 320px' : '1fr', gap: 20, alignItems: 'start' }}>
        {/* Form */}
        <ProductForm productId={id!} onSuccess={handleSuccess} />

        {/* Image upload — only shown when editing an existing product */}
        {id && (
          <div style={{ background: '#1c1c1c', border: '1px solid #383838', borderRadius: 8, padding: 20 }}>
            <h2 style={sectionTitle}>Product Images</h2>
            <ProductImageUpload productId={id} />
          </div>
        )}
      </div>
    </div>
  );
}

const titleStyle: React.CSSProperties = {
  fontFamily: 'Unbounded, sans-serif',
  fontSize: 22, fontWeight: 700,
  color: '#f0f0f0',
  letterSpacing: '-0.03em',
  margin: '8px 0 0',
};
const sectionTitle: React.CSSProperties = {
  fontSize: 13, fontWeight: 600,
  color: '#f0f0f0', margin: '0 0 14px',
  fontFamily: 'DM Sans, sans-serif',
};