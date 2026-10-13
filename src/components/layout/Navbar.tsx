import React, { useState } from 'react';
import {
  Menu,
  X,
  Bell,
  HeartHandshake,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  const {
    currentUser,
    currentRole,
    loginAs,
    logout,
    language,
    setLanguage,
    t,
    notifications,
    markNotificationRead,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const unreadNotifications = notifications.filter((n) => !n.isRead);

  const handleNav = (page: string) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element Brand wordmark */}
          <button
            onClick={() => handleNav('home')}
            className="flex items-center gap-2.5 text-left text-emerald-800 hover:text-emerald-950 transition-colors whitespace-nowrap shrink-0"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white shadow-xs">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-emerald-900 font-sans">
              FoodShare Lanka
            </span>
          </button>

          {/* Zone 2: 4-5 clean single-line nav links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-600">
            <button
              onClick={() => handleNav('home')}
              className={`hover:text-emerald-700 transition-colors whitespace-nowrap shrink-0 ${
                currentPage === 'home' ? 'text-emerald-700 font-semibold' : ''
              }`}
            >
              {t.nav.home}
            </button>
            <button
              onClick={() => handleNav('availableFood')}
              className={`hover:text-emerald-700 transition-colors whitespace-nowrap shrink-0 ${
                currentPage === 'availableFood' ? 'text-emerald-700 font-semibold' : ''
              }`}
            >
              {t.nav.availableFood}
            </button>
            <button
              onClick={() => handleNav('institutions')}
              className={`hover:text-emerald-700 transition-colors whitespace-nowrap shrink-0 ${
                currentPage === 'institutions' ? 'text-emerald-700 font-semibold' : ''
              }`}
            >
              {t.nav.institutions}
            </button>
            <button
              onClick={() => handleNav('howItWorks')}
              className={`hover:text-emerald-700 transition-colors whitespace-nowrap shrink-0 ${
                currentPage === 'howItWorks' ? 'text-emerald-700 font-semibold' : ''
              }`}
            >
              {t.nav.howItWorks}
            </button>
            <button
              onClick={() => handleNav('safety')}
              className={`hover:text-emerald-700 transition-colors whitespace-nowrap shrink-0 ${
                currentPage === 'safety' ? 'text-emerald-700 font-semibold' : ''
              }`}
            >
              {t.nav.safety}
            </button>
            <button
              onClick={() => handleNav('about')}
              className={`hover:text-emerald-700 transition-colors whitespace-nowrap shrink-0 ${
                currentPage === 'about' ? 'text-emerald-700 font-semibold' : ''
              }`}
            >
              {t.nav.about}
            </button>
            <button
              onClick={() => handleNav('contact')}
              className={`hover:text-emerald-700 transition-colors whitespace-nowrap shrink-0 ${
                currentPage === 'contact' ? 'text-emerald-700 font-semibold' : ''
              }`}
            >
              {t.nav.contact}
            </button>
          </nav>

          {/* Zone 3: 1 primary action area + controls */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Language Selector Toggle */}
            <div className="flex items-center bg-neutral-100 p-0.5 rounded-lg border border-neutral-200 text-xs">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded font-medium transition-colors ${
                  language === 'en'
                    ? 'bg-white text-emerald-900 shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
                title="Switch to English"
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('ta')}
                className={`px-2 py-1 rounded font-medium transition-colors ${
                  language === 'ta'
                    ? 'bg-white text-emerald-900 shadow-xs font-tamil'
                    : 'text-neutral-600 hover:text-neutral-900 font-tamil'
                }`}
                title="தமிழுக்கு மாற்றுக"
              >
                தமிழ்
              </button>
            </div>

            {/* In-app Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="relative p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                title="Notifications"
                aria-label="View notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center font-mono">
                    {unreadNotifications.length}
                  </span>
                )}
              </button>

              {/* Notification Menu */}
              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-neutral-200 rounded-xl shadow-lg p-3 z-50">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-100">
                    <span className="text-xs font-semibold text-neutral-900">Notifications</span>
                    <span className="text-[11px] text-neutral-500 font-mono">
                      {unreadNotifications.length} unread
                    </span>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-neutral-400 py-3 text-center">No notifications yet</p>
                    ) : (
                      notifications.slice(0, 5).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            markNotificationRead(n.id);
                            if (n.type === 'request') handleNav('donorDashboard');
                            if (n.type === 'approval') handleNav('institutionDashboard');
                          }}
                          className={`p-2 rounded-lg cursor-pointer text-xs transition-colors ${
                            n.isRead ? 'bg-neutral-50 text-neutral-600' : 'bg-emerald-50/80 text-emerald-950 font-medium'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-neutral-900">{n.title}</span>
                            <span className="text-[10px] text-neutral-400 font-mono">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[11px] text-neutral-600 mt-0.5 line-clamp-2">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Role Switcher for Seamless Testing */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 rounded-lg transition-colors whitespace-nowrap"
                title="Switch active user role for testing"
              >
                <span>Role:</span>
                <span className="font-semibold text-emerald-800 capitalize">
                  {currentRole === 'donor'
                    ? 'Donor'
                    : currentRole === 'institution'
                    ? 'Care Home'
                    : currentRole === 'admin'
                    ? 'Admin'
                    : 'Guest'}
                </span>
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-52 bg-white border border-neutral-200 rounded-xl shadow-lg p-2 z-50 text-xs">
                  <div className="px-2 py-1 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                    Switch Test Persona
                  </div>
                  <button
                    onClick={() => {
                      loginAs('donor');
                      setShowRoleMenu(false);
                      handleNav('donorDashboard');
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between hover:bg-emerald-50 ${
                      currentRole === 'donor' ? 'font-semibold text-emerald-800 bg-emerald-50/70' : 'text-neutral-700'
                    }`}
                  >
                    <span>Food Donor (Wedding Hall)</span>
                    {currentRole === 'donor' && <Check className="w-3.5 h-3.5 text-emerald-700" />}
                  </button>
                  <button
                    onClick={() => {
                      loginAs('institution');
                      setShowRoleMenu(false);
                      handleNav('institutionDashboard');
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between hover:bg-emerald-50 ${
                      currentRole === 'institution' ? 'font-semibold text-emerald-800 bg-emerald-50/70' : 'text-neutral-700'
                    }`}
                  >
                    <span>Care Home (Children/Elders)</span>
                    {currentRole === 'institution' && <Check className="w-3.5 h-3.5 text-emerald-700" />}
                  </button>
                  <button
                    onClick={() => {
                      loginAs('admin');
                      setShowRoleMenu(false);
                      handleNav('adminDashboard');
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between hover:bg-emerald-50 ${
                      currentRole === 'admin' ? 'font-semibold text-emerald-800 bg-emerald-50/70' : 'text-neutral-700'
                    }`}
                  >
                    <span>Administrator</span>
                    {currentRole === 'admin' && <Check className="w-3.5 h-3.5 text-emerald-700" />}
                  </button>
                </div>
              )}
            </div>

            {/* Primary Action Button */}
            {currentUser ? (
              <button
                onClick={() => {
                  if (currentRole === 'donor') handleNav('donorDashboard');
                  else if (currentRole === 'institution') handleNav('institutionDashboard');
                  else if (currentRole === 'admin') handleNav('adminDashboard');
                  else handleNav('login');
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors whitespace-nowrap shadow-xs"
              >
                {t.nav.dashboard}
              </button>
            ) : (
              <button
                onClick={() => handleNav('login')}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors whitespace-nowrap shadow-xs"
              >
                {t.nav.login}
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-neutral-600 hover:text-neutral-900"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-200 bg-white px-4 pt-3 pb-5 space-y-2">
          <button
            onClick={() => handleNav('home')}
            className="block w-full text-left py-2 text-sm font-medium text-neutral-700"
          >
            {t.nav.home}
          </button>
          <button
            onClick={() => handleNav('availableFood')}
            className="block w-full text-left py-2 text-sm font-medium text-neutral-700"
          >
            {t.nav.availableFood}
          </button>
          <button
            onClick={() => handleNav('institutions')}
            className="block w-full text-left py-2 text-sm font-medium text-neutral-700"
          >
            {t.nav.institutions}
          </button>
          <button
            onClick={() => handleNav('howItWorks')}
            className="block w-full text-left py-2 text-sm font-medium text-neutral-700"
          >
            {t.nav.howItWorks}
          </button>
          <button
            onClick={() => handleNav('safety')}
            className="block w-full text-left py-2 text-sm font-medium text-neutral-700"
          >
            {t.nav.safety}
          </button>
          <button
            onClick={() => handleNav('about')}
            className="block w-full text-left py-2 text-sm font-medium text-neutral-700"
          >
            {t.nav.about}
          </button>
          <button
            onClick={() => handleNav('contact')}
            className="block w-full text-left py-2 text-sm font-medium text-neutral-700"
          >
            {t.nav.contact}
          </button>

          <div className="pt-3 border-t border-neutral-200 space-y-2">
            <div className="text-xs font-semibold text-neutral-500">Switch Role:</div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  loginAs('donor');
                  handleNav('donorDashboard');
                }}
                className={`py-1.5 px-2 text-center rounded text-xs border ${
                  currentRole === 'donor' ? 'bg-emerald-50 border-emerald-500 font-bold text-emerald-900' : 'bg-neutral-50'
                }`}
              >
                Donor
              </button>
              <button
                onClick={() => {
                  loginAs('institution');
                  handleNav('institutionDashboard');
                }}
                className={`py-1.5 px-2 text-center rounded text-xs border ${
                  currentRole === 'institution' ? 'bg-emerald-50 border-emerald-500 font-bold text-emerald-900' : 'bg-neutral-50'
                }`}
              >
                Care Home
              </button>
              <button
                onClick={() => {
                  loginAs('admin');
                  handleNav('adminDashboard');
                }}
                className={`py-1.5 px-2 text-center rounded text-xs border ${
                  currentRole === 'admin' ? 'bg-emerald-50 border-emerald-500 font-bold text-emerald-900' : 'bg-neutral-50'
                }`}
              >
                Admin
              </button>
            </div>
            {currentUser && (
              <button
                onClick={() => {
                  logout();
                  handleNav('home');
                }}
                className="w-full text-center py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded"
              >
                {t.nav.logout}
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
