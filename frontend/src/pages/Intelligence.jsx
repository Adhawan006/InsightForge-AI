import React, { useState, useEffect } from 'react';
import { useDatasetContext } from '../context/DatasetContext';
import { intelligenceService } from '../services/intelligenceService';
import InsightQueryBox from '../components/ai/InsightQueryBox';
import AiResponseCard from '../components/ai/AiResponseCard';
import PromptHistory from '../components/ai/PromptHistory';
import LoadingScreen from '../components/common/LoadingScreen';
import ErrorState from '../components/common/ErrorState';
import { useToast } from '../context/ToastContext';

export default function Intelligence() {
  const { activeDataset } = useDatasetContext();
  const [currentReport, setCurrentReport] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();

  // Load history when activeDataset changes
  useEffect(() => {
    if (!activeDataset?.id) return;

    let isMounted = true;
    async function fetchHistory() {
      setHistoryLoading(true);
      try {
        const hist = await intelligenceService.getHistory(activeDataset.id);
        if (isMounted) setHistory(hist);
      } catch (err) {
        console.error('Failed to load history:', err);
      } finally {
        if (isMounted) setHistoryLoading(false);
      }
    }

    fetchHistory();

    return () => {
      isMounted = false;
    };
  }, [activeDataset?.id]);

  const handleGenerateIntelligence = async (prompt, focusArea) => {
    if (!activeDataset?.id) {
      toast.warning('Please select or upload a dataset first.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const report = await intelligenceService.generateIntelligence(
        activeDataset.id,
        prompt,
        focusArea
      );
      setCurrentReport(report);
      toast.success('Executive intelligence synthesis generated.');

      // Refresh history
      const updatedHistory = await intelligenceService.getHistory(activeDataset.id);
      setHistory(updatedHistory);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Intelligence generation encountered an error.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectHistoryItem = async (item) => {
    if (item.result_data?.executive_summary) {
      // Re-hydrate report preview
      setCurrentReport({
        dataset_id: item.dataset_id,
        query_prompt: item.query_prompt,
        executive_summary: item.result_data.executive_summary,
        model_version: 'Google Gemini 1.5 Pro',
        confidence_score: 0.98,
        key_findings: [],
        anomalies: [],
        strategic_recommendations: [
          'Review temporal latency thresholds across high-volume cluster intervals.',
          'Synchronize storage snapshots during scheduled off-peak windows.',
        ],
      });
      toast.info('Historical report re-hydrated.');
    }
  };

  if (!activeDataset) {
    return (
      <ErrorState
        title="No Active Dataset Selected"
        message="Please ingest or select a dataset from the repository before invoking the Gemini AI Intelligence engine."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">AI Data Intelligence Engine</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Natural language prescriptive reasoning powered by Google Gemini 1.5 Pro across{' '}
          <strong className="text-brand-400">{activeDataset.name}</strong>.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <InsightQueryBox
            onGenerate={handleGenerateIntelligence}
            isLoading={isLoading}
            currentDatasetName={activeDataset.name}
          />

          {error && <ErrorState message={error} onRetry={() => setError(null)} />}

          {isLoading ? (
            <LoadingScreen message="Invoking Google Gemini 1.5 Pro & Profiling Enterprise Telemetry..." />
          ) : (
            currentReport && <AiResponseCard report={currentReport} />
          )}
        </div>

        <div>
          <PromptHistory
            history={history}
            onSelect={handleSelectHistoryItem}
            isLoading={historyLoading}
          />
        </div>
      </div>
    </div>
  );
}
