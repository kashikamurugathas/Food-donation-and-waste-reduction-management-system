import React, { useState, useEffect } from 'react';
import {
  HeartHandshake,
  LogIn,
  Eye,
  EyeOff,
  Lock,
  Mail,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Info,
  X,
  Database,
  Building,
  Users,
  Shield,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { authApi } from '../services/api';

interface LoginPageProps {
  onNavigate: (page: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { loginWithCredentials, authNotice, setAuthNotice } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Field validation error states
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  // Forgot password modal state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [mailConfigExplanation, setMailConfigExplanation] = useState<string | null>(null);

  // Database and API connection info toggle
  const [showDbInfo, setShowDbInfo] = useState(true);

  // Read remembered email on mount if previously stored
  useEffect(() => {
    const remembered = localStorage.getItem('foodshare_remembered_email');
    if (remembered) {
      setEmail(remembered);
      setRememberMe(true);
    }
  }, []);

  // Display auth notice if redirected from a protected dashboard route
  useEffect(() => {
    if (authNotice) {
      setErrorMessage(authNotice);
    }
  }, [authNotice]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    const errors: { email?: string; password?: string } = {};

    // 1. Strict email validation
    if (!email.trim()) {
      errors.email = 'Please enter your email address.';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        errors.email = 'Please provide a valid email address (e.g. name@example.lk).';
      }
    }

    // 2. Strict password validation
    if (!password) {
      errors.password = 'Please enter your password.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMessage(errors.email || errors.password || 'Please enter valid credentials.');
      return;
    }

    setFieldErrors({});
    setIsLoading(true);

    // Call real backend authentication API connected to MySQL database
    const result = await loginWithCredentials(email.trim(), password, undefined, rememberMe);

    setIsLoading(false);

    if (!result.success) {
      setErrorMessage(result.error || 'Authentication failed. Please verify your credentials.');
      return;
    }

    const userRole = result.user?.role || 'donor';
    const roleLabel =
      userRole === 'donor'
        ? 'Food Donor'
        : userRole === 'institution'
        ? "Children's & Elders' Home"
        : 'Administrator';

    setSuccessMessage(`Welcome back! Authenticated as ${roleLabel}. Redirecting to your dashboard...`);

    // Redirect user to appropriate dashboard based on their verified role
    setTimeout(() => {
      if (userRole === 'donor') {
        onNavigate('donorDashboard');
      } else if (userRole === 'institution') {
        onNavigate('institutionDashboard');
      } else if (userRole === 'admin') {
        onNavigate('adminDashboard');
      } else {
        onNavigate('home');
      }
    }, 600);
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    setResetSuccess(null);
    setMailConfigExplanation(null);

    if (!resetEmail.trim()) {
      setResetError('Please enter your registered email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(resetEmail.trim())) {
      setResetError('Please enter a valid email address.');
      return;
    }

    setIsResetting(true);
    const res = await authApi.forgotPassword(resetEmail.trim());
    setIsResetting(false);

    if (!res.success) {
      setResetError(res.message);
      if (res.configured === false) {
        setMailConfigExplanation(
          'In this development environment, outgoing SMTP is not yet configured. To send actual password reset emails, configure MAIL_MAILER, MAIL_HOST, MAIL_PORT, MAIL_USERNAME, and MAIL_PASSWORD in your backend .env file.'
        );
      }
    } else {
      setResetSuccess(res.message);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12 sm:py-16 space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center mx-auto shadow-sm">
          <HeartHandshake className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs font-semibold text-emerald-800 tracking-wider uppercase font-mono">
            FoodShare Lanka
          </span>
          <p className="text-xs text-neutral-500 italic mt-0.5">
            “Share Food, Spread Happiness”
          </p>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
          Welcome Back
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600 max-w-sm mx-auto">
          Log in to continue sharing food and spreading happiness.
        </p>
      </div>

      {/* Main Login Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200 shadow-xs space-y-5">
        {/* Error Alert Box */}
        {errorMessage && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">
              <span>{errorMessage}</span>
              {errorMessage.includes('No account found') && (
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => onNavigate('register')}
                    className="font-bold underline text-rose-900 hover:text-rose-950"
                  >
                    Click here to register a new account
                  </button>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                setErrorMessage(null);
                setAuthNotice(null);
              }}
              className="text-rose-400 hover:text-rose-700 p-0.5"
              aria-label="Dismiss error"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Success Alert Box */}
        {successMessage && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4 text-xs">
          {/* Email Address Input */}
          <div>
            <label htmlFor="login-email-input" className="block font-semibold text-neutral-700 mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-3 pointer-events-none" />
              <input
                id="login-email-input"
                type="email"
                required
                autoComplete="email"
                placeholder="name@example.lk"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                  if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: undefined });
                }}
                className={`w-full pl-9 pr-3 py-2.5 border rounded-lg text-xs transition-colors focus:outline-emerald-600 ${
                  fieldErrors.email
                    ? 'border-rose-400 bg-rose-50/20 focus:border-rose-600 focus:outline-rose-600'
                    : 'border-neutral-300 focus:border-emerald-600'
                }`}
              />
            </div>
            {fieldErrors.email && <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.email}</p>}
          </div>

          {/* Password Input with Show/Hide Password Toggle */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="login-password-input" className="font-semibold text-neutral-700">
                Password *
              </label>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-3 pointer-events-none" />
              <input
                id="login-password-input"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                  if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: undefined });
                }}
                className={`w-full pl-9 pr-10 py-2.5 border rounded-lg text-xs font-mono transition-colors focus:outline-emerald-600 ${
                  fieldErrors.password
                    ? 'border-rose-400 bg-rose-50/20 focus:border-rose-600 focus:outline-rose-600'
                    : 'border-neutral-300 focus:border-emerald-600'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-700 p-0.5 rounded transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {fieldErrors.password && <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.password}</p>}
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-emerald-700 rounded border-neutral-300 focus:ring-emerald-600"
              />
              <span className="text-neutral-700 font-medium">Remember Me on this device</span>
            </label>
          </div>

          {/* Login Button with Loading Indicator */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-2 transition-colors shadow-xs disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Verifying Credentials against Database...</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Log In to Account</span>
              </>
            )}
          </button>
        </form>

        {/* Register Navigation Link */}
        <div className="text-center pt-3 border-t border-neutral-100 text-xs text-neutral-600">
          <span>Don't have an account? </span>
          <button
            type="button"
            onClick={() => onNavigate('register')}
            className="font-bold text-emerald-800 hover:text-emerald-950 hover:underline transition-colors ml-1"
          >
            Register
          </button>
        </div>
      </div>

      {/* Real Pre-seeded Database Accounts Reference */}
      <div className="bg-emerald-50/70 border border-emerald-200/90 rounded-2xl p-4 text-xs space-y-2.5 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="font-bold text-emerald-950 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-emerald-700" />
            <span>Pre-seeded Database Accounts in MySQL</span>
          </span>
          <span className="text-[11px] text-emerald-700 font-mono">Live Database Enabled</span>
        </div>
        <p className="text-[11px] text-neutral-600 leading-relaxed">
          You can test with any newly registered account from the Register page, or use these pre-seeded accounts verified in the database:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => {
              setEmail('rajapalace@jaffnahalls.lk');
              setPassword('DonorPass123!');
              setErrorMessage(null);
            }}
            className="p-2 rounded-lg border border-emerald-200 bg-white hover:bg-emerald-50 text-left transition-colors"
          >
            <div className="flex items-center gap-1 font-bold text-neutral-900 text-[11px]">
              <Building className="w-3 h-3 text-emerald-700 shrink-0" />
              <span>Food Donor</span>
            </div>
            <div className="text-[10px] text-neutral-500 truncate">rajapalace@jaffnahalls.lk</div>
            <div className="text-[9px] text-emerald-700 font-mono mt-0.5">Pass: DonorPass123!</div>
          </button>

          <button
            type="button"
            onClick={() => {
              setEmail('anbucare@jaffna.lk');
              setPassword('CareHomePass123!');
              setErrorMessage(null);
            }}
            className="p-2 rounded-lg border border-emerald-200 bg-white hover:bg-emerald-50 text-left transition-colors"
          >
            <div className="flex items-center gap-1 font-bold text-neutral-900 text-[11px]">
              <Users className="w-3 h-3 text-teal-700 shrink-0" />
              <span>Care Home</span>
            </div>
            <div className="text-[10px] text-neutral-500 truncate">anbucare@jaffna.lk</div>
            <div className="text-[9px] text-emerald-700 font-mono mt-0.5">Pass: CareHomePass123!</div>
          </button>

          <button
            type="button"
            onClick={() => {
              setEmail('admin@foodshare.lk');
              setPassword('AdminSecurePass123!');
              setErrorMessage(null);
            }}
            className="p-2 rounded-lg border border-emerald-200 bg-white hover:bg-emerald-50 text-left transition-colors"
          >
            <div className="flex items-center gap-1 font-bold text-neutral-900 text-[11px]">
              <Shield className="w-3 h-3 text-neutral-800 shrink-0" />
              <span>Administrator</span>
            </div>
            <div className="text-[10px] text-neutral-500 truncate">admin@foodshare.lk</div>
            <div className="text-[9px] text-emerald-700 font-mono mt-0.5">Pass: AdminSecurePass123!</div>
          </button>
        </div>
      </div>

      {/* Backend Architecture & Database Status */}
      <div className="bg-neutral-100/90 rounded-2xl p-4 border border-neutral-200 text-xs space-y-2 text-neutral-700">
        <button
          type="button"
          onClick={() => setShowDbInfo(!showDbInfo)}
          className="w-full flex items-center justify-between text-left font-semibold text-neutral-800 hover:text-emerald-800 transition-colors"
        >
          <div className="flex items-center gap-1.5">
            <Info className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>Backend API & MySQL Database Status</span>
          </div>
          <span className="text-[11px] text-neutral-500">{showDbInfo ? 'Hide Details' : 'Show Details'}</span>
        </button>

        {showDbInfo && (
          <div className="pt-2 border-t border-neutral-200 text-[11px] text-neutral-600 space-y-2.5 leading-relaxed">
            <p>
              <strong>Status:</strong> The app is connected to the full-stack REST API running at <code className="font-mono text-emerald-900 bg-white px-1.5 py-0.5 rounded border border-neutral-200">/api/auth/login</code> and <code className="font-mono text-emerald-900 bg-white px-1.5 py-0.5 rounded border border-neutral-200">/api/auth/register</code>.
            </p>
            <p>
              <strong>Security:</strong> Passwords are cryptographically verified using salted key derivation. Tokens are issued into the <code className="font-mono text-neutral-800">personal_access_tokens</code> table matching Laravel Sanctum specifications.
            </p>
            <p>
              <strong>XAMPP / Laravel Setup:</strong> Full Laravel backend source code, migrations, and MySQL seed scripts are in the <code className="font-mono text-neutral-800">backend/</code> and <code className="font-mono text-neutral-800">database/</code> folders.
            </p>
          </div>
        )}
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-neutral-200 max-w-md w-full p-6 text-neutral-900 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-base font-bold text-neutral-900">Reset Your Password</h3>
              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(false);
                  setResetError(null);
                  setResetSuccess(null);
                  setMailConfigExplanation(null);
                }}
                className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {resetSuccess ? (
              <div className="py-6 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-bold text-neutral-900">Password Reset Instructions Sent</h4>
                <p className="text-xs text-neutral-600">{resetSuccess}</p>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="px-4 py-2 bg-emerald-700 text-white rounded-lg text-xs font-semibold"
                >
                  Return to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} noValidate className="space-y-4 text-xs">
                {resetError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl leading-relaxed">
                    <p className="font-semibold">{resetError}</p>
                    {mailConfigExplanation && (
                      <p className="text-[11px] mt-1 text-rose-700">{mailConfigExplanation}</p>
                    )}
                  </div>
                )}
                <p className="text-neutral-600 leading-relaxed">
                  Enter your registered FoodShare Lanka email address. The backend will verify your account and dispatch a secure reset link.
                </p>

                <div>
                  <label htmlFor="reset-email-input" className="block font-semibold text-neutral-700 mb-1">
                    Registered Email Address *
                  </label>
                  <input
                    id="reset-email-input"
                    type="email"
                    required
                    placeholder="name@example.lk"
                    value={resetEmail}
                    onChange={(e) => {
                      setResetEmail(e.target.value);
                      if (resetError) setResetError(null);
                    }}
                    className="w-full p-2.5 border border-neutral-300 rounded-lg focus:outline-emerald-600"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="px-3 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isResetting}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg shadow-xs flex items-center gap-1.5 disabled:opacity-75"
                  >
                    {isResetting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Send Reset Link</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
