import type { Mock } from 'vitest';
import axiosClient from './axiosClient';
import {
  createQuestionnaire,
  getQuestionnaires,
  getQuestionnaire,
  updateQuestionnaireAnswers,
  updateQuestionnaireAnswersAuth,
} from './questionnaire';

vi.mock('./axiosClient', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
  },
}));

const mockedClient = axiosClient as unknown as {
  post: Mock;
  get: Mock;
  put: Mock;
};

describe('questionnaire api helpers', () => {
  beforeEach(() => {
    mockedClient.post.mockReset();
    mockedClient.get.mockReset();
    mockedClient.put.mockReset();
  });

  it('creates questionnaire with template reference', () => {
    const payload = { templateId: 'tpl-1' };
    createQuestionnaire(payload);
    expect(mockedClient.post).toHaveBeenCalledWith('/questionnaire', payload);
  });

  it('retrieves questionnaires and details', async () => {
    const response = { data: { id: 'qn-1' } };
    mockedClient.get.mockResolvedValueOnce({ data: [] });
    mockedClient.get.mockResolvedValueOnce(response);

    getQuestionnaires();
    expect(mockedClient.get).toHaveBeenCalledWith('/questionnaire/user');

    await expect(getQuestionnaire('qn-1')).resolves.toBe(response);
    expect(mockedClient.get).toHaveBeenCalledWith('/questionnaire/qn-1');
  });

  it('updates questionnaire answers for public submissions', () => {
    const payload = { ansTemplate: {}, uName: 'Alex', isComplete: true };
    updateQuestionnaireAnswers('qn-2', payload);
    expect(mockedClient.put).toHaveBeenCalledWith('/questionnaire/qn-2/answer', payload);
  });

  it('updates questionnaire answers for authenticated submissions', () => {
    const payload = { uPhone: '123', isComplete: false };
    updateQuestionnaireAnswersAuth('qn-3', payload);
    expect(mockedClient.put).toHaveBeenCalledWith('/questionnaire/qn-3/answer/auth', payload);
  });
});
