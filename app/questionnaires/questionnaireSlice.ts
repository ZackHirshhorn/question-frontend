import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getQuestionnairesForUser } from "~/api/questionnaires";
import type { Questionnaire } from "~/types/questionnaire";
import { logout } from "~/auth/authSlice";
import type { AppDispatch } from "~/store";

interface QuestionnaireState {
  questionnaires: Questionnaire[];
  loading: boolean;
  error: string | null;
}

const initialState: QuestionnaireState = {
  questionnaires: [],
  loading: false,
  error: null,
};

export const fetchQuestionnaires = createAsyncThunk<
  Questionnaire[],
  string,
  { dispatch: AppDispatch; rejectValue: string }
>("questionnaires/fetch", async (userId, { dispatch, rejectWithValue }) => {
  try {
    const questionnaires = await getQuestionnairesForUser(userId);
    return questionnaires;
  } catch (err: any) {
    // Handle different error cases
    if (err.response) {
      if (err.response.status === 401) {
        dispatch(logout());
        return rejectWithValue("Auth error");
      }
      if (err.response.status === 500) {
        return rejectWithValue("An internal server error occurred. Please try again later.");
      }
    }
    // For all other errors, use the server message or a generic fallback.
    return rejectWithValue(
      err.response?.data?.message ?? "Failed to fetch questionnaires"
    );
  }
});

const questionnaireSlice = createSlice({
  name: "questionnaires",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuestionnaires.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuestionnaires.fulfilled, (state, action) => {
        state.questionnaires = action.payload;
        state.loading = false;
      })
      .addCase(fetchQuestionnaires.rejected, (state, action) => {
        state.loading = false;
        // Only set an error if it wasn't our internal auth error signal.
        if (action.payload !== "Auth error") {
          state.error = action.payload ?? "Unknown error";
        }
      });
  },
});

export default questionnaireSlice.reducer;
