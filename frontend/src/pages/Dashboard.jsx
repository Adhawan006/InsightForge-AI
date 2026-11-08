import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDatasetContext } from '../context/DatasetContext';
import { intelligenceService } from '../services/intelligenceService';
import { datasetService } from '../services/datasetService';
import KpiMetricCard from '../components/charts/KpiMetricCard';
import AnalyticsLineChart from '../components/charts/AnalyticsLineChart';
import MetricsBarChart from '../components/charts/MetricsBarChart';
import DistributionPieChart from '../components/charts/DistributionPieChart';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import LoadingScreen from '../components/common/LoadingScreen';
import { formatBytes } from '../utils/formatters';

export default function Dashboard() {
  const navigate = useNavigate();
  const { activeDataset, activeSummary, datasets, loading: contextLoading } = useDatasetContext();
  const [telemetryRows, setTelemetryRows] = useState([]);
  const [distributions, setDistributions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!activeDataset?.id) return;
    let isMounted = true;
    async function fetchDashboardTelemetry() {
      setLoading(true);
      try {
        const [preview, dists] = await Promise.all([
          datasetService.getDatasetPreview(activeDataset.id, 1, 20),
          intelligenceService.getDistributions(activeDataset.id).catch(() => []),
        ]);
        if (isMounted) {
          setTelemetryRows(preview.data || []);
          setDistributions(dists || []);
        }
      } catch (err) {
        console.error('Failed to load dashboard telemetry:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchDashboardTelemetry();
    return () => { isMounted = false; };
  }, [activeDataset?.id]);

  // Empty / loading states
  if (contextLoading && !datasets.length) {
    return <LoadingScreen message="Loading dashboard..." />;
  }

  if (!activeDataset) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4">
        <p className="text-lg text-slate-300">Select a dataset to view telemetry.</p>
        <Button onClick={() => navigate('/datasets')}>Go to Datasets</Button>
      </div>
    );
  }

  // Derive dynamic chart data
  const numericCols = activeSummary?.numeric_columns || [];
  const primaryMetric = numericCols[0] || 'cpu_utilization_pct';
  const secondaryMetric = numericCols[1] || 'memory_utilization_pct';

  const lineChartData = telemetryRows.map((row, idx) => ({
    name: row.cluster_id || row.node_model || `R-${idx + 1}`,
    value: Number(row[primaryMetric]) || 0,
    secondary: Number(row[secondaryMetric]) || 0,
  }));

  const barChartData = (distributions[0]?.bins || []).map((bin) => ({
    name: bin.bin_label,
    value: bin.count,
  }));

  const pieChartData = (activeSummary?.columns || [])
    .filter((c) => c.is_categorical)
    .slice(0, 1)
    .flatMap((c) =>
      (c.sample_values || []).map((v, i) => ({
        name: String(v),
        value: 10 + i * 15,
      }))
    );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Enterprise Telemetry Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">
            Real‑time insights for <span className="text-brand-400 font-semibold">{activeDataset?.name}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => navigate('/upload')}>⬆️ Ingest Dataset</Button>
          <Button size="sm" onClick={() => navigate('/intelligence')}>✨ AI Data Intelligence</Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiMetricCard
          title="Cataloged Records"
          value={activeDataset?.row_count?.toLocaleString() || '0'}
          change={`${activeDataset?.column_count || 0} features`}
          isPositive={true}
          subtitle="dimensions profiled"
        />
        <KpiMetricCard
          title="Data Integrity Index"
          value={activeSummary ? `${(100 - activeSummary.missing_cells_pct).toFixed(1)}%` : '100%'}
          change={activeSummary?.missing_cells_count ? `${activeSummary.missing_cells_count} nulls` : 'Zero loss'}
          isPositive={!activeSummary?.missing_cells_count}
          subtitle="verified completeness"
        />
        <KpiMetricCard
          title="Memory Footprint"
          value={formatBytes(activeDataset?.file_size_bytes || 0)}
          change={activeDataset?.file_format?.toUpperCase() || 'CSV'}
          isPositive={true}
          subtitle="storage allocation"
        />
        <KpiMetricCard
          title="Purged Duplicates"
          value={activeDataset?.duplicate_rows_count || '0'}
          change={activeDataset?.is_cleaned ? 'Cleaned' : 'Raw'}
          isPositive={Boolean(activeDataset?.is_cleaned)}
          subtitle="deduplication status"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          title={`Normalized Metric Progression (${primaryMetric})`}
          subtitle="Sequential telemetry variance across records"
          headerAction={<span className="text-xs text-brand-400 font-mono">Recharts Engine</span>}
        >
          {loading ? (
            <LoadingScreen message="Loading charts..." />
          ) : lineChartData.length > 0 ? (
            <AnalyticsLineChart data={lineChartData} dataKeyX="name" dataKeyY="value" stroke="#0c87eb" />
          ) : (
            <div className="h-64 flex items-center justify-center text-xs text-slate-500">Awaiting dataset ingestion…</div>
          )}
        </Card>
        <Card
          title={`Distribution Frequency (${distributions[0]?.column_name || primaryMetric})`}
          subtitle="8‑bin histogram for continuous dimensions"
          headerAction={<span className="text-xs text-sky-400 font-mono">Histogram</span>}
        >
          {loading ? (
            <LoadingScreen message="Loading distribution..." />
          ) : barChartData.length > 0 ? (
            <MetricsBarChart data={barChartData} fill="#38bdf8" />
          ) : (
            <div className="h-64 flex items-center justify-center text-xs text-slate-500">No numeric columns to display.</div>
          )}
        </Card>
      </div>
    </div>
  );
}
