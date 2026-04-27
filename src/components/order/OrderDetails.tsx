import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { OrderStatusBadge, Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { Select } from '@components/ui/Select';
import { Spinner } from '@components/ui/Spinner';
import { Modal } from '@components/ui/Modal';
import { formatCurrency } from '@utils/formatCurrency';
import { formatDateTime } from '@utils/formatDate';
import {
  useAdminOrder,
  useUpdateOrderStatus,
  useUpdateOrderTracking,
  useUpdateOrderAdminNotes,
  useRefundOrder,
} from '@hooks/useAdminOrders';
import type { OrderStatus } from '@/types/order.types';

const ALL_STATUSES: { value: OrderStatus; label: string }[] = [
  { value: 'pending',    label: 'Pending'    },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped',    label: 'Shipped'    },
  { value: 'delivered',  label: 'Delivered'  },
  { value: 'cancelled',  label: 'Cancelled'  },
  { value: 'refunded',   label: 'Refunded'   },
];

// ---------------------------------------------------------------------------
// OrderDetail
// ---------------------------------------------------------------------------
export function OrderDetails() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading } = useAdminOrder(id);

  const statusMutation   = useUpdateOrderStatus(id!);
  const trackingMutation = useUpdateOrderTracking(id!);
  const notesMutation    = useUpdateOrderAdminNotes(id!);
  const refundMutation   = useRefundOrder(id!);

  const [refundOpen, setRefundOpen] = useState(false);
  const [newStatus, setNewStatus]   = useState<OrderStatus | null>(null);
  const [statusNote, setStatusNote] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  const trackingForm = useForm({ defaultValues: { trackingNumber: '', shippingCarrier: '', estimatedDelivery: '' } });

  if (isLoading) return <Spinner variant="page" label="Loading order…" />;
  if (!order)    return <div style={{ color: '#9a9a9a', padding: 32 }}>Order not found.</div>;

  // Sync admin notes textarea once data loads
  if (adminNotes === '' && order.adminNotes) setAdminNotes(order.adminNotes);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <Link to="/orders" style={{ color: '#9a9a9a', fontSize: 12, textDecoration: 'none' }}>← Orders</Link>
          </div>
          <h1 style={pageTitle}>{order.orderNumber}</h1>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 6 }}>
            <OrderStatusBadge status={order.status} />
            <span style={{ color: '#4a4a4a', fontSize: 12 }}>{formatDateTime(order.createdAt)}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {order.status !== 'refunded' && order.status !== 'cancelled' && order.paymentStatus === 'paid' && (
            <Button variant="danger" size="sm" onClick={() => setRefundOpen(true)}>Refund</Button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>

        {/* ── Left column ─────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Line items */}
          <section style={cardStyle}>
            <h2 style={cardHeading}>Items ({order.items.length})</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {order.items.map(item => (
                <div key={item._id} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 6, background: '#242424', border: '1px solid #383838', overflow: 'hidden', flexShrink: 0 }}>
                    {item.product.primaryImage
                      ? <img src={item.product.primaryImage} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4a4a4a', fontSize: 18 }}>📦</div>
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Link to={`/products/${item.product._id}/edit`} style={{ color: '#f0f0f0', fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>
                      {item.product.name}
                    </Link>
                    {item.variant && (
                      <div style={{ fontSize: 11, color: '#9a9a9a', marginTop: 2 }}>
                        {[item.variant.size, item.variant.color].filter(Boolean).join(' · ')} · SKU: {item.variant.sku}
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#f0f0f0' }}>{formatCurrency(item.subtotal)}</div>
                    <div style={{ fontSize: 11, color: '#9a9a9a' }}>{item.quantity} × {formatCurrency(item.unitPrice)}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Addresses */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { title: 'Shipping Address', addr: order.shippingAddress },
              { title: 'Billing Address',  addr: order.billingAddress  },
            ].map(({ title, addr }) => (
              <section key={title} style={cardStyle}>
                <h2 style={cardHeading}>{title}</h2>
                <div style={{ fontSize: 13, color: '#9a9a9a', lineHeight: 1.7 }}>
                  <div style={{ color: '#f0f0f0', fontWeight: 500 }}>{addr.firstName} {addr.lastName}</div>
                  <div>{addr.street}</div>
                  <div>{addr.city}{addr.state ? `, ${addr.state}` : ''} {addr.postalCode}</div>
                  <div>{addr.country}</div>
                  <div style={{ marginTop: 4 }}>{addr.phone}</div>
                </div>
              </section>
            ))}
          </div>

          {/* Status timeline */}
          <section style={cardStyle}>
            <h2 style={cardHeading}>Status History</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[...order.statusHistory].reverse().map((entry, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, paddingBottom: 16, position: 'relative' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: i === 0 ? '#f97316' : '#383838', border: `2px solid ${i === 0 ? '#f97316' : '#242424'}`, marginTop: 2 }} />
                    {i < order.statusHistory.length - 1 && (
                      <div style={{ width: 1, flex: 1, background: '#2e2e2e', marginTop: 4 }} />
                    )}
                  </div>
                  <div style={{ paddingBottom: 4 }}>
                    <OrderStatusBadge status={entry.status} size="sm" />
                    <div style={{ fontSize: 11, color: '#9a9a9a', marginTop: 4 }}>{formatDateTime(entry.timestamp)}</div>
                    {entry.note && <div style={{ fontSize: 12, color: '#9a9a9a', marginTop: 2, fontStyle: 'italic' }}>"{entry.note}"</div>}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Admin notes */}
          <section style={cardStyle}>
            <h2 style={cardHeading}>Admin Notes</h2>
            <textarea
              value={adminNotes}
              onChange={e => setAdminNotes(e.target.value)}
              rows={3}
              placeholder="Internal notes (not visible to customer)…"
              style={{ width: '100%', background: '#242424', border: '1px solid #383838', borderRadius: 6, color: '#f0f0f0', fontFamily: 'DM Sans, sans-serif', fontSize: 13, padding: '8px 12px', resize: 'vertical', outline: 'none', lineHeight: 1.5, boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
              <Button
                variant="secondary" size="sm" type="button"
                isLoading={notesMutation.isPending}
                onClick={() => notesMutation.mutate({ adminNotes })}
              >
                Save Notes
              </Button>
            </div>
          </section>
        </div>

        {/* ── Right column ────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Order totals */}
          <section style={cardStyle}>
            <h2 style={cardHeading}>Order Summary</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Subtotal',     value: order.subtotal   },
                { label: 'Shipping',     value: order.shippingFee },
                { label: 'Discount',     value: -order.discount, color: order.discount > 0 ? '#22c55e' : undefined },
                { label: 'Tax',          value: order.tax        },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: '#9a9a9a' }}>{row.label}</span>
                  <span style={{ color: row.color ?? '#f0f0f0' }}>{formatCurrency(row.value)}</span>
                </div>
              ))}
              <div style={{ height: 1, background: '#383838', margin: '4px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 700 }}>
                <span style={{ color: '#f0f0f0' }}>Total</span>
                <span style={{ color: '#f0f0f0', fontFamily: 'Unbounded, sans-serif', letterSpacing: '-0.02em' }}>{formatCurrency(order.total)}</span>
              </div>
            </div>

            <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid #2e2e2e' }}>
              <div style={{ fontSize: 11, color: '#9a9a9a', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Payment</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#9a9a9a' }}>{order.paymentMethod === 'card' ? 'Card' : 'Cash on Delivery'}</span>
                <Badge variant={order.paymentStatus === 'paid' ? 'success' : 'warning'} size="sm" dot>
                  {order.paymentStatus.replace('_', ' ')}
                </Badge>
              </div>
            </div>
          </section>

          {/* Customer */}
          <section style={cardStyle}>
            <h2 style={cardHeading}>Customer</h2>
            <Link to={`/users/${order.user._id}`} style={{ color: '#f0f0f0', fontSize: 13, fontWeight: 500, textDecoration: 'none', display: 'block', marginBottom: 2 }}>
              {order.user.name}
            </Link>
            <div style={{ fontSize: 12, color: '#9a9a9a' }}>{order.user.email}</div>
            {order.user.phone && <div style={{ fontSize: 12, color: '#9a9a9a' }}>{order.user.phone}</div>}
          </section>

          {/* Update status */}
          <section style={cardStyle}>
            <h2 style={cardHeading}>Update Status</h2>
            <Select
              value={newStatus ?? order.status}
              onChange={v => setNewStatus(v as OrderStatus)}
              options={ALL_STATUSES}
            />
            <Input
              placeholder="Note (optional)…"
              value={statusNote}
              onChange={e => setStatusNote(e.target.value)}
              style={{ marginTop: 8 }}
            />
            <Button
              variant="primary" size="sm" type="button"
              isLoading={statusMutation.isPending}
              disabled={!newStatus || newStatus === order.status}
              style={{ marginTop: 10, width: '100%' } as React.CSSProperties}
              onClick={() => {
                if (!newStatus) return;
                statusMutation.mutate({ status: newStatus, note: statusNote}, {
                  onSuccess: () => { setNewStatus(null); setStatusNote(''); },
                });
              }}
            >
              Update Status
            </Button>
          </section>

          {/* Tracking */}
          <section style={cardStyle}>
            <h2 style={cardHeading}>Tracking</h2>
            <form onSubmit={trackingForm.handleSubmit(dto => trackingMutation.mutate(dto))}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Input placeholder="Tracking number" {...trackingForm.register('trackingNumber', { required: true })} />
                <Input placeholder="Carrier (e.g. DHL)" {...trackingForm.register('shippingCarrier')} />
                <Input type="date" {...trackingForm.register('estimatedDelivery')} />
                <Button variant="secondary" size="sm" type="submit" isLoading={trackingMutation.isPending}>
                  Save Tracking
                </Button>
              </div>
            </form>
            {order.trackingNumber && (
              <div style={{ marginTop: 12, fontSize: 12, color: '#9a9a9a' }}>
                Current: <span style={{ color: '#f0f0f0', fontFamily: 'JetBrains Mono, monospace' }}>{order.trackingNumber}</span>
                {order.shippingCarrier && ` via ${order.shippingCarrier}`}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* ── Refund modal ──────────────────────────────────────────── */}
      <Modal isOpen={refundOpen} onClose={() => setRefundOpen(false)} size="sm" danger aria-labelledby="refund-title">
        <Modal.Header>
          <Modal.Title id="refund-title">Refund Order</Modal.Title>
          <Modal.Subtitle>This will trigger a full Stripe refund.</Modal.Subtitle>
        </Modal.Header>
        <Modal.Body>
          <p style={{ color: '#9a9a9a', fontSize: 14, margin: 0 }}>
            Refund <strong style={{ color: '#f0f0f0' }}>{formatCurrency(order.total)}</strong> to the customer for order{' '}
            <strong style={{ color: '#f0f0f0' }}>{order.orderNumber}</strong>?
          </p>
        </Modal.Body>
        <Modal.Footer
          actions={
            <>
              <Button variant="secondary" size="sm" onClick={() => setRefundOpen(false)}>Cancel</Button>
              <Button
                variant="dangerSolid" size="sm"
                isLoading={refundMutation.isPending}
                onClick={() => refundMutation.mutate(undefined, { onSuccess: () => setRefundOpen(false) })}
              >
                Confirm Refund
              </Button>
            </>
          }
        />
      </Modal>
    </div>
  );
}

const cardStyle: React.CSSProperties = { background: '#1c1c1c', border: '1px solid #383838', borderRadius: 8, padding: 20 };
const cardHeading: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: '#f0f0f0', margin: '0 0 14px', fontFamily: 'DM Sans, sans-serif' };
const pageTitle: React.CSSProperties = { fontSize: 22, fontWeight: 700, color: '#f0f0f0', margin: 0, fontFamily: 'Unbounded, sans-serif', letterSpacing: '-0.03em' };