import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Table } from '@components/ui/Table';
import { Badge, ProductStatusBadge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { Select } from '@components/ui/Select';
import { Modal } from '@components/ui/Modal';
import { formatCurrency } from '@utils/formatCurrency';
import { useAdminProducts, useDeleteProduct } from '@hooks/useAdminProducts';
import type { ProductListParams, ProductStatus } from '@/types/product.types';
import type { SelectOption } from '@components/ui/Select';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const STATUS_OPTIONS: SelectOption<ProductStatus | ''>[] = [
  { value: '', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'draft', label: 'Draft' },
  { value: 'archived', label: 'Archived' },
];

const SORT_OPTIONS: SelectOption[] = [
  { value: 'createdAt:desc', label: 'Newest first' },
  { value: 'createdAt:asc', label: 'Oldest first' },
  { value: 'price:asc', label: 'Price: low → high' },
  { value: 'price:desc', label: 'Price: high → low' },
  { value: 'name:asc', label: 'Name A → Z' },
  { value: 'totalSold:desc', label: 'Best sellers' },
];

const COLUMN_COUNT = 7;

// ---------------------------------------------------------------------------
// ProductTable
// ---------------------------------------------------------------------------
export function ProductTable() {
  const [params, setParams] = useState<ProductListParams>({
    page: 1, limit: 20, sortBy: 'createdAt', sortOrder: 'desc',
  });
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const { data, isLoading } = useAdminProducts({ ...params, search: search });
  const deleteMutation = useDeleteProduct();

  function handleSort(col: string) {
    setParams(p => ({
      ...p,
      sortBy: col,
      sortOrder: p.sortBy === col && p.sortOrder === 'asc' ? 'desc' : 'asc',
      page: 1,
    }));
  }

  function handleStatusFilter(val: ProductStatus | '' | null) {
    setParams(p => ({ ...p, status: (val as ProductStatus) || undefined, page: 1 }));
  }

  function handleSortSelect(val: string | null) {
    if (!val) return;
    const [sortBy, sortOrder] = val.split(':');
    setParams(p => ({ ...p, sortBy, sortOrder: sortOrder as 'asc' | 'desc', page: 1 }));
  }

  const currentSort = `${params.sortBy ?? 'createdAt'}:${params.sortOrder ?? 'desc'}`;

  return (
    <>
      <Table
        columnCount={COLUMN_COUNT}
        isLoading={isLoading}
        sort={{ sortBy: params.sortBy ?? '', sortOrder: params.sortOrder ?? 'desc' }}
        onSort={handleSort}
      >
        {/* Toolbar */}
        <Table.Toolbar
          left={
            <>
              <Input
                placeholder="Search products…"
                value={search}
                onChange={e => { setSearch(e.target.value); setParams(p => ({ ...p, page: 1 })); }}
                style={{ width: 220 }}
                leftAdornment={
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                    <circle cx="5.5" cy="5.5" r="4.5" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M9 9L12 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                }
              />
              <div style={{ width: 150 } as React.CSSProperties}>
                <Select
                  value={params.status ?? ''}
                  onChange={v => handleStatusFilter(v as ProductStatus | '')}
                  options={STATUS_OPTIONS}
                />
              </div>

            </>
          }
          right={
            <>
              <div style={{ width: 170 } as React.CSSProperties}>
                <Select
                  value={currentSort}
                  onChange={v => handleSortSelect(v! as string)}
                  options={SORT_OPTIONS}
                />
              </div>

              <Button
                variant="primary"
                size="sm"
                href="/products/new"
                leftIcon={
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                }
              >
                Add Product
              </Button>
            </>
          }
        />

        {/* Head */}
        <Table.Head>
          <Table.HeadRow>
            <Table.Th style={{ width: 44 }} />
            <Table.Th sortKey="name">Product</Table.Th>
            <Table.Th sortKey="category">Category</Table.Th>
            <Table.Th sortKey="price">Price</Table.Th>
            <Table.Th sortKey="totalStock">Stock</Table.Th>
            <Table.Th sortKey="status">Status</Table.Th>
            <Table.Th style={{ width: 80 }} />
          </Table.HeadRow>
        </Table.Head>

        {/* Body */}
        <Table.Body>
          {data?.items.length === 0 ? null : data?.items.map(product => (
            <Table.Row key={product._id}>
              {/* Thumbnail */}
              <Table.Td style={{ padding: '0 8px 0 16px' }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 6,
                  background: '#242424', border: '1px solid #383838',
                  overflow: 'hidden', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {product.primaryImage
                    ? <img src={product.primaryImage} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><rect x="1" y="1" width="12" height="12" rx="2" stroke="#4a4a4a" strokeWidth="1.2" /><path d="M1 9l3-3 3 3 2-2 4 4" stroke="#4a4a4a" strokeWidth="1.2" strokeLinejoin="round" /></svg>
                  }
                </div>
              </Table.Td>

              {/* Name */}
              <Table.Td>
                <div>
                  <Link
                    to={`/products/${product._id}/edit`}
                    style={{ color: '#f0f0f0', fontWeight: 500, fontSize: 13, textDecoration: 'none' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#f97316')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#f0f0f0')}
                  >
                    {product.name}
                  </Link>
                  {product.isFeatured && (
                    <div style={{ marginLeft: 6 } as React.CSSProperties}>
                      <Badge variant="brand" size="sm">Featured</Badge>
                    </div>
                  )}
                </div>
              </Table.Td>

              {/* Category */}
              <Table.Td muted>{product.category}</Table.Td>

              {/* Price */}
              <Table.Td>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{formatCurrency(product.price)}</span>
                {product.compareAtPrice && (
                  <span style={{ fontSize: 11, color: '#4a4a4a', textDecoration: 'line-through', marginLeft: 6 }}>
                    {formatCurrency(product.compareAtPrice)}
                  </span>
                )}
              </Table.Td>

              {/* Stock */}
              <Table.Td>
                <span style={{ color: product.totalStock === 0 ? '#ef4444' : product.totalStock < 10 ? '#f59e0b' : '#f0f0f0', fontSize: 13, fontWeight: 500 }}>
                  {product.totalStock}
                </span>
              </Table.Td>

              {/* Status */}
              <Table.Td><ProductStatusBadge status={product.status} /></Table.Td>

              {/* Actions */}
              <Table.Td style={{ textAlign: 'right', paddingRight: 12 }}>
                <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                  <Button variant="ghost" size="sm" href={`/products/${product._id}/edit`} iconOnly aria-label="Edit product">
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                      <path d="M9 2l2 2-7 7H2v-2L9 2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                    </svg>
                  </Button>
                  <Button
                    variant="ghost" size="sm" iconOnly
                    aria-label="Delete product"
                    onClick={() => setDeleteTarget({ id: product._id, name: product.name })}
                  >
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                      <path d="M2 3h9M5 3V2h3v1M4 3v8h5V3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Button>
                </div>
              </Table.Td>
            </Table.Row>
          ))}
        </Table.Body>

        {/* Empty */}
        {!isLoading && data?.items.length === 0 && (
          <Table.Empty
            title="No products found"
            description={search ? `No products match "${search}"` : 'Add your first product to get started.'}
            action={<Button variant="primary" size="sm" href="/products/new">Add Product</Button>}
          />
        )}

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <Table.Pagination
            page={data.page}
            totalPages={data.totalPages}
            total={data.total}
            limit={data.limit}
            onPageChange={page => setParams(p => ({ ...p, page }))}
          />
        )}
      </Table>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        size="sm"
        danger
        aria-labelledby="delete-product-title"
      >
        <Modal.Header>
          <Modal.Title id="delete-product-title">Delete Product</Modal.Title>
          <Modal.Subtitle>This action cannot be undone.</Modal.Subtitle>
        </Modal.Header>
        <Modal.Body>
          <p style={{ color: '#9a9a9a', fontSize: 14, margin: 0 }}>
            Are you sure you want to delete{' '}
            <strong style={{ color: '#f0f0f0' }}>{deleteTarget?.name}</strong>?
            All associated images and variants will be permanently removed.
          </p>
        </Modal.Body>
        <Modal.Footer
          actions={
            <>
              <Button variant="secondary" size="sm" onClick={() => setDeleteTarget(null)}>
                Cancel
              </Button>
              <Button
                variant="dangerSolid"
                size="sm"
                isLoading={deleteMutation.isPending}
                onClick={() => {
                  if (!deleteTarget) return;
                  deleteMutation.mutate(deleteTarget.id, {
                    onSuccess: () => setDeleteTarget(null),
                  });
                }}
              >
                Delete
              </Button>
            </>
          }
        />
      </Modal>
    </>
  );
}