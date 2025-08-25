import axiosClient from './axiosClient';

interface Category {
  name: string;
  questions: unknown[];
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

export const getTemplate = async (id: string) => {
  const response = await axiosClient.get(`/template/${id}`);
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

// Lightweight auth probe that mirrors the list fetch but with HEAD
export const headUserTemplates = () => {
  return axiosClient.head('/template/user');
};

export interface TemplateSummary {
  id: string;
  name: string;
  responses: number;
  complete: number;
  incomplete: number;
}

export const getTemplatesSummary = () => {
  return axiosClient.get<TemplateSummary[]>('/template/summary');
};

export interface QuestionnaireResponse {
  id: string;
  templateId: string;
  template: Template;
  userName?: string | null;
  userEmail?: string | null;
  userPhone?: string | null;
  schoolName?: string | null;
  isComplete: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}

interface SingleTemplateSummaryPayload {
  responses: QuestionnaireResponse[];
}

export const getSingleTemplateSummary = (templateId: string) => {
  return axiosClient.get<SingleTemplateSummaryPayload>(`/template/summary/${templateId}`);
};
