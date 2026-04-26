import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { UserStatusBadge, Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { Select } from '@components/ui/Select';
import { Modal } from '@components/ui/Modal';
import { Spinner } from '@components/ui/Spinner';
import { formatCurrency } from '@utils/formatCurrency';
import { formatDate } from '@utils/formatDate';
import {
  useAdminUser,
  useUpdateUser,
  useSuspendUser,
  useActivateUser,
  useDeleteUser,
} from '@hooks/useAdminUsers';
import type { UserRole } from '@/types/user.types';

const ROLE_OPTIONS = [
  { value: 'customer'    as UserRole, label: 'Customer'    },
  { value: 'admin'       as UserRole, label: 'Admin'       },
  { value: 'super_admin' as UserRole, label: 'Super Admin' },
];

export function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: user, isLoading } = useAdminUser(id);

  const updateMutation   = useUpdateUser(id!);
  const suspendMutation  = useSuspendUser(id!);
  const activateMutation = useActivateUser(id!);
  const deleteMutation   = useDeleteUser();

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [newRole,    setNewRole]    = useState<UserRole | null>(null);

  if (isLoading) return <Spinner variant="page" label="Loading user…" />;
  if (!user)     return <div style={{ color: '#9a9a9a', padding: 32 }}>User not found.</div>;

  const initials = user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(249,115,22,0.12)', border: '2px solid rgba(249,115,22,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: '#f97316', overflow: 'hidden', flexShrink: 0 }}>
            {user.avatar ? <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Link to="/users" style={{ color: '#9a9a9a', fontSize: 12, textDecoration: 'none' }}>← Users</Link>
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: '#f0f0f0', margin: 0, fontFamily: 'Unbounded, sans-serif', letterSpacing: '-0.03em' }}>{user.name}</h1>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 6 }}>
              <UserStatusBadge status={user.status} />
              <Badge variant="muted" size="sm">{user.role.replace('_', ' ')}</Badge>
              {user.emailVerified && <Badge variant="success" size="sm">Verified</Badge>}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {user.status === 'active'    && <Button variant="danger"    size="sm" isLoading={suspendMutation.isPending}  onClick={() => suspendMutation.mutate()}>Suspend</Button>}
          {user.status === 'suspended' && <Button variant="success"   size="sm" isLoading={activateMutation.isPending} onClick={() => activateMutation.mutate()}>Activate</Button>}
          <Button variant="ghost" size="sm" onClick={() => setDeleteOpen(true)}>Delete</Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20, alignItems: 'start' }}>

        {/* ── Left ──────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {[
              { label: 'Total Orders', value: user.orderCount.toString() },
              { label: 'Total Spent',  value: formatCurrency(user.totalSpent) },
              { label: 'Member Since', value: formatDate(user.createdAt) },
            ].map(stat => (
              <div key={stat.label} style={{ background: '#1c1c1c', border: '1px solid #383838', borderRadius: 8, padding: '14px 16px' }}>
                <div style={{ fontSize: 11, color: '#9a9a9a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{stat.label}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#f0f0f0', fontFamily: 'Unbounded, sans-serif', letterSpacing: '-0.02em' }}>{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Contact info */}
          <section style={cardStyle}>
            <h2 style={cardHeading}>Contact Information</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: 'Email',  value: user.email,        mono: true },
                { label: 'Phone',  value: user.phone ?? '—'              },
                { label: 'Role',   value: user.role.replace('_', ' ')    },
                { label: 'Last order', value: user.lastOrderAt ? formatDate(user.lastOrderAt) : '—' },
              ].map(row => (
                <div key={row.label}>
                  <div style={{ fontSize: 11, color: '#9a9a9a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>{row.label}</div>
                  <div style={{ fontSize: 13, color: '#f0f0f0', fontFamily: row.mono ? 'JetBrains Mono, monospace' : 'DM Sans, sans-serif' }}>{row.value}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Addresses */}
          {user.addresses.length > 0 && (
            <section style={cardStyle}>
              <h2 style={cardHeading}>Saved Addresses ({user.addresses.length})</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {user.addresses.map(addr => (
                  <div key={addr._id} style={{ padding: 12, background: '#242424', borderRadius: 6, border: '1px solid #2e2e2e' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#f0f0f0' }}>{addr.label ?? 'Address'}</span>
                      {addr.isDefault && <Badge variant="brand" size="sm">Default</Badge>}
                    </div>
                    <div style={{ fontSize: 12, color: '#9a9a9a', lineHeight: 1.6 }}>
                      {addr.firstName} {addr.lastName} · {addr.street}, {addr.city}{addr.state ? `, ${addr.state}` : ''} {addr.postalCode}, {addr.country} · {addr.phone}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* ── Right ─────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Role editor */}
          <section style={cardStyle}>
            <h2 style={cardHeading}>Access Role</h2>
            <Select
              value={newRole ?? user.role}
              onChange={v => setNewRole(v as UserRole)}
              options={ROLE_OPTIONS}
            />
            <Button
              variant="secondary" size="sm" type="button"
              disabled={!newRole || newRole === user.role}
              isLoading={updateMutation.isPending}
              style={{ marginTop: 10, width: '100%' } as React.CSSProperties}
              onClick={() => newRole && updateMutation.mutate({ role: newRole }, { onSuccess: () => setNewRole(null) })}
            >
              Save Role
            </Button>
          </section>

          {/* User ID */}
          <section style={cardStyle}>
            <h2 style={cardHeading}>User ID</h2>
            <code style={{ fontSize: 11, color: '#9a9a9a', fontFamily: 'JetBrains Mono, monospace', wordBreak: 'break-all' }}>
              {user._id}
            </code>
          </section>
        </div>
      </div>

      {/* ── Delete modal ───────────────────────────────────────────── */}
      <Modal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} size="sm" danger aria-labelledby="delete-user-title">
        <Modal.Header>
          <Modal.Title id="delete-user-title">Delete User</Modal.Title>
          <Modal.Subtitle>This is a soft-delete — the user's data is preserved.</Modal.Subtitle>
        </Modal.Header>
        <Modal.Body>
          <p style={{ color: '#9a9a9a', fontSize: 14, margin: 0 }}>
            Delete <strong style={{ color: '#f0f0f0' }}>{user.name}</strong>? They will be unable to log in and their account will be marked as deleted.
          </p>
        </Modal.Body>
        <Modal.Footer
          actions={
            <>
              <Button variant="secondary" size="sm" onClick={() => setDeleteOpen(false)}>Cancel</Button>
              <Button
                variant="dangerSolid" size="sm"
                isLoading={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(user._id, { onSuccess: () => setDeleteOpen(false) })}
              >
                Delete User
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