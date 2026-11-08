import React, { useState, useEffect } from 'react';
import { useDatasetContext } from '../context/DatasetContext';
import { intelligenceService } from '../services/intelligenceService';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import LoadingScreen from '../components/common/LoadingScreen';

export default function AnalysisHistory() {
  const { activeDataset, datasets } = useDatasetContext();
  const [selectedDatasetId, setSelectedDatasetId] = useState(activeDataset?.id || '');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeJobModal, setActiveJobModal] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadHistory() {
      setLoading(true);
      try {
        const data = await intelligenceService.getHistory(
          selectedDatasetId ? Number(selectedDatasetId) : null,
          50
        );
        if (isMounted) setHistory(data);
      } catch (err) {
        console.error('Failed to load history:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadHistory();

    return () => {
      isMounted = false;
    };
  }, [selectedDatasetId]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Enterprise Analysis Telemetry & Audit</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Full historical audit of Gemini AI synthesis, natural language queries, and SQL generations.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400">Filter Silo:</span>
          <select
            value={selectedDatasetId}
            onChange={(e) => setSelectedDatasetId(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg text-xs px-3 py-1.5 text-slate-200 focus:outline-none"
          >
            <option value="">All Enterprise Datasets</option>
            {datasets.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Card title="Query Execution Log" subtitle={`${history.length} operations cataloged`}>
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading historical audit stream...</div>
        ) : history.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 italic">
            No analysis jobs recorded for this filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Operation Type</th>
                  <th className="py-3 px-4">Analytical Prompt</th>
                  <th className="py-3 px-4">Latency</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Inspection</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {history.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {new Date(job.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {job.job_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-white max-w-xs truncate">
                      {job.query_prompt || 'Statistical Profiling Run'}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                      {job.execution_time_ms ? `${job.execution_time_ms}ms` : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={job.status === 'SUCCESS' ? 'success' : 'danger'}>
                        {job.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button size="sm" variant="ghost" onClick={() => setActiveJobModal(job)}>
                        Inspect Result
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Detail Inspection Modal */}
      <Modal
        isOpen={Boolean(activeJobModal)}
        onClose={() => setActiveJobModal(null)}
        title={`Audit Record #${activeJobModal?.id} &bull; ${activeJobModal?.job_type}`}
      >
        {activeJobModal && (
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Inquiry Prompt</span>
              <p className="text-xs text-white bg-slate-950 p-3 rounded-lg border border-slate-800">
                {activeJobModal.query_prompt || 'Standard analytical task'}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Result Payload</span>
              <pre className="text-xs font-mono text-sky-300 bg-slate-950 p-3 rounded-lg border border-slate-800 max-h-64 overflow-y-auto">
                {JSON.stringify(activeJobModal.result_data, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <Button size="sm" variant="secondary" onClick={() => setActiveJobModal(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
