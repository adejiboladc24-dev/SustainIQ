import React, { useState } from 'react';
import { Play, Trophy, Clock, Target, Zap, CheckCircle2, Lock, Flame } from 'lucide-react';
import { useSustainIQ } from '../context/SustainIQContext';

const card = 'bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl backdrop-blur-md transition-colors duration-300';

interface Challenge {
  id: string;
  name: string;
  description: string;
  category: string;
  duration: number;
  xpMultiplier: number;
  baseXP: number;
  icon: string;
  color: string;
  requirements: string[];
}

interface ActiveChallenge extends Challenge {
  startedAt: string;
  progress: number;
}

const CHALLENGES: Challenge[] = [
  {
    id: 'c1', name: '7-Day Carbon Sprint',
    description: 'Log at least one transport or energy habit every day for 7 consecutive days',
    category: 'Carbon', duration: 7, xpMultiplier: 1.5, baseXP: 150, icon: '💨', color: '#10b981',
    requirements: ['Log 7 transport/energy habits', 'Maintain daily streak', 'Earn 100+ XP'],
  },
  {
    id: 'c2', name: 'Zero Waste Fortnight',
    description: 'Divert waste from landfill through recycling and composting for 14 days',
    category: 'Waste', duration: 14, xpMultiplier: 2.0, baseXP: 300, icon: '♻️', color: '#3b82f6',
    requirements: ['Log 14 waste habits', 'Divert 2kg+ from landfill', 'No single-use plastic'],
  },
  {
    id: 'c3', name: 'Hydro Guardian Week',
    description: 'Conserve water through mindful daily practices for 7 days',
    category: 'Water', duration: 7, xpMultiplier: 1.5, baseXP: 150, icon: '💧', color: '#06b6d4',
    requirements: ['Log 7 water habits', 'Conserve 200L+', 'Shorter showers daily'],
  },
  {
    id: 'c4', name: 'Plant-Based Power Week',
    description: 'Choose plant-based meals and local produce for 7 days straight',
    category: 'Diet', duration: 7, xpMultiplier: 1.5, baseXP: 150, icon: '🌿', color: '#84cc16',
    requirements: ['Log 7 diet habits', 'Reduce meat intake', 'Buy local produce'],
  },
  {
    id: 'c5', name: 'Guardian Ascension',
    description: 'Complete all four eco-disciplines in a single week to reach Guardian tier',
    category: 'All', duration: 7, xpMultiplier: 3.0, baseXP: 500, icon: '🛡️', color: '#f59e0b',
    requirements: ['Log all 4 categories', 'Earn 200+ XP', 'Maintain 7-day streak'],
  },
  {
    id: 'c6', name: 'Solar Awareness Sprint',
    description: 'Reduce energy consumption and advocate for renewable energy for 5 days',
    category: 'Energy', duration: 5, xpMultiplier: 1.25, baseXP: 100, icon: '☀️', color: '#f97316',
    requirements: ['Log 5 energy habits', 'Unplug idle devices', 'Cold water laundry'],
  },
];

const getDaysRemaining = (startedAt: string, duration: number): number => {
  const start = new Date(startedAt);
  const end = new Date(start.getTime() + duration * 24 * 60 * 60 * 1000);
  const diff = Math.ceil((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
};

export const Challenges: React.FC = () => {
  const { addXP, stats, portfolioMode } = useSustainIQ();
  const [active, setActive] = useState<ActiveChallenge[]>([]);
  const [completed, setCompleted] = useState<string[]>([]);
  const [filter, setFilter] = useState<string>('All');

  const categories = ['All', 'Carbon', 'Waste', 'Water', 'Diet', 'Energy'];

  const activate = (challenge: Challenge) => {
    if (active.find((c) => c.id === challenge.id)) return;
    setActive((prev) => [...prev, { ...challenge, startedAt: new Date().toISOString(), progress: 0 }]);
    addXP(25, challenge.xpMultiplier);
  };

  const complete = (challengeId: string) => {
    const ch = active.find((c) => c.id === challengeId);
    if (!ch) return;
    addXP(ch.baseXP, ch.xpMultiplier);
    setCompleted((prev) => [...prev, challengeId]);
    setActive((prev) => prev.filter((c) => c.id !== challengeId));
  };

  const simulateProgress = (challengeId: string) => {
    setActive((prev) =>
      prev.map((c) => c.id === challengeId ? { ...c, progress: Math.min(c.progress + 20, 100) } : c)
    );
  };

  const filtered = filter === 'All' ? CHALLENGES : CHALLENGES.filter((c) => c.category === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
            Eco-Challenge Portal
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            High-stakes 7-day environmental sprint multipliers
          </p>
        </div>
        {portfolioMode && (
          <div className="bg-amber-400/10 border border-amber-400/30 text-amber-500 dark:text-amber-400 text-xs px-3 py-1.5 rounded-full font-medium">
            useState challenge state management
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Active',    value: active.length,    color: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Completed', value: completed.length, color: 'text-amber-600 dark:text-amber-400' },
          { label: 'Total XP',  value: stats.xp,         color: 'text-blue-600 dark:text-blue-400' },
        ].map((s) => (
          <div key={s.label} className={`${card} p-3 sm:p-4 text-center`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Active challenges */}
      {active.length > 0 && (
        <div>
          <h3 className="text-slate-900 dark:text-white font-semibold text-sm mb-3 flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />
            Active Challenges
          </h3>
          <div className="space-y-3">
            {active.map((ch) => {
              const daysLeft = getDaysRemaining(ch.startedAt, ch.duration);
              return (
                <div
                  key={ch.id}
                  className="border rounded-xl p-5 backdrop-blur-md transition-colors duration-300"
                  style={{ borderColor: ch.color + '40', background: ch.color + '08' }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{ch.icon}</span>
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                          {ch.name}
                        </h4>
                        <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                          {ch.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0 ml-3">
                      <Trophy className="w-4 h-4" style={{ color: ch.color }} />
                      <span className="text-sm font-bold" style={{ color: ch.color }}>
                        ×{ch.xpMultiplier}
                      </span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-400">Progress</span>
                      <span style={{ color: ch.color }}>{ch.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${ch.progress}%`, background: ch.color }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {daysLeft}d left
                      </span>
                      <span className="flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        +{Math.round(ch.baseXP * ch.xpMultiplier)} XP
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => simulateProgress(ch.id)}
                        className="px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition-all"
                      >
                        +Progress
                      </button>
                      <button
                        onClick={() => complete(ch.id)}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-900 rounded-lg transition-all hover:opacity-90"
                        style={{ background: ch.color }}
                      >
                        Complete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Available challenges */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-slate-900 dark:text-white font-semibold text-sm">
            Available Challenges
          </h3>
          <div className="flex gap-1.5 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                  filter === cat
                    ? 'bg-emerald-500 dark:bg-emerald-400 text-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((challenge) => {
            const isActive = active.some((c) => c.id === challenge.id);
            const isDone = completed.includes(challenge.id);
            return (
              <div
                key={challenge.id}
                className={`border rounded-xl p-5 backdrop-blur-md transition-all ${
                  isDone
                    ? 'bg-emerald-50 dark:bg-emerald-400/5 border-emerald-200 dark:border-emerald-400/30'
                    : isActive
                    ? 'bg-slate-100 dark:bg-slate-800/30 border-slate-200 dark:border-slate-700 opacity-60'
                    : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{challenge.icon}</span>
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                        {challenge.name}
                      </h4>
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                        style={{ background: challenge.color + '20', color: challenge.color }}
                      >
                        {challenge.category}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className="text-xs font-bold" style={{ color: challenge.color }}>
                      ×{challenge.xpMultiplier}
                    </p>
                    <p className="text-[10px] text-slate-400">multiplier</p>
                  </div>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
                  {challenge.description}
                </p>

                <div className="space-y-1 mb-4">
                  {challenge.requirements.map((req, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-400">
                      <Target className="w-3 h-3 flex-shrink-0" style={{ color: challenge.color }} />
                      {req}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {challenge.duration}d sprint
                    </span>
                    <span className="flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      {Math.round(challenge.baseXP * challenge.xpMultiplier)} XP
                    </span>
                  </div>

                  {isDone ? (
                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                      <CheckCircle2 className="w-4 h-4" /> Completed
                    </div>
                  ) : isActive ? (
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                      <Lock className="w-3.5 h-3.5" /> In Progress
                    </div>
                  ) : (
                    <button
                      onClick={() => activate(challenge)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-900 transition-all hover:opacity-90"
                      style={{ background: challenge.color }}
                    >
                      <Play className="w-3.5 h-3.5" /> Activate
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
