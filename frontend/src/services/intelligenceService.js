import api from './api';

export const intelligenceService = {
  generateIntelligence: async (datasetId, prompt, focusArea = 'GENERAL') => {
    const response = await api.post('/intelligence/generate', {
      dataset_id: datasetId,
      prompt,
      focus_area: focusArea,
    });
    return response.data;
  },

  generateSql: async (datasetId, prompt, dialect = 'postgresql') => {
    const response = await api.post('/intelligence/sql', {
      dataset_id: datasetId,
      prompt,
      dialect,
    });
    return response.data;
  },

  getHistory: async (datasetId = null, limit = 20) => {
    const params = { limit };
    if (datasetId) params.dataset_id = datasetId;
    const response = await api.get('/intelligence/history', { params });
    return response.data;
  },

  getReportById: async (reportId) => {
    const response = await api.get(`/intelligence/reports/${reportId}`);
    return response.data;
  },

  computeAnalytics: async (datasetId, targetColumns = null, operation = 'DESCRIPTIVE_STATS') => {
    const response = await api.post('/analytics/compute', {
      dataset_id: datasetId,
      target_columns: targetColumns,
      operation,
    });
    return response.data;
  },

  getCorrelations: async (datasetId) => {
    const response = await api.get(`/analytics/${datasetId}/correlations`);
    return response.data;
  },

  getDistributions: async (datasetId) => {
    const response = await api.get(`/analytics/${datasetId}/distributions`);
    return response.data;
  },
};
