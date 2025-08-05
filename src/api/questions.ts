import axiosClient from './axiosClient';

interface QuestionCollectionData {
  // Define the properties for a question collection
  name: string;
  questions: Record<string, unknown>[];
}

export const createQuestionCollection = (data: QuestionCollectionData) => {
  return axiosClient.post('/questions', data);
};

export const searchQuestionCollections = (name: string) => {
  return axiosClient.get(`/questions/search?name=${name}`);
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
