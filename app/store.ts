import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth/authSlice';
import questionnaireReducer from './questionnaires/questionnaireSlice';
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    questionnaires: questionnaireReducer,
  },
});

// *** Typed hooks (no more repeating RootState/AppDispatch) ***
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
