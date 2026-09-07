'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { deleteUser, getUsers } from '../services/user-api/page';

function UserGrid() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [toast, setToast] = useState({
    show: false,
    type: '',
    message: '',
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const showToast = (type, message) => {
    setToast({
      show: true,
      type,
      message,
    });

    setTimeout(() => {
      setToast({
        show: false,
        type: '',
        message: '',
      });
    }, 3000);
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await getUsers();

      const userData = Array.isArray(response?.data) ? response.data : [];

      setUsers(userData);
    } catch (err) {
      console.error('Get Users Error:', err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          'Unable to load users'
      );

      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const searchValue = search.toLowerCase().trim();

    if (!searchValue) {
      return true;
    }

    return (
      user?.name?.toLowerCase().includes(searchValue) ||
      user?.email?.toLowerCase().includes(searchValue) ||
      user?.mobileNumber?.toString().toLowerCase().includes(searchValue) ||
      user?.gender?.toLowerCase().includes(searchValue) ||
      user?.roleName?.toLowerCase().includes(searchValue) ||
      user?.roleId?.toString().includes(searchValue) ||
      user?.fatherName?.toLowerCase().includes(searchValue) ||
      user?.id?.toString().includes(searchValue)
    );
  });

  const handleDelete = async (user) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${user?.name || 'this user'}?`
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await deleteUser(user.id);
      await loadUsers();

      showToast('success', `${user?.name || 'User'} deleted successfully`);
    } catch (err) {
      showToast(
        'error',
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          'Unable to delete user'
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb] pt-20">
      {toast.show && (
        <div
          className={`fixed right-5 top-5 z-[9999] flex min-w-[320px] max-w-[420px] items-center gap-3 rounded-xl border px-5 py-4 shadow-xl ${
            toast.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-bold ${
              toast.type === 'success'
                ? 'bg-green-100 text-green-600'
                : 'bg-red-100 text-red-600'
            }`}
          >
            {toast.type === 'success' ? '✓' : '✕'}
          </div>

          <div className="flex-1">
            <p className="text-sm font-bold">
              {toast.type === 'success' ? 'Success' : 'Error'}
            </p>

            <p className="mt-0.5 text-xs">{toast.message}</p>
          </div>

          <button
            type="button"
            onClick={() =>
              setToast({
                show: false,
                type: '',
                message: '',
              })
            }
            className="text-xl opacity-50 transition hover:opacity-100"
          >
            ×
          </button>
        </div>
      )}

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1500px] px-6 py-5 lg:px-10">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-200">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m4-4a4 4 0 100-8 4 4 0 000 8zm6 0a3 3 0 100-6 3 3 0 000 6z"
                  />
                </svg>
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-800">
                  User Management
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Manage users, roles and account activity
                </p>
              </div>
            </div>

            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-100 transition-all duration-200 hover:bg-blue-700"
            >
              <span className="text-xl leading-none">+</span>
              Add New User
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] px-6 py-8 lg:px-10">
        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Users
                </p>

                <h2 className="mt-2 text-3xl font-bold text-slate-800">
                  {users.length}
                </h2>

                <p className="mt-2 text-xs text-slate-400">
                  Registered accounts
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                <svg
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m4-4a4 4 0 100-8 4 4 0 000 8z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Active Users
                </p>

                <h2 className="mt-2 text-3xl font-bold text-slate-800">
                  {users.length}
                </h2>

                <p className="mt-2 text-xs text-green-600">● All active</p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Search Results
                </p>

                <h2 className="mt-2 text-3xl font-bold text-slate-800">
                  {filteredUsers.length}
                </h2>

                <p className="mt-2 text-xs text-slate-400">
                  Currently displayed
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50">
                <svg
                  className="h-6 w-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-4.35-4.35m2.35-5.65a8 8 0 11-16 0 8 8 0 0116 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Account Status
                </p>

                <h2 className="mt-2 text-3xl font-bold text-slate-800">
                  Active
                </h2>

                <p className="mt-2 text-xs text-slate-400">System status</p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
                <span className="h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_0_5px_rgba(16,185,129,0.12)]" />
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800">All Users</h2>

                <p className="mt-1 text-sm text-slate-500">
                  View and manage all registered users
                </p>
              </div>

              <div className="relative w-full lg:w-96">
                <svg
                  className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-4.35-4.35m2.35-5.65a8 8 0 11-16 0 8 8 0 0116 0z"
                  />
                </svg>

                <input
                  type="text"
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="mx-6 mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-red-700">
                    Unable to load users
                  </p>

                  <p className="mt-1 text-xs text-red-600">{error}</p>
                </div>

                <button
                  type="button"
                  onClick={loadUsers}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead className="border-y border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    #
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    User
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Contact
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Gender
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Role
                  </th>

                  <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-500">
                    Status
                  </th>

                  <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

                        <p className="mt-4 text-sm font-medium text-slate-500">
                          Loading users...
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                          <svg
                            className="h-7 w-7 text-slate-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 12a5 5 0 100-10 5 5 0 000 10zm-7 9a7 7 0 0114 0"
                            />
                          </svg>
                        </div>

                        <h3 className="mt-4 font-semibold text-slate-700">
                          No users found
                        </h3>

                        <p className="mt-1 text-sm text-slate-400">
                          Try changing your search criteria.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, index) => (
                    <tr
                      key={user?.id || index}
                      className="transition duration-150 hover:bg-slate-50/80"
                    >
                      <td className="px-6 py-5">
                        <span className="text-sm font-medium text-slate-400">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 font-bold text-white shadow-sm">
                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>

                          <div>
                            <p className="font-semibold text-slate-800">
                              {user?.name || 'Unknown User'}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-400">
                              ID: #{user?.id ?? '-'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <p className="text-sm font-medium text-slate-700">
                          {user?.email || 'No email'}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {user?.mobileNumber || 'No mobile number'}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <span className="text-sm text-slate-600">
                          {user?.gender || '—'}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <span className="inline-flex items-center rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600">
                          {user?.roleName ||
                            (user?.roleId ? `Role ${user.roleId}` : 'No Role')}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-center">
                        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />
                          Active
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/register?id=${user?.id}`}
                            title="Edit User"
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-600 transition-all duration-200 hover:border-blue-600 hover:bg-blue-600 hover:text-white"
                          >
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.5-9.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 8.5-8.5z"
                              />
                            </svg>
                          </Link>

                          <button
                            type="button"
                            title="Delete User"
                            onClick={() => handleDelete(user)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-100 bg-red-50 text-red-600 transition-all duration-200 hover:border-red-600 hover:bg-red-600 hover:text-white"
                          >
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3m-9 0h14"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!loading && filteredUsers.length > 0 && (
            <div className="border-t border-slate-200 bg-slate-50/50 px-6 py-4">
              <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                <p className="text-sm text-slate-500">
                  Showing{' '}
                  <span className="font-semibold text-slate-700">
                    {filteredUsers.length}
                  </span>{' '}
                  of{' '}
                  <span className="font-semibold text-slate-700">
                    {users.length}
                  </span>{' '}
                  users
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default UserGrid;
