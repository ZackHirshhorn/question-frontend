import axiosClient from './axiosClient';

interface TemplateData {
  // Define the properties for a template
  name: string;
  content: Record<string, unknown>;
}

export const createTemplate = (data: TemplateData) => {
  return axiosClient.post('/template', data);
};

// export const getTemplates = () => {
//   return axiosClient.get('/template');
// };

export const getTemplates = (page = 1, pageSize = 50) => {
  return axiosClient.get(`/template/search?page=${page}&pageSize=${pageSize}`);
};

export const canCreateQuestionnaires = () => {
  return axiosClient.head(`/template/search?page=1&pageSize=1`);
};

export const getTemplate = (id: string) => {
  return axiosClient.get(`/template/${id}`);
};

export const deleteTemplate = (id: string) => {
  return axiosClient.delete(`/template/${id}`);
};

export const updateTemplate = (id: string, data: Partial<TemplateData>) => {
  return axiosClient.put(`/template/${id}`, data);
};

export const searchTemplates = (name: string) => {
  return axiosClient.get(`/template/search?name=${name}`);
};

export const getUserTemplates = () => {
  return axiosClient.get('/template/user');
};
