'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { createUser, updateUser, getUsers } from '../../services/user-api/page';
import { getRoles } from '../../services/role-api/page';
import { useAuth } from '../../context/AuthContext';

const initialUser = {
  id: 0,
  name: '',
  fatherName: '',
  email: '',
  mobileNumber: '',
  gender: '',
  roleId: '',
  idProofType: '',
  idProofNumber: '',
  address: '',
};

function Register() {
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');

  const [user, setUser] = useState(initialUser);
  const [userId, setUserId] = useState(0);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [success, setSuccess] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(false);
  const [roles, setRoles] = useState([]);
  const { isLoggedIn, isAdmin, logout } = useAuth();
  const isEditMode = Boolean(editId);

  const validators = {
    name: (value) =>
      typeof value === 'string' && /^[A-Za-z\s]+$/.test(value) && value.trim()
        ? ''
        : 'Name is required and should contain only letters',

    fatherName: (value) =>
      typeof value === 'string' && /^[A-Za-z\s]+$/.test(value) && value.trim()
        ? ''
        : "Father's name is required and should contain only letters",

    address: (value) => (value?.trim() ? '' : 'Address is required'),

    email: (value) =>
      /^\S+@\S+\.\S+$/.test(value) ? '' : 'Invalid email address',

    mobileNumber: (value) =>
      /^[6-9]\d{9}$/.test(value) ? '' : 'Invalid mobile number',

    gender: (value) => (value ? '' : 'Gender is required'),

    roleId: (value) => (value ? '' : 'Role is required'),

    idProofType: (value) => (value ? '' : 'ID proof type is required'),

    idProofNumber: (value, all) => {
      if (!all.idProofType) {
        return 'Select ID proof type';
      }

      if (!value?.trim()) {
        return 'ID proof number is required';
      }

      const cleanValue = value.replace(/\s/g, '');

      switch (all.idProofType) {
        case 'Aadhar':
          return /^\d{12}$/.test(cleanValue)
            ? ''
            : 'Aadhaar must contain 12 digits';

        case 'PAN':
          return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(cleanValue)
            ? ''
            : 'Invalid PAN Number';

        case 'Passport':
          return /^[A-Z]{1}[0-9]{7}$/i.test(cleanValue)
            ? ''
            : 'Invalid Passport Number';

        case 'Driving License':
          return /^[A-Z]{2}[0-9]{2}[0-9]{11,13}$/i.test(cleanValue)
            ? ''
            : 'Invalid Driving License Number';

        default:
          return '';
      }
    },
  };

  const validateAll = (data) => {
    const validationErrors = {};

    Object.keys(validators).forEach((field) => {
      const error = validators[field](data[field], data);

      if (error) {
        validationErrors[field] = error;
      }
    });

    return validationErrors;
  };

  const formatUserData = (data) => {
    return {
      id: Number(data?.id || 0),
      name: data?.name || '',
      fatherName: data?.fatherName || '',
      email: data?.email || '',
      mobileNumber: data?.mobileNumber?.toString() || '',
      gender: data?.gender || '',
      roleId:
        data?.roleId !== null && data?.roleId !== undefined
          ? String(data.roleId)
          : '',
      idProofType: data?.idProofType || '',
      idProofNumber: data?.idProofNumber || '',
      address: data?.address || '',
    };
  };

  const loadRoles = async () => {
    try {
      const response = await getRoles();
      const roleData = Array.isArray(response?.data) ? response.data : [];
      setRoles(roleData);
    } catch (error) {
      console.error('Get Roles Error:', error);
      setRoles([]);
    }
  };

  const loadUser = async (id) => {
    try {
      setLoadingUser(true);
      setErrors({});

      const response = await getUsers();
      const users = Array.isArray(response?.data) ? response.data : [];

      const existingUser = users.find(
        (item) => String(item?.id) === String(id)
      );

      if (!existingUser) {
        setErrors({
          server: 'User not found.',
        });

        setUser(initialUser);
        setUserId(0);
        return;
      }

      const formattedUser = formatUserData(existingUser);

      setUser(formattedUser);
      setUserId(Number(id));
      setErrors({});
      setTouched({});
      setSuccess({});
    } catch (error) {
      console.error('Load User Error:', error);

      setErrors({
        server:
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          'Unable to load user data.',
      });
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  useEffect(() => {
    if (editId) {
      loadUser(editId);
    } else {
      setUser(initialUser);
      setUserId(0);
      setErrors({});
      setTouched({});
      setSuccess({});
    }
  }, [editId]);

  const handleChange = (e) => {
    const { name } = e.target;
    let { value } = e.target;

    if (name === 'mobileNumber') {
      value = value.replace(/\D/g, '').slice(0, 10);
    }

    if (name === 'name' || name === 'fatherName') {
      value = value.replace(/[^A-Za-z\s]/g, '');
    }

    if (name === 'roleId') {
      value = value.replace(/\D/g, '');
    }

    if (name === 'idProofNumber') {
      if (user.idProofType === 'Aadhar') {
        const digits = value.replace(/\D/g, '').slice(0, 12);
        value = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
      }

      if (user.idProofType === 'PAN') {
        value = value
          .replace(/[^A-Za-z0-9]/g, '')
          .slice(0, 10)
          .toUpperCase();
      }

      if (user.idProofType === 'Passport') {
        value = value
          .replace(/[^A-Za-z0-9]/g, '')
          .slice(0, 8)
          .toUpperCase();
      }

      if (user.idProofType === 'Driving License') {
        value = value
          .replace(/[^A-Za-z0-9]/g, '')
          .slice(0, 17)
          .toUpperCase();
      }
    }

    const updatedUser = {
      ...user,
      [name]: value,
    };

    if (name === 'idProofType') {
      updatedUser.idProofNumber = '';
    }

    setUser(updatedUser);

    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    setErrors(validateAll(updatedUser));

    if (success.message) {
      setSuccess({});
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const currentErrors = validateAll(user);

    setErrors(currentErrors);

    const allTouched = Object.keys(validators).reduce(
      (acc, field) => ({
        ...acc,
        [field]: true,
      }),
      {}
    );

    setTouched(allTouched);

    if (Object.keys(currentErrors).length > 0) {
      setSuccess({});
      return;
    }

    setLoading(true);
    setSuccess({});

    try {
      let res;

      const payload = {
        ...user,
        id: userId,
        roleId: Number(user.roleId),
        idProofNumber: user.idProofNumber.replace(/\s/g, ''),
      };

      if (userId === 0) {
        res = await createUser(payload);
      } else {
        res = await updateUser(payload);
      }

      console.log('Response:', res);

      setSuccess({
        message:
          userId === 0
            ? 'User account created successfully.'
            : 'User account updated successfully.',
      });

      setErrors({});
      setTouched({});

      if (userId === 0) {
        clearForm();
      }
    } catch (err) {
      console.error('Error:', err);
      console.error('Status:', err?.response?.status);
      console.error('Backend Error:', err?.response?.data);

      setErrors({
        server:
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          'Something went wrong. Please try again.',
      });

      setSuccess({});
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setUserId(0);
    setUser(initialUser);
    setErrors({});
    setTouched({});
    setSuccess({});
  };

  const isFormValid =
    Object.keys(errors).length === 0 &&
    Object.keys(validators).every(
      (field) => String(user[field] ?? '').trim() !== ''
    );

  return (
    <div className="min-h-screen bg-[#f5f7fb] pt-20">
      <header className="w-full border-b border-slate-200 bg-white">
        <div className="mx-auto flex min-h-[80px] max-w-[1400px] items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-200">
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
                  d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zm8-3v6m3-3h-6"
                />
              </svg>
            </div>

            <div>
              <h1 className="text-lg font-bold leading-tight text-slate-800">
                User Management
              </h1>

              <p className="mt-0.5 hidden text-xs text-slate-400 sm:block">
                RoleBase Administration
              </p>
            </div>
          </div>

          {isAdmin && (
            <Link
              href="/user-grid"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
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
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>

              <span className="hidden sm:inline">Back to Users</span>
            </Link>
          )}
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            {isEditMode ? 'USER EDIT' : 'USER REGISTRATION'}
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-slate-800 sm:text-4xl">
            {isEditMode ? 'Edit User' : 'Create New User'}
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            {isEditMode
              ? 'Update the user information, role and identity details.'
              : 'Add a new user account with personal information, contact details, role and identity information.'}
          </p>
        </div>

        {errors.server && (
          <Alert
            type="error"
            title={isEditMode ? 'Unable to load user' : 'Unable to save user'}
            message={errors.server}
          />
        )}

        {success.message && (
          <Alert type="success" title="Success" message={success.message} />
        )}

        {loadingUser ? (
          <div className="flex min-h-[400px] items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col items-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

              <p className="mt-4 text-sm font-medium text-slate-500">
                Loading user data...
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_15px_50px_rgba(15,23,42,0.06)]">
            <div className="border-b border-slate-200 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-6 py-7 sm:px-8">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20 backdrop-blur">
                  <svg
                    className="h-7 w-7 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeWidth="1.8"
                      d="M15 19a3 3 0 01-6 0m9-7a6 6 0 10-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9z"
                    />
                  </svg>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white">
                    {userId === 0
                      ? 'New User Information'
                      : 'Update User Information'}
                  </h3>

                  <p className="mt-1 text-sm text-blue-100">
                    {userId === 0
                      ? 'Enter the details below to continue.'
                      : `Editing user #${userId}`}
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-6 sm:p-8">
                <SectionHeader
                  number="01"
                  title="Personal Information"
                  description="Basic information about the user"
                />

                <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                  <InputField
                    label="Full Name"
                    name="name"
                    value={user.name}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    required
                    error={errors.name}
                    touched={touched.name}
                    icon={
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeWidth="1.8"
                          d="M20 21a8 8 0 00-16 0M12 13a4 4 0 100-8 4 4 0 000 8z"
                        />
                      </svg>
                    }
                  />

                  <InputField
                    label="Father Name"
                    name="fatherName"
                    value={user.fatherName}
                    onChange={handleChange}
                    placeholder="Enter father name"
                    required
                    error={errors.fatherName}
                    touched={touched.fatherName}
                    icon={
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeWidth="1.8"
                          d="M12 3l7 4v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V7l7-4z"
                        />
                      </svg>
                    }
                  />

                  <SelectField
                    label="Gender"
                    name="gender"
                    value={user.gender}
                    onChange={handleChange}
                    required
                    error={errors.gender}
                    touched={touched.gender}
                    options={[
                      { value: '', label: 'Select gender' },
                      { value: 'Male', label: 'Male' },
                      { value: 'Female', label: 'Female' },
                      { value: 'Other', label: 'Other' },
                    ]}
                  />

                  <SelectField
                    label="Role"
                    name="roleId"
                    value={user.roleId}
                    onChange={handleChange}
                    required
                    error={errors.roleId}
                    touched={touched.roleId}
                    options={[
                      { value: '', label: 'Select Role' },
                      ...roles.map((role) => ({
                        value: String(role.id),
                        label: role.name,
                      })),
                    ]}
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 bg-slate-50/50 p-6 sm:p-8">
                <SectionHeader
                  number="02"
                  title="Contact Information"
                  description="User's communication details"
                />

                <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                  <InputField
                    label="Email Address"
                    name="email"
                    type="email"
                    value={user.email}
                    onChange={handleChange}
                    placeholder="example@email.com"
                    required
                    error={errors.email}
                    touched={touched.email}
                    icon={
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeWidth="1.8"
                          d="M4 6h16v12H4z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeWidth="1.8"
                          d="M4 7l8 6 8-6"
                        />
                      </svg>
                    }
                  />

                  <InputField
                    label="Mobile Number"
                    name="mobileNumber"
                    type="tel"
                    value={user.mobileNumber}
                    onChange={handleChange}
                    placeholder="Enter mobile number"
                    required
                    maxLength={10}
                    error={errors.mobileNumber}
                    touched={touched.mobileNumber}
                    icon={
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <rect
                          x="7"
                          y="2"
                          width="10"
                          height="20"
                          rx="2"
                          strokeWidth="1.8"
                        />
                        <path
                          strokeLinecap="round"
                          strokeWidth="1.8"
                          d="M11 18h2"
                        />
                      </svg>
                    }
                  />
                </div>
              </div>

              <div className="p-6 sm:p-8">
                <SectionHeader
                  number="03"
                  title="Identity Verification"
                  description="Government or identity document details"
                />

                <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                  <SelectField
                    label="ID Proof Type"
                    name="idProofType"
                    value={user.idProofType}
                    onChange={handleChange}
                    required
                    error={errors.idProofType}
                    touched={touched.idProofType}
                    options={[
                      { value: '', label: 'Select ID proof' },
                      { value: 'Aadhar', label: 'Aadhar Card' },
                      { value: 'PAN', label: 'PAN Card' },
                      { value: 'Passport', label: 'Passport' },
                      {
                        value: 'Driving License',
                        label: 'Driving License',
                      },
                    ]}
                  />

                  <InputField
                    label="ID Proof Number"
                    name="idProofNumber"
                    value={user.idProofNumber}
                    onChange={handleChange}
                    required
                    error={errors.idProofNumber}
                    touched={touched.idProofNumber}
                    placeholder={
                      user.idProofType === 'Aadhar'
                        ? '1234 5678 9012'
                        : user.idProofType === 'PAN'
                          ? 'ABCDE1234F'
                          : user.idProofType === 'Passport'
                            ? 'P1234567'
                            : user.idProofType === 'Driving License'
                              ? 'DL0120230001234'
                              : 'Enter ID Number'
                    }
                    icon={
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeWidth="1.8"
                          d="M4 7h16M4 12h16M4 17h10"
                        />
                      </svg>
                    }
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 bg-slate-50/50 p-6 sm:p-8">
                <SectionHeader
                  number="04"
                  title="Address Details"
                  description="Current residential address"
                />

                <div className="mt-6">
                  <label
                    htmlFor="address"
                    className="mb-2.5 block text-sm font-semibold text-slate-700"
                  >
                    Complete Address
                    <span className="ml-1 text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <div className="pointer-events-none absolute left-4 top-4 text-slate-400">
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeWidth="1.8"
                          d="M12 21s7-6.2 7-12a7 7 0 10-14 0c0 5.8 7 12 7 12z"
                        />
                        <circle cx="12" cy="9" r="2.5" strokeWidth="1.8" />
                      </svg>
                    </div>

                    <textarea
                      id="address"
                      name="address"
                      value={user.address}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Enter complete residential address..."
                      className={`w-full resize-none rounded-xl border bg-white py-3.5 pl-12 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 ${
                        errors.address && touched.address
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-50'
                          : 'border-slate-200 focus:ring-blue-50'
                      }`}
                    />
                  </div>

                  {errors.address && touched.address && (
                    <p className="mt-2 text-sm font-medium text-red-600">
                      {errors.address}
                    </p>
                  )}
                </div>
              </div>

              <div className="border-t border-slate-200 bg-white px-6 py-5 sm:px-8">
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs leading-5 text-slate-400">
                    Make sure all information is correct before submitting.
                  </p>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={clearForm}
                      className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-800"
                    >
                      Clear
                    </button>

                    <button
                      type="submit"
                      disabled={loading || !isFormValid}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 5v14m-7-7h14"
                            />
                          </svg>

                          {userId === 0 ? 'Create User' : 'Update User'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeWidth="1.8"
              d="M12 22a10 10 0 100-20 10 10 0 000 20zm0-6v-4m0-4h.01"
            />
          </svg>
          Your user information is handled securely.
        </div>
      </main>
    </div>
  );
}

function Alert({ type, title, message }) {
  const isSuccess = type === 'success';

  return (
    <div
      className={`mb-6 flex items-start gap-3 rounded-2xl border p-4 ${
        isSuccess
          ? 'border-emerald-200 bg-emerald-50'
          : 'border-red-200 bg-red-50'
      }`}
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
          isSuccess ? 'bg-emerald-100' : 'bg-red-100'
        }`}
      >
        <svg
          className={`h-5 w-5 ${
            isSuccess ? 'text-emerald-600' : 'text-red-600'
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isSuccess ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v3m0 4h.01M10.29 3.86l-7.3 12.64A2 2 0 004.72 19h14.56a2 2 0 001.73-2.5L13.71 3.86a2 2 0 00-3.42 0z"
            />
          )}
        </svg>
      </div>

      <div>
        <p
          className={`font-semibold ${
            isSuccess ? 'text-emerald-700' : 'text-red-700'
          }`}
        >
          {title}
        </p>

        <p
          className={`mt-1 text-sm ${
            isSuccess ? 'text-emerald-600' : 'text-red-600'
          }`}
        >
          {message}
        </p>
      </div>
    </div>
  );
}

function SectionHeader({ number, title, description }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xs font-extrabold text-blue-600">
        {number}
      </div>

      <div>
        <h3 className="text-base font-bold text-slate-800">{title}</h3>
        <p className="mt-1 text-sm text-slate-400">{description}</p>
      </div>
    </div>
  );
}

function InputField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  icon,
  required = false,
  error,
  touched,
  maxLength,
}) {
  const hasError = error && touched;

  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2.5 block text-sm font-semibold text-slate-700"
      >
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <div className="relative">
        {icon && (
          <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}

        <input
          id={name}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          maxLength={maxLength}
          className={`w-full rounded-xl border bg-white py-3.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:ring-4 ${
            icon ? 'pl-12' : 'px-4'
          } pr-4 ${
            hasError
              ? 'border-red-500 focus:border-red-500 focus:ring-red-50'
              : 'border-slate-200 focus:border-blue-500 focus:ring-blue-50'
          }`}
        />
      </div>

      {hasError && (
        <p className="mt-2 text-sm font-medium text-red-600">{error}</p>
      )}
    </div>
  );
}

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
  error,
  touched,
}) {
  const hasError = error && touched;

  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2.5 block text-sm font-semibold text-slate-700"
      >
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <div className="relative">
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          className={`w-full cursor-pointer appearance-none rounded-xl border bg-white px-4 py-3.5 pr-11 text-sm text-slate-700 outline-none transition hover:border-slate-300 focus:ring-4 ${
            hasError
              ? 'border-red-500 focus:border-red-500 focus:ring-red-50'
              : 'border-slate-200 focus:border-blue-500 focus:ring-blue-50'
          }`}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 9l6 6 6-6"
            />
          </svg>
        </div>
      </div>

      {hasError && (
        <p className="mt-2 text-sm font-medium text-red-600">{error}</p>
      )}
    </div>
  );
}

export default Register;
