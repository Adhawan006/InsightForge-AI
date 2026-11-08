import React from 'react';
import Card from '../common/Card';
import Badge from '../common/Badge';

export default function PromptHistory({ history = [], onSelect, isLoading }) {
  return (
    <Card title="Analysis History" subtitle="Previous queries executed against this dataset">
      {isLoading ? (
        <div className="py-8 text-center text-xs text-slate-400">Loading query telemetry...</div>
      ) : !history.length ? (
        <div className="py-8 text-center text-xs text-slate-500 italic">No historical queries recorded yet</div>
      ) : (
        <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
          {history.map((job) => (
            <div
              key={job.id}
              onClick={() => onSelect?.(job)}
              className="p-3 bg-slate-950 border border-slate-800 hover:border-brand-500/50 rounded-xl cursor-pointer transition-all space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {job.job_type}
                </span>
                <span className="text-[10px] text-slate-500">
                  {new Date(job.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-xs text-slate-200 line-clamp-2 font-medium">
                {job.query_prompt || 'Standard analytical profiling'}
              </p>
              {job.execution_time_ms ? (
                <div className="text-[10px] text-slate-500 flex items-center justify-between">
                  <span>Latency: {job.execution_time_ms}ms</span>
                  <Badge variant={job.status === 'SUCCESS' ? 'success' : 'danger'}>
                    {job.status}
                  </Badge>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
