import axiosClient from './axiosClient';

interface CreateQuestionnaireData {
  templateId: string;
}

export const createQuestionnaire = (data: CreateQuestionnaireData) => {
  return axiosClient.post('/questionnaire', data);
};

export const getQuestionnaires = () => {
  return axiosClient.get(`/questionnaire/user`);
};

export const getQuestionnaire = (id: string) => {
  return axiosClient.get(`/questionnaire/${id}`);
};

