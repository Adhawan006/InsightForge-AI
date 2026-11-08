import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDatasetContext } from '../context/DatasetContext';
import { datasetService } from '../services/datasetService';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import LoadingScreen from '../components/common/LoadingScreen';
import { formatBytes } from '../utils/formatters';

export default function Datasets() {
  const navigate = useNavigate();
  const {
    datasets,
    activeDataset,
    activeSummary,
    selectDataset,
    cleanDataset,
    deleteDataset,
    loading: contextLoading,
  } = useDatasetContext();

  const [previewData, setPreviewData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [isCleaningModalOpen, setIsCleaningModalOpen] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);

  // Clean form options
  const [removeDuplicates, setRemoveDuplicates] = useState(true);
  const [numericImputation, setNumericImputation] = useState('mean');
  const [categoricalImputation, setCategoricalImputation] = useState('mode');
  const [standardizeCols, setStandardizeCols] = useState(true);

  // Fetch paginated preview when activeDataset or page changes
  useEffect(() => {
    if (!activeDataset?.id) return;

    let isMounted = true;
    async function loadPreview() {
      setPreviewLoading(true);
      try {
        const preview = await datasetService.getDatasetPreview(activeDataset.id, page, pageSize);
        if (isMounted) {
          setColumns(preview.columns || []);
          setPreviewData(preview.data || []);
          setTotalRows(preview.total_rows || 0);
        }
      } catch (err) {
        console.error('Failed to load dataset preview:', err);
      } finally {
        if (isMounted) setPreviewLoading(false);
      }
    }
    loadPreview();

    return () => {
      isMounted = false;
    };
  }, [activeDataset?.id, page, pageSize]);

  const handleExecuteCleaning = async () => {
    if (!activeDataset?.id) return;
    setIsCleaning(true);
    try {
      await cleanDataset(activeDataset.id, {
        removeDuplicates,
        numericImputation,
        categoricalImputation,
        standardizeColumnNames: standardizeCols,
      });
      setIsCleaningModalOpen(false);
    } catch {
      // Toast handles error
    } finally {
      setIsCleaning(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Permanently purge this dataset from the repository?')) {
      await deleteDataset(id);
    }
  };

  const totalPages = Math.ceil(totalRows / pageSize) || 1;

  if (contextLoading && !datasets.length) {
    return <LoadingScreen message="Loading Ingested Datasets Catalog..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Dataset Repository & Profiler</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage multi-tenant tabular silos, inspect missing values, and execute automatic data cleaning.
          </p>
        </div>
        <Button size="sm" onClick={() => navigate('/upload')}>
          + Ingest New Dataset
        </Button>
      </div>

      {/* Dataset Catalog Table */}
      <Card title="Ingested Catalog" subtitle="Active enterprise dataset repositories">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Dataset Name</th>
                <th className="py-3 px-4">Dimensions</th>
                <th className="py-3 px-4">Size</th>
                <th className="py-3 px-4">Integrity / Missing</th>
                <th className="py-3 px-4">Cleaning Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {datasets.map((d) => {
                const isActive = activeDataset?.id === d.id;
                return (
                  <tr
                    key={d.id}
                    onClick={() => selectDataset(d)}
                    className={`cursor-pointer transition-colors ${
                      isActive ? 'bg-brand-500/10 font-medium' : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-brand-400 shrink-0" />}
                        <span className="text-white font-semibold">{d.name}</span>
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                          {d.file_format}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px]">
                      {d.row_count?.toLocaleString()} &times; {d.column_count}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px]">{formatBytes(d.file_size_bytes)}</td>
                    <td className="py-3 px-4">
                      {d.missing_cells_count ? (
                        <span className="text-amber-400 font-semibold">{d.missing_cells_count} nulls</span>
                      ) : (
                        <span className="text-emerald-400 font-medium">100% complete</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={d.is_cleaned ? 'success' : 'default'}>
                        {d.is_cleaned ? 'Purged & Cleaned' : 'Raw Telemetry'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          size="sm"
                          variant={isActive ? 'primary' : 'ghost'}
                          onClick={(e) => {
                            e.stopPropagation();
                            selectDataset(d);
                          }}
                        >
                          {isActive ? 'Active' : 'Select'}
                        </Button>
                        <button
                          onClick={(e) => handleDelete(d.id, e)}
                          className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors"
                          title="Delete Dataset"
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Tabular Data Grid & Cleaning Tools for Active Dataset */}
      {activeDataset && (
        <Card
          title={`Tabular Explorer: ${activeDataset.name}`}
          subtitle={`Showing records ${((page - 1) * pageSize) + 1} - ${Math.min(page * pageSize, totalRows)} of ${totalRows.toLocaleString()}`}
          headerAction={
            <div className="flex items-center space-x-2">
              <Button size="sm" variant="secondary" onClick={() => setIsCleaningModalOpen(true)}>
                🧹 Auto-Clean Dataset
              </Button>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="bg-slate-950 border border-slate-800 rounded-lg text-xs px-2.5 py-1 text-slate-300 focus:outline-none"
              >
                <option value={10}>10 / page</option>
                <option value={15}>15 / page</option>
                <option value={30}>30 / page</option>
                <option value={50}>50 / page</option>
              </select>
            </div>
          }
        >
          {previewLoading ? (
            <div className="py-12 text-center text-xs text-slate-400 font-mono">
              Loading tabular records...
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto border border-slate-800 rounded-xl">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800 sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3 w-12 text-slate-600 font-mono">#</th>
                      {columns.map((col) => (
                        <th key={col} className="py-2.5 px-3 whitespace-nowrap">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 bg-slate-950/40">
                    {previewData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/50">
                        <td className="py-2.5 px-3 font-mono text-[10px] text-slate-600">
                          {(page - 1) * pageSize + idx + 1}
                        </td>
                        {columns.map((col) => (
                          <td key={col} className="py-2.5 px-3 font-mono text-[11px] whitespace-nowrap">
                            {row[col] !== null && row[col] !== undefined ? (
                              String(row[col])
                            ) : (
                              <span className="text-slate-600 italic">null</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
                <span>
                  Page {page} of {totalPages}
                </span>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                  >
                    &larr; Previous
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                  >
                    Next &rarr;
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Cleaning Modal */}
      <Modal
        isOpen={isCleaningModalOpen}
        onClose={() => setIsCleaningModalOpen(false)}
        title="Enterprise Data Cleaning & Normalization"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            Execute in-memory Pandas deduplication and missing-value imputation on{' '}
            <strong className="text-white">{activeDataset?.name}</strong>.
          </p>

          <div className="space-y-3 p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs">
            <label className="flex items-center space-x-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={removeDuplicates}
                onChange={(e) => setRemoveDuplicates(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-slate-200 font-medium">Purge Duplicate Rows</span>
            </label>

            <label className="flex items-center space-x-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={standardizeCols}
                onChange={(e) => setStandardizeCols(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-slate-200 font-medium">Standardize Column Names (snake_case)</span>
            </label>

            <div>
              <label className="block text-slate-400 mb-1">Numeric Missing Value Strategy:</label>
              <select
                value={numericImputation}
                onChange={(e) => setNumericImputation(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none"
              >
                <option value="mean">Impute with Mean</option>
                <option value="median">Impute with Median</option>
                <option value="zero">Fill with Zero (0)</option>
                <option value="drop">Drop Rows with Missing Values</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Categorical Missing Value Strategy:</label>
              <select
                value={categoricalImputation}
                onChange={(e) => setCategoricalImputation(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none"
              >
                <option value="mode">Impute with Most Frequent (Mode)</option>
                <option value="unknown">Fill with 'Unknown'</option>
                <option value="drop">Drop Rows with Missing Values</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setIsCleaningModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleExecuteCleaning} disabled={isCleaning}>
              {isCleaning ? 'Cleaning...' : 'Execute Data Clean'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
