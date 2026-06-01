import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface UserProfile {
  name: string;
  city: string;
  ecoFocus: string;
  onboardingComplete: boolean;
}

export interface HabitEntry {
  id: string;
  habitId: string;
  title: string;
  category: string;
  xp: number;
  co2: number;
  water: number;
  waste: number;
  loggedAt: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string | null;
  condition: (stats: UserStats) => boolean;
}

export interface UserStats {
  xp: number;
  tierIndex: number;
  co2Averted: number;
  waterConserved: number;
  wasteAverted: number;
  currentStreak: number;
  totalHabits: number;
  lastActiveDate: string;
  habitLog: HabitEntry[];
  badges: Badge[];
}

export interface HabitItem {
  id: string;
  title: string;
  description: string;
  category: 'Transport' | 'Energy' | 'Waste' | 'Diet';
  xp: number;
  co2: number;
  water: number;
  waste: number;
  icon: string;
}

export interface TierInfo {
  name: string;
  minXP: number;
  maxXP: number;
  color: string;
  gradient: string;
  description: string;
}

export interface SustainIQContextType {
  profile: UserProfile | null;
  stats: UserStats;
  habits: HabitItem[];
  tiers: TierInfo[];
  currentTier: TierInfo;
  tierUpModal: { show: boolean; tier: TierInfo | null };
  setProfile: (profile: UserProfile) => void;
  logHabit: (habit: HabitItem) => void;
  addXP: (amount: number, multiplier?: number) => void;
  resetData: () => void;
  signOut: () => void;
  dismissTierModal: () => void;
  portfolioMode: boolean;
  setPortfolioMode: (mode: boolean) => void;
  isDark: boolean;
  toggleTheme: () => void;
}

export const TIERS: TierInfo[] = [
  {
    name: 'Observer',
    minXP: 0,
    maxXP: 149,
    color: '#94a3b8',
    gradient: 'from-slate-400 to-slate-500',
    description: 'Beginning your sustainability journey',
  },
  {
    name: 'Catalyst',
    minXP: 150,
    maxXP: 449,
    color: '#34d399',
    gradient: 'from-emerald-400 to-teal-400',
    description: 'Driving meaningful eco-change',
  },
  {
    name: 'Strategist',
    minXP: 450,
    maxXP: 899,
    color: '#60a5fa',
    gradient: 'from-blue-400 to-cyan-400',
    description: 'Architecting systemic impact',
  },
  {
    name: 'Guardian',
    minXP: 900,
    maxXP: Infinity,
    color: '#f59e0b',
    gradient: 'from-amber-400 to-orange-400',
    description: 'Steward of planetary resilience',
  },
];

export const HABIT_INVENTORY: HabitItem[] = [
  {
    id: 'h1',
    title: 'Public Transit Commute',
    description: 'Used bus, rail, or shared transit instead of a private vehicle',
    category: 'Transport',
    xp: 15,
    co2: 2.5,
    water: 0,
    waste: 0,
    icon: '🚌',
  },
  {
    id: 'h2',
    title: 'Cycled or Walked',
    description: 'Chose zero-emission mobility for your journey',
    category: 'Transport',
    xp: 15,
    co2: 3.2,
    water: 0,
    waste: 0,
    icon: '🚲',
  },
  {
    id: 'h3',
    title: 'Carpooled Today',
    description: 'Shared a ride to reduce per-capita emissions',
    category: 'Transport',
    xp: 15,
    co2: 1.8,
    water: 0,
    waste: 0,
    icon: '🚗',
  },
  {
    id: 'h4',
    title: 'LED Lighting Switch',
    description: 'Replaced incandescent bulbs with energy-efficient LEDs',
    category: 'Energy',
    xp: 15,
    co2: 1.2,
    water: 0,
    waste: 0,
    icon: '💡',
  },
  {
    id: 'h5',
    title: 'Unplugged Idle Devices',
    description: 'Eliminated phantom load by unplugging standby electronics',
    category: 'Energy',
    xp: 15,
    co2: 0.8,
    water: 0,
    waste: 0,
    icon: '🔌',
  },
  {
    id: 'h6',
    title: 'Cold Water Laundry',
    description: 'Washed clothes in cold water to reduce energy consumption',
    category: 'Energy',
    xp: 15,
    co2: 0.6,
    water: 30,
    waste: 0,
    icon: '🧺',
  },
  {
    id: 'h7',
    title: 'Recycled Household Waste',
    description: 'Sorted and deposited recyclables at a proper facility',
    category: 'Waste',
    xp: 15,
    co2: 0.5,
    water: 0,
    waste: 500,
    icon: '♻️',
  },
  {
    id: 'h8',
    title: 'Composted Organic Waste',
    description: 'Diverted food scraps from landfill via composting',
    category: 'Waste',
    xp: 15,
    co2: 0.4,
    water: 0,
    waste: 300,
    icon: '🌱',
  },
  {
    id: 'h9',
    title: 'Refused Single-Use Plastic',
    description: 'Declined plastic bags, straws, or packaging',
    category: 'Waste',
    xp: 15,
    co2: 0.3,
    water: 0,
    waste: 100,
    icon: '🚫',
  },
  {
    id: 'h10',
    title: 'Shorter Shower',
    description: 'Reduced shower time by 5+ minutes to conserve water',
    category: 'Energy',
    xp: 15,
    co2: 0.2,
    water: 50,
    waste: 0,
    icon: '🚿',
  },
  {
    id: 'h11',
    title: 'Plant-Based Meal',
    description: 'Chose a fully plant-based meal over animal products',
    category: 'Diet',
    xp: 15,
    co2: 2.0,
    water: 200,
    waste: 0,
    icon: '🥗',
  },
  {
    id: 'h12',
    title: 'Local Produce Purchase',
    description: 'Bought locally sourced food to reduce transport emissions',
    category: 'Diet',
    xp: 15,
    co2: 1.1,
    water: 80,
    waste: 0,
    icon: '🛒',
  },
  {
    id: 'h13',
    title: 'Reduced Meat Intake',
    description: 'Substituted red meat with a lower-impact protein source',
    category: 'Diet',
    xp: 15,
    co2: 1.8,
    water: 150,
    waste: 0,
    icon: '🌿',
  },
  {
    id: 'h14',
    title: 'Rainwater Harvesting',
    description: 'Collected rainwater for garden or household use',
    category: 'Energy',
    xp: 15,
    co2: 0.1,
    water: 100,
    waste: 0,
    icon: '🌧️',
  },
  {
    id: 'h15',
    title: 'Upcycled an Item',
    description: 'Repurposed a discarded item instead of buying new',
    category: 'Waste',
    xp: 15,
    co2: 0.7,
    water: 0,
    waste: 400,
    icon: '🔄',
  },
  {
    id: 'h16',
    title: 'Zero Food Waste Day',
    description: 'Consumed or preserved all food with zero waste',
    category: 'Diet',
    xp: 15,
    co2: 0.9,
    water: 60,
    waste: 200,
    icon: '🍽️',
  },
];

const BADGE_DEFINITIONS: Omit<Badge, 'unlockedAt'>[] = [
  {
    id: 'b1',
    title: 'First Step',
    description: 'Logged your first eco-habit',
    icon: '🌱',
    condition: (s) => s.totalHabits >= 1,
  },
  {
    id: 'b2',
    title: 'Habit Streak',
    description: 'Maintained a 3-day streak',
    icon: '🔥',
    condition: (s) => s.currentStreak >= 3,
  },
  {
    id: 'b3',
    title: 'Carbon Cutter',
    description: 'Averted 10kg of CO2',
    icon: '💨',
    condition: (s) => s.co2Averted >= 10,
  },
  {
    id: 'b4',
    title: 'Water Warden',
    description: 'Conserved 500 liters of water',
    icon: '💧',
    condition: (s) => s.waterConserved >= 500,
  },
  {
    id: 'b5',
    title: 'Zero Waste Hero',
    description: 'Diverted 2kg of waste from landfill',
    icon: '♻️',
    condition: (s) => s.wasteAverted >= 2000,
  },
  {
    id: 'b6',
    title: 'Century Club',
    description: 'Accumulated 100 XP',
    icon: '⚡',
    condition: (s) => s.xp >= 100,
  },
  {
    id: 'b7',
    title: 'Eco Veteran',
    description: 'Logged 20 habits total',
    icon: '🏆',
    condition: (s) => s.totalHabits >= 20,
  },
  {
    id: 'b8',
    title: 'Guardian Rising',
    description: 'Reached Guardian tier',
    icon: '🛡️',
    condition: (s) => s.xp >= 900,
  },
];

const buildBadges = (stats: UserStats): Badge[] => {
  return BADGE_DEFINITIONS.map((def) => {
    const existing = stats.badges.find((b) => b.id === def.id);
    const unlocked = def.condition(stats);
    return {
      ...def,
      unlockedAt: unlocked
        ? existing?.unlockedAt ?? new Date().toISOString()
        : null,
    };
  });
};

const getTierIndex = (xp: number): number => {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (xp >= TIERS[i].minXP) return i;
  }
  return 0;
};

const defaultStats: UserStats = {
  xp: 0,
  tierIndex: 0,
  co2Averted: 0,
  waterConserved: 0,
  wasteAverted: 0,
  currentStreak: 0,
  totalHabits: 0,
  lastActiveDate: new Date().toISOString().split('T')[0],
  habitLog: [],
  badges: BADGE_DEFINITIONS.map((d) => ({ ...d, unlockedAt: null })),
};

const SustainIQContext = createContext<SustainIQContextType | undefined>(undefined);

export const SustainIQProvider: React.FC<{ children: React.ReactNode }> = ({ children }: { children: React.ReactNode }) => {
  const [profile, setProfileState] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats>(defaultStats);
  const [portfolioMode, setPortfolioModeState] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [tierUpModal, setTierUpModal] = useState<{ show: boolean; tier: TierInfo | null }>({
    show: false,
    tier: null,
  });

  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem('siq_profile');
      const savedStats = localStorage.getItem('siq_stats');
      const savedPortfolio = localStorage.getItem('siq_portfolio');
      const savedTheme = localStorage.getItem('siq_theme');
      if (savedProfile) setProfileState(JSON.parse(savedProfile));
      if (savedStats) {
        const parsed = JSON.parse(savedStats);
        setStats({ ...defaultStats, ...parsed });
      }
      if (savedPortfolio) setPortfolioModeState(JSON.parse(savedPortfolio));
      // default to dark; only go light if explicitly saved
      const dark = savedTheme ? savedTheme === 'dark' : true;
      setIsDark(dark);
      if (dark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('siq_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('siq_theme', 'light');
      }
      return next;
    });
  }, []);

  const setProfile = useCallback((p: UserProfile) => {
    setProfileState(p);
    localStorage.setItem('siq_profile', JSON.stringify(p));
  }, []);

  const setPortfolioMode = useCallback((mode: boolean) => {
    setPortfolioModeState(mode);
    localStorage.setItem('siq_portfolio', JSON.stringify(mode));
  }, []);

  const addXP = useCallback(
    (amount: number, multiplier: number = 1) => {
      setStats((prev) => {
        const newXP = prev.xp + Math.round(amount * multiplier);
        const newTierIndex = getTierIndex(newXP);
        const updatedStats: UserStats = {
          ...prev,
          xp: newXP,
          tierIndex: newTierIndex,
          badges: buildBadges({ ...prev, xp: newXP }),
        };
        localStorage.setItem('siq_stats', JSON.stringify(updatedStats));
        if (newTierIndex > prev.tierIndex) {
          setTierUpModal({ show: true, tier: TIERS[newTierIndex] });
        }
        return updatedStats;
      });
    },
    []
  );

  const logHabit = useCallback(
    (habit: HabitItem) => {
      const today = new Date().toISOString().split('T')[0];
      setStats((prev) => {
        const isNewDay = prev.lastActiveDate !== today;
        const newXP = prev.xp + habit.xp;
        const newTierIndex = getTierIndex(newXP);
        const entry: HabitEntry = {
          id: `${Date.now()}-${habit.id}`,
          habitId: habit.id,
          title: habit.title,
          category: habit.category,
          xp: habit.xp,
          co2: habit.co2,
          water: habit.water,
          waste: habit.waste,
          loggedAt: new Date().toISOString(),
        };
        const updatedStats: UserStats = {
          ...prev,
          xp: newXP,
          tierIndex: newTierIndex,
          co2Averted: parseFloat((prev.co2Averted + habit.co2).toFixed(2)),
          waterConserved: parseFloat((prev.waterConserved + habit.water).toFixed(2)),
          wasteAverted: parseFloat((prev.wasteAverted + habit.waste).toFixed(2)),
          currentStreak: isNewDay ? prev.currentStreak + 1 : prev.currentStreak,
          totalHabits: prev.totalHabits + 1,
          lastActiveDate: today,
          habitLog: [entry, ...prev.habitLog].slice(0, 200),
          badges: buildBadges({
            ...prev,
            xp: newXP,
            totalHabits: prev.totalHabits + 1,
            co2Averted: prev.co2Averted + habit.co2,
            waterConserved: prev.waterConserved + habit.water,
            wasteAverted: prev.wasteAverted + habit.waste,
            currentStreak: isNewDay ? prev.currentStreak + 1 : prev.currentStreak,
          }),
        };
        localStorage.setItem('siq_stats', JSON.stringify(updatedStats));
        if (newTierIndex > prev.tierIndex) {
          setTierUpModal({ show: true, tier: TIERS[newTierIndex] });
        }
        return updatedStats;
      });
    },
    []
  );

  const resetData = useCallback(() => {
    setProfileState(null);
    setStats(defaultStats);
    setPortfolioModeState(false);
    localStorage.removeItem('siq_profile');
    localStorage.removeItem('siq_stats');
    localStorage.removeItem('siq_portfolio');
  }, []);

  // Sign out: clears profile + resets daily metrics, keeps theme preference
  const signOut = useCallback(() => {
    setProfileState(null);
    setStats(defaultStats);
    localStorage.removeItem('siq_profile');
    localStorage.removeItem('siq_stats');
  }, []);

  const dismissTierModal = useCallback(() => {
    setTierUpModal({ show: false, tier: null });
  }, []);

  const currentTier = TIERS[stats.tierIndex] ?? TIERS[0];

  return (
    <SustainIQContext.Provider
      value={{
        profile,
        stats,
        habits: HABIT_INVENTORY,
        tiers: TIERS,
        currentTier,
        tierUpModal,
        setProfile,
        logHabit,
        addXP,
        resetData,
        signOut,
        dismissTierModal,
        portfolioMode,
        setPortfolioMode,
        isDark,
        toggleTheme,
      }}
    >
      {children}
    </SustainIQContext.Provider>
  );
};

export const useSustainIQ = (): SustainIQContextType => {
  const ctx = useContext(SustainIQContext);
  if (!ctx) throw new Error('useSustainIQ must be used within SustainIQProvider');
  return ctx;
};
