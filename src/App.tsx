import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AudioPlayerBar } from './components/AudioPlayerBar';
import { AuthModal } from './components/AuthModal';
import { SetupGuideModal } from './components/SetupGuideModal';
import { ToastContainer } from './components/ToastContainer';

import { LandingPage } from './pages/LandingPage';
import { StudioPage } from './pages/StudioPage';
import { VoiceLibraryPage } from './pages/VoiceLibraryPage';
import { HistoryPage } from './pages/HistoryPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { PricingPage } from './pages/PricingPage';
import { DashboardPage } from './pages/DashboardPage';

const AppContent: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors font-sans antialiased selection:bg-indigo-500 selection:text-white pb-20">
      <Navbar />

      <main className="flex-1">
        {activeTab === 'home' && <LandingPage />}
        {activeTab === 'studio' && <StudioPage />}
        {activeTab === 'voices' && <VoiceLibraryPage />}
        {activeTab === 'history' && <HistoryPage />}
        {activeTab === 'projects' && <ProjectsPage />}
        {activeTab === 'pricing' && <PricingPage />}
        {activeTab === 'dashboard' && <DashboardPage />}
      </main>

      <Footer />

      {/* Global Modals & Controls */}
      <AudioPlayerBar />
      <AuthModal />
      <SetupGuideModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
