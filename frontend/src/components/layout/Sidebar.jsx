import React from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { label: 'Executive Dashboard', path: '/dashboard', icon: '📊' },
  { label: 'Dataset Repository', path: '/datasets', icon: '🗄️' },
  { label: 'Dataset Upload', path: '/upload', icon: '⬆️' },
  { label: 'AI Data Intelligence', path: '/intelligence', icon: '✨' },
  { label: 'SQL Query Generator', path: '/sql-generator', icon: '⚡' },
  { label: 'Statistical Charts', path: '/charts', icon: '📈' },
  { label: 'Analysis History', path: '/history', icon: '📜' },
  { label: 'Architect Profile', path: '/profile', icon: '👤' },
  { label: 'Platform Settings', path: '/settings', icon: '⚙️' },
];

export default function Sidebar() {
  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900 flex flex-col justify-between shrink-0 h-screen sticky top-0 overflow-y-auto">
      <div>
        <div className="h-16 flex items-center px-6 border-b border-slate-800 space-x-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-sky-400 flex items-center justify-center font-bold text-white text-xs shadow-md shadow-brand-500/20">
            IF
          </div>
          <div>
            <span className="font-bold text-sm text-slate-100 tracking-tight block">InsightForge AI</span>
            <span className="text-[10px] text-brand-400 uppercase tracking-widest font-semibold block">Enterprise Hub</span>
          </div>
        </div>

        <nav className="p-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-brand-600/15 text-brand-400 border border-brand-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`
              }
            >
              <span className="text-base">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-800 space-y-3">
        <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold text-slate-200">Dell APEX Tier</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <p className="text-[11px] text-slate-400">Gemini 1.5 Pro Enabled</p>
          <div className="mt-2 text-[10px] text-slate-500 font-mono">v1.0.0-production</div>
        </div>
      </div>
    </aside>
  );
}
