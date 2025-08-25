# Frontend Contributing Notes

## Popup Components

- Name popup components with the `Popup` suffix: `SomethingPopup.tsx`.
- Export a component whose name also ends with `Popup` (PascalCase).
- Popups render overlay markup using `.popup-overlay` and `.popup-content` classes.
- A unit test (`src/components/PopupNaming.test.ts`) enforces that any component containing the overlay markup lives in a `*Popup.tsx` file.

Examples:
- `CreateTemplatePopup.tsx`
- `CreateQuestionsColPopup.tsx`
- `RenamePopup.tsx`
- `ConfirmDeletePopup.tsx`
- `CreateNamesPopup.tsx` (generic; used for categories, sub‑categories, and topics)

## General

- Keep popup logic self‑contained; parents should pass data and handlers.
- Prefer consistent button behavior (disabled + spinner during persistence).
