import axiosClient from './axiosClient';

export const createQuestionnaire = (data: any) => {
  return axiosClient.post('/questionnaire', data);
};

export const getQuestionnaires = (userId: string) => {
  return axiosClient.get(`/questionnaire/user/${userId}`);
};
