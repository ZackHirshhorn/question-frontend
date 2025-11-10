import React, { useState } from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import QuestionOptions from './QuestionOptions';

describe('QuestionOptions', () => {
  it('adds an empty trailing option when all existing choices are filled', () => {
    render(<QuestionOptions choices={['ראשונה', 'שנייה']} onChange={vi.fn()} />);

    const inputs = screen.getAllByRole('textbox');
    expect(inputs).toHaveLength(3);
    expect(inputs[2]).toHaveValue('');

    const deleteButtons = screen.getAllByRole('button', { name: /מחיקת אפשרות/ });
    expect(deleteButtons).toHaveLength(2);
  });

  it('pushes a blank option through onChange when the trailing slot is filled', () => {
    const handleChange = vi.fn();
    render(<QuestionOptions choices={['ראשונה', 'שנייה']} onChange={handleChange} />);

    const trailingInput = screen.getAllByRole('textbox')[2];
    fireEvent.change(trailingInput, { target: { value: 'שלישית' } });

    expect(handleChange).toHaveBeenCalledWith(['ראשונה', 'שנייה', 'שלישית', '']);
  });

  it('adjusts the selected index when removing options in single mode', () => {
    const changeSpy = vi.fn();
    const selectionSpy = vi.fn();

    const Harness: React.FC = () => {
      const [choices, setChoices] = useState(['א', 'ב', 'ג']);
      const [selected, setSelected] = useState<number | null>(2);
      return (
        <QuestionOptions
          mode="single"
          choices={choices}
          onChange={(next) => {
            setChoices(next);
            changeSpy(next);
          }}
          selectedIndex={selected}
          onSelectedIndexChange={(next) => {
            setSelected(next);
            selectionSpy(next);
          }}
        />
      );
    };

    render(<Harness />);

    const firstRow = screen.getByDisplayValue('א').closest('.question-option-row');
    if (!firstRow) throw new Error('missing first row');
    fireEvent.click(within(firstRow).getByRole('button', { name: /מחיקת אפשרות 1/ }));

    expect(changeSpy).toHaveBeenLastCalledWith(['ב', 'ג']);
    expect(selectionSpy).toHaveBeenLastCalledWith(1);

    const selectedRow = screen.getByDisplayValue('ג').closest('.question-option-row');
    if (!selectedRow) throw new Error('missing selected row');
    fireEvent.click(within(selectedRow).getByRole('button', { name: /מחיקת אפשרות 2/ }));

    expect(changeSpy).toHaveBeenLastCalledWith(['ב', '']);
    expect(selectionSpy).toHaveBeenLastCalledWith(null);
  });

  it('updates selected index when choosing a radio option', () => {
    const handleSelection = vi.fn();
    const Harness: React.FC = () => {
      const [selected, setSelected] = useState<number | null>(null);
      return (
        <QuestionOptions
          mode="single"
          choices={['ראשונה', 'שנייה']}
          selectedIndex={selected}
          onSelectedIndexChange={(index) => {
            setSelected(index);
            handleSelection(index);
          }}
          onChange={vi.fn()}
        />
      );
    };

    render(<Harness />);

    const radios = screen.getAllByRole('radio');
    fireEvent.click(radios[1]);

    expect(handleSelection).toHaveBeenLastCalledWith(1);
    expect(radios[1]).toBeChecked();
  });
});
