import { render, screen, fireEvent } from '@testing-library/react';
import React, { useState } from 'react';
import QuestionnaireView, { type PreviewQuestion } from './QuestionnaireView';

describe('QuestionnaireView radio grouping', () => {
  it('keeps single-choice selections isolated between sections', () => {
    const Wrapper: React.FC = () => {
      const [sectionA, setSectionA] = useState<PreviewQuestion[]>([
        {
          q: 'שאלה א',
          qType: 'Single',
          choice: ['אפשרות א1', 'אפשרות א2'],
          answer: null,
        },
      ]);
      const [sectionB, setSectionB] = useState<PreviewQuestion[]>([
        {
          q: 'שאלה ב',
          qType: 'Single',
          choice: ['אפשרות ב1', 'אפשרות ב2'],
          answer: null,
        },
      ]);

      return (
        <>
          <QuestionnaireView
            questions={sectionA}
            mode="answer"
            onAnswerChange={(questionIndex, value) =>
              setSectionA((prev) =>
                prev.map((question, idx) => (idx === questionIndex ? { ...question, answer: value } : question)),
              )
            }
          />
          <QuestionnaireView
            questions={sectionB}
            mode="answer"
            onAnswerChange={(questionIndex, value) =>
              setSectionB((prev) =>
                prev.map((question, idx) => (idx === questionIndex ? { ...question, answer: value } : question)),
              )
            }
          />
        </>
      );
    };

    render(<Wrapper />);

    const firstSectionOption = screen.getByLabelText('אפשרות א1');
    const secondSectionOption = screen.getByLabelText('אפשרות ב1');

    fireEvent.click(firstSectionOption);
    expect(firstSectionOption).toBeChecked();

    fireEvent.click(secondSectionOption);
    expect(secondSectionOption).toBeChecked();
    expect(firstSectionOption).toBeChecked();
  });
});
