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
    // Click the trash icon wrapper
    const iconWrappers = document.querySelectorAll('.icon-wrapper');
    const trashWrapper = iconWrappers[0] as HTMLElement;
    fireEvent.click(trashWrapper);
    expect(onDelete).toHaveBeenCalled();
  });
});

