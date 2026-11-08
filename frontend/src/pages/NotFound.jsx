import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center space-y-4">
      <h1 className="text-6xl font-black text-brand-500">404</h1>
      <h2 className="text-lg font-semibold text-white">Enterprise Resource Not Found</h2>
      <p className="text-xs text-slate-400 max-w-sm">
        The requested routing path does not exist in the current tenant registry.
      </p>
      <Link to="/dashboard">
        <Button size="sm">Return to Executive Dashboard</Button>
      </Link>
    </div>
  );
}
