'use client';

import React, { useEffect, useRef, useState } from 'react';
import { deleteRole, getRoles } from '../services/role-api/page';
import {
  ShieldCheck,
  Pencil,
  Trash2,
  House,
  Plus,
  UsersRound,
  ChevronRight,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';
import Link from 'next/link';

function Role() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({
    show: false,
    type: '',
    message: '',
  });

  const toastTimerRef = useRef(null);

  const showToast = (type, message) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    setToast({
      show: true,
      type,
      message,
    });

    toastTimerRef.current = setTimeout(() => {
      setToast({
        show: false,
        type: '',
        message: '',
      });
    }, 3500);
  };

  const closeToast = () => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    setToast({
      show: false,
      type: '',
      message: '',
    });
  };

  const loadRoles = async () => {
    try {
      setLoading(true);

      const response = await getRoles();

      setRoles(Array.isArray(response?.data) ? response.data : []);
    } catch (err) {
      console.error('Get Roles Error:', err);
      setRoles([]);

      showToast(
        'error',
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          'Unable to load roles. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();

    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const handleDelete = async (role) => {
    const roleName = role?.name || 'this role';

    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${roleName}"?\n\nThis action cannot be undone.`
    );

    if (!confirmDelete) return;

    try {
      await deleteRole(role.id);

      setRoles((prevRoles) => prevRoles.filter((item) => item.id !== role.id));

      showToast('success', `"${roleName}" has been deleted successfully.`);
    } catch (err) {
      console.error('Delete Role Error:', err);

      showToast(
        'error',
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          `Unable to delete "${roleName}". Please try again.`
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb] pt-20">
      {toast.show && (
        <div
          role="alert"
          className={`fixed right-5 top-5 z-[100] flex w-[calc(100%-2.5rem)] max-w-sm items-center gap-3 rounded-2xl border bg-white px-4 py-3.5 shadow-2xl backdrop-blur-xl ${
            toast.type === 'success'
              ? 'border-emerald-200 shadow-emerald-100'
              : 'border-red-200 shadow-red-100'
          }`}
        >
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              toast.type === 'success'
                ? 'bg-emerald-100 text-emerald-600'
                : 'bg-red-100 text-red-600'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 size={22} strokeWidth={2.3} />
            ) : (
              <AlertCircle size={22} strokeWidth={2.3} />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p
              className={`text-sm font-bold ${
                toast.type === 'success' ? 'text-emerald-700' : 'text-red-700'
              }`}
            >
              {toast.type === 'success' ? 'Success' : 'Action Failed'}
            </p>

            <p className="mt-0.5 text-xs font-medium leading-5 text-slate-500">
              {toast.message}
            </p>
          </div>

          <button
            type="button"
            onClick={closeToast}
            aria-label="Close notification"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-lg shadow-indigo-200">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900">
                RoleBase
              </h1>
              <p className="text-xs text-slate-400">Administration Console</p>
            </div>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
          >
            <House size={17} />
            <span className="hidden sm:inline">Home</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8 lg:py-10">
        <section className="relative mb-8 overflow-hidden rounded-[28px] bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 p-6 shadow-xl shadow-indigo-100 sm:p-8 lg:p-10">
          <div className="absolute -right-24 -top-32 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />

          <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-indigo-200 backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Access Control
              </div>

              <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Role Management
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                Create and manage application roles from one central place. Keep
                your users, permissions and access structure organized.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-5 py-3.5 backdrop-blur">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                  <UsersRound size={20} className="text-indigo-200" />
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-400">
                    Total Roles
                  </p>
                  <p className="text-xl font-bold text-white">{roles.length}</p>
                </div>
              </div>

              <Link
                href="/roles/add-role"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3.5 text-sm font-bold text-indigo-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-indigo-50"
              >
                <Plus size={18} />
                Add New Role
              </Link>

              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3.5 text-sm font-bold text-indigo-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-indigo-50"
              >
                <Plus size={18} />
                Add New User
              </Link>
            </div>
          </div>
        </section>

        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
              System Roles
            </p>

            <h3 className="mt-1 text-2xl font-bold text-slate-900">
              Available Roles
            </h3>
          </div>

          <button
            type="button"
            onClick={loadRoles}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="h-1.5 animate-pulse bg-slate-200" />

                <div className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 animate-pulse rounded-2xl bg-slate-200" />

                    <div className="flex-1">
                      <div className="h-5 w-28 animate-pulse rounded bg-slate-200" />
                      <div className="mt-2 h-3 w-20 animate-pulse rounded bg-slate-100" />
                    </div>
                  </div>

                  <div className="mt-6 h-16 animate-pulse rounded-xl bg-slate-100" />

                  <div className="mt-5 flex gap-3">
                    <div className="h-10 flex-1 animate-pulse rounded-xl bg-slate-100" />
                    <div className="h-10 w-11 animate-pulse rounded-xl bg-slate-100" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : roles.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-50">
              <ShieldCheck className="h-10 w-10 text-indigo-500" />
            </div>

            <h3 className="mt-6 text-xl font-bold text-slate-800">
              No roles available
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Your application does not have any roles yet. Create your first
              role to start managing access.
            </p>

            <Link
              href="/roles/add-role"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              <Plus size={18} />
              Create First Role
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {roles.map((role, index) => (
              <div
                key={role.id || index}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-100/50"
              >
                <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500" />

                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-100 transition duration-300 group-hover:from-indigo-100 group-hover:to-violet-200">
                      <ShieldCheck size={28} className="text-indigo-600" />
                    </div>

                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-600">
                      ACTIVE
                    </span>
                  </div>

                  <div className="mt-5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Role {String(index + 1).padStart(2, '0')}
                    </p>

                    <h3 className="mt-1 truncate text-xl font-extrabold text-slate-900">
                      {role.name}
                    </h3>
                  </div>

                  <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-lg bg-white p-1.5 shadow-sm">
                        <ShieldCheck size={15} className="text-indigo-500" />
                      </div>

                      <p className="text-xs leading-5 text-slate-500">
                        This role controls user permissions and application
                        access.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex gap-2">
                    <Link
                      href={`/roles/add-role?id=${role.id}`}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50 py-2.5 text-sm font-bold text-indigo-600 transition hover:bg-indigo-600 hover:text-white"
                    >
                      <Pencil size={16} />
                      Edit
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleDelete(role)}
                      aria-label={`Delete ${role.name || 'role'}`}
                      className="flex h-10 w-11 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-500 transition hover:bg-red-500 hover:text-white"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                    <span className="text-xs font-medium text-slate-400">
                      Role ID: #{role.id}
                    </span>

                    <ChevronRight
                      size={16}
                      className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-indigo-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400">
          <ShieldCheck size={15} />
          Role permissions are managed securely
        </div>
      </main>
    </div>
  );
}

export default Role;
