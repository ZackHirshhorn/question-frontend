import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '../store';
import AnswerFill from './AnswerFill';
import * as questionnaireApi from '../api/questionnaire';

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
});
