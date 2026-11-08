import { useState, useEffect, useCallback } from 'react';
import { datasetService } from '../services/datasetService';

export function useDataset() {
  const [datasets, setDatasets] = useState([]);
  const [currentDataset, setCurrentDataset] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDatasets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await datasetService.getDatasets();
      setDatasets(data);
      if (data.length > 0 && !currentDataset) {
        // Automatically default to the first dataset (e.g. Dell APEX Telemetry)
        setCurrentDataset(data[0]);
      }
      return data;
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to fetch datasets.';
      setError(msg);
      return [];
    } finally {
      setLoading(false);
    }
  }, [currentDataset]);

  useEffect(() => {
    fetchDatasets();
  }, [fetchDatasets]);

  const selectDataset = async (id) => {
    setLoading(true);
    try {
      const ds = await datasetService.getDatasetById(id);
      setCurrentDataset(ds);
      return ds;
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load dataset details.');
    } finally {
      setLoading(false);
    }
  };

  const uploadDataset = async (file, name, description) => {
    setLoading(true);
    setError(null);
    try {
      const newDs = await datasetService.uploadDataset(file, name, description);
      setDatasets((prev) => [newDs, ...prev]);
      setCurrentDataset(newDs);
      return newDs;
    } catch (err) {
      const msg = err.response?.data?.detail || 'Dataset upload failed.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const cleanDataset = async (id, options) => {
    setLoading(true);
    setError(null);
    try {
      const cleanResult = await datasetService.cleanDataset(id, options);
      // Refresh list and current dataset
      await fetchDatasets();
      if (currentDataset?.id === id) {
        const refreshed = await datasetService.getDatasetById(id);
        setCurrentDataset(refreshed);
      }
      return cleanResult;
    } catch (err) {
      const msg = err.response?.data?.detail || 'Data cleaning failed.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const deleteDataset = async (id) => {
    setLoading(true);
    try {
      await datasetService.deleteDataset(id);
      setDatasets((prev) => prev.filter((d) => d.id !== id));
      if (currentDataset?.id === id) {
        const remaining = datasets.filter((d) => d.id !== id);
        setCurrentDataset(remaining[0] || null);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete dataset.');
    } finally {
      setLoading(false);
    }
  };

  return {
    datasets,
    currentDataset,
    loading,
    error,
    fetchDatasets,
    selectDataset,
    setCurrentDataset,
    uploadDataset,
    cleanDataset,
    deleteDataset,
  };
}
