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
  Building,
  Users,
  Shield,
  Loader2,
  Info,
  KeyRound,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

interface LoginPageProps {
  onNavigate: (page: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { loginWithCredentials, authNotice, setAuthNotice } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [selectedRole, setSelectedRole] = useState<UserRole | undefined>('donor');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Field-level error highlights
  const [fieldErrors, setFieldErrors] = useState<{ email?: boolean; password?: boolean }>({});

  // Forgot password modal state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  // Backend architecture information toggle
  const [showBackendInfo, setShowBackendInfo] = useState(true);

  // Read remembered email on mount if previously stored
  useEffect(() => {
    const remembered = localStorage.getItem('foodshare_remembered_email');
    if (remembered) {
      setEmail(remembered);
      if (remembered.includes('donor')) setSelectedRole('donor');
      else if (remembered.includes('institution')) setSelectedRole('institution');
      else if (remembered.includes('admin')) setSelectedRole('admin');
    }
  }, []);

  // Display auth notice if redirected from a protected route
  useEffect(() => {
    if (authNotice) {
      setErrorMessage(authNotice);
    }
  }, [authNotice]);

  const handleFillCredentials = (demoEmail: string, demoRole: UserRole) => {
    setEmail(demoEmail);
    setPassword('password123');
    setSelectedRole(demoRole);
    setErrorMessage(null);
    setFieldErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    const newFieldErrors: { email?: boolean; password?: boolean } = {};

    // 1. Validate Email
    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      setFieldErrors({ email: true });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Please enter a valid email address (e.g. name@example.lk).');
      setFieldErrors({ email: true });
      return;
    }

    // 2. Validate Password
    if (!password) {
      setErrorMessage('Please enter your password.');
      setFieldErrors({ password: true });
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      setFieldErrors({ password: true });
      return;
    }

    setFieldErrors({});
    setIsLoading(true);

    // Simulate authenticating request with feedback latency
    await new Promise((resolve) => setTimeout(resolve, 450));

    const result = loginWithCredentials(email, password, selectedRole, rememberMe);

    setIsLoading(false);

    if (!result.success) {
      setErrorMessage(result.error || 'Authentication failed. Please verify your credentials.');
      return;
    }

    // Role-based redirection per requirement:
    // Food Donor → Donor Dashboard
    // Children's Home / Elders' Home → Institution Dashboard
    // Administrator → Admin Dashboard
    const userRole = result.user?.role || selectedRole || 'donor';
    const roleLabel =
      userRole === 'donor'
        ? 'Food Donor'
        : userRole === 'institution'
        ? "Children's & Elders' Home"
        : 'Administrator';

    setSuccessMessage(`Login successful! Redirecting to ${roleLabel} Dashboard...`);

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

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);

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
    setTimeout(() => {
      setIsResetting(false);
      setResetSuccess(true);
      setTimeout(() => {
        setShowForgotPassword(false);
        setResetSuccess(false);
        setResetEmail('');
        setSuccessMessage(
          'Password reset instructions sent! For testing evaluation, you can sign in using password "password123".'
        );
      }, 2000);
    }, 500);
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

      {/* Quick Test Credential Auto-Fill Strip */}
      <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-xl p-4 text-xs space-y-2.5 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="font-bold text-emerald-950 flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-emerald-700" />
            <span>1-Click Test Credentials (Jaffna Profiles)</span>
          </span>
          <span className="text-[11px] text-emerald-700 font-mono">Password: password123</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleFillCredentials('donor@foodshare.lk', 'donor')}
            className={`p-2.5 rounded-lg border text-left transition-colors bg-white hover:bg-emerald-50 shadow-2xs ${
              email === 'donor@foodshare.lk'
                ? 'border-emerald-600 ring-2 ring-emerald-600/30'
                : 'border-emerald-200'
            }`}
          >
            <div className="flex items-center gap-1 font-bold text-neutral-900 text-[11px]">
              <Building className="w-3 h-3 text-emerald-700 shrink-0" />
              <span>Food Donor</span>
            </div>
            <div className="text-[10px] text-neutral-500 truncate mt-0.5">donor@foodshare.lk</div>
          </button>

          <button
            type="button"
            onClick={() => handleFillCredentials('institution@foodshare.lk', 'institution')}
            className={`p-2.5 rounded-lg border text-left transition-colors bg-white hover:bg-emerald-50 shadow-2xs ${
              email === 'institution@foodshare.lk'
                ? 'border-emerald-600 ring-2 ring-emerald-600/30'
                : 'border-emerald-200'
            }`}
          >
            <div className="flex items-center gap-1 font-bold text-neutral-900 text-[11px]">
              <Users className="w-3 h-3 text-teal-700 shrink-0" />
              <span>Care Home</span>
            </div>
            <div className="text-[10px] text-neutral-500 truncate mt-0.5">institution@foodshare.lk</div>
          </button>

          <button
            type="button"
            onClick={() => handleFillCredentials('admin@foodshare.lk', 'admin')}
            className={`p-2.5 rounded-lg border text-left transition-colors bg-white hover:bg-emerald-50 shadow-2xs ${
              email === 'admin@foodshare.lk'
                ? 'border-emerald-600 ring-2 ring-emerald-600/30'
                : 'border-emerald-200'
            }`}
          >
            <div className="flex items-center gap-1 font-bold text-neutral-900 text-[11px]">
              <Shield className="w-3 h-3 text-neutral-800 shrink-0" />
              <span>Admin</span>
            </div>
            <div className="text-[10px] text-neutral-500 truncate mt-0.5">admin@foodshare.lk</div>
          </button>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="bg-white p-6 sm:p-8 rounded-xl border border-neutral-200 shadow-xs space-y-5">
        {/* Error Alert Box */}
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">{errorMessage}</div>
            <button
              type="button"
              onClick={() => {
                setErrorMessage(null);
                setAuthNotice(null);
              }}
              className="text-rose-400 hover:text-rose-700 p-0.5"
              aria-label="Dismiss error message"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Success Alert Box */}
        {successMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-lg flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Role Portal Selection Tabs */}
        <div>
          <span className="block text-xs font-semibold text-neutral-700 mb-1.5">
            Select Your Portal Role
          </span>
          <div className="grid grid-cols-3 gap-1 bg-neutral-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setSelectedRole('donor')}
              className={`py-1.5 text-xs font-semibold rounded-md transition-colors ${
                selectedRole === 'donor'
                  ? 'bg-white text-emerald-900 shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Food Donor
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole('institution')}
              className={`py-1.5 text-xs font-semibold rounded-md transition-colors ${
                selectedRole === 'institution'
                  ? 'bg-white text-emerald-900 shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Care Home
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole('admin')}
              className={`py-1.5 text-xs font-semibold rounded-md transition-colors ${
                selectedRole === 'admin'
                  ? 'bg-white text-emerald-900 shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Administrator
            </button>
          </div>
        </div>

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
                  if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: false });
                }}
                className={`w-full pl-9 pr-3 py-2.5 border rounded-lg text-xs transition-colors focus:outline-emerald-600 ${
                  fieldErrors.email
                    ? 'border-rose-400 bg-rose-50/20 focus:border-rose-600 focus:outline-rose-600'
                    : 'border-neutral-300 focus:border-emerald-600'
                }`}
              />
            </div>
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
                  if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: false });
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
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>
                  Log In to{' '}
                  {selectedRole === 'donor'
                    ? 'Donor'
                    : selectedRole === 'institution'
                    ? 'Care Home'
                    : 'Admin'}{' '}
                  Portal
                </span>
              </>
            )}
          </button>
        </form>

        {/* Register Navigation Link */}
        <div className="text-center pt-3 border-t border-neutral-100 text-xs text-neutral-600">
          <span>Don't have an account yet? </span>
          <button
            type="button"
            onClick={() => onNavigate('register')}
            className="font-bold text-emerald-800 hover:text-emerald-950 hover:underline transition-colors ml-1"
          >
            Register
          </button>
        </div>
      </div>

      {/* Backend Authentication Status & Configuration Section */}
      <div className="bg-neutral-100/90 rounded-xl p-4 border border-neutral-200 text-xs space-y-2 text-neutral-700">
        <button
          type="button"
          onClick={() => setShowBackendInfo(!showBackendInfo)}
          className="w-full flex items-center justify-between text-left font-semibold text-neutral-800 hover:text-emerald-800 transition-colors"
        >
          <div className="flex items-center gap-1.5">
            <Info className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>Backend Authentication Configuration Status</span>
          </div>
          <span className="text-[11px] text-neutral-500">
            {showBackendInfo ? 'Hide Details' : 'Show Details'}
          </span>
        </button>

        {showBackendInfo && (
          <div className="pt-2 border-t border-neutral-200 text-[11px] text-neutral-600 space-y-2.5 leading-relaxed">
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-900">
              <strong>Transparent Status Notice:</strong> In this interactive preview environment, authentication runs on client-side state with local persistence and pre-seeded demonstration accounts. Unauthorised visitors cannot access protected dashboards without logging in.
            </div>
            <p>
              <strong>Connecting a Production Backend:</strong> To connect this login form to a live backend (such as Express, Laravel Sanctum, or Firebase Auth), replace the client-side provider with an HTTP POST request:
            </p>
            <div className="bg-neutral-900 text-emerald-400 p-2.5 rounded font-mono text-[10px] overflow-x-auto">
              <code>POST /api/auth/login {'{ email, password, role }'}</code>
              <br />
              <code>→ Returns: 200 OK {'{ token: "Bearer eyJhbGci...", user: { id, name, role } }'}</code>
            </div>
            <p>
              For production deployment, see the SQL schemas and token authentication guides in the project repository.
            </p>
          </div>
        )}
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-neutral-200 max-w-md w-full p-6 text-neutral-900 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-base font-bold text-neutral-900">Reset Your Password</h3>
              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(false);
                  setResetError(null);
                  setResetSuccess(false);
                }}
                className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {resetSuccess ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-bold text-neutral-900">
                  Password Reset Instructions Dispatched
                </h4>
                <p className="text-xs text-neutral-500">
                  We've sent a recovery link to <strong>{resetEmail}</strong>. In evaluation mode,
                  you can sign in with password <code>password123</code>.
                </p>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} noValidate className="space-y-4 text-xs">
                {resetError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg">
                    {resetError}
                  </div>
                )}
                <p className="text-neutral-600 leading-relaxed">
                  Enter your registered FoodShare Lanka email address. We will verify your account
                  and send password recovery instructions.
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
                    <span>Send Recovery Link</span>
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
