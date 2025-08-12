import axiosClient from './axiosClient';
import { sanitizeTemplate } from './sanitizeTemplate';

interface Category {
  name: string;
  questions: any[];
}

interface Template {
  name: string;
  categories: Category[];
}

interface TemplatePayload {
  template: Template;
}

export const createTemplate = (data: TemplatePayload) => {
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

export const getTemplate = async (id: string) => {
  const response = await axiosClient.get(`/template/${id}`);
  // Mutate the response data in place to discard unnecessary populated question objects.
  sanitizeTemplate(response.data);
  return response;
};

export const deleteTemplate = (id: string) => {
  return axiosClient.delete(`/template/${id}`);
};

export const updateTemplate = (id: string, data: Partial<Template>) => {
  return axiosClient.put(`/template/${id}`, { template: data });
};

export const searchTemplates = (name: string) => {
  return axiosClient.get(`/template/search?name=${name}`);
};

export const getUserTemplates = () => {
  return axiosClient.get('/template/user');
};
