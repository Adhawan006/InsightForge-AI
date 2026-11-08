import React, { useState, useRef } from 'react';
import Button from './Button';
import Input from './Input';
import { formatBytes } from '../../utils/formatters';

export default function FileUpload({ onUpload, isLoading }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [datasetName, setDatasetName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateAndSetFile = (file) => {
    setError('');
    if (!file) return;

    const allowed = ['.csv', '.xlsx', '.xls'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowed.includes(ext)) {
      setError(`Invalid format (${ext}). Please select a CSV or Excel file (.csv, .xlsx, .xls).`);
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      setError('File exceeds enterprise limit of 100 MB.');
      return;
    }

    setSelectedFile(file);
    if (!datasetName) {
      // Auto-populate dataset name from file name without extension
      const base = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      setDatasetName(base.replace(/[-_]/g, ' '));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select a file to upload.');
      return;
    }
    if (!datasetName.trim()) {
      setError('Please provide a name for this dataset.');
      return;
    }
    onUpload?.(selectedFile, datasetName.trim(), description.trim());
  };

  const handleReset = () => {
    setSelectedFile(null);
    setDatasetName('');
    setDescription('');
    setError('');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-xl text-xs text-rose-300 flex items-center justify-between">
          <span>{error}</span>
          <button type="button" onClick={() => setError('')} className="text-rose-400 hover:text-white">✕</button>
        </div>
      )}

      {!selectedFile ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center min-h-[220px] ${
            dragActive
              ? 'border-brand-500 bg-brand-500/10'
              : 'border-slate-800 hover:border-slate-700 bg-slate-900/60'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleChange}
            className="hidden"
          />
          <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center text-xl font-bold mb-3">
            📁
          </div>
          <p className="text-sm font-semibold text-slate-100">
            Click to upload or drag & drop dataset
          </p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            Supported formats: CSV, Excel (.xlsx, .xls) up to 100 MB. Ingests directly into Dell APEX telemetry pipeline.
          </p>
        </div>
      ) : (
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📄</span>
              <div>
                <p className="text-xs font-semibold text-white">{selectedFile.name}</p>
                <p className="text-[11px] text-slate-400">{formatBytes(selectedFile.size)}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-slate-400 hover:text-rose-400 transition-colors"
            >
              Remove
            </button>
          </div>

          <div className="space-y-3">
            <Input
              label="Dataset Name *"
              value={datasetName}
              onChange={(e) => setDatasetName(e.target.value)}
              placeholder="e.g. Dell PowerEdge Fleet Telemetry"
              required
            />
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Description (Optional)
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enterprise context, node tier, SLA boundaries..."
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={handleReset} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isLoading}>
              {isLoading ? 'Ingesting Dataset...' : 'Ingest into Platform'}
            </Button>
          </div>
        </div>
      )}
    </form>
  );
}
