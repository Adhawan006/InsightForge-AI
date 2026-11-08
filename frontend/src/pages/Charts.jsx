import React, { useState, useEffect } from 'react';
import { useDatasetContext } from '../context/DatasetContext';
import { intelligenceService } from '../services/intelligenceService';
import { datasetService } from '../services/datasetService';
import Card from '../components/common/Card';
import AnalyticsLineChart from '../components/charts/AnalyticsLineChart';
import MetricsBarChart from '../components/charts/MetricsBarChart';
import DistributionPieChart from '../components/charts/DistributionPieChart';
import LoadingScreen from '../components/common/LoadingScreen';
import ErrorState from '../components/common/ErrorState';

export default function Charts() {
  const { activeDataset, activeSummary } = useDatasetContext();
  const [correlations, setCorrelations] = useState(null);
  const [distributions, setDistributions] = useState([]);
  const [previewRows, setPreviewRows] = useState([]);
  const [selectedColumn, setSelectedColumn] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!activeDataset?.id) return;

    let isMounted = true;
    async function fetchAnalyticsData() {
      setLoading(true);
      try {
        const [corr, dists, preview] = await Promise.all([
          intelligenceService.getCorrelations(activeDataset.id).catch(() => null),
          intelligenceService.getDistributions(activeDataset.id).catch(() => []),
          datasetService.getDatasetPreview(activeDataset.id, 1, 30).catch(() => ({ data: [] })),
        ]);

        if (isMounted) {
          setCorrelations(corr);
          setDistributions(dists || []);
          setPreviewRows(preview.data || []);
          if (corr?.columns?.length > 0 && !selectedColumn) {
            setSelectedColumn(corr.columns[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load chart analytics:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchAnalyticsData();

    return () => {
      isMounted = false;
    };
  }, [activeDataset?.id]);

  if (!activeDataset) {
    return (
      <ErrorState
        title="No Active Dataset"
        message="Please select or upload a dataset to compute statistical distributions and correlation charts."
      />
    );
  }

  if (loading && !correlations) {
    return <LoadingScreen message="Calculating Pearson Covariance & Histograms..." />;
  }

  const numericCols = activeSummary?.numeric_columns || [];
  const currentMetric = selectedColumn || numericCols[0] || 'cpu_utilization_pct';

  const lineData = previewRows.map((r, i) => ({
    name: r.cluster_id || r.node_model || `T-${i + 1}`,
    value: Number(r[currentMetric]) || 0,
  }));

  // Find distribution for selected column or default
  const activeDist = distributions.find((d) => d.column_name === currentMetric) || distributions[0];
  const barData = (activeDist?.bins || []).map((b) => ({
    name: b.bin_label,
    value: b.count,
  }));

  const corrCols = correlations?.columns || [];
  const corrMatrix = correlations?.correlation_matrix || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Statistical Analytics & Visualizations</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Covariance matrices, variance progression curves, and frequency distributions for{' '}
            <strong className="text-brand-400">{activeDataset.name}</strong>.
          </p>
        </div>

        {numericCols.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400">Target Feature:</span>
            <select
              value={currentMetric}
              onChange={(e) => setSelectedColumn(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono px-3 py-1.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              {numericCols.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          title={`Temporal Progression: ${currentMetric}`}
          subtitle="Sequential telemetry variance along sampled records"
        >
          {lineData.length > 0 ? (
            <AnalyticsLineChart data={lineData} dataKeyX="name" dataKeyY="value" stroke="#38bdf8" />
          ) : (
            <div className="h-64 flex items-center justify-center text-xs text-slate-500">
              No continuous records available.
            </div>
          )}
        </Card>

        <Card
          title={`Histogram Distribution: ${activeDist?.column_name || currentMetric}`}
          subtitle="8-bin binned frequency representation"
        >
          {barData.length > 0 ? (
            <MetricsBarChart data={barData} fill="#0c87eb" />
          ) : (
            <div className="h-64 flex items-center justify-center text-xs text-slate-500">
              No continuous histogram available.
            </div>
          )}
        </Card>
      </div>

      {/* Pearson Correlation Heatmap Table */}
      {corrCols.length > 0 && (
        <Card
          title="Pearson Pairwise Correlation Matrix"
          subtitle="Calculated correlation coefficients across all numeric dimensions (-1.0 to +1.0)"
        >
          <div className="overflow-x-auto border border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3 font-mono text-[11px] bg-slate-950">Dimension</th>
                  {corrCols.map((col) => (
                    <th key={col} className="py-2.5 px-3 font-mono text-[11px] whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 bg-slate-950/40">
                {corrCols.map((rowCol) => (
                  <tr key={rowCol} className="hover:bg-slate-800/40">
                    <td className="py-2 px-3 font-mono text-[11px] text-white font-medium bg-slate-950/80 whitespace-nowrap">
                      {rowCol}
                    </td>
                    {corrCols.map((colCol) => {
                      const val = corrMatrix[rowCol]?.[colCol] ?? 0;
                      let bg = 'text-slate-400';
                      if (val > 0.7) bg = 'text-emerald-400 font-bold bg-emerald-950/30';
                      else if (val > 0.4) bg = 'text-emerald-300 bg-emerald-950/15';
                      else if (val < -0.4) bg = 'text-rose-400 font-bold bg-rose-950/30';
                      return (
                        <td
                          key={colCol}
                          className={`py-2 px-3 font-mono text-[11px] text-center whitespace-nowrap ${bg}`}
                        >
                          {val.toFixed(2)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
