import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useDatasetContext } from '../../context/DatasetContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { datasets, activeDataset, selectDataset } = useDatasetContext();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Left: Active Dataset Selector */}
      <div className="flex items-center space-x-3">
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-500/15 text-brand-400 border border-brand-500/30">
          Active Silo
        </span>
        {datasets.length > 0 ? (
          <select
            value={activeDataset?.id || ''}
            onChange={(e) => selectDataset(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg text-xs font-medium text-slate-200 px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-500 max-w-xs truncate"
          >
            {datasets.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.row_count?.toLocaleString()} rows)
              </option>
            ))}
          </select>
        ) : (
          <span className="text-xs text-slate-400 italic">No datasets ingested</span>
        )}
      </div>

      {/* Right: Telemetry pill & User Avatar */}
      <div className="flex items-center space-x-4">
        <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-slate-950 border border-slate-800 rounded-full text-[11px] text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Gateway Connected</span>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-3 p-1 rounded-xl hover:bg-slate-800 transition-colors focus:outline-none"
          >
            <div className="text-right hidden md:block">
              <p className="text-xs font-semibold text-slate-200 leading-tight">
                {user?.full_name || 'Enterprise Architect'}
              </p>
              <p className="text-[11px] text-slate-400">{user?.organization || 'Dell Technologies'}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-sky-500 flex items-center justify-center font-bold text-xs text-white shadow">
              {user?.full_name?.charAt(0) || 'D'}
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2 border-b border-slate-800 mb-1">
                <p className="font-semibold text-white truncate">{user?.full_name}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
              </div>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  navigate('/profile');
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              >
                👤 Architect Profile
              </button>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  navigate('/settings');
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              >
                ⚙️ Platform Settings
              </button>
              <div className="border-t border-slate-800 my-1" />
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors font-medium"
              >
                🚪 Terminate Session
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
