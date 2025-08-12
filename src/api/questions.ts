import axiosClient from './axiosClient';

interface QuestionCollectionData {
  // Define the properties for a question collection
  name: string;
  questions: Record<string, unknown>[];
}

export const createQuestionCollection = (data: QuestionCollectionData) => {
  return axiosClient.post('/questions', data);
};

// Exact backend shape for creation: { colName, questions }
export const createQuestionsCol = (colName: string, questions: Record<string, unknown>[] = []) => {
  return axiosClient.post('/questions', { colName, questions });
};

// Fetch question collections. If a value is provided, it searches by name; otherwise,
// it returns a paginated list of all collections for the admin user.
export const searchQuestionCollections = (value?: string, page = 1, pageSize = 50) => {
  const params = new URLSearchParams();
  if (value && value.trim().length > 0) params.set('value', value.trim());
  if (page) params.set('page', String(page));
  if (pageSize) params.set('pageSize', String(pageSize));
  const qs = params.toString();
  return axiosClient.get(`/questions/search${qs ? `?${qs}` : ''}`);
};

export const getQuestionCollection = (id: string) => {
  return axiosClient.get(`/questions/${id}`);
};

export const updateQuestionCollection = (id: string, data: Partial<QuestionCollectionData>) => {
  return axiosClient.put(`/questions/${id}`, data);
};

export const deleteQuestionCollection = (id: string) => {
  return axiosClient.delete(`/questions/${id}`);
};
