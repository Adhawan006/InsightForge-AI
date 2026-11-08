import React, { useState } from 'react';
import Button from '../common/Button';

export default function InsightQueryBox({ onGenerate, isLoading, currentDatasetName }) {
  const [prompt, setPrompt] = useState('');
  const [focusArea, setFocusArea] = useState('OPERATIONAL');

  const focusOptions = [
    { id: 'OPERATIONAL', label: 'Operational Inefficiencies' },
    { id: 'RISK', label: 'Risk & Anomaly Detection' },
    { id: 'FINANCIAL', label: 'Cloud Consumption / TCO' },
    { id: 'GENERAL', label: 'Holistic Executive Synthesis' },
  ];

  const enterprisePrompts = [
    'Analyze cluster IOPS bottlenecks and suggest APEX optimizations',
    'Detect thermal outliers across PowerEdge server fleet',
    'Audit SLA compliance drop-offs during peak batch transaction windows',
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    onGenerate?.(prompt.trim(), focusArea);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-white">Gemini Data Intelligence Studio</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Querying active dataset: <span className="text-brand-400 font-medium">{currentDatasetName || 'Active Silo'}</span>
          </p>
        </div>

        {/* Focus Area Select */}
        <div className="flex flex-wrap gap-1.5">
          {focusOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setFocusArea(opt.id)}
              className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                focusArea === opt.id
                  ? 'bg-brand-600/20 text-brand-400 border-brand-500/40 shadow-sm'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        <textarea
          rows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask an analytical question regarding resource thresholds, storage latency, or failure probability..."
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none leading-relaxed"
        />
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-[11px] text-slate-400 font-medium">Enterprise Benchmarks:</span>
        {enterprisePrompts.map((p, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setPrompt(p)}
            className="text-[11px] px-2.5 py-1 bg-slate-950 hover:bg-slate-800 text-slate-300 rounded-full border border-slate-800 transition-colors truncate max-w-xs"
          >
            {p}
          </button>
        ))}
      </div>

      <div className="flex justify-end pt-1">
        <Button type="submit" size="sm" disabled={isLoading || !prompt.trim()}>
          {isLoading ? 'Synthesizing with Gemini 1.5 Pro...' : 'Generate Executive Report'}
        </Button>
      </div>
    </form>
  );
}
