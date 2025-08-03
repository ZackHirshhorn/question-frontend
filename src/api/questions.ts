import axiosClient from './axiosClient';

export const createQuestionCollection = (data: any) => {
  return axiosClient.post('/questions', data);
};

export const searchQuestionCollections = (name: string) => {
  return axiosClient.get(`/questions/search?name=${name}`);
};

export const getQuestionCollection = (id: string) => {
  return axiosClient.get(`/questions/${id}`);
};

export const updateQuestionCollection = (id: string, data: any) => {
  return axiosClient.put(`/questions/${id}`, data);
};

export const deleteQuestionCollection = (id: string) => {
  return axiosClient.delete(`/questions/${id}`);
};
