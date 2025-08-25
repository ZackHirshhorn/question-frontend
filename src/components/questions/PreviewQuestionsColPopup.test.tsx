import { render, screen, fireEvent } from '@testing-library/react';
import PreviewQuestionsColPopup from './PreviewQuestionsColPopup';

describe('PreviewQuestionsColPopup', () => {
  it('shows loading state', () => {
    render(
      <PreviewQuestionsColPopup
        name="Set A"
        questions={[]}
        loading
        onClose={() => {}}
      />
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('בטעינה...')).toBeInTheDocument();
  });

  it('renders empty message when no questions', () => {
    render(
      <PreviewQuestionsColPopup
        name="Set A"
        questions={[]}
        onClose={() => {}}
      />
    );
    expect(screen.getByText('אין שאלות להצגה')).toBeInTheDocument();
  });

  it('renders description and multiple question types', () => {
    const questions: Array<{ q: string; qType: 'Text' | 'Multiple' | 'Single' | 'Number' | string; choice?: string[]; required?: boolean }> = [
      { q: 'Q1', qType: 'Text' },
      { q: 'Q2', qType: 'Number' },
      { q: 'Q3', qType: 'Single', choice: ['A', 'B'], required: true },
      { q: 'Q4', qType: 'Multiple', choice: [] },
    ];
    render(
      <PreviewQuestionsColPopup
        name="Set A"
        description="Desc"
        questions={questions}
        onClose={() => {}}
      />
    );
    expect(screen.getByText('Desc')).toBeInTheDocument();
    expect(screen.getByText('Q1')).toBeInTheDocument();
    expect(screen.getByText('Q2')).toBeInTheDocument();
    expect(screen.getByText('Q3 *')).toBeInTheDocument();
    // radio/checkbox rendered
    expect(screen.getAllByRole('radio').length).toBeGreaterThan(0);
  });

  it('close button calls onClose', () => {
    const onClose = vi.fn();
    render(
      <PreviewQuestionsColPopup
        name="Set A"
        questions={[]}
        onClose={onClose}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'סגור' }));
    expect(onClose).toHaveBeenCalled();
  });
});
