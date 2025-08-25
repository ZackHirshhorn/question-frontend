import { render, screen, fireEvent } from '@testing-library/react';
import CategoryListItem from './CategoryListItem';

describe('CategoryListItem', () => {
  it('fires action callbacks', () => {
    const onClick = vi.fn();
    const onRename = vi.fn();
    const onDelete = vi.fn();
    const onPlusQ = vi.fn();
    const onNew = vi.fn();

    render(
      <CategoryListItem
        content="Cat"
        isExpanded={false}
        onClick={onClick}
        onRenameClick={onRename}
        onDeleteClick={onDelete}
        onPlusQuestionClick={onPlusQ}
        onNewClick={onNew}
      />
    );

    const item = screen.getByText('Cat');
    fireEvent.mouseEnter(item.parentElement!);

    const wrappers = document.querySelectorAll('.icon-wrapper');
    // order: plus?, trash, edit, new
    fireEvent.click(wrappers[0] as HTMLElement);
    fireEvent.click(wrappers[1] as HTMLElement);
    fireEvent.click(wrappers[2] as HTMLElement);
    fireEvent.click(wrappers[3] as HTMLElement);

    expect(onPlusQ).toHaveBeenCalled();
    expect(onDelete).toHaveBeenCalled();
    expect(onRename).toHaveBeenCalled();
    expect(onNew).toHaveBeenCalled();
  });
});

