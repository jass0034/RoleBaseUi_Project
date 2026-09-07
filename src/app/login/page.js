'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, BadgeCheck, LockKeyhole, ShieldCheck } from 'lucide-react';
import { sendOtp, verifyOtp } from '../../services/login-api/pages';

const initialData = {
  name: '',
  email: '',
  mobileNumber: '',
};

function Login() {
  const router = useRouter();

  const [form, setForm] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [success, setSuccess] = useState({});
  const [loading, setLoading] = useState(false);

  const [otpModal, setOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  const validators = {
    name: (value) =>
      typeof value === 'string' && /^[A-Za-z\s]+$/.test(value) && value.trim()
        ? ''
        : 'Name is required and should contain only letters',

    email: (value) =>
      typeof value === 'string' && /^\S+@\S+\.\S+$/.test(value.trim())
        ? ''
        : 'Email is required and should be valid',

    mobileNumber: (value) =>
      /^[6-9]\d{9}$/.test(value)
        ? ''
        : 'Mobile number is required and should be valid',
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

  const handleChange = (e) => {
    const { name } = e.target;
    let { value } = e.target;

    if (name === 'name') {
      value = value.replace(/[^A-Za-z\s]/g, '');
    }

    if (name === 'mobileNumber') {
      value = value.replace(/\D/g, '').slice(0, 10);

      if (otpVerified) {
        setOtpVerified(false);
      }
    }

    if (name === 'email') {
      value = value.trimStart();
    }

    const updatedForm = {
      ...form,
      [name]: value,
    };

    setForm(updatedForm);

    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    setErrors(validateAll(updatedForm));

    if (success.message) {
      setSuccess({});
    }

    if (name === 'mobileNumber') {
      setOtpError('');
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;

    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    setErrors(validateAll(form));
  };

  const handleSendOtp = async () => {
    const validationErrors = validateAll(form);

    setErrors(validationErrors);

    setTouched((prev) => ({
      ...prev,
      name: true,
      email: true,
      mobileNumber: true,
    }));

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setOtpError('');
    setOtp('');
    setOtpLoading(true);
    setSuccess({});
    setErrors({});

    try {
      const response = await sendOtp({
        name: form.name.trim(),
        email: form.email.trim(),
        mobileNumber: form.mobileNumber,
      });

      console.log('Send OTP Response:', response);

      setOtpModal(true);
    } catch (err) {
      console.error('OTP Error:', err);
      console.error('Response:', err?.response);

      setOtpError(
        err?.response?.data?.message ||
          err?.message ||
          'Failed to send OTP. Please try again.'
      );
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      setOtpError('Please enter OTP');
      return;
    }

    if (otp.length !== 6) {
      setOtpError('Please enter a valid 6 digit OTP');
      return;
    }

    setOtpLoading(true);
    setOtpError('');

    try {
      const response = await verifyOtp({
        mobileNumber: form.mobileNumber,
        otp: otp.trim(),
      });

      const responseData = response?.data || response;

      if (!responseData?.token) {
        setOtpError('Login failed. Token not received.');
        return;
      }

      const expiryTime = Date.now() + 30 * 60 * 1000;

      localStorage.setItem('token', responseData.token);

      if (responseData.userName) {
        localStorage.setItem('userName', responseData.userName);
      }

      if (responseData.role) {
        localStorage.setItem(
          'role',
          String(responseData.role).trim().toLowerCase()
        );
      }

      localStorage.setItem('expiryTime', expiryTime.toString());

      window.dispatchEvent(new Event('authChange'));

      setOtpVerified(true);
      setOtpModal(false);
      setOtp('');
      setOtpError('');

      setSuccess({
        message: 'Login successful.',
      });
    } catch (err) {
      console.error('Verify OTP Error:', err);

      let errorMessage = 'Invalid OTP. Please try again.';

      if (err?.response) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err?.message) {
        errorMessage = err.message;
      }

      setOtpError(errorMessage);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateAll(form);

    setErrors(validationErrors);

    setTouched({
      name: true,
      email: true,
      mobileNumber: true,
    });

    if (Object.keys(validationErrors).length > 0) {
      setSuccess({});
      return;
    }

    if (!otpVerified) {
      setSuccess({});
      setErrors({
        mobileNumber: 'Please verify your mobile number with OTP first.',
      });
      return;
    }

    setLoading(true);
    setSuccess({});
    setErrors({});

    try {
      setSuccess({
        message: 'Login successful.',
      });

      setTimeout(() => {
        router.push('/register');
      }, 500);
    } catch (error) {
      console.error('Login Error:', error);

      setErrors({
        server: 'Something went wrong. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseOtpModal = () => {
    if (otpLoading) {
      return;
    }

    setOtpModal(false);
    setOtp('');
    setOtpError('');
  };

  const isFormValid =
    Object.keys(errors).length === 0 &&
    Object.keys(validators).every(
      (field) => String(form[field] ?? '').trim() !== ''
    ) &&
    otpVerified;

  return (
    <div className="min-h-screen bg-[#f8fafc] pt-[72px]">
      <div className="relative flex min-h-[calc(100vh-72px)] items-center justify-center overflow-hidden px-4 py-12 sm:px-6 lg:py-16">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#b9c8ff]/60 blur-3xl" />
        <div className="absolute -bottom-40 -right-32 h-[500px] w-[500px] rounded-full bg-cyan-200/35 blur-3xl" />
        <div className="absolute inset-0 -z-10 opacity-40 [background-image:radial-gradient(#b5c3d9_1px,transparent_1px)] [background-size:22px_22px]" />

        <div className="relative grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-2xl shadow-slate-900/10 lg:grid-cols-[.94fr_1.06fr]">
          <div className="relative hidden overflow-hidden bg-slate-950 p-11 lg:flex lg:flex-col lg:justify-between">
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border-[50px] border-white/10" />
            <div className="absolute -bottom-28 -left-28 h-80 w-80 rounded-full border-[60px] border-[#375dfb]/50" />
            <div className="absolute right-12 top-28 h-36 w-36 rounded-full bg-[#375dfb]/30 blur-3xl" />

            <div className="relative">
              <div className="mb-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#375dfb] text-white shadow-lg shadow-blue-500/30">
                <ShieldCheck className="h-7 w-7" strokeWidth={1.8} />
              </div>

              <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-blue-200">
                RoleBase workspace
              </p>

              <h1 className="font-display max-w-md text-5xl font-semibold leading-[1.02] tracking-[-.05em] text-white">
                Access with confidence.
              </h1>

              <p className="mt-6 max-w-md text-base leading-7 text-slate-300">
                A focused, secure space for your team&apos;s people, permissions, and everyday decisions.
              </p>
            </div>

            <div className="relative flex items-center gap-3 text-sm font-semibold text-slate-300">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-300">
                <BadgeCheck className="h-4 w-4" />
              </div>
              Your information is protected
            </div>
          </div>

          <div className="bg-white p-6 sm:p-10 lg:p-14">
            <div className="mb-8 lg:hidden">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#375dfb] text-white shadow-lg shadow-blue-200">
                <LockKeyhole className="h-5 w-5" strokeWidth={2} />
              </div>
            </div>

            <div className="mb-8">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[11px] font-bold tracking-[.12em] text-[#375dfb]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#375dfb]" />
                SECURE SIGN IN
              </div>

              <h2 className="font-display text-4xl font-semibold tracking-[-.045em] text-slate-950">
                Welcome back.
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Use your registered details to enter your workspace.
              </p>
            </div>

            {errors.server && (
              <Alert
                type="error"
                title="Unable to login"
                message={errors.server}
              />
            )}

            {success.message && (
              <Alert type="success" title="Success" message={success.message} />
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <InputField
                label="Full Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter your full name"
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
                label="Email Address"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                onBlur={handleBlur}
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

              <div>
                <label
                  htmlFor="mobileNumber"
                  className="mb-2.5 block text-sm font-semibold text-slate-700"
                >
                  Mobile Number
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <div
                      className={`pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 ${
                        errors.mobileNumber && touched.mobileNumber
                          ? 'text-red-400'
                          : 'text-slate-400'
                      }`}
                    >
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
                    </div>

                    <input
                      id="mobileNumber"
                      type="tel"
                      name="mobileNumber"
                      value={form.mobileNumber}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Enter 10 digit mobile number"
                      maxLength={10}
                      disabled={otpVerified}
                      className={`w-full rounded-xl border bg-slate-50 py-3.5 pl-12 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 hover:bg-white ${
                        errors.mobileNumber && touched.mobileNumber
                          ? 'border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-4 focus:ring-red-50'
                          : otpVerified
                            ? 'border-emerald-300 bg-emerald-50'
                            : 'border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50'
                      }`}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={
                      otpLoading ||
                      !/^[6-9]\d{9}$/.test(form.mobileNumber) ||
                      otpVerified
                    }
                    className="shrink-0 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {otpVerified
                      ? 'Verified'
                      : otpLoading
                        ? 'Sending...'
                        : 'Send OTP'}
                  </button>
                </div>

                {errors.mobileNumber && touched.mobileNumber && (
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
                    {errors.mobileNumber}
                  </p>
                )}

                {otpVerified && (
                  <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100">
                      ✓
                    </span>
                    Mobile number verified successfully
                  </p>
                )}
              </div>

              {!otpVerified && /^[6-9]\d{9}$/.test(form.mobileNumber) && (
                <p className="text-center text-xs font-medium text-amber-600">
                  Please verify your mobile number with OTP before signing in.
                </p>
              )}

              <button
                type="submit"
                disabled={loading || !isFormValid}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-slate-900/15 transition duration-300 hover:-translate-y-0.5 hover:bg-[#375dfb] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </>
                )}
              </button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100" />
                </div>

                <div className="relative flex justify-center">
                  <span className="bg-white px-4 text-xs text-slate-400">
                    NEW TO THE PLATFORM?
                  </span>
                </div>
              </div>

              <Link
                href="/register"
                className="flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
              >
                Create New Account
              </Link>
            </form>

            <p className="mt-8 text-center text-xs leading-5 text-slate-400">
              By continuing, you agree to our account and security policies.
            </p>
          </div>
        </div>
      </div>

      {otpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100">
                <svg
                  className="h-7 w-7 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <rect
                    x="5"
                    y="3"
                    width="14"
                    height="18"
                    rx="2"
                    strokeWidth="1.8"
                  />
                  <path
                    strokeLinecap="round"
                    strokeWidth="1.8"
                    d="M9 8h6M9 12h6M11 17h2"
                  />
                </svg>
              </div>

              <h3 className="text-2xl font-extrabold text-slate-900">
                Verify OTP
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                We have sent a 6 digit OTP to
              </p>

              <p className="mt-1 font-bold text-slate-800">
                +91 {form.mobileNumber}
              </p>
            </div>

            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={otp}
              autoFocus
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setOtp(value);
                setOtpError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && otp.length === 6) {
                  handleVerifyOtp();
                }
              }}
              placeholder="Enter 6 digit OTP"
              className={`w-full rounded-xl border bg-slate-50 px-4 py-4 text-center text-xl font-bold tracking-[0.5em] text-slate-800 outline-none transition placeholder:text-sm placeholder:tracking-normal ${
                otpError
                  ? 'border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-4 focus:ring-red-50'
                  : 'border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50'
              }`}
            />

            {otpError && (
              <p className="mt-2 text-center text-sm font-medium text-red-600">
                {otpError}
              </p>
            )}

            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={otpLoading || otp.length !== 6}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
            >
              {otpLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Verifying...
                </>
              ) : (
                'Verify OTP'
              )}
            </button>

            <button
              type="button"
              onClick={handleCloseOtpModal}
              disabled={otpLoading}
              className="mt-3 w-full rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <p className="mt-5 text-center text-xs text-slate-400">
              Didn't receive the OTP?{' '}
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={otpLoading}
                className="font-semibold text-blue-600 hover:underline disabled:opacity-50"
              >
                Resend OTP
              </button>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function InputField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
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
        <div
          className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 transition ${
            hasError ? 'text-red-400' : 'text-slate-400'
          }`}
        >
          {icon}
        </div>

        <input
          id={name}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          maxLength={maxLength}
          className={`w-full rounded-xl border bg-slate-50 py-3.5 pl-12 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 hover:bg-white ${
            hasError
              ? 'border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-4 focus:ring-red-50'
              : 'border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50'
          }`}
        />
      </div>

      {hasError && (
        <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-600">
          <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10A8 8 0 11 2 10a8 8 0 0116 0zm-7-3a1 1 0 10-2 0v3a1 1 0 002 0V7zm-1 7a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
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

export default Login;
