import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { datasetService } from '../services/datasetService';
import { useToast } from './ToastContext';

const DatasetContext = createContext(null);

export function DatasetProvider({ children }) {
  const [datasets, setDatasets] = useState([]);
  const [activeDataset, setActiveDataset] = useState(null);
  const [activeSummary, setActiveSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();

  const fetchDatasets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await datasetService.getDatasets();
      setDatasets(data);
      if (data.length > 0) {
        // If no active dataset or active dataset was deleted, pick the first
        setActiveDataset((prev) => {
          if (!prev) return data[0];
          const found = data.find((d) => d.id === prev.id);
          return found || data[0];
        });
      } else {
        setActiveDataset(null);
        setActiveSummary(null);
      }
      return data;
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to retrieve datasets catalog.';
      setError(msg);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDatasets();
  }, [fetchDatasets]);

  // Load summary whenever active dataset changes
  useEffect(() => {
    if (!activeDataset?.id) {
      setActiveSummary(null);
      return;
    }

    let isMounted = true;
    async function loadSummary() {
      try {
        const summary = await datasetService.getDatasetSummary(activeDataset.id);
        if (isMounted) setActiveSummary(summary);
      } catch (err) {
        console.error('Failed to load dataset summary:', err);
      }
    }
    loadSummary();

    return () => {
      isMounted = false;
    };
  }, [activeDataset?.id]);

  const selectDataset = useCallback((datasetOrId) => {
    if (typeof datasetOrId === 'object' && datasetOrId !== null) {
      setActiveDataset(datasetOrId);
    } else {
      const found = datasets.find((d) => d.id === Number(datasetOrId));
      if (found) setActiveDataset(found);
    }
  }, [datasets]);

  const uploadDataset = async (file, name, description) => {
    setLoading(true);
    try {
      const created = await datasetService.uploadDataset(file, name, description);
      toast.success(`Dataset '${created.name}' ingested successfully.`);
      await fetchDatasets();
      setActiveDataset(created);
      return created;
    } catch (err) {
      const msg = err.response?.data?.detail || 'Upload failed.';
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cleanDataset = async (datasetId, cleanOptions) => {
    setLoading(true);
    try {
      const result = await datasetService.cleanDataset(datasetId, cleanOptions);
      toast.success(`Data cleaning complete: ${result.duplicates_removed} duplicates purged, ${result.missing_values_imputed} cells imputed.`);
      await fetchDatasets();
      const refreshed = await datasetService.getDatasetById(datasetId);
      setActiveDataset(refreshed);
      return result;
    } catch (err) {
      const msg = err.response?.data?.detail || 'Data cleaning encountered an error.';
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteDataset = async (datasetId) => {
    try {
      await datasetService.deleteDataset(datasetId);
      toast.info('Dataset deleted.');
      await fetchDatasets();
    } catch (err) {
      toast.error('Failed to delete dataset.');
      throw err;
    }
  };

  return (
    <DatasetContext.Provider
      value={{
        datasets,
        activeDataset,
        activeSummary,
        loading,
        error,
        fetchDatasets,
        selectDataset,
        uploadDataset,
        cleanDataset,
        deleteDataset,
      }}
    >
      {children}
    </DatasetContext.Provider>
  );
}

export function useDatasetContext() {
  const context = useContext(DatasetContext);
  if (!context) {
    throw new Error('useDatasetContext must be used within a DatasetProvider');
  }
  return context;
}
