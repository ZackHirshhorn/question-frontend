import axiosClient from './axiosClient';

export const createTemplate = (data: any) => {.
  return axiosClient.post('/template', data);
};

export const getTemplates = () => {
  return axiosClient.get('/template');
};

export const getTemplate = (id: string) => {
  return axiosClient.get(`/template/${id}`);
};

export const deleteTemplate = (id: string) => {
  return axiosClient.delete(`/template/${id}`);
};

export const updateTemplate = (id: string, data: any) => {
  return axiosClient.put(`/template/${id}`, data);
};

export const searchTemplates = (query: string) => {
  return axiosClient.get(`/template/search?query=${query}`);
};
