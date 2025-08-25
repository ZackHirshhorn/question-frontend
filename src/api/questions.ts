import axiosClient from './axiosClient';

interface QuestionCollectionData {
  // Define the properties for a question collection
  name: string;
  questions: Record<string, unknown>[];
}

interface QuestionPayload {
  q: string;
  qType: 'Text' | 'Multiple' | 'Single' | 'Number';
  required: boolean;
  choice: string[];
  id?: string;
}

interface QuestionCollectionUpdateData {
  colName?: string;
  description?: string;
  questions?: QuestionPayload[];
}

export const createQuestionCollection = (data: QuestionCollectionData) => {
  return axiosClient.post('/questions', data);
};

// Exact backend shape for creation: { colName, questions }
export const createQuestionsCol = (
  colName: string,
  questions: Record<string, unknown>[] = [],
  description?: string
) => {
  return axiosClient.post('/questions', { colName, questions, description });
};

// Fetch question collections. If a value is provided, it searches by name; otherwise,
// it returns a paginated list of all collections for the admin user.
export const searchQuestionCollections = (value?: string, page = 1, pageSize = 50) => {
  const params = new URLSearchParams();
  if (value && value.trim().length > 0) params.set('value', value.trim());
  if (page) params.set('page', String(page));
  if (pageSize) params.set('pageSize', String(pageSize));
  const qs = params.toString();
  // For Admin users, fetch the authenticated user's collections
  return axiosClient.get(`/questions/user${qs ? `?${qs}` : ''}`);
};

export const getQuestionCollection = (id: string) => {
  return axiosClient.get(`/questions/${id}`);
};

export const updateQuestionCollection = (id: string, data: QuestionCollectionUpdateData) => {
  return axiosClient.put(`/questions/${id}`, data);
};

export const deleteQuestionCollection = (id: string) => {
  return axiosClient.delete(`/questions/${id}`);
};
