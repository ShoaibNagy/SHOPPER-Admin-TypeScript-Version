import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Table } from '@components/ui/Table';
import { UserStatusBadge } from '@components/ui/Badge';
import { Input } from '@components/ui/Input';
import { Select } from '@components/ui/Select';
import { formatCurrency } from '@utils/formatCurrency';
import { formatRelativeTime, formatDate } from '@utils/formatDate';
import { useAdminUsers } from '@hooks/useAdminUsers';
import type { UserListParams, UserStatus } from '@/types/user.types';

const STATUS_OPTIONS = [
  { value: '' as const, label: 'All statuses' },
  { value: 'active' as const, label: 'Active' },
  { value: 'suspended' as const, label: 'Suspended' },
  { value: 'deleted' as const, label: 'Deleted' },
];

const SORT_OPTIONS = [
  { value: 'createdAt:desc', label: 'Newest first' },
  { value: 'createdAt:asc', label: 'Oldest first' },
  { value: 'totalSpent:desc', label: 'Highest spenders' },
  { value: 'orderCount:desc', label: 'Most orders' },
  { value: 'name:asc', label: 'Name A → Z' },
];

const COLUMN_COUNT = 7;

export function UserTable() {
  const [params, setParams] = useState<UserListParams>({
    page: 1, limit: 20, sortBy: 'createdAt', sortOrder: 'desc',
  });
  const [search, setSearch] = useState('');

  const { data, isLoading } = useAdminUsers({ ...params, search: search });

  function handleSort(col: string) {
    setParams(p => ({
      ...p, sortBy: col,
      sortOrder: p.sortBy === col && p.sortOrder === 'asc' ? 'desc' : 'asc',
      page: 1,
    }));
  }

  const currentSort = `${params.sortBy ?? 'createdAt'}:${params.sortOrder ?? 'desc'}`;

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
            placeholder="Search by name or email…"
            value={search}
            onChange={e => { setSearch(e.target.value); setParams(p => ({ ...p, page: 1 })); }}
            style={{ width: 240 }}
            leftAdornment={<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="5.5" cy="5.5" r="4.5" stroke="currentColor" strokeWidth="1.4" /><path d="M9 9L12 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>}
          />
        }
        right={
          <>
            <div style={{ width: 150 } as React.CSSProperties}>
              <Select
                value={params.status ?? ''}
                onChange={v => setParams(p => ({ ...p, status: (v as UserStatus) || undefined, page: 1 }))}
                options={STATUS_OPTIONS}
              />
            </div>

            <div style={{ width: 170 } as React.CSSProperties}>
              <Select
                value={currentSort}
                onChange={v => {
                  if (!v) return;
                  const [sortBy, sortOrder] = (v as string).split(':');
                  setParams(p => ({ ...p, sortBy, sortOrder: sortOrder as 'asc' | 'desc', page: 1 }));
                }}
                options={SORT_OPTIONS}
                
              />
            </div>

          </>
        }
      />

      <Table.Head>
        <Table.HeadRow>
          <Table.Th sortKey="name">User</Table.Th>
          <Table.Th sortKey="status">Status</Table.Th>
          <Table.Th sortKey="orderCount">Orders</Table.Th>
          <Table.Th sortKey="totalSpent">Total Spent</Table.Th>
          <Table.Th>Last Order</Table.Th>
          <Table.Th sortKey="createdAt">Joined</Table.Th>
          <Table.Th style={{ width: 40 }} />
        </Table.HeadRow>
      </Table.Head>

      <Table.Body>
        {data?.items.map(user => {
          const initials = user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
          return (
            <Table.Row key={user._id}>
              <Table.Td>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {/* Avatar */}
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden', fontSize: 11, fontWeight: 600, color: '#f97316' }}>
                    {user.avatar ? <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
                  </div>
                  <div>
                    <Link to={`/users/${user._id}`} style={{ color: '#f0f0f0', fontSize: 13, fontWeight: 500, textDecoration: 'none' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#f97316')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#f0f0f0')}
                    >
                      {user.name}
                    </Link>
                    <div style={{ fontSize: 11, color: '#9a9a9a' }}>{user.email}</div>
                  </div>
                </div>
              </Table.Td>

              <Table.Td><UserStatusBadge status={user.status} /></Table.Td>

              <Table.Td>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{user.orderCount}</span>
              </Table.Td>

              <Table.Td>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{formatCurrency(user.totalSpent)}</span>
              </Table.Td>

              <Table.Td muted>
                {user.lastOrderAt ? formatRelativeTime(user.lastOrderAt) : '—'}
              </Table.Td>

              <Table.Td muted title={formatDate(user.createdAt)}>
                {formatDate(user.createdAt)}
              </Table.Td>

              <Table.Td>
                <Link to={`/users/${user._id}`} style={{ color: '#9a9a9a', fontSize: 11, textDecoration: 'none' }}>
                  View →
                </Link>
              </Table.Td>
            </Table.Row>
          );
        })}
      </Table.Body>

      {!isLoading && data?.items.length === 0 && (
        <Table.Empty title="No users found" description={search ? `No users match "${search}"` : 'Users will appear here once they register.'} />
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