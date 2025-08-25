# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Demo Email Notifications (EmailJS)

The Start → Create flow sends the questionnaire link to the respondent via EmailJS when both the questionnaire and an email address exist. The send is skipped silently if the EmailJS configuration is missing.

Setup steps:

1. In EmailJS create or reuse a service and email template. The template should reference the variables `{{to_email}}`, `{{questionnaire_url}}`, `{{template_name}}`, and `{{respondent_name}}` in the message body/subject.
2. Copy the service ID, template ID, and public key from EmailJS.
3. Add the values to your environment, for example in `.env.development` or `.env.localdev`:

   ```ini
   VITE_EMAILJS_SERVICE_ID=your_service_id
   VITE_EMAILJS_QUESTIONNAIRE_TEMPLATE_ID=your_template_id
   VITE_EMAILJS_PUBLIC_KEY=your_public_key
   ```

When these values are present, newly created questionnaires will trigger an email to the guest email (if provided) or the logged-in user's email. If the source template has no name, the email falls back to `תבנית ללא שם`, and when no respondent name is available it falls back to `אורח ללא שם`.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

## UI Popups

- Use `CreateNamesPopup` for generic "add names" flows (categories, sub‑categories, topics). It accepts labels and messages via props and enforces duplicate validation and a consistent save/cancel experience with an optional spinner.
- Other popups include `CreateTemplatePopup`, `CreateQuestionsColPopup`, `PreviewQuestionsColPopup`, `ConfirmDeletePopup`, and `RenamePopup`.

## Question Collections: Shared State + Popup

The שאלות tab and the שאלונים (Template View) both need access to question collections.

- Redux slice: `src/store/questionCollectionsSlice.ts`
  - Provides `items`, `loading`, `error`, and optional `allNames` cache.
  - Actions: `fetchStart`, `fetchSuccess`, `fetchFailure`, `setAllNames`.
  - Selectors: `selectCollections`, `selectCollectionsLoading`, `selectCollectionsError`.
  - Shape is minimal: `{ _id, name, description?, size? }`.

- Popup component: `src/components/SelectQuestionsColPopup.tsx`
  - Displays a single-choice (radio) list of collections with name/description/count.
  - Reads from the Redux slice and fetches on first mount if empty (via `searchQuestionCollections`).
  - API:
    - `title?`: optional heading text
    - `onClose()`: close handler
    - `onSelect?(collection)`: called on confirm with the chosen collection

Usage pattern (inside a parent component):

```tsx
const [open, setOpen] = useState(false);
return (
  <>
    <button onClick={() => setOpen(true)}>הוספת שאלה</button>
    {open && (
      <SelectQuestionsColPopup
        onClose={() => setOpen(false)}
        onSelect={(col) => {
          console.log('Selected', col);
          setOpen(false);
        }}
      />
    )}
  </>
);
```

This approach avoids duplicating fetching logic and keeps the UI consistent across tabs.
