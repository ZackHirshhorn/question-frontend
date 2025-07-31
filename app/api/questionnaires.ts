import axiosClient from "./axios";
import type { Questionnaire } from "~/types/questionnaire";

export const getQuestionnairesForUser = async (userId: string): Promise<Questionnaire[]> => {
  const { data } = await axiosClient.get<Questionnaire[]>(`/api/questionnaire/user/${userId}`);
  return data;
};
