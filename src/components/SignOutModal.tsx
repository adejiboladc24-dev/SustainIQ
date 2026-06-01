import React from 'react';
import { AlertTriangle, LogOut, X } from 'lucide-react';

interface SignOutModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export const SignOutModal: React.FC<SignOutModalProps> = ({ onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    {/* Backdrop */}
    <div
      className="absolute inset-0 bg-slate-950/70 dark:bg-slate-950/80 backdrop-blur-sm"
      onClick={onCancel}
    />

    {/* Card */}
    <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden">
      {/* Top accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-red-400 via-orange-400 to-red-500" />

      <div className="p-6">
        {/* Close */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon */}
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-400/10 border border-red-400/30 mb-4">
          <AlertTriangle className="w-6 h-6 text-red-400" />
        </div>

        {/* Copy */}
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
          Sign out of SustainIQ?
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
          Your profile and daily habit metrics will be cleared from this device. Your progress
          data will be reset. This action cannot be undone.
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-400 text-white transition-all text-sm font-semibold"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  </div>
);
