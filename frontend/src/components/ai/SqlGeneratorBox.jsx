import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { useToast } from '../../context/ToastContext';

export default function SqlGeneratorBox({ onGenerate, result, isLoading, currentDatasetName }) {
  const [prompt, setPrompt] = useState('');
  const [dialect, setDialect] = useState('postgresql');
  const toast = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    onGenerate?.(prompt.trim(), dialect);
  };

  const handleCopy = () => {
    if (!result?.sql_query) return;
    navigator.clipboard.writeText(result.sql_query);
    toast.success('SQL query copied to clipboard!');
  };

  const samplePrompts = [
    'Find average CPU and memory utilization grouped by cluster',
    'Show all server nodes where storage latency exceeds 4.0 ms',
    'Calculate total error rate percentage partitioned by region',
  ];

  return (
    <div className="space-y-6">
      <Card title="Natural Language SQL Synthesis" subtitle={`Targeting: ${currentDatasetName || 'Active Dataset'}`}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs text-slate-400">
              Transform analytical business questions into syntactically compliant queries
            </span>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400">Dialect:</span>
              <select
                value={dialect}
                onChange={(e) => setDialect(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg text-xs px-2.5 py-1 text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="postgresql">PostgreSQL</option>
                <option value="ansi">ANSI SQL</option>
              </select>
            </div>
          </div>

          <div className="relative">
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Find all cluster records where power consumption is greater than 500W ordered by CPU desc..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            />
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-[11px] text-slate-400 font-medium">Quick Prompts:</span>
            {samplePrompts.map((p, idx) => (
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

          <div className="flex justify-end">
            <Button type="submit" size="sm" disabled={isLoading || !prompt.trim()}>
              {isLoading ? 'Synthesizing Query...' : 'Generate Enterprise SQL'}
            </Button>
          </div>
        </form>
      </Card>

      {result && (
        <Card
          title="Generated SQL Specification"
          headerAction={
            <div className="flex items-center space-x-2">
              <Badge variant="primary">Confidence: {(result.confidence_score * 100).toFixed(0)}%</Badge>
              <Button size="sm" variant="secondary" onClick={handleCopy}>
                📋 Copy SQL
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-sky-300 overflow-x-auto selection:bg-brand-600">
              <pre>{result.sql_query}</pre>
            </div>

            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Architectural Rationale</p>
              <p className="text-xs text-slate-300 leading-relaxed">{result.explanation}</p>
            </div>

            {result.columns_projected?.length > 0 && (
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-slate-400 font-medium">Projected Dimensions:</span>
                <div className="flex flex-wrap gap-1.5">
                  {result.columns_projected.map((col, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] font-mono">
                      {col}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
