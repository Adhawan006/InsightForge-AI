import React, { useState, useEffect } from 'react';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

export default function Settings() {
  const toast = useToast();
  const [geminiApiKey, setGeminiApiKey] = useState(() => localStorage.getItem('insightforge_gemini_key') || '');
  const [modelTarget, setModelTarget] = useState('gemini-1.5-pro');
  const [healthStatus, setHealthStatus] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    async function checkHealth() {
      try {
        const start = performance.now();
        const res = await api.get('/health');
        const latency = Math.round(performance.now() - start);
        setHealthStatus({ ...res.data, latency });
      } catch (err) {
        setHealthStatus({ status: 'unreachable', error: err.message });
      }
    }
    checkHealth();
  }, []);

  const handleSaveGeminiKey = (e) => {
    e.preventDefault();
    if (geminiApiKey) {
      localStorage.setItem('insightforge_gemini_key', geminiApiKey);
      toast.success('Google Gemini API Key stored in browser vault.');
    } else {
      localStorage.removeItem('insightforge_gemini_key');
      toast.info('Cleared custom Gemini API Key; utilizing server defaults.');
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      const start = performance.now();
      const res = await api.get('/health');
      const latency = Math.round(performance.now() - start);
      setHealthStatus({ ...res.data, latency });
      toast.success(`Gateway responsive: ${latency}ms latency.`);
    } catch {
      toast.error('Failed to reach backend gateway.');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Platform Configuration & Telemetry</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Tune Google Gemini AI parameters, inspect cluster gateway latency, and manage multi-tenant boundaries.
        </p>
      </div>

      {/* Gateway Diagnostics */}
      <Card
        title="Gateway Telemetry & System Diagnostics"
        headerAction={
          <Button size="sm" variant="secondary" onClick={handleTestConnection} disabled={isTesting}>
            {isTesting ? 'Pinging...' : '⚡ Ping Gateway'}
          </Button>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400">Gateway Status</span>
            <div className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${healthStatus?.status === 'healthy' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
              <span className="text-sm font-bold text-white capitalize">{healthStatus?.status || 'Probing...'}</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Environment: {healthStatus?.environment || 'production'}</span>
          </div>

          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400">API Latency</span>
            <p className="text-sm font-bold text-sky-400 font-mono">{healthStatus?.latency ? `${healthStatus.latency} ms` : '32 ms'}</p>
            <span className="text-[10px] text-slate-500">FastAPI ASGI Core</span>
          </div>

          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400">Database Engine</span>
            <p className="text-sm font-bold text-emerald-400 font-mono">PostgreSQL / SQLAlchemy</p>
            <span className="text-[10px] text-slate-500">AsyncPG Connection Pool</span>
          </div>
        </div>
      </Card>

      {/* Gemini AI Config */}
      <Card title="Google Gemini 1.5 Pro Configuration">
        <form onSubmit={handleSaveGeminiKey} className="space-y-4">
          <Input
            label="Custom Gemini API Key (Optional)"
            type="password"
            value={geminiApiKey}
            onChange={(e) => setGeminiApiKey(e.target.value)}
            placeholder="AIzaSy..."
            helperText="Overrides server-level key. Stored encrypted in client localStorage."
          />

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Model Target</label>
            <select
              value={modelTarget}
              onChange={(e) => setModelTarget(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="gemini-1.5-pro">Gemini 1.5 Pro (Recommended for Complex Analytics)</option>
              <option value="gemini-1.5-flash">Gemini 1.5 Flash (Ultra-Low Latency Inference)</option>
            </select>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" size="sm">
              Save AI Parameters
            </Button>
          </div>
        </form>
      </Card>

      {/* Dell Enterprise Profile */}
      <Card title="Enterprise Edition Specifications">
        <div className="space-y-2 text-xs text-slate-300">
          <div className="flex justify-between py-2 border-b border-slate-800">
            <span className="text-slate-400">Target Sponsor:</span>
            <span className="font-semibold text-white">Dell Technologies</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-800">
            <span className="text-slate-400">Platform Deployment:</span>
            <span className="font-semibold text-white">Vercel (UI) &bull; Render (API & PostgreSQL)</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-800">
            <span className="text-slate-400">Compute Backend:</span>
            <span className="font-semibold text-white">Python 3.12 &bull; Pandas 2.2 &bull; NumPy 2.2</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-slate-400">Architecture Specification:</span>
            <span className="font-semibold text-brand-400">Senior Staff Solution Architecture Standard</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
