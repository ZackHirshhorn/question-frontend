import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import AnswerPage from './AnswerPage';
import userReducer from '../../store/userSlice';
import questionCollectionsReducer from '../../store/questionCollectionsSlice';
import * as questionnaireApi from '../../api/questionnaire';

type CreateQuestionnaireResult = Awaited<ReturnType<typeof questionnaireApi.createQuestionnaire>>;
type UpdateQuestionnaireAuthResult = Awaited<ReturnType<typeof questionnaireApi.updateQuestionnaireAnswersAuth>>;

describe('AnswerPage linking flow (authenticated)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  const makeStore = () =>
    configureStore({
      reducer: {
        user: userReducer,
        questionCollections: questionCollectionsReducer,
      },
      preloadedState: {
        user: {
          isAuthenticated: true,
          user: { id: 'u1', name: 'User One', email: 'u1@example.com', role: 'USER' },
        },
      },
    });

  const renderAt = (path: string) => {
    return render(
      <MemoryRouter initialEntries={[path]}>
        <Provider store={makeStore()}>
          <Routes>
            <Route path="/start/:templateId" element={<AnswerPage />} />
          </Routes>
        </Provider>
      </MemoryRouter>
    );
  };

  it('creates, links via auth PUT, then redirects to answer page', async () => {
    const created = { id: 'qid1', template: { name: 'T', categories: [] } };
    vi.spyOn(questionnaireApi, 'createQuestionnaire').mockResolvedValue({ data: created } as CreateQuestionnaireResult);
    const authSpy = vi.spyOn(questionnaireApi, 'updateQuestionnaireAnswersAuth').mockResolvedValue({ data: { ok: true } } as UpdateQuestionnaireAuthResult);

    const replaceMock = vi.fn();
    const originalLoc = window.location;
    Object.defineProperty(window, 'location', {
      value: { ...originalLoc, replace: replaceMock },
      configurable: true,
    });

    renderAt('/start/tpl1');

    // Authenticated variant shows only phone field; submit without typing is fine too
    fireEvent.click(screen.getByRole('button', { name: 'המשך' }));

    await waitFor(() => expect(authSpy).toHaveBeenCalledTimes(1));
    expect(authSpy).toHaveBeenCalledWith('qid1', {
      ansTemplate: created.template,
      uPhone: null,
    });

    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith('/answer/qid1'));
  });

  it('stops and shows error if auth linking fails', async () => {
    const created = { id: 'qid2', template: { name: 'T2', categories: [] } };
    vi.spyOn(questionnaireApi, 'createQuestionnaire').mockResolvedValue({ data: created } as CreateQuestionnaireResult);
    vi.spyOn(questionnaireApi, 'updateQuestionnaireAnswersAuth').mockRejectedValue(new Error('link failed'));

    const replaceMock2 = vi.fn();
    const originalLoc2 = window.location;
    Object.defineProperty(window, 'location', {
      value: { ...originalLoc2, replace: replaceMock2 },
      configurable: true,
    });

    renderAt('/start/tpl2');

    fireEvent.click(screen.getByRole('button', { name: 'המשך' }));

    // Error message should be visible and no redirect should occur
    expect(await screen.findByText('קישור השאלון לחשבון נכשל. נא לנסות שוב.')).toBeInTheDocument();
    expect(replaceMock2).not.toHaveBeenCalled();
  });
});
