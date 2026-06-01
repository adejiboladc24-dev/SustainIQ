import React, { useState } from 'react';
import { SustainIQProvider, useSustainIQ } from './context/SustainIQContext';
import { Onboarding } from './components/Onboarding';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Metrics } from './components/Metrics';
import { Analytics } from './components/Analytics';
import { Map } from './components/Map';
import { Challenges } from './components/Challenges';
import { Assistant } from './components/Assistant';
import { TierUpModal } from './components/TierUpModal';

const PAGE_TITLES: Record<string, string> = {
  dashboard: 'Dashboard',
  metrics: 'Metrics',
  analytics: 'Analytics',
  map: 'Eco Map',
  challenges: 'Challenges',
  assistant: 'AI Assistant',
};

const AppContent: React.FC = () => {
  const { profile, tierUpModal, portfolioMode } = useSustainIQ();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (!profile) return <Onboarding />;

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':   return <Dashboard />;
      case 'metrics':     return <Metrics />;
      case 'analytics':   return <Analytics />;
      case 'map':         return <Map />;
      case 'challenges':  return <Challenges />;
      case 'assistant':   return <Assistant />;
      default:            return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />

      <div className="ml-64 flex flex-col min-h-screen">
        {/* Top header bar */}
        <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/60 px-8 py-4 transition-colors duration-300">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <h1 className="text-slate-900 dark:text-white font-semibold">
              {PAGE_TITLES[currentPage]}
            </h1>
            {portfolioMode && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-400/10 border border-amber-400/30 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-amber-500 dark:text-amber-400 text-xs font-medium">
                  System Inspect Mode Active
                </span>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-8 py-6">
          <div className="max-w-6xl mx-auto">
            {renderPage()}
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 dark:border-slate-800/60 px-8 py-4 mt-auto transition-colors duration-300">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center">
                <span className="text-emerald-500 text-[10px]">S</span>
              </div>
              <span className="text-slate-400 dark:text-slate-600 text-xs">
                SustainIQ · Environmental Intelligence Platform
              </span>
            </div>
            {portfolioMode && (
              <div className="flex items-center gap-3 text-[10px] text-slate-400 dark:text-slate-600 flex-wrap justify-end">
                <span>React 18 + Vite</span>
                <span>·</span>
                <span>TypeScript</span>
                <span>·</span>
                <span>Tailwind CSS</span>
                <span>·</span>
                <span>Recharts</span>
                <span>·</span>
                <span>React-Leaflet</span>
                <span>·</span>
                <span>OpenWeatherMap API</span>
              </div>
            )}
          </div>
        </footer>
      </div>

      {tierUpModal.show && tierUpModal.tier && (
        <TierUpModal tier={tierUpModal.tier} />
      )}
    </div>
  );
};

function App() {
  return (
    <SustainIQProvider>
      <AppContent />
    </SustainIQProvider>
  );
}

export default App;
