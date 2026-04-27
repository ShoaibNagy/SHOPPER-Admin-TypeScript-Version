import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Table } from '@components/ui/Table';
import { ReviewStatusBadge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { Select } from '@components/ui/Select';
import { Modal } from '@components/ui/Modal';
import { formatRelativeTime } from '@utils/formatDate';
import {
  useAdminReviews,
  useApproveReview,
  useRejectReview,
  useDeleteReview,
} from '@hooks/useAdminReviews';
import type { ReviewListParams, ReviewStatus } from '@/types/review.types';

// ---------------------------------------------------------------------------
// Star rating display
// ---------------------------------------------------------------------------
function Stars({ rating }: { rating: number }) {
  return (
    <span style={{ display: 'inline-flex', gap: 1 }} aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
          <path
            d="M5.5 1l1.2 2.5 2.8.4-2 2 .5 2.8-2.5-1.3-2.5 1.3.5-2.8-2-2 2.8-.4z"
            fill={i < rating ? '#f59e0b' : '#383838'}
          />
        </svg>
      ))}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Per-row action hooks — pulled out so each row has its own mutation state
// ---------------------------------------------------------------------------
function ReviewRowActions({
  id,
  status,
  onDelete,
}: {
  id: string;
  status: ReviewStatus;
  onDelete: (id: string) => void;
}) {
  const approveMutation = useApproveReview(id);
  const rejectMutation = useRejectReview(id);

  return (
    <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
      {status !== 'approved' && (
        <Button
          variant="success" size="sm" iconOnly
          aria-label="Approve review"
          isLoading={approveMutation.isPending}
          onClick={() => approveMutation.mutate()}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Button>
      )}
      {status !== 'rejected' && (
        <Button
          variant="danger" size="sm" iconOnly
          aria-label="Reject review"
          isLoading={rejectMutation.isPending}
          onClick={() => rejectMutation.mutate('id')}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </Button>
      )}
      <Button
        variant="ghost" size="sm" iconOnly
        aria-label="Delete review"
        onClick={() => onDelete(id)}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M2 3h8M4.5 3V2h3v1M3.5 3v7h5V3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ReviewTable
// ---------------------------------------------------------------------------
const STATUS_OPTIONS = [
  { value: '' as const, label: 'All statuses' },
  { value: 'pending' as const, label: 'Pending' },
  { value: 'approved' as const, label: 'Approved' },
  { value: 'rejected' as const, label: 'Rejected' },
];

const RATING_OPTIONS = [
  { value: '', label: 'All ratings' },
  { value: '5', label: '★★★★★ (5)' },
  { value: '4', label: '★★★★☆ (4)' },
  { value: '3', label: '★★★☆☆ (3)' },
  { value: '2', label: '★★☆☆☆ (2)' },
  { value: '1', label: '★☆☆☆☆ (1)' },
];

const COLUMN_COUNT = 7;

export function ReviewTable() {
  const [params, setParams] = useState<ReviewListParams>({
    page: 1, limit: 20, sortBy: 'createdAt', sortOrder: 'desc',
  });
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const { data, isLoading } = useAdminReviews({ ...params, search: search});
  const deleteMutation = useDeleteReview();

  function handleSort(col: string) {
    setParams(p => ({
      ...p, sortBy: col,
      sortOrder: p.sortBy === col && p.sortOrder === 'asc' ? 'desc' : 'asc',
      page: 1,
    }));
  }

  return (
    <>
      <Table
        columnCount={COLUMN_COUNT}
        isLoading={isLoading}
        sort={{ sortBy: params.sortBy ?? '', sortOrder: params.sortOrder ?? 'desc' }}
        onSort={handleSort}
      >
        <Table.Toolbar
          left={
            <Input
              placeholder="Search reviews…"
              value={search}
              onChange={e => { setSearch(e.target.value); setParams(p => ({ ...p, page: 1 })); }}
              style={{ width: 220 }}
              leftAdornment={
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <circle cx="5.5" cy="5.5" r="4.5" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M9 9L12 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              }
            />
          }
          right={
            <>
              <div style={{ width: 140 } as React.CSSProperties}>
                <Select
                  value={params.status ?? ''}
                  onChange={v => setParams(p => ({
                    ...p,
                    status: (v as ReviewStatus) || undefined,
                    page: 1,
                  }))}
                  options={STATUS_OPTIONS}
                />
              </div>

              <div style={{ width: 130 } as React.CSSProperties}>
                <Select
                  value={params.minRating?.toString() ?? ''}
                  onChange={v => setParams(p => ({
                    ...p,
                    minRating: Number(v)!,
                    maxRating: Number(v)!,
                    page: 1,
                  }))}
                  options={RATING_OPTIONS}
                />
              </div>
            </>
          }
        />

        <Table.Head>
          <Table.HeadRow>
            <Table.Th sortKey="rating">Rating</Table.Th>
            <Table.Th>Review</Table.Th>
            <Table.Th>Product</Table.Th>
            <Table.Th>Customer</Table.Th>
            <Table.Th sortKey="status">Status</Table.Th>
            <Table.Th sortKey="createdAt">Date</Table.Th>
            <Table.Th style={{ width: 100 }} />
          </Table.HeadRow>
        </Table.Head>

        <Table.Body>
          {data?.items.map(review => (
            <Table.Row key={review._id}>
              {/* Rating */}
              <Table.Td>
                <Stars rating={review.rating} />
              </Table.Td>

              {/* Body preview */}
              <Table.Td>
                <div style={{ maxWidth: 260 }}>
                  {review.title && (
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#f0f0f0', marginBottom: 2 }}>
                      {review.title}
                    </div>
                  )}
                  <div style={{
                    fontSize: 12, color: '#9a9a9a', lineHeight: 1.4,
                    overflow: 'hidden', display: '-webkit-box',
                    WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                  }}>
                    {review.bodyPreview}
                  </div>
                  {review.isVerifiedPurchase && (
                    <span style={{ fontSize: 10, color: '#22c55e', marginTop: 3, display: 'block' }}>
                      ✓ Verified purchase
                    </span>
                  )}
                </div>
              </Table.Td>

              {/* Product */}
              <Table.Td>
                <Link
                  to={`/products/${review.productId}/edit`}
                  style={{ color: '#f0f0f0', fontSize: 12, textDecoration: 'none', maxWidth: 140, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#f97316')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#f0f0f0')}
                  title={review.productName}
                >
                  {review.productName}
                </Link>
              </Table.Td>

              {/* User */}
              <Table.Td>
                <Link
                  to={`/users/${review.userId}`}
                  style={{ color: '#9a9a9a', fontSize: 12, textDecoration: 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#f0f0f0')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#9a9a9a')}
                >
                  {review.userName}
                </Link>
              </Table.Td>

              {/* Status */}
              <Table.Td>
                <ReviewStatusBadge status={review.status} />
              </Table.Td>

              {/* Date */}
              <Table.Td muted title={review.createdAt}>
                {formatRelativeTime(review.createdAt)}
              </Table.Td>

              {/* Actions */}
              <Table.Td>
                <ReviewRowActions
                  id={review._id}
                  status={review.status}
                  onDelete={id => setDeleteTarget(id)}
                />
              </Table.Td>
            </Table.Row>
          ))}
        </Table.Body>

        {!isLoading && data?.items.length === 0 && (
          <Table.Empty
            title="No reviews found"
            description={
              search
                ? `No reviews match "${search}"`
                : params.status === 'pending'
                  ? 'All reviews have been moderated.'
                  : 'Reviews will appear here once customers submit them.'
            }
          />
        )}

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

      {/* Delete confirm */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        size="sm"
        danger
        aria-labelledby="delete-review-title"
      >
        <Modal.Header>
          <Modal.Title id="delete-review-title">Delete Review</Modal.Title>
          <Modal.Subtitle>This action cannot be undone.</Modal.Subtitle>
        </Modal.Header>
        <Modal.Body>
          <p style={{ color: '#9a9a9a', fontSize: 14, margin: 0 }}>
            Are you sure you want to permanently delete this review?
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
                  deleteMutation.mutate(deleteTarget, {
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