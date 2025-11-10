import type { Mock } from 'vitest';
import axiosClient from './axiosClient';
import {
  createQuestionCollection,
  createQuestionsCol,
  searchQuestionCollections,
  getQuestionCollection,
  updateQuestionCollection,
  deleteQuestionCollection,
} from './questions';

vi.mock('./axiosClient', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockedClient = axiosClient as unknown as {
  post: Mock;
  get: Mock;
  put: Mock;
  delete: Mock;
};

describe('questions api helpers', () => {
  beforeEach(() => {
    mockedClient.post.mockReset();
    mockedClient.get.mockReset();
    mockedClient.put.mockReset();
    mockedClient.delete.mockReset();
  });

  it('creates question collection with provided payload', () => {
    const payload = { name: 'General', questions: [] };
    createQuestionCollection(payload);
    expect(mockedClient.post).toHaveBeenCalledWith('/questions', payload);
  });

  it('builds creation payload from primitives', () => {
    const questions = [{ prompt: 'Q1' }];
    createQuestionsCol('My Set', questions, 'desc');
    expect(mockedClient.post).toHaveBeenCalledWith('/questions', {
      colName: 'My Set',
      questions,
      description: 'desc',
    });

    createQuestionsCol('Empty');
    expect(mockedClient.post).toHaveBeenCalledWith('/questions', {
      colName: 'Empty',
      questions: [],
      description: undefined,
    });
  });

  it('constructs search query parameters correctly', () => {
    searchQuestionCollections();
    expect(mockedClient.get).toHaveBeenCalledWith('/questions/user?page=1&pageSize=50');

    mockedClient.get.mockClear();
    searchQuestionCollections('  Draft  ', 3, 25);
    expect(mockedClient.get).toHaveBeenCalledWith('/questions/user?value=Draft&page=3&pageSize=25');

    mockedClient.get.mockClear();
    searchQuestionCollections('   ');
    expect(mockedClient.get).toHaveBeenCalledWith('/questions/user?page=1&pageSize=50');
  });

  it('proxies get/put/delete operations with identifiers', () => {
    getQuestionCollection('abc');
    expect(mockedClient.get).toHaveBeenCalledWith('/questions/abc');

    updateQuestionCollection('abc', { colName: 'New' });
    expect(mockedClient.put).toHaveBeenCalledWith('/questions/abc', { colName: 'New' });

    deleteQuestionCollection('abc');
    expect(mockedClient.delete).toHaveBeenCalledWith('/questions/abc');
  });
});
