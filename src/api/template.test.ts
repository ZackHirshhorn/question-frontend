import type { Mock } from 'vitest';
import axiosClient from './axiosClient';
import {
  createTemplate,
  getTemplates,
  getTemplate,
  deleteTemplate,
  updateTemplate,
  searchTemplates,
  getUserTemplates,
  headUserTemplates,
  getTemplatesSummary,
} from './template';

vi.mock('./axiosClient', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    head: vi.fn(),
  },
}));

const mockedClient = axiosClient as unknown as {
  post: Mock;
  get: Mock;
  put: Mock;
  delete: Mock;
  head: Mock;
};

describe('template api helpers', () => {
  beforeEach(() => {
    mockedClient.post.mockReset();
    mockedClient.get.mockReset();
    mockedClient.put.mockReset();
    mockedClient.delete.mockReset();
    mockedClient.head.mockReset();
  });

  it('posts template payload on create', () => {
    const payload = { template: { name: 'New', categories: [] } };
    createTemplate(payload);
    expect(mockedClient.post).toHaveBeenCalledWith('/template', payload);
  });

  it('fetches templates list with defaults and pagination overrides', () => {
    getTemplates();
    expect(mockedClient.get).toHaveBeenCalledWith('/template/search?page=1&pageSize=50');

    mockedClient.get.mockClear();
    getTemplates(3, 10);
    expect(mockedClient.get).toHaveBeenCalledWith('/template/search?page=3&pageSize=10');
  });

  it('returns template details for identifier', async () => {
    const response = { data: { id: 'tpl-1' } };
    mockedClient.get.mockResolvedValue(response);

    await expect(getTemplate('tpl-1')).resolves.toBe(response);
    expect(mockedClient.get).toHaveBeenCalledWith('/template/tpl-1');
  });

  it('delegates delete and update operations to axios client', () => {
    deleteTemplate('tpl-2');
    expect(mockedClient.delete).toHaveBeenCalledWith('/template/tpl-2');

    mockedClient.put.mockClear();
    updateTemplate('tpl-2', { name: 'Updated' });
    expect(mockedClient.put).toHaveBeenCalledWith('/template/tpl-2', {
      template: { name: 'Updated' },
    });
  });

  it('searches templates by name', () => {
    searchTemplates('marketing');
    expect(mockedClient.get).toHaveBeenCalledWith('/template/search?name=marketing');
  });

  it('probes user templates and summaries', async () => {
    const summary = [{ id: '1', name: 'Demo', responses: 1, complete: 1, incomplete: 0 }];
    mockedClient.get.mockResolvedValueOnce({ data: { templates: [] } });
    mockedClient.get.mockResolvedValueOnce(summary);

    getUserTemplates();
    expect(mockedClient.get).toHaveBeenCalledWith('/template/user');

    await expect(getTemplatesSummary()).resolves.toEqual(summary);
    expect(mockedClient.get).toHaveBeenCalledWith('/template/summary');

    headUserTemplates();
    expect(mockedClient.head).toHaveBeenCalledWith('/template/user');
  });
});
