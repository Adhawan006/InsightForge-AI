import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDatasetContext } from '../context/DatasetContext';
import FileUpload from '../components/common/FileUpload';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';

export default function DatasetUpload() {
  const navigate = useNavigate();
  const { uploadDataset, loading, datasets } = useDatasetContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpload = async (file, name, description) => {
    setIsSubmitting(true);
    try {
      const created = await uploadDataset(file, name, description);
      navigate('/datasets');
    } catch {
      // Error is handled via Toast in context
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-bold text-white tracking-tight">Dataset Ingestion Pipeline</h1>
          <Badge variant="primary">CSV &bull; Excel</Badge>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Ingest structured tabular logs into Dell APEX telemetry storage with automatic schema extraction and cleaning.
        </p>
      </div>

      <FileUpload onUpload={handleUpload} isLoading={isSubmitting || loading} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Ingestion Specifications">
          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-start space-x-2">
              <span className="text-brand-400 font-bold">&bull;</span>
              <span><strong>Supported Formats:</strong> RFC 4180 CSV, Microsoft Excel (.xlsx, .xls)</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-brand-400 font-bold">&bull;</span>
              <span><strong>Max Payload Size:</strong> 100 MB per single batch ingestion</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-brand-400 font-bold">&bull;</span>
              <span><strong>Automatic Profiling:</strong> Type inference, null detection, skewness profiling</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-brand-400 font-bold">&bull;</span>
              <span><strong>Encoding:</strong> UTF-8, Latin-1 with automatic fallback</span>
            </li>
          </ul>
        </Card>

        <Card title="Recently Cataloged Datasets">
          {datasets.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No datasets cataloged yet.</p>
          ) : (
            <div className="space-y-2">
              {datasets.slice(0, 3).map((d) => (
                <div
                  key={d.id}
                  onClick={() => navigate('/datasets')}
                  className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between cursor-pointer hover:border-slate-700 transition-colors"
                >
                  <div>
                    <p className="text-xs font-semibold text-white">{d.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {d.row_count?.toLocaleString()} rows &bull; {d.column_count} cols
                    </p>
                  </div>
                  <Badge variant={d.is_cleaned ? 'success' : 'default'}>
                    {d.is_cleaned ? 'Cleaned' : 'Raw'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
