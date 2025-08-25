import { render, screen, fireEvent } from '@testing-library/react';
import TopicListItem from './TopicListItem';

describe('TopicListItem', () => {
  it('fires action callbacks', () => {
    const onClick = vi.fn();
    const onRename = vi.fn();
    const onDelete = vi.fn();
    const onPlusQ = vi.fn();

    render(
      <TopicListItem
        content="Top"
        onClick={onClick}
        onRenameClick={onRename}
        onDeleteClick={onDelete}
        onPlusQuestionClick={onPlusQ}
      />
    );

    const item = screen.getByText('Top');
    fireEvent.mouseEnter(item.parentElement!);
    const wrappers = document.querySelectorAll('.icon-wrapper');
    // order: plus?, trash, edit
    fireEvent.click(wrappers[0] as HTMLElement);
    fireEvent.click(wrappers[1] as HTMLElement);
    fireEvent.click(wrappers[2] as HTMLElement);

    expect(onPlusQ).toHaveBeenCalled();
    expect(onDelete).toHaveBeenCalled();
    expect(onRename).toHaveBeenCalled();
  });
});

