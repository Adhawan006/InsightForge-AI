import React from 'react';
import Spinner from './Spinner';

/**
 * Centralised loading overlay used across pages.
 * Displays a subtle backdrop with a spinning indicator and an optional message.
 */
export default function LoadingScreen({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4">
      {/* Spinner with brand accent */}
      <div className="relative">
        <Spinner className="w-12 h-12 text-brand-500 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-brand-400">
          {/* Optional visual cue */}
          <span>⏳</span>
        </div>
      </div>
      <p className="text-sm text-slate-400 font-medium tracking-wide animate-pulse">
        {message}
      </p>
    </div>
  );
}
