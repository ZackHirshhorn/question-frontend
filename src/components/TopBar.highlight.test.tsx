import { render, screen } from '@testing-library/react';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useLocation: () => ({ pathname: '/templates' }),
    Link: ({ to, children, style }: any) => <a href={to} style={style}>{children}</a>,
  };
});

import TopBar from './TopBar';

describe('TopBar highlighting', () => {
  it('underlines templates tab for /templates', () => {
    render(<TopBar />);
    const templatesLink = screen.getByText('שאלונים');
    const responsesLink = screen.getByText('תגובות');
    expect(templatesLink).toHaveStyle({ textDecoration: 'underline' });
    expect(responsesLink).not.toHaveStyle({ textDecoration: 'underline' });
  });
});

