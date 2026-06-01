import React, { useState } from 'react';
import {
  Leaf,
  LayoutDashboard,
  BarChart3,
  Map,
  Zap,
  MessageSquare,
  LogOut,
  Eye,
  EyeOff,
  Sun,
  Moon,
} from 'lucide-react';
import { useSustainIQ, TIERS } from '../context/SustainIQContext';
import { SignOutModal } from './SignOutModal';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'metrics', label: 'Metrics', icon: BarChart3 },
  { id: 'analytics', label: 'Analytics', icon: Zap },
  { id: 'map', label: 'Eco Map', icon: Map },
  { id: 'challenges', label: 'Challenges', icon: Leaf },
  { id: 'assistant', label: 'AI Assistant', icon: MessageSquare },
];

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange }) => {
  const {
    profile,
    stats,
    currentTier,
    signOut,
    portfolioMode,
    setPortfolioMode,
    isDark,
    toggleTheme,
  } = useSustainIQ();

  const [showSignOut, setShowSignOut] = useState(false);

  const nextTier = TIERS[stats.tierIndex + 1];
  const progressPct = nextTier
    ? Math.min(
        ((stats.xp - currentTier.minXP) / (nextTier.minXP - currentTier.minXP)) * 100,
        100
      )
    : 100;

  const handleSignOut = () => {
    setShowSignOut(false);
    signOut();
  };

  return (
    <>
      <aside className="w-64 bg-white/80 dark:bg-slate-900/60 border-r border-slate-200 dark:border-slate-800/80 backdrop-blur-xl fixed left-0 top-0 h-screen flex flex-col z-30 transition-colors duration-300">

        {/* Logo */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center">
                <Leaf className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-none">
                  SustainIQ
                </h1>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                  Intelligence Platform
                </p>
              </div>
            </div>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600 transition-all"
            >
              {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* User profile card */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800/60">
          <div className="bg-slate-100 dark:bg-slate-800/40 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-slate-900 flex-shrink-0"
                style={{ background: currentTier.color }}
              >
                {profile?.name?.charAt(0).toUpperCase() ?? 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-slate-900 dark:text-white font-semibold text-sm truncate">
                  {profile?.name ?? 'User'}
                </p>
                <p className="text-slate-400 dark:text-slate-500 text-xs truncate">
                  {profile?.city ?? 'Lagos'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold" style={{ color: currentTier.color }}>
                {currentTier.name}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">{stats.xp} XP</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${progressPct}%`,
                  background: `linear-gradient(90deg, ${currentTier.color}, ${TIERS[Math.min(stats.tierIndex + 1, TIERS.length - 1)].color})`,
                }}
              />
            </div>
            {nextTier && (
              <p className="text-[10px] text-slate-400 dark:text-slate-600 mt-1">
                {nextTier.minXP - stats.xp} XP to {nextTier.name}
              </p>
            )}

            <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700/50">
              <div className="text-center">
                <p className="text-emerald-500 font-bold text-sm">{stats.currentStreak}</p>
                <p className="text-slate-400 dark:text-slate-600 text-[10px]">Streak</p>
              </div>
              <div className="text-center">
                <p className="text-teal-500 font-bold text-sm">{stats.totalHabits}</p>
                <p className="text-slate-400 dark:text-slate-600 text-[10px]">Habits</p>
              </div>
              <div className="text-center">
                <p className="text-blue-500 font-bold text-sm">
                  {stats.badges.filter((b) => b.unlockedAt).length}
                </p>
                <p className="text-slate-400 dark:text-slate-600 text-[10px]">Badges</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onPageChange(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left text-sm ${
                currentPage === id
                  ? 'bg-emerald-400/10 border border-emerald-400/40 text-emerald-600 dark:text-emerald-400 font-medium'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        {/* Footer controls */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800/60 space-y-2">
          {/* System Inspect Mode */}
          <button
            onClick={() => setPortfolioMode(!portfolioMode)}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all text-sm border ${
              portfolioMode
                ? 'bg-amber-400/10 border-amber-400/40 text-amber-500 dark:text-amber-400'
                : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            {portfolioMode ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            <span>System Inspect Mode</span>
            {portfolioMode && (
              <span className="ml-auto w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            )}
          </button>

          {/* Sign Out */}
          <button
            onClick={() => setShowSignOut(true)}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-400/5 border border-transparent hover:border-red-200 dark:hover:border-red-400/20 transition-all text-sm"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Sign-out confirmation modal */}
      {showSignOut && (
        <SignOutModal
          onConfirm={handleSignOut}
          onCancel={() => setShowSignOut(false)}
        />
      )}
    </>
  );
};
