/**
 * Redux slice for managing question collections used across the app.
 *
 * Motivation:
 * - The שאלות tab fetches and displays collections.
 * - The שאלונים/Template view needs the same data to power a selection popup
 *   when adding questions to categories/subcategories/topics.
 *
 * Keeping this state in Redux avoids duplicate fetching and keeps UX consistent.
 */
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './index';

/**
 * Minimal collection shape used by the UI.
 * Note: backend may return `id` or `_id`; callers should normalize before storing.
 */
export interface QuestionCollection {
  _id: string;
  name: string;
  description?: string;
  size?: number;
}

/**
 * Collections slice state.
 * - items: list of available collections (paged as delivered by API call sites)
 * - loading/error: simple request state for the last fetch
 * - allNames: optional cache of all names for uniqueness checks in modals
 */
interface CollectionsState {
  items: QuestionCollection[];
  loading: boolean;
  error: string | null;
  // Optional cache of all names for uniqueness checks
  allNames: string[];
}

const initialState: CollectionsState = {
  items: [],
  loading: false,
  error: null,
  allNames: [],
};

const questionCollectionsSlice = createSlice({
  name: 'questionCollections',
  initialState,
  reducers: {
    /** Mark the slice as loading and clear previous error */
    fetchStart(state) {
      state.loading = true;
      state.error = null;
    },
    /** Store fetched collections and clear loading */
    fetchSuccess(state, action: PayloadAction<QuestionCollection[]>) {
      state.items = action.payload;
      state.loading = false;
    },
    /** Store error and clear loading */
    fetchFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    /** Replace the cached list of all collection names */
    setAllNames(state, action: PayloadAction<string[]>) {
      state.allNames = action.payload;
    },
  },
});

export const { fetchStart, fetchSuccess, fetchFailure, setAllNames } = questionCollectionsSlice.actions;

export default questionCollectionsSlice.reducer;

// Selectors
/** Select the list of collections */
export const selectCollections = (state: RootState) => state.questionCollections.items;
/** Select the loading state of the last fetch */
export const selectCollectionsLoading = (state: RootState) => state.questionCollections.loading;
/** Select the error string for the last fetch (if any) */
export const selectCollectionsError = (state: RootState) => state.questionCollections.error;
/** Select the cached list of all collection names */
export const selectAllCollectionNames = (state: RootState) => state.questionCollections.allNames;
