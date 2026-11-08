import api from './api';

export const datasetService = {
  getDatasets: async (skip = 0, limit = 100) => {
    const response = await api.get('/datasets/', { params: { skip, limit } });
    return response.data;
  },

  getDatasetById: async (id) => {
    const response = await api.get(`/datasets/${id}`);
    return response.data;
  },

  getDatasetSummary: async (id) => {
    const response = await api.get(`/datasets/${id}/summary`);
    return response.data;
  },

  getDatasetPreview: async (id, page = 1, pageSize = 20) => {
    const response = await api.get(`/datasets/${id}/preview`, {
      params: { page, page_size: pageSize },
    });
    return response.data;
  },

  uploadDataset: async (file, name, description = '') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);
    formData.append('description', description);

    const response = await api.post('/datasets/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  cleanDataset: async (id, cleanParams = {}) => {
    const response = await api.post(`/datasets/${id}/clean`, {
      remove_duplicates: cleanParams.removeDuplicates ?? true,
      numeric_imputation: cleanParams.numericImputation ?? 'mean',
      categorical_imputation: cleanParams.categoricalImputation ?? 'mode',
      standardize_column_names: cleanParams.standardizeColumnNames ?? true,
    });
    return response.data;
  },

  deleteDataset: async (id) => {
    await api.delete(`/datasets/${id}`);
    return true;
  },
};
