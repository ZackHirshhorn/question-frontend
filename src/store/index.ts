import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import questionCollectionsReducer from './questionCollectionsSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    questionCollections: questionCollectionsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
