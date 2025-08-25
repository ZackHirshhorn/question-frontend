Session Bootstrap Without Client Storage — Next Steps

Summary
- Goal: Do not save user credentials (name, email, phone, etc.) anywhere on the client (localStorage, Redux persistence, cookies we set). Only the “previous-page” draft fields (start form) may be stored, per your rule.
- Current status: localStorage persistence of the Redux user slice has been removed. Auth remains in-memory only for the session.

Completed
1) Removed localStorage persistence from `userSlice` (no read/write/remove of `localStorage['user']`).
   - File: `frontend-question/src/store/userSlice.ts`
   - Added `setAuthenticated(boolean)` to allow session bootstrap without storing credentials.

Remaining Tasks
1) AnswerPage: stop storing per-questionnaire info
   - File: `frontend-question/src/components/filling/AnswerPage.tsx`
   - Remove the block that writes `localStorage.setItem('questionnaire_info:${qid}', …)` right after `createQuestionnaire` succeeds.
   - Keep only clearing the previous-page draft key: `localStorage.removeItem(START_INFO_KEY)`.

2) AnswerFill: stop reading per-questionnaire info
   - File: `frontend-question/src/components/filling/AnswerFill.tsx`
   - Remove the `useEffect` that reads `localStorage.getItem('questionnaire_info:${id}')` and hydrates `info` from it.
   - Rely solely on the server response: `GET /api/questionnaire/:id` (fields: `userName`, `userEmail`, `userPhone`).

3) App: bootstrap session from server (cookie) without storing credentials
   - File: `frontend-question/src/App.tsx`
   - On mount, call a “safe” endpoint that requires auth (e.g., `getUserTemplates()`), and if it succeeds, dispatch `setAuthenticated(true)`.
   - Do not write to any storage. This restores the in-memory session using only the server cookie.
   - Imports needed: `setAuthenticated` from `store/userSlice` and `getUserTemplates` from `api/template`.

Rules to Enforce
- Never save user credentials (name, email, phone, passwords) to localStorage, Redux persistence, or any other client storage.
- The only allowed storage is the “previous-page” draft under `start_info:*` (entered on the prepare form). Remove anything else (e.g., `questionnaire_info:*`).

Validation Steps
1) Lint: `npm run lint` should pass.
2) Tests: `npm test` should pass.
3) Manual: 
   - Login, close and reopen the tab; the app should auto-mark authenticated after the bootstrap call (no login prompt) if the server cookie is still valid.
   - Start questionnaire while logged in; skip phone; Answer page should show server-provided name/email (when available) without reading from localStorage.

Notes
- If a dedicated current-user endpoint (e.g., `/api/auth/me`) is added later, prefer that for bootstrap instead of using `getUserTemplates()`.
- Backend remains unchanged; all changes are frontend-only per scope.
