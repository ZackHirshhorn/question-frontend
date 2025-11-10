import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '../../store';
import AnswerFill from './AnswerFill';
import * as questionnaireApi from '../../api/questionnaire';

describe('AnswerFill user info panel', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // Clean storage between tests (no longer used for questionnaire info)
    window.localStorage.clear();
  });

  it('displays server user info', async () => {
    // Server returns user details
    vi.spyOn(questionnaireApi, 'getQuestionnaire').mockResolvedValue({
      data: { userName: 'Server Name', userEmail: 'srv@example.com', userPhone: '0501234567' },
    } as unknown as ReturnType<typeof questionnaireApi.getQuestionnaire>);

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/answer/123"]}>
          <Routes>
            <Route path="/answer/:id" element={<AnswerFill />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    expect(await screen.findByText('פרטי משתמש:')).toBeInTheDocument();

    expect(screen.getByText('שם: Server Name')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('דוא"ל: srv@example.com')).toBeInTheDocument();
      expect(screen.getByText('טלפון: 0501234567')).toBeInTheDocument();
    });
  });

  it('shows success popup after saving questionnaire progress', async () => {
    vi.spyOn(questionnaireApi, 'getQuestionnaire').mockResolvedValue({
      data: {
        userName: 'Server Name',
        userEmail: 'srv@example.com',
        userPhone: '0501234567',
        template: {
          name: 'טופס',
          categories: [
            {
              name: 'קטגוריה',
              questions: [
                {
                  q: 'שאלה',
                  qType: 'Text',
                  answer: 'תשובה',
                },
              ],
            },
          ],
        },
      },
    } as unknown as ReturnType<typeof questionnaireApi.getQuestionnaire>);

    const updateSpy = vi
      .spyOn(questionnaireApi, 'updateQuestionnaireAnswers')
      .mockResolvedValue({
        data: {
          userName: 'Server Name',
          userEmail: 'srv@example.com',
          template: {
            name: 'טופס',
            categories: [
              {
                name: 'קטגוריה',
                questions: [
                  {
                    q: 'שאלה',
                    qType: 'Text',
                    answer: 'תשובה',
                  },
                ],
              },
            ],
          },
        },
      } as unknown as ReturnType<typeof questionnaireApi.updateQuestionnaireAnswers>);

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/answer/123"]}>
          <Routes>
            <Route path="/answer/:id" element={<AnswerFill />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    const saveButton = screen.getByRole('button', { name: 'שמירה' });
    expect(saveButton).toBeDisabled();

    await waitFor(() => expect(saveButton).toBeEnabled());

    fireEvent.click(saveButton);

    await waitFor(() => expect(updateSpy).toHaveBeenCalled());
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText(/שלחנו לינק חזרה לכתובת/)).toBeInTheDocument();
    expect(within(dialog).getByText(/srv@example.com/)).toBeInTheDocument();
  });

  it('serializes multiple-choice answers before saving', async () => {
    vi.spyOn(questionnaireApi, 'getQuestionnaire').mockResolvedValue({
      data: {
        userEmail: 'srv@example.com',
        template: {
          name: 'טופס',
          categories: [
            {
              name: 'קטגוריה',
              questions: [
                {
                  q: 'בחר אפשרויות',
                  qType: 'Multiple',
                  choice: ['אפשרות 1', 'אפשרות 2'],
                  answer: [],
                },
              ],
            },
          ],
        },
      },
    } as unknown as ReturnType<typeof questionnaireApi.getQuestionnaire>);

    const updateSpy = vi
      .spyOn(questionnaireApi, 'updateQuestionnaireAnswers')
      .mockResolvedValue({
        data: {
          userEmail: 'srv@example.com',
          template: {
            name: 'טופס',
            categories: [
              {
                name: 'קטגוריה',
                questions: [
                  {
                    q: 'בחר אפשרויות',
                    qType: 'Multiple',
                    choice: ['אפשרות 1', 'אפשרות 2'],
                    answer: 'MULTI:["אפשרות 1","אפשרות 2"]',
                  },
                ],
              },
            ],
          },
        },
      } as unknown as ReturnType<typeof questionnaireApi.updateQuestionnaireAnswers>);

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/answer/456"]}>
          <Routes>
            <Route path="/answer/:id" element={<AnswerFill />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    const optionOne = await screen.findByLabelText('אפשרות 1');
    const optionTwo = screen.getByLabelText('אפשרות 2');
    fireEvent.click(optionOne);
    fireEvent.click(optionTwo);

    const saveButton = await screen.findByRole('button', { name: 'שמירה' });
    fireEvent.click(saveButton);

    await waitFor(() => expect(updateSpy).toHaveBeenCalled());

    const payload = updateSpy.mock.calls[0][1];
    const savedTemplate = payload.ansTemplate as {
      categories?: Array<{
        questions?: Array<{ answer?: string }>;
      }>;
    };
    const savedAnswer = savedTemplate.categories?.[0]?.questions?.[0]?.answer;
    expect(savedAnswer).toBe('MULTI:["אפשרות 1","אפשרות 2"]');
  });

  it('decodes encoded multiple-choice answers from the server', async () => {
    vi.spyOn(questionnaireApi, 'getQuestionnaire').mockResolvedValue({
      data: {
        userEmail: 'srv@example.com',
        template: {
          categories: [
            {
              name: 'קטגוריה',
              questions: [
                {
                  q: 'בחר אפשרויות',
                  qType: 'Multiple',
                  choice: ['אפשרות 1', 'אפשרות 2'],
                  answer: 'MULTI:["אפשרות 2"]',
                },
              ],
            },
          ],
        },
      },
    } as unknown as ReturnType<typeof questionnaireApi.getQuestionnaire>);

    vi.spyOn(questionnaireApi, 'updateQuestionnaireAnswers').mockResolvedValue({
      data: {},
    } as unknown as ReturnType<typeof questionnaireApi.updateQuestionnaireAnswers>);

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/answer/789"]}>
          <Routes>
            <Route path="/answer/:id" element={<AnswerFill />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    const optionOne = await screen.findByLabelText('אפשרות 1');
    const optionTwo = screen.getByLabelText('אפשרות 2');
    expect(optionOne).not.toBeChecked();
    expect(optionTwo).toBeChecked();
  });
});
