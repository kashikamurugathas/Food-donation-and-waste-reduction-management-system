/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
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

const MainApp: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [selectedDonationId, setSelectedDonationId] = useState<string | null>(null);
  const { currentRole } = useApp();

  // Scroll to top on navigation
  const navigateTo = (page: string) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
