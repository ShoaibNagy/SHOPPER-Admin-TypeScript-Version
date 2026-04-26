import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Table } from '@components/ui/Table';
import { OrderStatusBadge, Badge } from '@components/ui/Badge';
import { Input } from '@components/ui/Input';
import { Select } from '@components/ui/Select';
import { formatCurrency } from '@utils/formatCurrency';
import { formatDateTime, formatRelativeTime } from '@utils/formatDate';
import { useAdminOrders } from '@hooks/useAdminOrders';
import type { OrderListParams, OrderStatus, PaymentStatus } from '@/types/order.types';
import type { SelectOption } from '@components/ui/Select';

const STATUS_OPTIONS: SelectOption<OrderStatus | ''>[] = [
  { value: '',            label: 'All statuses'  },
  { value: 'pending',     label: 'Pending'       },
  { value: 'processing',  label: 'Processing'    },
  { value: 'shipped',     label: 'Shipped'       },
  { value: 'delivered',   label: 'Delivered'     },
  { value: 'cancelled',   label: 'Cancelled'     },
  { value: 'refunded',    label: 'Refunded'      },
];

const PAYMENT_OPTIONS: SelectOption<PaymentStatus | ''>[] = [
  { value: '',            label: 'All payments'  },
  { value: 'paid',        label: 'Paid'          },
  { value: 'unpaid',      label: 'Unpaid'        },
  { value: 'refunded',    label: 'Refunded'      },
  { value: 'failed',      label: 'Failed'        },
];

const paymentVariantMap: Record<PaymentStatus, 'success' | 'warning' | 'danger' | 'muted'> = {
  paid:               'success',
  unpaid:             'warning',
  partially_refunded: 'warning',
  refunded:           'muted',
  failed:             'danger',
};

const COLUMN_COUNT = 7;

export function OrderTable() {
  const [params, setParams] = useState<OrderListParams>({
    page: 1, limit: 20, sortBy: 'createdAt', sortOrder: 'desc',
  });
  const [search, setSearch] = useState('');

  const { data, isLoading } = useAdminOrders({ ...params, search: search!});

  function handleSort(col: string) {
    setParams(p => ({
      ...p, sortBy: col,
      sortOrder: p.sortBy === col && p.sortOrder === 'asc' ? 'desc' : 'asc',
      page: 1,
    }));
  }

  return (
    <Table
      columnCount={COLUMN_COUNT}
      isLoading={isLoading}
      sort={{ sortBy: params.sortBy ?? '', sortOrder: params.sortOrder ?? 'desc' }}
      onSort={handleSort}
    >
      <Table.Toolbar
        left={
          <Input
            placeholder="Search by order # or customer…"
            value={search}
            onChange={e => { setSearch(e.target.value); setParams(p => ({ ...p, page: 1 })); }}
            style={{ width: 260 }}
            leftAdornment={<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="5.5" cy="5.5" r="4.5" stroke="currentColor" strokeWidth="1.4" /><path d="M9 9L12 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>}
          />
        }
        right={
          <>
            <div style={{ width: 150 }}>
              <Select
                value={params.status ?? ''}
                onChange={v => setParams(p => ({ ...p, status: (v as OrderStatus) || undefined, page: 1 }))}
                options={STATUS_OPTIONS}
              />
            </div>
            <div style={{ width: 150 }}>
              <Select
                value={params.paymentStatus ?? ''}
                onChange={v => setParams(p => ({ ...p, paymentStatus: (v as PaymentStatus) || undefined, page: 1 }))}
                options={PAYMENT_OPTIONS}
              />
            </div>
          </>
        }
      />

      <Table.Head>
        <Table.HeadRow>
          <Table.Th sortKey="orderNumber">Order</Table.Th>
          <Table.Th>Customer</Table.Th>
          <Table.Th sortKey="status">Status</Table.Th>
          <Table.Th>Payment</Table.Th>
          <Table.Th>Items</Table.Th>
          <Table.Th sortKey="total">Total</Table.Th>
          <Table.Th sortKey="createdAt">Date</Table.Th>
        </Table.HeadRow>
      </Table.Head>

      <Table.Body>
        {data?.items.map(order => (
          <Table.Row key={order._id}>
            <Table.Td>
              <Link
                to={`/orders/${order._id}`}
                style={{ color: '#f97316', fontSize: 12, fontFamily: 'JetBrains Mono, monospace', fontWeight: 500, textDecoration: 'none' }}
              >
                {order.orderNumber}
              </Link>
            </Table.Td>

            <Table.Td>
              <div>
                <Link to={`/users/${order.user._id}`} style={{ color: '#f0f0f0', fontSize: 13, textDecoration: 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#f97316')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#f0f0f0')}
                >
                  {order.user.name}
                </Link>
                <div style={{ fontSize: 11, color: '#9a9a9a' }}>{order.user.email}</div>
              </div>
            </Table.Td>

            <Table.Td><OrderStatusBadge status={order.status} /></Table.Td>

            <Table.Td>
              <Badge variant={paymentVariantMap[order.paymentStatus]} size="sm" dot>
                {order.paymentStatus.replace('_', ' ')}
              </Badge>
            </Table.Td>

            <Table.Td muted>{order.itemCount} item{order.itemCount !== 1 ? 's' : ''}</Table.Td>

            <Table.Td>
              <span style={{ fontWeight: 600, fontSize: 13 }}>{formatCurrency(order.total)}</span>
            </Table.Td>

            <Table.Td muted title={formatDateTime(order.createdAt)}>
              {formatRelativeTime(order.createdAt)}
            </Table.Td>
          </Table.Row>
        ))}
      </Table.Body>

      {!isLoading && data?.items.length === 0 && (
        <Table.Empty title="No orders found" description={search ? `No orders match "${search}"` : 'Orders will appear here once customers place them.'} />
      )}

      {data && data.totalPages > 1 && (
        <Table.Pagination
          page={data.page} totalPages={data.totalPages}
          total={data.total} limit={data.limit}
          onPageChange={page => setParams(p => ({ ...p, page }))}
        />
      )}
    </Table>
  );
}