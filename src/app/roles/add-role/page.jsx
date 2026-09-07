'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ShieldCheck, Save } from 'lucide-react';
import {
  createRole,
  getRoles,
  updateRole,
} from '../../../services/role-api/page';

export default function AddRole() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const roleId = searchParams.get('id');
  const isEdit = Boolean(roleId);

  const [name, setName] = useState('');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [success, setSuccess] = useState({});
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);

  const validators = {
    name: (value) =>
      typeof value === 'string' &&
      /^[A-Za-z0-9\s]+$/.test(value.trim()) &&
      value.trim()
        ? ''
        : 'Role name is required and should contain only letters and numbers',
  };

  const validateAll = (data) => {
    const validationErrors = {};

    Object.keys(validators).forEach((field) => {
      const error = validators[field](data[field]);

      if (error) {
        validationErrors[field] = error;
      }
    });

    return validationErrors;
  };

  useEffect(() => {
    const loadRole = async () => {
      if (!roleId) return;

      try {
        setPageLoading(true);

        const response = await getRoles();

        const roles = Array.isArray(response?.data) ? response.data : [];

        const role = roles.find((item) => String(item.id) === String(roleId));

        if (!role) {
          router.replace('/roles');
          return;
        }

        setName(role.name || '');
      } catch (error) {
        console.error('Get Role Error:', error);
        router.replace('/roles');
      } finally {
        setPageLoading(false);
      }
    };

    loadRole();
  }, [roleId, router]);

  const handleChange = (e) => {
    const value = e.target.value.replace(/[^A-Za-z0-9\s]/g, '');

    setName(value);

    setTouched((prev) => ({
      ...prev,
      name: true,
    }));

    setErrors(
      validateAll({
        name: value,
      })
    );

    setSuccess({});
  };

  const handleBlur = () => {
    setTouched((prev) => ({
      ...prev,
      name: true,
    }));

    setErrors(
      validateAll({
        name,
      })
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateAll({
      name,
    });

    setErrors(validationErrors);

    setTouched({
      name: true,
    });

    if (Object.keys(validationErrors).length > 0) {
      setSuccess({});
      return;
    }

    setLoading(true);
    setSuccess({});
    setErrors({});

    try {
      if (isEdit) {
        await updateRole({
          id: roleId,
          name: name.trim(),
        });
      } else {
        await createRole({
          name: name.trim(),
        });
      }

      setName('');
      setTouched({});
      setErrors({});

      router.replace('/roles');
      router.refresh();
    } catch (error) {
      setErrors({
        server:
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          'Something went wrong. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    name.trim() !== '' &&
    Object.keys(
      validateAll({
        name,
      })
    ).length === 0;

  if (pageLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f7fb]">
        <div className="flex items-center gap-3 text-sm font-semibold text-slate-600">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
          Loading role...
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f5f7fb] p-6">
      <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-200/30 blur-3xl" />

      <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-purple-200/30 blur-3xl" />

      <div className="relative w-full max-w-lg overflow-hidden rounded-[28px] border border-white bg-white shadow-[0_25px_70px_-20px_rgba(15,23,42,0.25)]">
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-900 to-indigo-700 p-7 text-white">
          <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full border-[30px] border-white/5" />

          <div className="absolute -bottom-20 right-20 h-40 w-40 rounded-full bg-purple-400/10 blur-2xl" />

          <div className="relative flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-lg backdrop-blur-md">
              <ShieldCheck size={30} strokeWidth={1.8} />
            </div>

            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-200">
                Access Control
              </p>

              <h1 className="text-2xl font-bold tracking-tight">
                {isEdit ? 'Edit Role' : 'Add New Role'}
              </h1>

              <p className="mt-1 text-sm text-indigo-100/75">
                {isEdit
                  ? 'Update the role for your application.'
                  : 'Create a new role for your application.'}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-7 p-7">
          <div>
            <label
              htmlFor="roleName"
              className="mb-2.5 block text-sm font-semibold text-slate-800"
            >
              Role Name
              <span className="ml-1 text-red-500">*</span>
            </label>

            <input
              id="roleName"
              type="text"
              placeholder="Enter role name"
              value={name}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="off"
              className={`h-14 w-full rounded-2xl border bg-slate-50 px-4 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 hover:bg-white ${
                errors.name && touched.name
                  ? 'border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                  : 'border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100'
              }`}
            />

            {errors.name && touched.name && (
              <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-600">
                <svg
                  className="h-3.5 w-3.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10A8 8 0 11 2 10a8 8 0 0116 0zm-7-3a1 1 0 10-2 0v3a1 1 0 002 0V7zm-1 7a1 1 0 100-2 1 1 0 000 2z"
                    clipRule="evenodd"
                  />
                </svg>
                {errors.name}
              </p>
            )}

            {!errors.name && name.trim() && touched.name && (
              <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                <svg
                  className="h-3.5 w-3.5"
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
                Role name looks good
              </p>
            )}

            {!touched.name && (
              <p className="mt-2 text-xs text-slate-400">
                Choose a clear and descriptive name for this role.
              </p>
            )}
          </div>

          {errors.server && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-600">
              {errors.server}
            </div>
          )}

          {success.message && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-600">
              {success.message}
            </div>
          )}

          <div className="border-t border-slate-100" />

          <div className="flex justify-between gap-4">
            <Link
              href="/roles"
              className="flex h-12 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
            >
              <ArrowLeft size={18} />
              Back
            </Link>

            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="flex h-12 items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-0.5 hover:from-indigo-700 hover:to-violet-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  {isEdit ? 'Updating...' : 'Saving...'}
                </>
              ) : (
                <>
                  <Save size={18} />
                  {isEdit ? 'Update Role' : 'Save Role'}
                </>
              )}
            </button>
          </div>
        </form>

        <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600" />
      </div>
    </div>
  );
}
