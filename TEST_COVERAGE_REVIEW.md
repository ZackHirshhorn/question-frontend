# Test Coverage Review

## Recently addressed

- Added a bootstrap smoke test for `src/main.tsx` that verifies the DOM host passed to `createRoot` and the expected provider stack in the rendered tree.【F:src/main.test.tsx†L1-L43】【F:src/main.tsx†L1-L18】
- Covered `src/components/questions/QuestionOptions.tsx` to assert automatic blank-row insertion, single-select radio updates, and selection rollback semantics.【F:src/components/questions/QuestionOptions.test.tsx†L1-L83】【F:src/components/questions/QuestionOptions.tsx†L1-L82】
- Stabilized `AnswerFill` save-flow expectations so the suite awaits the async enablement of the save action before interacting with it.【F:src/components/filling/AnswerFill.test.tsx†L1-L138】

## Units still missing focused coverage

### `src/components/questions/QuestionNumber.tsx`
The numerical badge component emits increment/decrement controls and text entry for numbering question groups, yet there is no test ensuring the callbacks fire for clicks and keyboard edits. A compact unit test could prevent regressions to its change handler logic.【F:src/components/questions/QuestionNumber.tsx†L1-L24】

### `src/components/templates/UndoBanner.tsx`
The undo banner coordinates the label copy and `onUndo` handler used across template editing flows, but no spec guards its button semantics or accessibility attributes. A shallow render asserting the label text, click callback, and dismissibility would lock down this shared UI fragment.【F:src/components/templates/UndoBanner.tsx†L1-L67】
