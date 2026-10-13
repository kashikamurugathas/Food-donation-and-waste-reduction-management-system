/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { DemoBanner } from './components/common/DemoBanner';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { FoodDonationsPage } from './pages/FoodDonationsPage';
import { InstitutionsDirectoryPage } from './pages/InstitutionsDirectoryPage';
import { FoodSafetyPage } from './pages/FoodSafetyPage';
import { ContactPage } from './pages/ContactPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DonorDashboard } from './pages/DonorDashboard';
import { InstitutionDashboard } from './pages/InstitutionDashboard';
import { AdminDashboard } from './pages/AdminDashboard';

// Map of canonical URL paths to internal page identifiers
const PATH_TO_PAGE: Record<string, string> = {
  '/': 'home',
  '/login': 'login',
  '/register': 'register',
  '/about': 'about',
  '/how-it-works': 'howItWorks',
  '/available-food': 'availableFood',
  '/institutions': 'institutions',
  '/food-safety': 'safety',
  '/safety': 'safety',
  '/contact': 'contact',
  '/donor-dashboard': 'donorDashboard',
  '/institution-dashboard': 'institutionDashboard',
  '/admin-dashboard': 'adminDashboard',
};

// Map of page identifiers to canonical URL paths
const PAGE_TO_PATH: Record<string, string> = {
  home: '/',
  login: '/login',
  register: '/register',
  about: '/about',
  howItWorks: '/how-it-works',
  availableFood: '/available-food',
  institutions: '/institutions',
  safety: '/food-safety',
  contact: '/contact',
  donorDashboard: '/donor-dashboard',
  institutionDashboard: '/institution-dashboard',
  adminDashboard: '/admin-dashboard',
};

const PAGE_TITLES: Record<string, string> = {
  home: 'FoodShare Lanka – Share Food, Spread Happiness',
  login: 'Login – FoodShare Lanka',
  register: 'Register – FoodShare Lanka',
  about: 'About Us – FoodShare Lanka',
  howItWorks: 'How It Works – FoodShare Lanka',
  availableFood: 'Available Food Donations – FoodShare Lanka',
  institutions: "Children's Homes & Elders' Homes – FoodShare Lanka",
  safety: 'Food Safety Guidelines – FoodShare Lanka',
  contact: 'Contact Us – FoodShare Lanka',
  donorDashboard: 'Food Donor Dashboard – FoodShare Lanka',
  institutionDashboard: 'Care Institution Dashboard – FoodShare Lanka',
  adminDashboard: 'Admin Control Center – FoodShare Lanka',
};

const parsePageFromCurrentUrl = (): string => {
  if (typeof window === 'undefined') return 'home';
  const pathname = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/';
  if (PATH_TO_PAGE[pathname]) return PATH_TO_PAGE[pathname];

  // Also support hash paths like #/login or #login
  const hash = window.location.hash.toLowerCase().replace(/^#\/?/, '');
  if (hash && PATH_TO_PAGE['/' + hash]) return PATH_TO_PAGE['/' + hash];
  if (hash && PAGE_TO_PATH[hash]) return hash;

  return 'home';
};

const MainApp: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>(() => parsePageFromCurrentUrl());
  const [selectedDonationId, setSelectedDonationId] = useState<string | null>(null);
  const { currentUser, setAuthNotice } = useApp();

  // Route protection and navigation handler
  const navigateTo = useCallback(
    (page: string, replaceUrl: boolean = false) => {
      // 1. Food Donor Dashboard protection
      if (page === 'donorDashboard') {
        if (!currentUser) {
          setAuthNotice(
            'Authentication Required: Please log in with a Food Donor account to access the Donor Dashboard.'
          );
          page = 'login';
        } else if (currentUser.role !== 'donor' && currentUser.role !== 'admin') {
          setAuthNotice(
            `Access Restricted: Your current account is '${currentUser.role}'. Please log in as a Food Donor to access this dashboard.`
          );
          page = 'login';
        }
      }

      // 2. Institution Dashboard protection
      if (page === 'institutionDashboard') {
        if (!currentUser) {
          setAuthNotice(
            "Authentication Required: Please log in with a Care Home / Institution account to access the Institution Dashboard."
          );
          page = 'login';
        } else if (currentUser.role !== 'institution' && currentUser.role !== 'admin') {
          setAuthNotice(
            `Access Restricted: Your current account is '${currentUser.role}'. Please log in as a Care Home to access this dashboard.`
          );
          page = 'login';
        }
      }

      // 3. Admin Dashboard protection
      if (page === 'adminDashboard') {
        if (!currentUser || currentUser.role !== 'admin') {
          setAuthNotice(
            'Administrator Authentication Required: Please sign in with administrator credentials.'
          );
          page = 'login';
        }
      }

      // Update browser history and address bar URL
      const targetPath = PAGE_TO_PATH[page] || '/';
      if (typeof window !== 'undefined' && window.location.pathname !== targetPath) {
        if (replaceUrl) {
          window.history.replaceState({ page }, '', targetPath);
        } else {
          window.history.pushState({ page }, '', targetPath);
        }
      }

      // Update document title
      if (typeof document !== 'undefined') {
        document.title = PAGE_TITLES[page] || 'FoodShare Lanka – Share Food, Spread Happiness';
      }

      setCurrentPage(page);
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    [currentUser, setAuthNotice]
  );

  // Handle browser back and forward button clicks
  useEffect(() => {
    const handlePopState = () => {
      const page = parsePageFromCurrentUrl();
      navigateTo(page, true);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [navigateTo]);

  // Initial load: verify if the loaded page is protected
  useEffect(() => {
    const initialPage = parsePageFromCurrentUrl();
    if (initialPage !== 'home') {
      navigateTo(initialPage, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Guard against logout or role mismatch while on a protected dashboard
  useEffect(() => {
    if (
      !currentUser &&
      (currentPage === 'donorDashboard' ||
        currentPage === 'institutionDashboard' ||
        currentPage === 'adminDashboard')
    ) {
      setAuthNotice('Your session has ended. Please log in to continue.');
      navigateTo('login', true);
    }
  }, [currentUser, currentPage, setAuthNotice, navigateTo]);

  const handleSelectDonation = (id: string) => {
    setSelectedDonationId(id);
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900 font-sans">
      <DemoBanner />
      <Navbar currentPage={currentPage} onNavigate={navigateTo} />

      <main className="flex-1">
        {currentPage === 'home' && (
          <HomePage
            onNavigate={navigateTo}
            onSelectDonation={handleSelectDonation}
          />
        )}
        {currentPage === 'about' && <AboutPage onNavigate={navigateTo} />}
        {currentPage === 'howItWorks' && <HowItWorksPage onNavigate={navigateTo} />}
        {currentPage === 'availableFood' && (
          <FoodDonationsPage
            onNavigate={navigateTo}
            selectedDonationId={selectedDonationId}
          />
        )}
        {currentPage === 'institutions' && <InstitutionsDirectoryPage />}
        {currentPage === 'safety' && <FoodSafetyPage />}
        {currentPage === 'contact' && <ContactPage />}
        {currentPage === 'login' && <LoginPage onNavigate={navigateTo} />}
        {currentPage === 'register' && <RegisterPage onNavigate={navigateTo} />}
        {currentPage === 'donorDashboard' && <DonorDashboard onNavigate={navigateTo} />}
        {currentPage === 'institutionDashboard' && <InstitutionDashboard onNavigate={navigateTo} />}
        {currentPage === 'adminDashboard' && <AdminDashboard />}
      </main>

      <Footer onNavigate={navigateTo} />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
