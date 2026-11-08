import React from 'react';
import Button from './Button';

export default function ErrorState({
  title = 'Service Error Occurred',
  message = 'An unexpected error occurred while communicating with the enterprise gateway.',
  onRetry,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-slate-900 border border-slate-800 rounded-2xl text-center max-w-lg mx-auto my-8">
      <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center text-xl font-bold mb-3">
        !
      </div>
      <h3 className="text-base font-semibold text-slate-100 mb-1">{title}</h3>
      <p className="text-xs text-slate-400 mb-5 leading-relaxed">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} size="sm" variant="secondary">
          Retry Request
        </Button>
      )}
    </div>
  );
}
