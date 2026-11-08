import React, { useState } from 'react';
import { useDatasetContext } from '../context/DatasetContext';
import { intelligenceService } from '../services/intelligenceService';
import SqlGeneratorBox from '../components/ai/SqlGeneratorBox';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import ErrorState from '../components/common/ErrorState';
import { useToast } from '../context/ToastContext';

export default function SqlGenerator() {
  const { activeDataset, activeSummary } = useDatasetContext();
  const [sqlResult, setSqlResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();

  const handleGenerateSql = async (prompt, dialect) => {
    if (!activeDataset?.id) {
      toast.warning('Please select an active dataset first.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await intelligenceService.generateSql(activeDataset.id, prompt, dialect);
      setSqlResult(response);
      toast.success('SQL query generated successfully.');
    } catch (err) {
      const msg = err.response?.data?.detail || 'SQL generation encountered an error.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (!activeDataset) {
    return (
      <ErrorState
        title="No Active Dataset"
        message="Please select or upload a dataset before generating SQL queries."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-bold text-white tracking-tight">Enterprise SQL Query Synthesizer</h1>
          <Badge variant="primary">PostgreSQL &bull; ANSI</Badge>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          Translate natural language analytical questions into safe, optimized SELECT queries mapped to{' '}
          <strong className="text-brand-400">{activeDataset.name}</strong>.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <SqlGeneratorBox
            onGenerate={handleGenerateSql}
            result={sqlResult}
            isLoading={isLoading}
            currentDatasetName={activeDataset.name}
          />
        </div>

        <div>
          <Card
            title="Available Schema Columns"
            subtitle={`${activeSummary?.column_count || 0} dimensions available for query projection`}
          >
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {(activeSummary?.columns || []).map((col) => (
                <div
                  key={col.name}
                  className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between"
                >
                  <span className="text-xs font-mono text-slate-200">{col.name}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                    {col.data_type}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
