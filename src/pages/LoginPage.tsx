import React, { useState } from 'react';
import { HeartHandshake, LogIn, Shield, Users, Building, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

interface LoginPageProps {
  onNavigate: (page: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { loginAs, loginWithCredentials } = useApp();
  const [role, setRole] = useState<UserRole>('donor');
  const [email, setEmail] = useState('donor@foodshare.lk');
  const [password, setPassword] = useState('••••••••');
  const [error, setError] = useState('');

  const handleRoleSelect = (r: UserRole) => {
    setRole(r);
    if (r === 'donor') setEmail('donor@foodshare.lk');
    else if (r === 'institution') setEmail('institution@foodshare.lk');
    else if (r === 'admin') setEmail('admin@foodshare.lk');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please provide your registered email address.');
      return;
    }
    const success = loginWithCredentials(email, role);
    if (success) {
      if (role === 'donor') onNavigate('donorDashboard');
      else if (role === 'institution') onNavigate('institutionDashboard');
      else if (role === 'admin') onNavigate('adminDashboard');
    }
  };

  const handleQuickDemoLogin = (r: UserRole) => {
    loginAs(r);
    if (r === 'donor') onNavigate('donorDashboard');
    else if (r === 'institution') onNavigate('institutionDashboard');
    else if (r === 'admin') onNavigate('adminDashboard');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-8">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center mx-auto shadow-sm">
          <HeartHandshake className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-neutral-900">Sign in to FoodShare Lanka</h1>
        <p className="text-xs text-neutral-500">
          Access your donor, care home, or administrator portal in Jaffna.
        </p>
      </div>

      {/* Instant 1-Click Persona Testing Strip */}
      <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-4 text-xs space-y-2.5">
        <span className="font-bold text-emerald-950 block">Instant 1-Click Evaluation Sign In:</span>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleQuickDemoLogin('donor')}
            className="p-2 bg-white hover:bg-emerald-100 border border-emerald-300 rounded-lg text-center transition-colors shadow-2xs"
          >
            <Building className="w-4 h-4 text-emerald-700 mx-auto mb-1" />
            <span className="font-semibold text-neutral-800 block text-[11px]">Food Donor</span>
            <span className="text-[10px] text-neutral-500">Wedding Hall</span>
          </button>
          <button
            onClick={() => handleQuickDemoLogin('institution')}
            className="p-2 bg-white hover:bg-emerald-100 border border-emerald-300 rounded-lg text-center transition-colors shadow-2xs"
          >
            <Users className="w-4 h-4 text-teal-700 mx-auto mb-1" />
            <span className="font-semibold text-neutral-800 block text-[11px]">Care Home</span>
            <span className="text-[10px] text-neutral-500">Children/Elders</span>
          </button>
          <button
            onClick={() => handleQuickDemoLogin('admin')}
            className="p-2 bg-white hover:bg-emerald-100 border border-emerald-300 rounded-lg text-center transition-colors shadow-2xs"
          >
            <Shield className="w-4 h-4 text-neutral-800 mx-auto mb-1" />
            <span className="font-semibold text-neutral-800 block text-[11px]">Admin</span>
            <span className="text-[10px] text-neutral-500">Platform Desk</span>
          </button>
        </div>
      </div>

      {/* Standard Form */}
      <div className="bg-white p-6 sm:p-8 rounded-xl border border-neutral-200 shadow-xs space-y-5">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg">
            {error}
          </div>
        )}

        {/* Role Selector Tabs */}
        <div>
          <span className="block text-xs font-medium text-neutral-700 mb-1.5">Sign In As</span>
          <div className="grid grid-cols-3 gap-1 bg-neutral-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => handleRoleSelect('donor')}
              className={`py-1.5 text-xs font-semibold rounded-md transition-colors ${
                role === 'donor' ? 'bg-white text-emerald-900 shadow-2xs' : 'text-neutral-600'
              }`}
            >
              Donor
            </button>
            <button
              type="button"
              onClick={() => handleRoleSelect('institution')}
              className={`py-1.5 text-xs font-semibold rounded-md transition-colors ${
                role === 'institution' ? 'bg-white text-emerald-900 shadow-2xs' : 'text-neutral-600'
              }`}
            >
              Institution
            </button>
            <button
              type="button"
              onClick={() => handleRoleSelect('admin')}
              className={`py-1.5 text-xs font-semibold rounded-md transition-colors ${
                role === 'admin' ? 'bg-white text-emerald-900 shadow-2xs' : 'text-neutral-600'
              }`}
            >
              Admin
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label htmlFor="login-email" className="block font-medium text-neutral-700 mb-1">Email Address</label>
            <input
              id="login-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 border border-neutral-300 rounded-lg focus:outline-emerald-600"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="login-password" className="font-medium text-neutral-700">Password</label>
              <a href="#forgot" onClick={(e) => e.preventDefault()} className="text-[11px] text-emerald-700 hover:underline">
                Forgot?
              </a>
            </div>
            <input
              id="login-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2.5 border border-neutral-300 rounded-lg font-mono focus:outline-emerald-600"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In to Portal</span>
          </button>
        </form>

        <div className="text-center pt-2 border-t border-neutral-100 text-xs text-neutral-500">
          Don't have an account yet?{' '}
          <button
            onClick={() => onNavigate('register')}
            className="font-semibold text-emerald-800 hover:underline"
          >
            Register Here
          </button>
        </div>
      </div>
    </div>
  );
};
