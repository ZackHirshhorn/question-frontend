import {
  fetchFailure,
  fetchStart,
  fetchSuccess,
  setAllNames,
  type QuestionCollection,
  default as questionCollectionsReducer,
  selectAllCollectionNames,
  selectCollections,
  selectCollectionsError,
  selectCollectionsLoading,
} from './questionCollectionsSlice';
import type { RootState } from './index';

describe('questionCollectionsSlice', () => {
  const baseState = {
    items: [],
    loading: false,
    error: null as string | null,
    allNames: [] as string[],
  };

  it('returns the initial state when passed an unknown action', () => {
    const state = questionCollectionsReducer(undefined, { type: 'unknown' });
    expect(state).toEqual(baseState);
  });

  it('marks the state as loading when fetch starts', () => {
    const state = questionCollectionsReducer(baseState, fetchStart());
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('stores fetched collections on success', () => {
    const startState = { ...baseState, loading: true };
    const payload: QuestionCollection[] = [
      { _id: '1', name: 'Math', description: 'Algebra', size: 4 },
      { _id: '2', name: 'Science' },
    ];

    const state = questionCollectionsReducer(startState, fetchSuccess(payload));

    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.items).toEqual(payload);
  });

  it('stores an error message when the fetch fails', () => {
    const startState = { ...baseState, loading: true };
    const state = questionCollectionsReducer(startState, fetchFailure('boom'));

    expect(state.loading).toBe(false);
    expect(state.error).toBe('boom');
  });

  it('replaces the cached collection names', () => {
    const startState = { ...baseState, allNames: ['Old'] };
    const state = questionCollectionsReducer(startState, setAllNames(['New', 'Other']));

    expect(state.allNames).toEqual(['New', 'Other']);
  });

  it('selects state slices via exported selectors', () => {
    const sliceState = {
      items: [{ _id: '10', name: 'History' }],
      loading: true,
      error: 'timeout',
      allNames: ['History'],
    };
    const rootState = {
      questionCollections: sliceState,
    } as unknown as RootState;

    expect(selectCollections(rootState)).toEqual(sliceState.items);
    expect(selectCollectionsLoading(rootState)).toBe(true);
    expect(selectCollectionsError(rootState)).toBe('timeout');
    expect(selectAllCollectionNames(rootState)).toEqual(['History']);
  });
});
