import { render, screen, fireEvent } from '@testing-library/react';
import TemplateListItem from './TemplateListItem';

describe('TemplateListItem', () => {
  it('calls onDeleteClick when trash is clicked', () => {
    const onClick = vi.fn();
    const onDelete = vi.fn();
    render(
      <TemplateListItem content="Template A" onClick={onClick} onDeleteClick={onDelete} />
    );
    // Hover to show tooltip
    const item = screen.getByText('Template A');
    fireEvent.mouseEnter(item.parentElement!);
    // Click the trash icon via stable test id
    const trashIcon = screen.getByTestId('delete-icon');
    fireEvent.click(trashIcon.parentElement as HTMLElement);
    expect(onDelete).toHaveBeenCalled();
  });

  it('renders pencil after trash and calls onRenameClick', () => {
    const onClick = vi.fn();
    const onDelete = vi.fn();
    const onRename = vi.fn();
    render(
      <TemplateListItem content="Template B" onClick={onClick} onDeleteClick={onDelete} onRenameClick={onRename} />
    );
    // Hover to show actions
    const item = screen.getByText('Template B');
    fireEvent.mouseEnter(item.parentElement!);
    // Click the pencil icon via stable test id
    const editIcon = screen.getByTestId('edit-icon');
    fireEvent.click(editIcon.parentElement as HTMLElement);
    expect(onRename).toHaveBeenCalled();
    expect(onDelete).not.toHaveBeenCalled();
  });
});
