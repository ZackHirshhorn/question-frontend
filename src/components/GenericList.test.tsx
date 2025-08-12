import { render, screen } from '@testing-library/react';
import GenericList from './GenericList';

describe('GenericList', () => {
  it('renders items using renderItem', () => {
    const items = [{ id: '1', name: 'One' }, { id: '2', name: 'Two' }];
    render(
      <GenericList
        items={items}
        keyExtractor={(i) => i.id}
        renderItem={(i) => <span>{i.name}</span>}
      />
    );
    expect(screen.getByText('One')).toBeInTheDocument();
    expect(screen.getByText('Two')).toBeInTheDocument();
  });
});

