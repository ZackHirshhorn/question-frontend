import axiosClient from './axiosClient';

interface QuestionnaireData {
  // Define the properties for a new questionnaire
  title: string;
  description?: string;
  userId: string;
}

export const createQuestionnaire = (data: QuestionnaireData) => {
  return axiosClient.post('/questionnaire', data);
};

export const getQuestionnaires = () => {
  return axiosClient.get(`/questionnaire/user`);
};
