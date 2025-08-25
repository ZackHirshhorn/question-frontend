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

// Public (no-auth) update for answers submission
export interface UpdateQuestionnaireAnswers {
  ansTemplate: unknown; // Matches server answer structure
  uName?: string | null;
  uEmail?: string | null;
  uPhone?: string | null;
  isComplete?: boolean;
}

export const updateQuestionnaireAnswers = (
  id: string,
  data: UpdateQuestionnaireAnswers,
) => {
  return axiosClient.put(`/questionnaire/${id}/answer`, data);
};

// Authenticated update for answers submission and phone only
export interface UpdateQuestionnaireAnswersAuth {
  ansTemplate?: unknown;
  uPhone?: string | null;
  isComplete?: boolean;
}

export const updateQuestionnaireAnswersAuth = (
  id: string,
  data: UpdateQuestionnaireAnswersAuth,
) => {
  return axiosClient.put(`/questionnaire/${id}/answer/auth`, data);
};
