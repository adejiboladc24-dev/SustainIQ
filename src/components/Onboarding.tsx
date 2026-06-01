import React, { useState } from 'react';
import { Leaf, ArrowRight, ArrowLeft, Zap, Droplets, Recycle } from 'lucide-react';
import { useSustainIQ } from '../context/SustainIQContext';

const ECO_FOCUSES = [
  {
    id: 'Reduce Carbon',
    label: 'Reduce Carbon',
    icon: <Zap className="w-5 h-5" />,
    desc: 'Cut your carbon footprint through smarter transport and energy choices',
    activeClass: 'border-emerald-400 bg-emerald-400/10 text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 'Water Conservation',
    label: 'Water Conservation',
    icon: <Droplets className="w-5 h-5" />,
    desc: 'Protect freshwater resources through mindful daily habits',
    activeClass: 'border-cyan-400 bg-cyan-400/10 text-cyan-600 dark:text-cyan-400',
  },
  {
    id: 'Zero Waste',
    label: 'Zero Waste',
    icon: <Recycle className="w-5 h-5" />,
    desc: 'Eliminate waste through circular economy principles',
    activeClass: 'border-blue-400 bg-blue-400/10 text-blue-600 dark:text-blue-400',
  },
];

export const Onboarding: React.FC = () => {
  const { setProfile } = useSustainIQ();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [ecoFocus, setEcoFocus] = useState('Reduce Carbon');

  const canAdvance =
    (step === 1 && name.trim().length >= 2) ||
    (step === 2 && city.trim().length >= 2) ||
    step === 3;

  const handleNext = () => {
    if (step < 3) {
      setStep((s) => s + 1);
    } else {
      setProfile({
        name: name.trim(),
        city: city.trim() || 'Lagos, Nigeria',
        ecoFocus,
        onboardingComplete: true,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-50 dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4 overflow-hidden transition-colors duration-300">
      {/* Ambient blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-emerald-500/6 dark:bg-emerald-500/8 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-teal-500/6 dark:bg-teal-500/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="relative w-full max-w-lg">
        {/* Brand */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-400/10 border border-emerald-400/30 mb-4">
            <Leaf className="w-8 h-8 text-emerald-500" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
            SustainIQ
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Environmental Intelligence Platform
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 justify-center mb-8">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all duration-300 ${
                  s < step
                    ? 'bg-emerald-400 text-slate-900'
                    : s === step
                    ? 'bg-emerald-400/20 border-2 border-emerald-400 text-emerald-600 dark:text-emerald-400'
                    : 'bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-400'
                }`}
              >
                {s < step ? '✓' : s}
              </div>
              {s < 3 && (
                <div
                  className={`h-px flex-1 max-w-12 transition-all duration-500 ${
                    s < step ? 'bg-emerald-400' : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 backdrop-blur-xl rounded-2xl p-8 mb-6 shadow-xl dark:shadow-none transition-colors duration-300">
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                What should we call you?
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                Your name personalizes your sustainability dashboard
              </p>
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && canAdvance && handleNext()}
                autoFocus
                className="w-full bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 transition-all text-sm"
              />
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                Where are you based?
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                Used for local environmental telemetry. Defaults to{' '}
                <span className="text-emerald-500 dark:text-emerald-400">Lagos, Nigeria</span> if
                left blank.
              </p>
              <input
                type="text"
                placeholder="e.g. Lagos, London, New York"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && canAdvance && handleNext()}
                autoFocus
                className="w-full bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 transition-all text-sm"
              />
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                Choose your eco-focus
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                This shapes your habit recommendations and analytics
              </p>
              <div className="space-y-3">
                {ECO_FOCUSES.map((focus) => (
                  <button
                    key={focus.id}
                    onClick={() => setEcoFocus(focus.id)}
                    className={`w-full flex items-start gap-4 p-4 rounded-xl border transition-all text-left ${
                      ecoFocus === focus.id
                        ? focus.activeClass
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className="mt-0.5">{focus.icon}</div>
                    <div>
                      <p className="font-semibold text-sm">{focus.label}</p>
                      <p className="text-xs mt-0.5 opacity-70">{focus.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 1}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-900 dark:hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={!canAdvance}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 dark:bg-emerald-400 text-white dark:text-slate-900 font-semibold hover:bg-emerald-400 dark:hover:bg-emerald-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed text-sm"
          >
            {step === 3 ? 'Launch Dashboard' : 'Continue'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
