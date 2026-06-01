import React from 'react';
import { Wind, Droplets, Trash2, Zap, Flame, Award, TrendingUp, Calendar } from 'lucide-react';
import { useSustainIQ, TIERS } from '../context/SustainIQContext';

const card = 'bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl backdrop-blur-md transition-colors duration-300';

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
  sub: string;
  accentColor: string;
  tooltip?: string;
  portfolioMode: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
  icon, label, value, unit, sub, accentColor, tooltip, portfolioMode,
}) => (
  <div className={`relative group ${card} p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-all`}>
    {portfolioMode && tooltip && (
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-amber-400 text-slate-900 text-[10px] font-semibold px-2 py-1 rounded-md whitespace-nowrap z-50 pointer-events-none shadow-lg">
        {tooltip}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-amber-400" />
      </div>
    )}
    <div className="flex items-start justify-between mb-4">
      <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/60">{icon}</div>
    </div>
    <p className="text-slate-400 dark:text-slate-500 text-xs uppercase tracking-wider mb-1">{label}</p>
    <div className="flex items-baseline gap-1.5">
      <p className="text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
      <span className="text-slate-400 text-sm">{unit}</span>
    </div>
    <p className="text-xs text-slate-400 dark:text-slate-600 mt-1">{sub}</p>
    <div className="mt-3 h-1 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
      <div className="h-full rounded-full w-3/4 transition-all" style={{ background: accentColor }} />
    </div>
  </div>
);

export const Metrics: React.FC = () => {
  const { stats, currentTier, portfolioMode } = useSustainIQ();

  const nextTier = TIERS[stats.tierIndex + 1];
  const progressPct = nextTier
    ? Math.min(((stats.xp - currentTier.minXP) / (nextTier.minXP - currentTier.minXP)) * 100, 100)
    : 100;

  const unlockedBadges = stats.badges.filter((b) => b.unlockedAt);
  const lockedBadges = stats.badges.filter((b) => !b.unlockedAt);
  const recentLog = stats.habitLog.slice(0, 8);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
          Environmental Metrics
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Your cumulative sustainability impact
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          icon={<Wind className="w-5 h-5 text-emerald-500" />}
          label="CO₂ Averted"
          value={stats.co2Averted.toFixed(1)}
          unit="kg"
          sub="Carbon emissions avoided"
          accentColor="#10b981"
          tooltip="stats.co2Averted — accumulated via logHabit()"
          portfolioMode={portfolioMode}
        />
        <MetricCard
          icon={<Droplets className="w-5 h-5 text-cyan-500" />}
          label="Water Conserved"
          value={stats.waterConserved.toFixed(0)}
          unit="L"
          sub="Freshwater preserved"
          accentColor="#06b6d4"
          tooltip="stats.waterConserved — real-time accumulation"
          portfolioMode={portfolioMode}
        />
        <MetricCard
          icon={<Trash2 className="w-5 h-5 text-blue-500" />}
          label="Waste Diverted"
          value={
            stats.wasteAverted >= 1000
              ? (stats.wasteAverted / 1000).toFixed(2)
              : stats.wasteAverted.toFixed(0)
          }
          unit={stats.wasteAverted >= 1000 ? 'kg' : 'g'}
          sub="Diverted from landfill"
          accentColor="#3b82f6"
          tooltip="stats.wasteAverted — circular economy metric"
          portfolioMode={portfolioMode}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tier progression */}
        <div className={`${card} p-5`}>
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-amber-500" />
            <h3 className="text-slate-900 dark:text-white font-semibold text-sm">
              Tier Progression
            </h3>
          </div>
          <div className="space-y-3">
            {TIERS.map((tier, i) => {
              const isActive = i === stats.tierIndex;
              const isPast = i < stats.tierIndex;
              return (
                <div key={tier.name} className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{
                      background: isActive || isPast ? tier.color + '20' : undefined,
                      border: `2px solid ${isActive || isPast ? tier.color : '#cbd5e1'}`,
                      color: isActive || isPast ? tier.color : '#94a3b8',
                    }}
                  >
                    {isPast ? '✓' : i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span
                        className="text-sm font-medium"
                        style={{
                          color: isActive ? tier.color : isPast ? '#94a3b8' : '#cbd5e1',
                        }}
                      >
                        {tier.name}
                      </span>
                      <span className="text-xs text-slate-400">{tier.minXP} XP</span>
                    </div>
                    {isActive && (
                      <div className="mt-1 h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${progressPct}%`, background: tier.color }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Activity summary */}
        <div className={`${card} p-5`}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <h3 className="text-slate-900 dark:text-white font-semibold text-sm">
              Activity Summary
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: <Flame className="w-3.5 h-3.5 text-orange-500" />, label: 'Streak', value: stats.currentStreak, unit: 'days', color: 'text-orange-500' },
              { icon: <Calendar className="w-3.5 h-3.5 text-teal-500" />, label: 'Total Habits', value: stats.totalHabits, unit: 'logged', color: 'text-teal-500' },
              { icon: <Zap className="w-3.5 h-3.5 text-amber-500" />, label: 'Total XP', value: stats.xp, unit: 'points', color: 'text-amber-500' },
              { icon: <Award className="w-3.5 h-3.5 text-purple-500" />, label: 'Badges', value: unlockedBadges.length, unit: `of ${stats.badges.length}`, color: 'text-purple-500' },
            ].map((item) => (
              <div key={item.label} className="bg-slate-50 dark:bg-slate-800/40 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  {item.icon}
                  <p className="text-slate-400 text-xs">{item.label}</p>
                </div>
                <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
                <p className="text-xs text-slate-400 dark:text-slate-600">{item.unit}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Badge collection */}
      <div className={`${card} p-5`}>
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-4 h-4 text-purple-500" />
          <h3 className="text-slate-900 dark:text-white font-semibold text-sm">
            Badge Collection
          </h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...unlockedBadges, ...lockedBadges].map((badge) => (
            <div
              key={badge.id}
              className={`p-3 rounded-xl border text-center transition-all ${
                badge.unlockedAt
                  ? 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                  : 'bg-slate-50/50 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800/50 opacity-40'
              }`}
            >
              <div className="text-2xl mb-1.5">{badge.icon}</div>
              <p className={`text-xs font-semibold ${badge.unlockedAt ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-600'}`}>
                {badge.title}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-600 mt-0.5">
                {badge.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      {recentLog.length > 0 && (
        <div className={`${card} p-5`}>
          <h3 className="text-slate-900 dark:text-white font-semibold text-sm mb-4">
            Recent Activity
          </h3>
          <div className="space-y-2">
            {recentLog.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/60 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <div>
                    <p className="text-slate-900 dark:text-white text-xs font-medium">
                      {entry.title}
                    </p>
                    <p className="text-slate-400 text-[10px]">{entry.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                    +{entry.xp} XP
                  </p>
                  <p className="text-slate-400 text-[10px]">
                    {new Date(entry.loggedAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
