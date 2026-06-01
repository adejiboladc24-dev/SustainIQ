import React, { useEffect } from 'react';
import { X, Star } from 'lucide-react';
import { useSustainIQ, TierInfo } from '../context/SustainIQContext';

interface TierUpModalProps {
  tier: TierInfo;
}

export const TierUpModal: React.FC<TierUpModalProps> = ({ tier }) => {
  const { dismissTierModal } = useSustainIQ();

  useEffect(() => {
    const t = setTimeout(dismissTierModal, 6000);
    return () => clearTimeout(t);
  }, [dismissTierModal]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={dismissTierModal}
      />
      <div className="relative w-full max-w-sm">
        <div className="absolute inset-0 rounded-2xl blur-2xl opacity-40" style={{ background: tier.color }} />
        <div
          className="relative bg-white dark:bg-slate-900 border rounded-2xl p-8 text-center shadow-2xl"
          style={{ borderColor: tier.color + '60' }}
        >
          <button
            onClick={dismissTierModal}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div
            className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 animate-bounce"
            style={{ background: tier.color + '20', border: `2px solid ${tier.color}` }}
          >
            <Star className="w-10 h-10" style={{ color: tier.color }} />
          </div>

          <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">Tier Unlocked</p>
          <h2 className="text-3xl font-bold mb-2" style={{ color: tier.color }}>
            {tier.name}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">{tier.description}</p>

          <div className="flex items-center justify-center gap-1 mb-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full transition-all"
                style={{
                  background: i <= ['Observer', 'Catalyst', 'Strategist', 'Guardian'].indexOf(tier.name)
                    ? tier.color
                    : '#334155',
                }}
              />
            ))}
          </div>

          <button
            onClick={dismissTierModal}
            className="w-full py-3 rounded-xl font-semibold text-slate-900 transition-all hover:opacity-90"
            style={{ background: tier.color }}
          >
            Continue Journey
          </button>
        </div>
      </div>
    </div>
  );
};
