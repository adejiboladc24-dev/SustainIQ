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
import {
  LayoutDashboard, BarChart3, Zap, Map as MapIcon, Leaf, MessageSquare,
} from 'lucide-react';

const PAGE_TITLES: Record<string, string> = {
  dashboard: 'Dashboard',
  metrics: 'Metrics',
  analytics: 'Analytics',
  map: 'Eco Map',
  challenges: 'Challenges',
  assistant: 'AI Assistant',
};

const BOTTOM_NAV = [
  { id: 'dashboard',  icon: LayoutDashboard, label: 'Home' },
  { id: 'metrics',    icon: BarChart3,        label: 'Metrics' },
  { id: 'analytics',  icon: Zap,              label: 'Analytics' },
  { id: 'map',        icon: MapIcon,          label: 'Map' },
  { id: 'challenges', icon: Leaf,             label: 'Challenges' },
  { id: 'assistant',  icon: MessageSquare,    label: 'AI' },
];

const AppContent: React.FC = () => {
  const { profile, tierUpModal, portfolioMode } = useSustainIQ();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!profile) return <Onboarding />;

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':  return <Dashboard />;
      case 'metrics':    return <Metrics />;
      case 'analytics':  return <Analytics />;
      case 'map':        return <Map />;
      case 'challenges': return <Challenges />;
      case 'assistant':  return <Assistant />;
      default:           return <Dashboard />;
    }
  };

  const handlePageChange = (page: string) => {
    setCurrentPage(page);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300">

      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — hidden on mobile unless open */}
      <Sidebar
        currentPage={currentPage}
        onPageChange={handlePageChange}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content area */}
      <div className="lg:ml-64 flex flex-col min-h-screen pb-16 lg:pb-0">

        {/* Top header */}
        <header className="sticky top-0 z-20 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/60 px-4 sm:px-6 lg:px-8 py-3.5 transition-colors duration-300">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* Hamburger — mobile only */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                aria-label="Open menu"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-slate-900 dark:text-white font-semibold text-sm sm:text-base">
                {PAGE_TITLES[currentPage]}
              </h1>
            </div>

            {portfolioMode && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-amber-400/10 border border-amber-400/30 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-amber-500 dark:text-amber-400 text-xs font-medium whitespace-nowrap">
                  Inspect Mode
                </span>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-5">
          <div className="max-w-6xl mx-auto">
            {renderPage()}
          </div>
        </main>

        {/* Footer — desktop only */}
        <footer className="hidden lg:block border-t border-slate-200 dark:border-slate-800/60 px-8 py-4 mt-auto transition-colors duration-300">
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
                <span>React 18 + Vite</span><span>·</span>
                <span>TypeScript</span><span>·</span>
                <span>Tailwind CSS</span><span>·</span>
                <span>Recharts</span><span>·</span>
                <span>React-Leaflet</span><span>·</span>
                <span>OpenWeatherMap API</span>
              </div>
            )}
          </div>
        </footer>
      </div>

      {/* Bottom nav — mobile only */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800/80 px-2 py-1 transition-colors duration-300">
        <div className="flex items-center justify-around">
          {BOTTOM_NAV.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => handlePageChange(id)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all min-w-0 flex-1 ${
                currentPage === id
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-[9px] font-medium truncate">{label}</span>
              {currentPage === id && (
                <div className="w-1 h-1 rounded-full bg-emerald-500 dark:bg-emerald-400" />
              )}
            </button>
          ))}
        </div>
      </nav>

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
