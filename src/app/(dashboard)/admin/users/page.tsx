'use client';

import { useEffect, useState } from 'react';
import { Search, Trash2 } from 'lucide-react';

interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  createdAt: string;
  _count: {
    enrollments: number;
    courses: number;
    broadcasts: number;
  };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (roleFilter) params.set('role', roleFilter);

      const res = await fetch(`/api/admin/users?${params}`);
      if (res.ok) setUsers(await res.json());
      setLoading(false);
    }
    load();
  }, [search, roleFilter]);

  async function updateRole(userId: string, newRole: string) {
    const res = await fetch('/api/admin/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, role: newRole }),
    });
    if (res.ok) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    }
  }

  async function deleteUser(userId: string) {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    const res = await fetch(`/api/admin/users?userId=${userId}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">User Management</h1>
        <p className="page-subtitle">{users.length} users total</p>
      </div>

      <div className="search-container">
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '40px' }}
          />
        </div>
        <select
          className="input select"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          style={{ width: '160px' }}
        >
          <option value="">All roles</option>
          <option value="STUDENT">Student</option>
          <option value="FACULTY">Faculty</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>

      {loading ? (
        <div className="skeleton" style={{ height: '400px' }} />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Courses</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td style={{ fontWeight: '500' }}>{user.name || 'Unnamed'}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{user.email}</td>
                  <td>
                    <select
                      className="input select"
                      value={user.role}
                      onChange={(e) => updateRole(user.id, e.target.value)}
                      style={{ width: '120px', padding: '4px 8px', fontSize: '13px' }}
                    >
                      <option value="STUDENT">Student</option>
                      <option value="FACULTY">Faculty</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    {user.role === 'FACULTY'
                      ? `${user._count.courses} taught`
                      : `${user._count.enrollments} enrolled`}
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => deleteUser(user.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
